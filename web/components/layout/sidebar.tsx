"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Clock,
  Palmtree,
  Briefcase,
  TrendingUp,
  FileText,
  GraduationCap,
  BarChart3,
  Sparkles,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LumoLogoMark } from "@/components/brand/lumo-logo";
import { getAccountInfo } from "@/services/settings.service";
import { useAsyncData } from "@/hooks/use-async-data";

const navItems = [
  { label: "Início", href: "/", icon: LayoutGrid },
  { label: "Pessoas", href: "/pessoas", icon: Users },
  { label: "Ponto", href: "/ponto", icon: Clock },
  { label: "Férias", href: "/ferias", icon: Palmtree },
  { label: "Recrutamento", href: "/recrutamento", icon: Briefcase },
  { label: "Desempenho", href: "/desempenho", icon: TrendingUp },
  { label: "Documentos", href: "/documentos", icon: FileText },
  { label: "Treinamentos", href: "/treinamentos", icon: GraduationCap },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Lumo AI", href: "/lumo-ai", icon: Sparkles },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  consulta: "Consulta",
  administrador: "Administrador",
  rh: "RH",
  gestor: "Gestor",
  financeiro: "Financeiro",
  colaborador: "Colaborador",
};

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { data: account } = useAsyncData(getAccountInfo, []);
  const currentUser = account || { name: "Usuário Lumo", role: "", companyName: "Empresa" };

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen flex-col bg-lumo-ink text-slate-300 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center gap-2.5 px-5", collapsed && "justify-center px-0")}>
        <LumoLogoMark className="h-9 w-9" />
        {!collapsed && (
          <span className="font-display text-[15px] font-semibold text-white">
            Lumo <span className="text-lumo-turquoise">Gestão</span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 scrollbar-thin">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-lumo-turquoise")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className={cn(
          "mx-3 mb-2 flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-100",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && "Recolher"}
      </button>

      <div className={cn("flex items-center gap-3 border-t border-white/10 px-4 py-4", collapsed && "justify-center px-0")}>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-lumo-turquoise text-lumo-ink">
            {initials(currentUser.name)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
            <p className="truncate text-xs text-slate-400">
              {roleLabels[currentUser.role] || currentUser.role} · {currentUser.companyName}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
