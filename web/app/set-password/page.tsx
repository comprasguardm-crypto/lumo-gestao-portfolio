"use client";

import { FormEvent, useEffect, useState } from "react";
import { acceptSessionFromRecoveryUrl, signOut, updateCurrentPassword } from "@/lib/supabase-rest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function SetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    try { const session = acceptSessionFromRecoveryUrl(); setReady(Boolean(session)); if (!session) setError("Este link não contém uma sessão válida. Solicite um novo convite ou redefinição de senha."); }
    catch (e) { setError(e instanceof Error ? e.message : "Link de senha inválido."); }
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setSaving(true);
    try { await updateCurrentPassword(password); await signOut(); setReady(false); setMessage("Senha definida com sucesso. Agora você pode entrar no aplicativo Lumo Gestão."); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível definir a senha."); }
    finally { setSaving(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-lumo-frost p-5"><Card className="w-full max-w-md"><CardContent className="space-y-5 p-6"><div><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-lumo-ink font-display font-bold text-lumo-turquoise">L</div><h1 className="font-display text-xl font-semibold text-lumo-ink">Definir nova senha</h1><p className="mt-1 text-sm text-lumo-slate">Crie sua senha de acesso ao Lumo Gestão.</p></div>{message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}{error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{ready && !message && <form onSubmit={submit} className="space-y-4"><label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Nova senha</span><Input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></label><label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>Confirmar senha</span><Input type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label><Button type="submit" variant="primary" className="w-full" disabled={saving}>{saving ? "Salvando..." : "Definir senha"}</Button></form>}</CardContent></Card></main>;
}
