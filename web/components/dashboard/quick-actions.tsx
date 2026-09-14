import Link from "next/link";
import { UserPlus, CalendarPlus, Clock3, FileUp, Briefcase, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { label: "Adicionar colaborador", href: "/pessoas?novo=1", icon: UserPlus },
  { label: "Registrar férias", href: "/ferias", icon: CalendarPlus },
  { label: "Ajustar ponto", href: "/ponto", icon: Clock3 },
  { label: "Enviar documento", href: "/documentos", icon: FileUp },
  { label: "Adicionar candidato", href: "/recrutamento?novo=1", icon: Briefcase },
  { label: "Gerar relatório", href: "/relatorios", icon: BarChart3 },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-start gap-2.5 rounded-[10px] border border-slate-100 p-3 text-left transition-colors hover:border-lumo-turquoise/40 hover:bg-lumo-turquoise/5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-slate-100 text-lumo-ink">
                <action.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium leading-tight text-lumo-ink">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
