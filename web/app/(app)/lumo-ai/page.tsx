"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sendAIMessage } from "@/services/ai.service";
import { AIMessage } from "@/types";
import { cn } from "@/lib/utils";

const examplePrompts = [
  "Cadastre João como auxiliar de produção.",
  "Quem está de férias esta semana?",
  "Mostre colaboradores com documento vencido.",
  "Quais funcionários possuem horas extras?",
  "Crie um relatório de admissões deste mês.",
];

export default function LumoAIPage() {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setSending(true);
    try {
      const reply = await sendAIMessage(content);
      setMessages((prev) => [...prev, reply]);
    } catch (e) {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: e instanceof Error ? e.message : "Não consegui concluir a solicitação.", createdAt: new Date().toISOString() }]);
    } finally { setSending(false); }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-lumo-ai text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-lumo-ink">Lumo AI</h1>
          <p className="text-xs text-lumo-slate">Sua assistente de RH em linguagem natural</p>
        </div>
        <Badge variant="ai" className="ml-2">BETA</Badge>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-6 scrollbar-thin">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-lumo-ink">
                Olá! Eu sou a Lumo AI. Posso ajudar a consultar dados, cadastrar colaboradores e gerar relatórios
                usando apenas linguagem natural. O que você gostaria de fazer hoje?
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="rounded-[10px] border border-slate-200 px-3.5 py-2.5 text-left text-sm text-lumo-slate hover:border-violet-200 hover:bg-violet-50/50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-[10px] px-4 py-2.5 text-sm",
                m.role === "user" ? "ml-auto bg-lumo-ink text-white" : "bg-violet-50 text-lumo-ink"
              )}
            >
              {m.content}
            </div>
          ))}

          {sending && (
            <div className="max-w-[80%] rounded-[10px] bg-violet-50 px-4 py-2.5 text-sm text-lumo-slate">
              Pensando…
            </div>
          )}
        </CardContent>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-slate-100 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva sua solicitação em linguagem natural..."
            className="h-11 flex-1 rounded-[10px] border border-slate-200 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumo-ai"
          />
          <Button type="submit" variant="ai" size="lg" disabled={sending}>
            <Send className="h-4 w-4" /> Enviar
          </Button>
        </form>
      </Card>
    </div>
  );
}
