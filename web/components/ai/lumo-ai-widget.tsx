"use client";

import { useState } from "react";
import { Sparkles, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sendAIMessage } from "@/services/ai.service";
import { AIMessage } from "@/types";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  "Quem está de férias esta semana?",
  "Mostre colaboradores com documento vencido.",
  "Quais funcionários possuem horas extras?",
];

export function LumoAIWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    const userMessage: AIMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
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
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-lumo-ai text-white shadow-popover transition-transform hover:scale-105",
          open && "hidden"
        )}
        aria-label="Abrir Lumo AI"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex h-[32rem] w-[23rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-lg border border-violet-200/70 bg-white shadow-popover animate-fade-in">
          <div className="flex items-center justify-between bg-lumo-ai px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-display text-sm font-semibold">Lumo AI</span>
              <Badge className="bg-white/15 text-white">BETA</Badge>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-lumo-ink">O que você gostaria de fazer hoje?</p>
                <div className="space-y-1.5">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="block w-full rounded-[10px] border border-slate-200 px-3 py-2 text-left text-xs text-lumo-slate hover:border-violet-200 hover:bg-violet-50/50"
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
                  "max-w-[85%] rounded-[10px] px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-lumo-ink text-white"
                    : "bg-violet-50 text-lumo-ink"
                )}
              >
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="max-w-[85%] rounded-[10px] bg-violet-50 px-3 py-2 text-sm text-lumo-slate">
                Pensando…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva sua solicitação em linguagem natural..."
              className="h-9 flex-1 rounded-[10px] border border-slate-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumo-ai"
            />
            <Button type="submit" size="icon" variant="ai" disabled={sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
