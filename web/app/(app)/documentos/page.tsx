"use client";

import { FormEvent, useMemo, useState } from "react";
import { Download, FileText, Search, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { EmptyState, TableSkeleton } from "@/components/shared/states";
import { useAsyncData } from "@/hooks/use-async-data";
import { createDocument, deleteDocument, getDocumentDownloadUrl, listDocuments } from "@/services/documents.service";
import { listEmployees } from "@/services/employees.service";
import { formatDate, cn } from "@/lib/utils";
import { DocumentCategory, EmployeeDocument } from "@/types";

const categories: { label: string; value: DocumentCategory | "todos" }[] = [
  { label: "Todos", value: "todos" }, { label: "Contratos", value: "contratos" }, { label: "Atestados", value: "atestados" },
  { label: "Documentos pessoais", value: "pessoais" }, { label: "Termos", value: "termos" }, { label: "Políticas internas", value: "politicas" }, { label: "Holerites", value: "holerite" },
];

const emptyForm = { employeeId: "", title: "", category: "contratos" as DocumentCategory, issuedAt: "", expiresAt: "", reminderDays: "30", note: "" };

export default function DocumentosPage() {
  const { data: documents, isLoading, isError, reload } = useAsyncData(listDocuments, []);
  const { data: employees } = useAsyncData(listEmployees, []);
  const [category, setCategory] = useState<DocumentCategory | "todos">("todos");
  const [employeeFilter, setEmployeeFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string>();
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents?.filter((d) =>
      (category === "todos" || d.category === category) &&
      (employeeFilter === "todos" || d.employeeId === employeeFilter) &&
      (!q || d.title.toLowerCase().includes(q) || d.employeeName.toLowerCase().includes(q) || d.fileName?.toLowerCase().includes(q))
    ) ?? [];
  }, [documents, category, employeeFilter, query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.employeeId || !form.title.trim()) { setError("Selecione o colaborador e informe o título."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      await createDocument({ ...form, reminderDays: Number(form.reminderDays) || 0, file });
      setOpen(false); setForm(emptyForm); setFile(undefined); setMessage("Documento enviado e registrado com segurança."); reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível enviar o documento."); }
    finally { setSaving(false); }
  }

  async function download(doc: EmployeeDocument) {
    setWorkingId(doc.id); setError("");
    try {
      const url = await getDocumentDownloadUrl(doc);
      const link = document.createElement("a"); link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
      if (doc.fileName) link.download = doc.fileName;
      document.body.appendChild(link); link.click(); link.remove();
      if (url.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível abrir o documento."); }
    finally { setWorkingId(undefined); }
  }

  async function remove(doc: EmployeeDocument) {
    if (!window.confirm(`Excluir “${doc.title}”? Esta ação remove o registro e o arquivo quando você tiver permissão.`)) return;
    setWorkingId(doc.id); setError("");
    try { await deleteDocument(doc); setMessage("Documento excluído."); reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível excluir o documento."); }
    finally { setWorkingId(undefined); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-display text-xl font-semibold text-lumo-ink">Documentos</h1><p className="mt-1 text-sm text-lumo-slate">Prontuário digital protegido por empresa e permissões.</p></div><Button variant="primary" onClick={() => { setError(""); setOpen(true); }}><Upload className="h-4 w-4" /> Enviar documento</Button></div>
    {message && <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}
    {error && <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    {isError && <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">Não foi possível carregar os documentos. Verifique sua sessão e permissão.</p>}

    <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lumo-slate"/><Input className="pl-9" placeholder="Buscar documento ou colaborador..." value={query} onChange={(e)=>setQuery(e.target.value)}/></div>
      <select className="h-10 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={employeeFilter} onChange={(e)=>setEmployeeFilter(e.target.value)}><option value="todos">Todos os colaboradores</option>{employees?.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select>
    </div>
    <div className="flex flex-wrap gap-1.5">{categories.map((c) => <button key={c.value} onClick={() => setCategory(c.value)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", category === c.value ? "border-lumo-ink bg-lumo-ink text-white" : "border-slate-200 text-lumo-slate hover:bg-slate-50")}>{c.label}</button>)}</div>

    <Card><CardHeader><CardTitle>Documentos</CardTitle></CardHeader><CardContent className="p-0">{isLoading || !documents ? <TableSkeleton rows={6} cols={7} /> : filtered.length === 0 ? <EmptyState icon={FileText} title="Nenhum documento encontrado" className="border-none" /> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Colaborador</TableHead><TableHead>Emissão</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead>Arquivo</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{filtered.map((doc) => <TableRow key={doc.id}><TableCell><p className="font-medium text-lumo-ink">{doc.title}</p><p className="mt-0.5 text-[11px] text-lumo-slate">Atualizado em {formatDate(doc.updatedAt)}</p></TableCell><TableCell className="text-lumo-slate">{doc.employeeName}</TableCell><TableCell className="text-lumo-slate">{doc.issuedAt ? formatDate(doc.issuedAt) : "—"}</TableCell><TableCell className="text-lumo-slate">{doc.expiresAt ? formatDate(doc.expiresAt) : "—"}</TableCell><TableCell><DocumentStatusBadge status={doc.status} /></TableCell><TableCell className="max-w-[180px] truncate text-lumo-slate">{doc.fileName || "—"}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" disabled={workingId===doc.id} onClick={() => download(doc)}><Download className="h-3.5 w-3.5" /> Abrir</Button><Button variant="danger" size="sm" disabled={workingId===doc.id} onClick={() => remove(doc)} aria-label={`Excluir ${doc.title}`}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>

    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Enviar documento</DialogTitle><DialogDescription>O arquivo será salvo no Storage privado e vinculado ao prontuário do colaborador.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4">
      <Field label="Colaborador"><select className="h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Selecione...</option>{employees?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
      <Field label="Título"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Contrato de trabalho" /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Categoria"><select className="h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}>{categories.filter(c => c.value !== "todos").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></Field><Field label="Arquivo"><Input type="file" required onChange={(e)=>setFile(e.target.files?.[0])}/></Field></div>
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Data de emissão"><Input type="date" value={form.issuedAt} onChange={(e)=>setForm({...form, issuedAt:e.target.value})}/></Field><Field label="Vencimento"><Input type="date" value={form.expiresAt} onChange={(e)=>setForm({...form, expiresAt:e.target.value})}/></Field><Field label="Lembrar antes (dias)"><Input type="number" min={0} max={365} value={form.reminderDays} onChange={(e)=>setForm({...form, reminderDays:e.target.value})}/></Field></div>
      <Field label="Observação"><Textarea value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} placeholder="Opcional"/></Field>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? "Enviando..." : "Enviar"}</Button></div>
    </form></DialogContent></Dialog>
  </div>;
}

function Field({label, children}:{label:string;children:React.ReactNode}) { return <label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>{label}</span>{children}</label>; }
