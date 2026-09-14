"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getBackendContext } from "@/lib/supabase-rest";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function validate() {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("Sessão ausente");
        await getBackendContext();
        if (active) setReady(true);
      } catch {
        if (active) router.replace("/login");
      }
    }
    validate();
    return () => { active = false; };
  }, [router]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-lumo-slate">Validando acesso ao Lumo...</div>;
  }
  return <>{children}</>;
}
