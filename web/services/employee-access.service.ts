import { hasBackendSession, invokeFunction } from "@/lib/supabase-rest";

export async function grantEmployeeMobileAccess(employeeId: string, email: string): Promise<string> {
  if (!hasBackendSession()) {
    return "Modo demonstração: acesso Mobile simulado com sucesso.";
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!employeeId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Informe um e-mail válido para liberar o acesso Mobile.");
  }
  const result = await invokeFunction<{ ok?: boolean; message?: string }>("lumo-employee-access-v1", {
    employee_id: employeeId,
    email: cleanEmail,
  });
  return result.message || "Acesso Mobile liberado com sucesso.";
}
