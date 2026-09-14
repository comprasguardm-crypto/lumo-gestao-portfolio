"use client";

import { Users, Palmtree, UserPlus, FileText, Clock3, UserCheck } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmployeesByAreaChart } from "@/components/dashboard/employees-by-area-chart";
import { RecentActivityCard } from "@/components/dashboard/recent-activity";
import { PendingCenter } from "@/components/dashboard/pending-center";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { LumoAICard } from "@/components/dashboard/lumo-ai-card";
import { ModuleHub } from "@/components/dashboard/module-hub";
import { CardSkeleton, ErrorState } from "@/components/shared/states";
import { useAsyncData } from "@/hooks/use-async-data";
import { getDashboardMetrics, getDashboardUserName, getPendingItems, getRecentActivities } from "@/services/dashboard.service";

export default function DashboardPage() {
  const { data: userName } = useAsyncData(getDashboardUserName, []);
  const firstName = (userName || "Usuário").split(" ")[0];

  const { data: metrics, isLoading: loadingMetrics, isError: errorMetrics, reload: reloadMetrics } =
    useAsyncData(getDashboardMetrics, []);
  const { data: activities, isLoading: loadingActivities } = useAsyncData(getRecentActivities, []);
  const { data: pendingItems, isLoading: loadingPending } = useAsyncData(getPendingItems, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-lumo-ink">Bom dia, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-lumo-slate">Veja o que está acontecendo na sua empresa hoje.</p>
      </div>

      {errorMetrics && <ErrorState onRetry={reloadMetrics} />}

      {!errorMetrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {loadingMetrics || !metrics
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : [
                <MetricCard
                  key="employees"
                  label="Colaboradores"
                  value={metrics.employeesTotal}
                  helper={`+${metrics.employeesChangePct}% em relação ao mês anterior`}
                  icon={Users}
                  tone="positive"
                />,
                <MetricCard
                  key="present"
                  label="Presentes hoje"
                  value={metrics.presentToday}
                  helper="Com entrada registrada hoje"
                  icon={UserCheck}
                  tone="positive"
                />,
                <MetricCard
                  key="vacations"
                  label="Férias pendentes"
                  value={metrics.vacationsPending}
                  helper={`${metrics.vacationsAwaitingApproval} solicitações aguardando aprovação`}
                  icon={Palmtree}
                  tone="warning"
                />,
                <MetricCard
                  key="admissions"
                  label="Admissões este mês"
                  value={metrics.admissionsThisMonth}
                  helper={`+${metrics.admissionsThisWeek} esta semana`}
                  icon={UserPlus}
                  tone="positive"
                />,
                <MetricCard
                  key="documents"
                  label="Documentos"
                  value={metrics.documentsAwaitingSignature}
                  helper="Aguardando assinatura"
                  icon={FileText}
                />,
                <MetricCard
                  key="attendance"
                  label="Pendências de ponto"
                  value={metrics.attendancePendingAdjustments}
                  helper="Marcações aguardando ajuste"
                  icon={Clock3}
                  tone="warning"
                />,

              ]}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {loadingMetrics || !metrics ? (
          <CardSkeleton />
        ) : (
          <EmployeesByAreaChart data={metrics.employeesByArea} total={metrics.employeesTotal} />
        )}

        {loadingActivities || !activities ? (
          <CardSkeleton />
        ) : (
          <RecentActivityCard activities={activities} />
        )}

        {loadingPending || !pendingItems ? (
          <CardSkeleton />
        ) : (
          <PendingCenter items={pendingItems} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <LumoAICard />
      </div>

      <ModuleHub />
    </div>
  );
}
