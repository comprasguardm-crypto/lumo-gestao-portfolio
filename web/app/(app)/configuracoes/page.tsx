"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, CreditCard, Clock, Bell, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAccountInfo, getCompanySettings, getNotificationPreferences, getRolePermissions, RolePermissionMatrix, saveCompanySettings, saveNotificationPreferences } from "@/services/settings.service";

const settingsLinks = [
  { label: "Dados da empresa", description: "Razão social, CNPJ e nome fantasia", href: "#empresa", icon: Building2 },
  { label: "Usuários e permissões", description: "Papel e matriz de acesso", href: "#permissoes", icon: Shield },
  { label: "Plano e cobrança", description: "Assinatura e limite de colaboradores", href: "/configuracoes/plano", icon: CreditCard },
  { label: "Local de ponto", description: "Geolocalização permitida para batidas", href: "/configuracoes/ponto", icon: Clock },
  { label: "Notificações", description: "Preferências de alertas", href: "#notificacoes", icon: Bell },
];

export default function ConfiguracoesPage() {
  const [account, setAccount] = useState<{ name: string; role: string } | null>(null);
  const [company, setCompany] = useState({ legalName: "", tradeName: "", cnpj: "" });
  const [notifications, setNotifications] = useState<Record<string, boolean>>({ point: true, vacation: true, documents: true, bank: true });
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAccountInfo(), getCompanySettings(), getNotificationPreferences(), getRolePermissions()])
      .then(([a, c, n, permissions]) => { setAccount(a); setCompany({ legalName: c.legalName, tradeName: c.tradeName, cnpj: c.cnpj }); setNotifications(n); setRolePermissions(permissions); })
      .catch((e) => setError(e instanceof Error ? e.message : "Não foi possível carregar as configurações."))
      .finally(() => setLoading(false));
  }, []);

  async function saveCompany() {
    setSaving(true); setError(""); setMessage("");
    try { await saveCompanySettings(company); setMessage("Dados da empresa salvos com sucesso."); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar os dados da empresa."); }
    finally { setSaving(false); }
  }
  async function saveNotifications() {
    setSaving(true); setError(""); setMessage("");
    try { await saveNotificationPreferences(notifications); setMessage("Preferências de notificação salvas."); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar as preferências."); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <div><h1 className="font-display text-xl font-semibold text-lumo-ink">Configurações</h1><p className="mt-1 text-sm text-lumo-slate">Gerencie os dados e preferências da empresa atual.</p></div>
    {loading && <p className="text-sm text-lumo-slate">Carregando configurações...</p>}
    {message && <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}
    {error && <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{settingsLinks.map((link) => <Link key={link.label} href={link.href}><Card className="transition-colors hover:border-lumo-turquoise/40 hover:bg-slate-50"><CardContent className="flex items-center gap-4 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-lumo-ink"><link.icon className="h-[18px] w-[18px]" /></span><div className="min-w-0 flex-1"><p className="font-display text-sm font-semibold text-lumo-ink">{link.label}</p><p className="truncate text-xs text-lumo-slate">{link.description}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-lumo-slate" /></CardContent></Card></Link>)}</div>
    <Card id="empresa"><CardContent className="space-y-4 p-6"><h2 className="font-display text-sm font-semibold text-lumo-ink">Dados da empresa</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Field label="Razão social"><Input value={company.legalName} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} /></Field><Field label="Nome fantasia"><Input value={company.tradeName} onChange={(e) => setCompany({ ...company, tradeName: e.target.value })} /></Field><Field label="CNPJ"><Input value={company.cnpj} onChange={(e) => setCompany({ ...company, cnpj: e.target.value })} /></Field></div><Button variant="primary" size="sm" disabled={saving || loading} onClick={saveCompany}>{saving ? "Salvando..." : "Salvar alterações"}</Button></CardContent></Card>
    <Card id="notificacoes"><CardContent className="space-y-4 p-6"><h2 className="font-display text-sm font-semibold text-lumo-ink">Notificações</h2><Toggle label="Ponto" checked={notifications.point !== false} onChange={(v) => setNotifications({ ...notifications, point: v })} /><Toggle label="Férias" checked={notifications.vacation !== false} onChange={(v) => setNotifications({ ...notifications, vacation: v })} /><Toggle label="Documentos" checked={notifications.documents !== false} onChange={(v) => setNotifications({ ...notifications, documents: v })} /><Toggle label="Banco de horas" checked={notifications.bank !== false} onChange={(v) => setNotifications({ ...notifications, bank: v })} /><Button variant="primary" size="sm" disabled={saving || loading} onClick={saveNotifications}>{saving ? "Salvando..." : "Salvar preferências"}</Button></CardContent></Card>
    <Card id="permissoes"><CardContent className="space-y-4 p-6"><h2 className="font-display text-sm font-semibold text-lumo-ink">Usuários e permissões</h2><p className="text-xs text-lumo-slate">Papel atual de {account?.name || "usuário"}: <span className="font-medium text-lumo-ink">{account?.role || "—"}</span></p>{rolePermissions.length ? <div className="overflow-x-auto rounded-[10px] border border-slate-200"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-lumo-slate"><tr><th className="px-3 py-2 font-medium">Perfil</th><th className="px-3 py-2 font-medium">Permissões efetivas</th></tr></thead><tbody className="divide-y divide-slate-100">{rolePermissions.map((row) => <tr key={row.role}><td className="px-3 py-2 font-medium capitalize text-lumo-ink">{row.role}</td><td className="px-3 py-2 text-lumo-slate">{Object.entries(row.permissions).filter(([, enabled]) => enabled).map(([key]) => permissionLabel(key)).join(", ") || "Somente acesso básico"}</td></tr>)}</tbody></table></div> : <p className="text-xs text-lumo-slate">Nenhuma matriz de permissão disponível.</p>}<p className="text-xs text-lumo-slate">Esta matriz é lida do Supabase; as operações continuam protegidas por RLS e permissões granulares no backend.</p></CardContent></Card>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center justify-between rounded-[10px] border border-slate-200 p-3 text-sm text-lumo-ink"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-emerald-500" /></label>; }

function permissionLabel(key: string) {
  const labels: Record<string, string> = {
    "point.view": "ver ponto", "point.edit": "editar ponto", "vacation.view": "ver férias", "vacation.edit": "editar férias",
    "documents.manage": "gerenciar documentos", "reports.view": "ver relatórios", "users.manage": "gerenciar usuários",
    "close.manage": "fechamentos", "audit.restore": "restaurar auditoria", "backup.manage": "backups", "integrations.manage": "integrações",
  };
  return labels[key] || key;
}
