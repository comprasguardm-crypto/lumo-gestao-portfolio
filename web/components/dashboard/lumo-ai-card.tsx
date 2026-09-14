"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendAIMessage } from "@/services/ai.service";

const examplePrompts = [
  "Cadastre João como auxiliar de produção.",
  "Quem está de férias esta semana?",
  "Mostre colaboradores com documento vencido.",
  "Quais funcionários possuem horas extras?",
  "Crie um relatório de admissões deste mês.",
];

export function LumoAICard() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const message = await sendAIMessage(input);
      setReply(message.content);
    } catch (e) {
      setReply(e instanceof Error ? e.message : "Não consegui concluir a solicitação.");
    } finally { setSending(false); }
  }

  return (
    <Card className="overflow-hidden border-violet-200/60 bg-gradient-to-br from-violet-50 via-white to-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-lumo-ai text-white">
            <Sparkles className="h-[18px] w-[18px]" />
          </span>
          <h3 className="font-display text-base font-semibold text-lumo-ink">Lumo AI</h3>
          <Badge variant="ai">BETA</Badge>
        </div>

        <p className="mt-4 text-sm text-lumo-ink">O que você gostaria de fazer hoje?</p>

        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva sua solicitação em linguagem natural..."
            className="bg-white"
          />
          <Button type="submit" variant="ai" disabled={sending}>
            Enviar
          </Button>
        </form>

        {reply && <p className="mt-3 rounded-[10px] bg-white/70 p-3 text-xs text-lumo-slate">{reply}</p>}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {examplePrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-xs text-lumo-ai hover:bg-violet-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <Link
          href="/lumo-ai"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-lumo-ai hover:underline"
        >
          Abrir Lumo AI completo <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
