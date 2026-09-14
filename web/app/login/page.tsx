"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LumoBrand } from "@/components/brand/lumo-logo";
import { requestPasswordReset, signInWithPassword } from "@/lib/supabase-rest";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.localStorage.removeItem("lumo.demo-mode");
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await signInWithPassword(email, password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  async function recover() {
    if (!email.includes("@")) {
      setError("Informe seu e-mail para recuperar a senha.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setMessage("E-mail de recuperação solicitado. Verifique sua caixa de entrada.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível solicitar a recuperação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#001f18] px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-lumo-turquoise/10 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <LumoBrand dark />
        </div>

        <Card className="border-white/10 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur">
          <CardContent className="p-7">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <h1 className="font-display text-xl font-semibold text-lumo-ink">Entrar no painel</h1>
                <p className="mt-1 text-sm text-lumo-slate">Use o acesso fornecido pelo RH da sua empresa.</p>
              </div>

              <label className="block space-y-1.5 text-xs font-medium text-lumo-slate">
                <span>E-mail</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lumo-slate" />
                  <Input className="pl-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </label>

              <label className="block space-y-1.5 text-xs font-medium text-lumo-slate">
                <span>Senha</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lumo-slate" />
                  <Input className="pl-9" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </label>

              {error && <p className="rounded-[10px] bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
              {message && <p className="rounded-[10px] bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}

              <Button type="submit" className="w-full" variant="primary" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <button type="button" onClick={recover} className="w-full text-center text-xs font-medium text-lumo-slate hover:text-lumo-ink">
                Esqueci minha senha
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link className="hover:text-white hover:underline" href="/privacidade">Política de Privacidade</Link>
          <Link className="hover:text-white hover:underline" href="/exclusao-de-dados">Exclusão de dados</Link>
        </div>
      </div>
    </main>
  );
}
