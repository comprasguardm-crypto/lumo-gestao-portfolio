import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PendingItem } from "@/types";
import { cn } from "@/lib/utils";

const priorityConfig = {
  alta: { label: "Alta prioridade", variant: "danger" as const },
  media: { label: "Média prioridade", variant: "warning" as const },
  baixa: { label: "Baixa prioridade", variant: "outline" as const },
};

export function PendingCenter({ items }: { items: PendingItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Precisa da sua atenção</CardTitle>
        <CardDescription>Itens que dependem de uma ação sua</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-lumo-turquoise" />
            <p className="text-sm text-lumo-slate">Tudo em dia por aqui.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-[10px] border border-slate-100 p-3"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    item.priority === "alta"
                      ? "bg-red-50 text-red-600"
                      : item.priority === "media"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-lumo-slate"
                  )}
                >
                  <AlertCircle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-lumo-ink">{item.description}</p>
                  <Badge variant={priorityConfig[item.priority].variant} className="mt-1">
                    {priorityConfig[item.priority].label}
                  </Badge>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link href={item.href}>{item.actionLabel}</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
