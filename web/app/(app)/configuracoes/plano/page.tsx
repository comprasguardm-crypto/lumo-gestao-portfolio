"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { mockPlans } from "@/mocks/plans";
import { listEmployees } from "@/services/employees.service";
import { getSubscription } from "@/services/settings.service";

export default function PlanoPage() {
  const [subscription, setSubscription] = useState<{ planCode: string; status: string; seats: number; monthlyAmount: number; nextBillingDate?: string | null } | null>(null);
  const [usedSeats, setUsedSeats] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getSubscription(), listEmployees()])
      .then(([sub, employees]) => { setSubscription(sub); setUsedSeats(employees.filter((e) => e.status !== "desligado").length); })
      .catch((e) => setError(e instanceof Error ? e.message : "Não foi possível carregar o plano."));
  }, []);
  const currentPlan = useMemo(() => mockPlans.find((p) => p.id === subscription?.planCode) || null, [subscription]);
  const limit = Math.max(1, subscription?.seats || (typeof currentPlan?.employeeLimit === "number" ? currentPlan.employeeLimit : usedSeats || 1));
  const usagePct = Math.min(100, Math.round((usedSeats / limit) * 100));
  function requestChange(name: string) { setMessage(`Solicitação para o plano ${name} preparada. Como não há provedor de cobrança configurado, a alteração deve ser concluída pelo comercial do Lumo.`); }
  return <div className="space-y-6">
    <div><h1 className="font-display text-xl font-semibold text-lumo-ink">Plano e cobrança</h1><p className="mt-1 text-sm text-lumo-slate">Consulte a assinatura registrada para a empresa.</p></div>
    {error && <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    {message && <p className="rounded-[10px] border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">{message}</p>}
    <Card><CardContent className="space-y-3 p-6"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-medium text-lumo-ink">Plano atual: {currentPlan?.name || subscription?.planCode || "Carregando..."}</p><p className="text-xs text-lumo-slate">{usedSeats} de {subscription?.seats || "—"} colaboradores · status {subscription?.status || "—"}</p></div><Progress value={usagePct} />{subscription?.monthlyAmount ? <p className="text-xs text-lumo-slate">Valor mensal registrado: R$ {subscription.monthlyAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}{subscription.nextBillingDate ? ` · Próxima cobrança: ${new Date(subscription.nextBillingDate + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}</p> : <p className="text-xs text-lumo-slate">Nenhum provedor de cobrança automatizada está configurado para esta assinatura.</p>}</CardContent></Card>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{mockPlans.map((plan) => { const active = plan.id === subscription?.planCode; return <Card key={plan.id} className={cn("relative flex flex-col", active && "border-lumo-turquoise ring-1 ring-lumo-turquoise/40")}>{plan.highlight && <Badge variant="ai" className="absolute right-4 top-4">Mais popular</Badge>}<CardContent className="flex flex-1 flex-col gap-4 p-6"><div><p className="font-display text-base font-semibold text-lumo-ink">{plan.name}</p><p className="mt-1 text-2xl font-semibold text-lumo-ink">R$ {plan.priceMonthly}<span className="text-sm font-normal text-lumo-slate">/mês</span></p><p className="mt-1 text-xs text-lumo-slate">Até {plan.employeeLimit === "ilimitado" ? "colaboradores ilimitados" : `${plan.employeeLimit} colaboradores`}</p></div><ul className="flex-1 space-y-2">{plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-lumo-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lumo-turquoise" /> {f}</li>)}</ul><Button variant={active ? "outline" : "primary"} disabled={active} onClick={() => requestChange(plan.name)}>{active ? "Plano atual" : "Solicitar alteração"}</Button></CardContent></Card>; })}</div>
  </div>;
}
