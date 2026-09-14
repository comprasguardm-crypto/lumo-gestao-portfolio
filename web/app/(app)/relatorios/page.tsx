"use client";

import { Download, FileBarChart, Users, Clock, Palmtree, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { downloadCsv } from "@/lib/export";
import { useAsyncData } from "@/hooks/use-async-data";
import { listEmployees } from "@/services/employees.service";
import { listTodayAttendance } from "@/services/attendance.service";
import { listVacations } from "@/services/vacations.service";
import { listDocuments } from "@/services/documents.service";
import { CardSkeleton } from "@/components/shared/states";

const reportTemplates = [
  { title: "Quadro de colaboradores", description: "Cargos, setores, status e admissão.", icon: Users, kind: "employees" as const },
  { title: "Folha de ponto", description: "Marcações consolidadas do dia.", icon: Clock, kind: "attendance" as const },
  { title: "Férias e solicitações", description: "Períodos solicitados e status de aprovação.", icon: Palmtree, kind: "vacations" as const },
  { title: "Documentos", description: "Prontuário, vencimentos e status.", icon: FileText, kind: "documents" as const },
];

export default function RelatoriosPage() {
  const { data: employees, isLoading: employeesLoading } = useAsyncData(listEmployees, []);
  const { data: attendance, isLoading: attendanceLoading } = useAsyncData(listTodayAttendance, []);
  const { data: vacations, isLoading: vacationsLoading } = useAsyncData(listVacations, []);
  const { data: documents, isLoading: documentsLoading } = useAsyncData(listDocuments, []);
  const loading = employeesLoading || attendanceLoading || vacationsLoading || documentsLoading;

  const months = Array.from({ length: 6 }).map((_, index) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - index));
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
    return { month, admissoes: employees?.filter((e)=>e.admissionDate?.startsWith(key)).length || 0 };
  });

  function exportReport(kind: typeof reportTemplates[number]["kind"]) {
    if (kind === "employees") return downloadCsv("lumo-colaboradores.csv", ["Nome", "CPF", "Cargo", "Setor", "Status", "Admissão", "E-mail"], (employees || []).map(e => [e.name, e.cpf, e.role, e.department, e.status, e.admissionDate, e.email]));
    if (kind === "attendance") return downloadCsv("lumo-ponto-hoje.csv", ["Colaborador", "Data", "Entrada", "Saída almoço", "Retorno", "Saída", "Horas", "Status"], (attendance || []).map(e => [e.employeeName, e.date, e.checkIn, e.lunchOut, e.lunchIn, e.checkOut, e.workedHours, e.status]));
    if (kind === "vacations") return downloadCsv("lumo-ferias.csv", ["Colaborador", "Início", "Fim", "Dias", "Status", "Aprovador"], (vacations || []).map(v => [v.employeeName, v.startDate, v.endDate, v.days, v.status, v.approver]));
    return downloadCsv("lumo-documentos.csv", ["Colaborador", "Título", "Categoria", "Status", "Emissão", "Vencimento", "Arquivo"], (documents || []).map(d => [d.employeeName, d.title, d.category, d.status, d.issuedAt, d.expiresAt, d.fileName]));
  }

  return <div className="space-y-6"><div><h1 className="font-display text-xl font-semibold text-lumo-ink">Relatórios</h1><p className="mt-1 text-sm text-lumo-slate">Exportações geradas com os dados disponíveis para sua empresa.</p></div>
    <Card><CardHeader><CardTitle>Admissões</CardTitle><CardDescription>Últimos 6 meses · dados reais do cadastro de colaboradores</CardDescription></CardHeader><CardContent>{employeesLoading ? <CardSkeleton/> : <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={months}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} /><Bar dataKey="admissoes" fill="#14D6B3" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}</CardContent></Card>
    <div><h2 className="mb-3 font-display text-sm font-semibold text-lumo-ink">Relatórios disponíveis</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{reportTemplates.map((r) => <Card key={r.title}><CardContent className="flex flex-col gap-3 p-5"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-slate-100 text-lumo-ink"><r.icon className="h-[18px] w-[18px]" /></span><div><p className="font-display text-sm font-semibold text-lumo-ink">{r.title}</p><p className="mt-1 text-xs text-lumo-slate">{r.description}</p></div><Button variant="outline" size="sm" className="mt-1" disabled={loading} onClick={() => exportReport(r.kind)}><Download className="h-3.5 w-3.5" /> {loading ? "Carregando..." : "Exportar CSV"}</Button></CardContent></Card>)}</div></div>
    <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-2 p-10 text-center"><FileBarChart className="h-8 w-8 text-lumo-slate" /><p className="text-sm text-lumo-slate">Os arquivos CSV usam UTF-8 com BOM e separador ponto e vírgula para compatibilidade com Excel em pt-BR.</p></CardContent></Card>
  </div>;
}
