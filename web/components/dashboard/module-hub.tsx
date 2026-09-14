import Link from "next/link";
import { Users, Clock, Palmtree, Briefcase, FileText, TrendingUp, GraduationCap, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const modules = [
  { label: "Pessoas", description: "Cadastro e gestão do quadro de colaboradores", href: "/pessoas", icon: Users, indicator: "142 ativos" },
  { label: "Ponto", description: "Marcações, jornada e auditoria pelo app", href: "/ponto", icon: Clock, indicator: "7 pendências" },
  { label: "Férias", description: "Solicitações, aprovações e calendário", href: "/ferias", icon: Palmtree, indicator: "8 pendentes" },
  { label: "Recrutamento", description: "Vagas e funil de candidatos", href: "/recrutamento", icon: Briefcase, indicator: "8 candidatos" },
  { label: "Documentos", description: "Contratos, atestados e assinaturas", href: "/documentos", icon: FileText, indicator: "12 pendentes" },
  { label: "Desempenho", description: "Avaliações e planos de desenvolvimento", href: "/desempenho", icon: TrendingUp },
  { label: "Treinamentos", description: "Trilhas de capacitação da equipe", href: "/treinamentos", icon: GraduationCap },
  { label: "Relatórios", description: "Indicadores e exportações do RH", href: "/relatorios", icon: BarChart3 },
];

export function ModuleHub() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu RH em um só lugar</CardTitle>
        <CardDescription>Acesse rapidamente qualquer módulo da Lumo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((mod) => (
            <Link
              key={mod.label}
              href={mod.href}
              className="group flex flex-col gap-3 rounded-[10px] border border-slate-100 p-4 transition-colors hover:border-lumo-turquoise/40 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-slate-100 text-lumo-ink group-hover:bg-lumo-turquoise/15 group-hover:text-lumo-ink">
                  <mod.icon className="h-[18px] w-[18px]" />
                </span>
                {mod.indicator && (
                  <Badge variant="outline" className="text-[11px]">
                    {mod.indicator}
                  </Badge>
                )}
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-lumo-ink">{mod.label}</p>
                <p className="mt-0.5 text-xs text-lumo-slate">{mod.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
