import { mockVacations } from "@/mocks/vacations";
import { Vacation, VacationStatus } from "@/types";
import { readLocalList, writeLocalList } from "@/lib/local-storage";
import { getBackendContext, hasBackendSession, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";
import { listEmployees } from "@/services/employees.service";

const SIMULATED_DELAY_MS = 120;
const STORAGE_KEY = "lumo.vacations";

type BackendRequest = {
  id: string;
  employee_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  manager_note?: string | null;
  decided_by?: string | null;
};

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));
}
function loadVacations(): Vacation[] {
  return readLocalList<Vacation>(STORAGE_KEY, mockVacations);
}
function daysBetween(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`); const b = new Date(`${end}T12:00:00`);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
}
function backendStatus(status: string): VacationStatus {
  if (status === "approved") return "aprovada";
  if (status === "rejected") return "rejeitada";
  if (status === "cancelled") return "cancelada";
  return "em_analise";
}
function dbStatus(status: VacationStatus) {
  if (status === "aprovada" || status === "agendada") return "approved";
  if (status === "rejeitada") return "rejected";
  if (status === "cancelada") return "cancelled";
  return "pending";
}

export async function listVacations(): Promise<Vacation[]> {
  if (hasBackendSession()) {
    const { profile } = await getBackendContext();
    const [requests, employees] = await Promise.all([
      restSelect<BackendRequest[]>("ponto_employee_requests", `select=id,employee_id,start_date,end_date,status,manager_note,decided_by&company_id=eq.${encodeURIComponent(profile.company_id)}&request_type=eq.vacation&order=created_at.desc`),
      listEmployees(),
    ]);
    const names = new Map(employees.map((employee) => [employee.id, employee.name]));
    return requests.filter((r) => r.employee_id && r.start_date && r.end_date).map((r) => ({
      id: r.id,
      employeeId: r.employee_id!,
      employeeName: names.get(r.employee_id!) || "Colaborador",
      startDate: r.start_date!,
      endDate: r.end_date!,
      days: daysBetween(r.start_date!, r.end_date!),
      status: backendStatus(r.status),
      approver: r.decided_by ? "RH / Gestor" : undefined,
    }));
  }
  return delay(loadVacations());
}

export async function requestVacation(input: { employeeId: string; startDate: string; days: number; note?: string }): Promise<Vacation> {
  const employees = await listEmployees();
  const employee = employees.find((item) => item.id === input.employeeId);
  if (!employee) throw new Error("Colaborador não encontrado");
  const start = new Date(`${input.startDate}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(1, input.days) - 1);
  const endDate = end.toISOString().slice(0, 10);

  if (hasBackendSession()) {
    const { session, profile } = await getBackendContext();
    const row = await restInsert<BackendRequest>("ponto_employee_requests", {
      company_id: profile.company_id,
      employee_id: employee.id,
      created_by: session.user.id,
      request_type: "vacation",
      start_date: input.startDate,
      end_date: endDate,
      message: input.note?.trim() || "Solicitação de férias",
      status: "pending",
      approval_payload: {},
    });
    return { id: row.id, employeeId: employee.id, employeeName: employee.name, startDate: input.startDate, endDate, days: Math.max(1, input.days), status: "em_analise" };
  }

  const created: Vacation = { id: `v-${Date.now()}`, employeeId: employee.id, employeeName: employee.name, startDate: input.startDate, endDate, days: Math.max(1, input.days), status: "em_analise" };
  const vacations = loadVacations();
  writeLocalList(STORAGE_KEY, [created, ...vacations]);
  return delay(created);
}

export async function setVacationStatus(id: string, status: VacationStatus, approver = "RH / Gestor"): Promise<Vacation> {
  if (hasBackendSession()) {
    const { profile } = await getBackendContext();
    const updated = await restUpdate<BackendRequest>("ponto_employee_requests", `company_id=eq.${encodeURIComponent(profile.company_id)}&id=eq.${encodeURIComponent(id)}&request_type=eq.vacation`, {
      status: dbStatus(status),
      manager_note: status === "rejeitada" ? "Solicitação rejeitada pelo RH/gestor." : null,
      decided_at: status === "em_analise" ? null : new Date().toISOString(),
      ...(status === "em_analise" ? {} : { decided_by: (await getBackendContext()).session.user.id }),
    });
    const employees = await listEmployees();
    const employee = employees.find((e) => e.id === updated.employee_id);
    const startDate = updated.start_date || new Date().toISOString().slice(0, 10);
    const endDate = updated.end_date || startDate;
    return { id: updated.id, employeeId: updated.employee_id || "", employeeName: employee?.name || "Colaborador", startDate, endDate, days: daysBetween(startDate, endDate), status, approver };
  }

  const vacations = loadVacations();
  const index = vacations.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Solicitação não encontrada");
  const updated = { ...vacations[index], status, approver: status === "aprovada" || status === "agendada" ? approver : vacations[index].approver };
  vacations[index] = updated;
  writeLocalList(STORAGE_KEY, vacations);
  return delay(updated);
}
