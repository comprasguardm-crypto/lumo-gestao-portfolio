"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardSkeleton } from "@/components/shared/states";
import { useAsyncData } from "@/hooks/use-async-data";
import { createCandidate, listCandidates, moveCandidateStage } from "@/services/recruitment.service";
import { formatDate, initials } from "@/lib/utils";
import { CandidateStage, RecruitmentCandidate } from "@/types";

const stages: { key: CandidateStage; label: string }[] = [
  { key: "candidatos", label: "Candidatos" }, { key: "triagem", label: "Triagem" }, { key: "entrevista", label: "Entrevista" }, { key: "aprovados", label: "Aprovados" }, { key: "contratados", label: "Contratados" },
];

export default function RecrutamentoPage() {
  const { data: candidates, isLoading, reload } = useAsyncData(listCandidates, []);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RecruitmentCandidate>();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", role: "", responsible: "RH" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("novo") === "1") setOpen(true);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    setSaving(true); await createCandidate(form); setSaving(false); setOpen(false); setForm({ name: "", role: "", responsible: "RH" }); setMessage("Candidato adicionado ao funil."); reload();
  }

  async function advance(candidate: RecruitmentCandidate) {
    const index = stages.findIndex((stage) => stage.key === candidate.stage);
    if (index < 0 || index === stages.length - 1) return;
    const next = stages[index + 1].key;
    await moveCandidateStage(candidate.id, next);
    setSelected(undefined); setMessage(`${candidate.name} avançou para ${stages[index + 1].label}.`); reload();
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-display text-xl font-semibold text-lumo-ink">Recrutamento</h1><p className="mt-1 text-sm text-lumo-slate">Acompanhe o funil de candidatos por vaga.</p></div><Button variant="primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Adicionar candidato</Button></div>
    {message && <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}
    {isLoading || !candidates ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div> : <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-3 lg:grid-cols-5">{stages.map((stage) => { const stageCandidates = candidates.filter((c) => c.stage === stage.key); return <div key={stage.key} className="min-w-[220px] space-y-3"><div className="flex items-center justify-between px-1"><h3 className="text-sm font-semibold text-lumo-ink">{stage.label}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-lumo-slate">{stageCandidates.length}</span></div><div className="space-y-2.5">{stageCandidates.length === 0 ? <div className="rounded-[10px] border border-dashed border-slate-200 p-4 text-center text-xs text-lumo-slate">Nenhum candidato</div> : stageCandidates.map((candidate) => <Card key={candidate.id} className="cursor-pointer hover:shadow-popover" onClick={() => setSelected(candidate)}><CardContent className="space-y-2.5 p-3.5"><div className="flex items-center gap-2.5"><Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{initials(candidate.name)}</AvatarFallback></Avatar><p className="text-sm font-medium text-lumo-ink">{candidate.name}</p></div><p className="text-xs text-lumo-slate">{candidate.role}</p><div className="flex items-center justify-between text-[11px] text-lumo-slate"><span>{formatDate(candidate.date)}</span><span>{candidate.responsible}</span></div></CardContent></Card>)}</div></div>; })}</div>}

    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Adicionar candidato</DialogTitle><DialogDescription>Inclua uma pessoa na primeira etapa do funil.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Nome</span><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Vaga / cargo</span><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></label><label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Responsável</span><Input value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} /></label><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? "Adicionando..." : "Adicionar"}</Button></div></form></DialogContent></Dialog>

    <Dialog open={Boolean(selected)} onOpenChange={(value) => !value && setSelected(undefined)}><DialogContent><DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>{selected?.role}</DialogDescription></DialogHeader>{selected && <div className="space-y-4"><div className="rounded-[10px] bg-slate-50 p-4 text-sm"><p><span className="text-lumo-slate">Etapa:</span> {stages.find(s => s.key === selected.stage)?.label}</p><p><span className="text-lumo-slate">Responsável:</span> {selected.responsible}</p><p><span className="text-lumo-slate">Entrada:</span> {formatDate(selected.date)}</p></div><div className="flex justify-end"><Button variant="primary" disabled={selected.stage === "contratados"} onClick={() => advance(selected)}>{selected.stage === "contratados" ? "Processo concluído" : <><ArrowRight className="h-4 w-4" /> Avançar etapa</>}</Button></div></div>}</DialogContent></Dialog>
  </div>;
}
