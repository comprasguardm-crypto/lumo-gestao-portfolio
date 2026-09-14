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
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LumoLogoMark } from "@/components/brand/lumo-logo";
import { cn } from "@/lib/utils";

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

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-lumo-ink p-0 text-slate-300">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <LumoLogoMark className="h-9 w-9" />
          <span className="font-display text-[15px] font-semibold text-white">
            Lumo <span className="text-lumo-turquoise">Gestão</span>
          </span>
        </div>
        <nav className="space-y-0.5 px-3 py-2">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active && "text-lumo-turquoise")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
