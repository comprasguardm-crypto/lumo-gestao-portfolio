"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, HelpCircle, Menu, LogOut, User, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { initials } from "@/lib/utils";
import { getAccountInfo } from "@/services/settings.service";
import { signOut } from "@/lib/supabase-rest";
import { useAsyncData } from "@/hooks/use-async-data";

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { data: account } = useAsyncData(getAccountInfo, []);
  const currentUser = account || { name: "Usuário Lumo", email: "", role: "" };
  function search(event: FormEvent) { event.preventDefault(); if (query.trim()) router.push(`/pessoas?search=${encodeURIComponent(query.trim())}`); }

  return <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur sm:px-6">
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>
    <form className="relative hidden max-w-md flex-1 md:block" onSubmit={search}><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lumo-slate" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar colaboradores..." className="pl-9" /></form>
    <div className="flex-1 md:hidden" />
    <div className="ml-auto flex items-center gap-1.5 sm:gap-2"><CompanySwitcher /><Button variant="ghost" size="icon" aria-label="Ajuda" onClick={() => setHelpOpen(true)}><HelpCircle className="h-[18px] w-[18px] text-lumo-slate" /></Button><NotificationsPanel />
      <DropdownMenu><DropdownMenuTrigger className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumo-turquoise"><Avatar className="h-9 w-9"><AvatarFallback className="bg-lumo-ink text-white">{initials(currentUser.name)}</AvatarFallback></Avatar></DropdownMenuTrigger><DropdownMenuContent align="end"><div className="px-2.5 py-1.5"><p className="text-sm font-medium text-lumo-ink">{currentUser.name}</p><p className="text-xs text-lumo-slate">{currentUser.email}</p></div><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => setProfileOpen(true)}><User className="h-4 w-4" /> Meu perfil</DropdownMenuItem><DropdownMenuItem onSelect={() => router.push("/configuracoes")}><Settings className="h-4 w-4" /> Configurações</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-red-600 focus:bg-red-50" onSelect={async () => { await signOut(); router.replace("/login"); }}><LogOut className="h-4 w-4" /> Sair</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent><DialogHeader><DialogTitle>Meu perfil</DialogTitle><DialogDescription>Dados do usuário conectado ao painel.</DialogDescription></DialogHeader><div className="rounded-[10px] bg-slate-50 p-4 text-sm"><p className="font-medium text-lumo-ink">{currentUser.name}</p><p className="text-lumo-slate">{currentUser.email}</p><p className="mt-2 text-xs uppercase text-lumo-slate">Perfil: {currentUser.role}</p></div></DialogContent></Dialog>
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}><DialogContent><DialogHeader><DialogTitle>Ajuda do Lumo</DialogTitle><DialogDescription>Use a Lumo AI para dúvidas operacionais ou consulte as configurações do sistema.</DialogDescription></DialogHeader><div className="flex gap-2"><Button variant="ai" onClick={() => { setHelpOpen(false); router.push("/lumo-ai"); }}>Abrir Lumo AI</Button><Button variant="outline" onClick={() => { setHelpOpen(false); router.push("/configuracoes"); }}>Configurações</Button></div></DialogContent></Dialog>
  </header>;
}
