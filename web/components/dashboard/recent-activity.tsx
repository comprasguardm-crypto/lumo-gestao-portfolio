import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { RecentActivity } from "@/types";
import { EmptyState } from "@/components/shared/states";
import { History } from "lucide-react";

export function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Movimentações recentes</CardTitle>
        <Link href="/relatorios" className="text-xs font-medium text-lumo-turquoise hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState icon={History} title="Sem movimentações recentes" className="border-none py-8" />
        ) : (
          <ul className="space-y-4">
            {activities.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[11px]">{initials(a.employeeName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-lumo-ink">
                    <span className="font-medium">{a.employeeName}</span>{" "}
                    <span className="text-lumo-slate">{a.action.toLowerCase()}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-lumo-slate">{a.timeAgo}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
