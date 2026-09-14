"use client";

import { Building2, Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAsyncData } from "@/hooks/use-async-data";
import { getAccountInfo } from "@/services/settings.service";

export function CompanySwitcher() {
  const { data } = useAsyncData(getAccountInfo, []);
  const name = data?.companyName || "Empresa";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-lumo-ink hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumo-turquoise">
        <Building2 className="h-4 w-4 text-lumo-slate" />
        <span className="hidden max-w-[9rem] truncate sm:inline">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-lumo-slate" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Empresa atual</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled><span className="flex-1">{name}</span><Check className="h-4 w-4 text-lumo-turquoise" /></DropdownMenuItem>
        <DropdownMenuSeparator />
        <p className="max-w-[240px] px-2.5 pb-1.5 pt-1 text-xs text-lumo-slate">Os dados desta sessão são isolados pelo company_id e pelas políticas RLS.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
