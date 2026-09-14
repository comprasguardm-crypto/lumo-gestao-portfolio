"use client";

import { ClipboardCheck, ClipboardList, Gauge, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/shared/states";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useAsyncData } from "@/hooks/use-async-data";
import { listPerformanceSnapshots } from "@/services/performance.service";

const month = (period: string) => { const [y,m] = period.split("-").map(Number); return new Date(y, Math.max(0,m-1), 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""); };

export default function DesempenhoPage() {
  const { data, isLoading, isError, reload } = useAsyncData(listPerformanceSnapshots, []);
  const current = data?.[data.length - 1];
  const chartData = (data || []).map((item) => ({ period: month(item.period), media: item.averageScore }));
  return <div className="space-y-6">
    <div><h1 className="font-display text-xl font-semibold text-lumo-ink">Desempenho</h1><p className="mt-1 text-sm text-lumo-slate">Avaliações e evolução registradas para a empresa atual.</p></div>
    {isError && <ErrorState onRetry={reload} />}
    {isLoading || !data ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/></div> : <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><MetricCard label="Avaliações abertas" value={current?.openReviews || 0} icon={ClipboardList} tone="warning"/><MetricCard label="Avaliações concluídas" value={current?.completedReviews || 0} icon={ClipboardCheck} tone="positive"/><MetricCard label="Média geral" value={current ? `${current.averageScore.toFixed(1)} / 5` : "—"} icon={Gauge} tone="ai"/><MetricCard label="Planos de desenvolvimento" value={current?.developmentPlans || 0} icon={Target}/></div>
      <Card><CardHeader><CardTitle>Evolução da média geral</CardTitle><CardDescription>Histórico registrado no Lumo</CardDescription></CardHeader><CardContent>{chartData.length === 0 ? <EmptyState icon={Gauge} title="Sem avaliações registradas" description="Os indicadores aparecerão quando houver snapshots de desempenho para a empresa." className="border-none"/> : <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false}/><XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false}/><YAxis domain={[0,5]} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }}/><Line type="monotone" dataKey="media" stroke="#14D6B3" strokeWidth={2.5} dot={{ r: 3 }}/></LineChart></ResponsiveContainer></div>}</CardContent></Card>
    </>}
  </div>;
}
