import { AIMessage } from "@/types";
import { hasBackendSession, invokeFunction } from "@/lib/supabase-rest";

export async function sendAIMessage(content: string): Promise<AIMessage> {
  const message = content.trim();
  if (!message) throw new Error("Digite uma mensagem para a Lumo AI.");
  if (!hasBackendSession()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return {
      id: `demo-ai-${Date.now()}`,
      role: "assistant",
      content: "Você está no modo demonstração. Entre com uma conta real para a Lumo AI consultar dados protegidos da empresa.",
      createdAt: new Date().toISOString(),
    };
  }
  type Response = { answer?: string; error?: string; message_id?: string; mode?: string };
  const response = await invokeFunction<Response>("guara-rh-assistant-v8", {
    action: "chat",
    message,
    context: { surface: "lumo_web" },
  });
  const answer = String(response.answer || response.error || "Não consegui gerar uma resposta agora.");
  return {
    id: response.message_id || `ai-${Date.now()}`,
    role: "assistant",
    content: answer,
    createdAt: new Date().toISOString(),
  };
}
