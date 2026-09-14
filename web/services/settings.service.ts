import { getBackendContext, hasBackendSession, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";
import { mockCurrentUser, mockCompanies } from "@/mocks/company";

export type AccountInfo = { name: string; email: string; role: string; companyId: string; companyName: string };
export type CompanySettings = { id: string; legalName: string; tradeName: string; cnpj: string; status: string; planCode: string; employeeLimit: number };
export type SubscriptionInfo = { planCode: string; status: string; seats: number; monthlyAmount: number; setupAmount: number; billingProvider?: string | null; nextBillingDate?: string | null };
export type RolePermissionMatrix = { role: string; permissions: Record<string, boolean> };

export async function getAccountInfo(): Promise<AccountInfo> {
  if (!hasBackendSession()) return { name: mockCurrentUser.name, email: mockCurrentUser.email, role: mockCurrentUser.role, companyId: mockCompanies[0].id, companyName: mockCompanies[0].name };
  const { session, profile } = await getBackendContext();
  type Company = { id: string; trade_name?: string | null; legal_name: string };
  const rows = await restSelect<Company[]>("ponto_companies", `select=id,trade_name,legal_name&id=eq.${encodeURIComponent(profile.company_id)}&limit=1`);
  const company = rows[0];
  return {
    name: profile.full_name || session.user.email || "Usuário Lumo",
    email: session.user.email || "",
    role: profile.role,
    companyId: profile.company_id,
    companyName: company?.trade_name || company?.legal_name || "Minha empresa",
  };
}

export async function getCompanySettings(): Promise<CompanySettings> {
  if (!hasBackendSession()) return { id: mockCompanies[0].id, legalName: mockCompanies[0].name, tradeName: mockCompanies[0].name, cnpj: "", status: "active", planCode: "professional", employeeLimit: 50 };
  const { profile } = await getBackendContext();
  type Row = { id: string; legal_name: string; trade_name?: string | null; cnpj?: string | null; status: string; plan_code: string; employee_limit: number };
  const rows = await restSelect<Row[]>("ponto_companies", `select=id,legal_name,trade_name,cnpj,status,plan_code,employee_limit&id=eq.${encodeURIComponent(profile.company_id)}&limit=1`);
  if (!rows[0]) throw new Error("Empresa não encontrada.");
  const row = rows[0];
  return { id: row.id, legalName: row.legal_name, tradeName: row.trade_name || "", cnpj: row.cnpj || "", status: row.status, planCode: row.plan_code, employeeLimit: row.employee_limit };
}

export async function saveCompanySettings(input: Pick<CompanySettings, "legalName" | "tradeName" | "cnpj">) {
  if (!hasBackendSession()) return;
  const { profile } = await getBackendContext();
  if (profile.role !== "admin") throw new Error("Somente administradores podem alterar os dados da empresa.");
  await restUpdate("ponto_companies", `id=eq.${encodeURIComponent(profile.company_id)}`, { legal_name: input.legalName.trim(), trade_name: input.tradeName.trim() || null, cnpj: input.cnpj.trim() || null, updated_at: new Date().toISOString() });
}

export async function getNotificationPreferences(): Promise<Record<string, boolean>> {
  if (!hasBackendSession()) return { point: true, vacation: true, documents: true, bank: true, tasks: true, integration: true };
  const { session } = await getBackendContext();
  type Row = { notification_config?: Record<string, boolean> | null };
  const rows = await restSelect<Row[]>("ponto_user_preferences", `select=notification_config&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`);
  return { point: true, vacation: true, documents: true, bank: true, tasks: true, integration: true, ...(rows[0]?.notification_config || {}) };
}

export async function saveNotificationPreferences(config: Record<string, boolean>) {
  if (!hasBackendSession()) return;
  const { session, profile } = await getBackendContext();
  type Row = { user_id: string };
  const rows = await restSelect<Row[]>("ponto_user_preferences", `select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`);
  if (!rows.length) {
    await restInsert("ponto_user_preferences", { user_id: session.user.id, company_id: profile.company_id, notification_config: config, updated_at: new Date().toISOString() });
  } else {
    await restUpdate("ponto_user_preferences", `user_id=eq.${encodeURIComponent(session.user.id)}`, { company_id: profile.company_id, notification_config: config, updated_at: new Date().toISOString() });
  }
}

export async function getSubscription(): Promise<SubscriptionInfo> {
  if (!hasBackendSession()) return { planCode: "professional", status: "demo", seats: 50, monthlyAmount: 0, setupAmount: 0 };
  const { profile } = await getBackendContext();
  type Row = { plan_code: string; status: string; seats: number; monthly_amount: number | string; setup_amount: number | string; billing_provider?: string | null; next_billing_date?: string | null };
  const rows = await restSelect<Row[]>("ponto_subscriptions", `select=plan_code,status,seats,monthly_amount,setup_amount,billing_provider,next_billing_date&company_id=eq.${encodeURIComponent(profile.company_id)}&limit=1`);
  const row = rows[0];
  if (!row) {
    const company = await getCompanySettings();
    return { planCode: company.planCode, status: "active", seats: company.employeeLimit, monthlyAmount: 0, setupAmount: 0 };
  }
  return { planCode: row.plan_code, status: row.status, seats: row.seats, monthlyAmount: Number(row.monthly_amount || 0), setupAmount: Number(row.setup_amount || 0), billingProvider: row.billing_provider, nextBillingDate: row.next_billing_date };
}


export async function getRolePermissions(): Promise<RolePermissionMatrix[]> {
  if (!hasBackendSession()) {
    return [
      { role: "admin", permissions: { "point.view": true, "point.edit": true, "vacation.view": true, "vacation.edit": true, "documents.manage": true, "reports.view": true, "users.manage": true } },
      { role: "gestor", permissions: { "point.view": true, "point.edit": true, "vacation.view": true, "vacation.edit": true, "documents.manage": true, "reports.view": true, "users.manage": false } },
      { role: "consulta", permissions: { "point.view": true, "point.edit": false, "vacation.view": true, "vacation.edit": false, "documents.manage": false, "reports.view": true, "users.manage": false } },
      { role: "colaborador", permissions: { "point.view": true, "point.edit": false, "vacation.view": true, "vacation.edit": false, "documents.manage": false, "reports.view": false, "users.manage": false } },
    ];
  }
  type Row = { role: string; permissions: Record<string, boolean> | null };
  const rows = await restSelect<Row[]>("ponto_role_permissions", "select=role,permissions&order=role.asc");
  return rows.map((row) => ({ role: row.role, permissions: row.permissions || {} }));
}
