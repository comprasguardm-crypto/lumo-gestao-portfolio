"use client";

import { FormEvent, useMemo, useState } from "react";
import { Palmtree, CalendarClock, Hourglass, AlertOctagon, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { VacationStatusBadge } from "@/components/shared/status-badge";
import { CardSkeleton, TableSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAsyncData } from "@/hooks/use-async-data";
import { listVacations, requestVacation, setVacationStatus } from "@/services/vacations.service";
import { listEmployees } from "@/services/employees.service";
import { formatDate } from "@/lib/utils";

const DAYS_IN_MONTH = 30;

export default function FeriasPage() {
  const { data: vacations, isLoading, reload } = useAsyncData(listVacations, []);
  const { data: employees } = useAsyncData(listEmployees, []);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ employeeId: "", startDate: "", days: "15" });

  const onVacation = vacations?.filter((v) => v.status === "aprovada").length ?? 0;
  const upcoming = vacations?.filter((v) => v.status === "agendada").length ?? 0;
  const pending = vacations?.filter((v) => v.status === "em_analise").length ?? 0;
  const overdue = 0;

  const calendarDays = useMemo(() => {
    const marked = new Set<number>();
    vacations?.filter((v) => v.status === "aprovada" || v.status === "agendada").forEach((v) => {
      const start = new Date(`${v.startDate}T12:00:00`).getDate();
      const end = Math.min(start + Math.floor(v.days / 3), DAYS_IN_MONTH);
      for (let d = start; d <= end; d++) marked.add(d);
    });
    return marked;
  }, [vacations]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.employeeId || !form.startDate || Number(form.days) < 1) return;
    setSaving(true);
    await requestVacation({ employeeId: form.employeeId, startDate: form.startDate, days: Number(form.days) });
    setSaving(false);
    setOpen(false);
    setForm({ employeeId: "", startDate: "", days: "15" });
    setMessage("Solicitação de férias registrada.");
    reload();
  }

  async function changeStatus(id: string, status: "aprovada" | "rejeitada") {
    await setVacationStatus(id, status);
    setMessage(status === "aprovada" ? "Férias aprovadas." : "Solicitação rejeitada.");
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="font-display text-xl font-semibold text-lumo-ink">Férias</h1><p className="mt-1 text-sm text-lumo-slate">Solicitações, aprovações e calendário do time.</p></div>
        <Button variant="primary" onClick={() => setOpen(true)}>Registrar férias</Button>
      </div>
      {message && <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isLoading || !vacations ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : <>
          <MetricCard label="Em férias" value={onVacation} icon={Palmtree} tone="positive" />
          <MetricCard label="Próximas férias" value={upcoming} icon={CalendarClock} />
          <MetricCard label="Solicitações pendentes" value={pending} icon={Hourglass} tone="warning" />
          <MetricCard label="Férias vencidas" value={overdue} icon={AlertOctagon} />
        </>}
      </div>

      <Card><CardHeader><CardTitle>Calendário do mês</CardTitle><CardDescription>Dias com colaboradores em férias ou próximos do período</CardDescription></CardHeader><CardContent>
        <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">{Array.from({ length: DAYS_IN_MONTH }).map((_, i) => { const day = i + 1; const active = calendarDays.has(day); return <div key={day} className={`flex h-9 items-center justify-center rounded-[8px] text-xs font-medium ${active ? "bg-lumo-turquoise/20 text-lumo-ink" : "bg-slate-50 text-lumo-slate"}`}>{day}</div>; })}</div>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Solicitações</CardTitle></CardHeader><CardContent className="p-0">
        {isLoading || !vacations ? <TableSkeleton rows={6} cols={6} /> : <Table><TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Período</TableHead><TableHead>Dias</TableHead><TableHead>Status</TableHead><TableHead>Aprovador</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>
          {vacations.map((v) => <TableRow key={v.id}><TableCell className="font-medium text-lumo-ink">{v.employeeName}</TableCell><TableCell className="text-lumo-slate">{formatDate(v.startDate)} – {formatDate(v.endDate)}</TableCell><TableCell className="text-lumo-slate">{v.days}</TableCell><TableCell><VacationStatusBadge status={v.status} /></TableCell><TableCell className="text-lumo-slate">{v.approver ?? "—"}</TableCell><TableCell className="text-right">{v.status === "em_analise" ? <div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => changeStatus(v.id, "aprovada")}><Check className="h-3.5 w-3.5" /> Aprovar</Button><Button variant="danger" size="sm" onClick={() => changeStatus(v.id, "rejeitada")}><X className="h-3.5 w-3.5" /> Rejeitar</Button></div> : "—"}</TableCell></TableRow>)}
        </TableBody></Table>}
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Registrar férias</DialogTitle><DialogDescription>Crie uma solicitação para um colaborador.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4">
        <label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Colaborador</span><select className="h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Selecione...</option>{employees?.filter(e => e.status !== "desligado").map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Data de início</span><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label><label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Dias</span><Input type="number" min={1} max={30} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} /></label></div>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? "Salvando..." : "Registrar"}</Button></div>
      </form></DialogContent></Dialog>
    </div>
  );
}
