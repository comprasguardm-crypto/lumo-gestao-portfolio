import { mockDashboardMetrics, mockRecentActivities, mockPendingItems } from "@/mocks/dashboard";
import { DashboardMetrics, PendingItem, RecentActivity } from "@/types";
import { getBackendContext, hasBackendSession } from "@/lib/supabase-rest";
import { listEmployees } from "@/services/employees.service";
import { listVacations } from "@/services/vacations.service";
import { listMobileAttendanceRecords, listTodayAttendance } from "@/services/attendance.service";
import { listDocuments } from "@/services/documents.service";

const SIMULATED_DELAY_MS = 150;
function delay<T>(value: T): Promise<T> { return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS)); }

export async function getDashboardUserName() {
  if (!hasBackendSession()) return "Usuário Demo";
  const { profile, session } = await getBackendContext();
  return profile.full_name || String(session.user.user_metadata?.["full_name"] || session.user.email || "Usuário");
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!hasBackendSession()) return delay(mockDashboardMetrics);
  const [employees, vacations, attendance, documents] = await Promise.all([listEmployees(), listVacations(), listTodayAttendance(), listDocuments()]);
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const activeEmployees = employees.filter((e) => e.status !== "desligado");
  const byArea = new Map<string, number>();
  activeEmployees.forEach((e) => byArea.set(e.department || "Outros", (byArea.get(e.department || "Outros") || 0) + 1));
  return {
    employeesTotal: activeEmployees.length,
    presentToday: attendance.filter((a) => Boolean(a.checkIn)).length,
    employeesChangePct: 0,
    vacationsPending: vacations.filter((v) => v.status === "em_analise").length,
    vacationsAwaitingApproval: vacations.filter((v) => v.status === "em_analise").length,
    admissionsThisMonth: employees.filter((e) => e.admissionDate?.startsWith(monthPrefix)).length,
    admissionsThisWeek: employees.filter((e) => { if (!e.admissionDate) return false; const d = new Date(`${e.admissionDate}T12:00:00`); const diff = now.getTime() - d.getTime(); return diff >= 0 && diff <= 7 * 86400000; }).length,
    documentsAwaitingSignature: documents.filter((d) => d.status === "aguardando_assinatura" || d.status === "pendente" || d.status === "vencido").length,
    attendancePendingAdjustments: attendance.filter((a) => a.status === "incompleto" || a.status === "ajuste_solicitado").length,
    birthdaysThisWeek: 0,
    employeesByArea: [...byArea.entries()].map(([area, total]) => ({ area, total })),
  };
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  if (!hasBackendSession()) return delay(mockRecentActivities);
  const punches = await listMobileAttendanceRecords();
  const labels = { entrada: "Registrou entrada", saida_intervalo: "Saiu para intervalo", retorno_intervalo: "Retornou do intervalo", saida: "Registrou saída" } as const;
  if (punches.length) return punches.slice(0, 6).map((item) => ({ id: item.id, employeeName: item.employeeName, action: labels[item.type], timeAgo: `${item.date} ${item.time}` }));
  const attendance = await listTodayAttendance();
  return attendance.slice(0, 6).map((entry) => ({ id: `attendance-${entry.id}`, employeeName: entry.employeeName, action: entry.checkOut ? "Jornada concluída" : "Registro de ponto atualizado", timeAgo: entry.checkOut || entry.checkIn || "Hoje" }));
}

export async function getPendingItems(): Promise<PendingItem[]> {
  if (!hasBackendSession()) return delay(mockPendingItems);
  const [vacations, attendance, documents] = await Promise.all([listVacations(), listTodayAttendance(), listDocuments()]);
  const items: PendingItem[] = [];
  const vacationCount = vacations.filter((v) => v.status === "em_analise").length;
  const pointCount = attendance.filter((a) => a.status === "incompleto" || a.status === "ajuste_solicitado").length;
  const expired = documents.filter((d) => d.status === "vencido").length;
  const nearExpiry = documents.filter((d) => { if (!d.expiresAt || d.status === "vencido") return false; const diff = new Date(`${d.expiresAt}T23:59:59`).getTime() - Date.now(); const days = diff / 86400000; return days >= 0 && days <= (d.reminderDays ?? 30); }).length;
  if (vacationCount) items.push({ id: "vacations-live", description: `${vacationCount} solicitação(ões) de férias aguardando análise`, priority: "media", actionLabel: "Revisar", href: "/ferias" });
  if (pointCount) items.push({ id: "attendance-live", description: `${pointCount} jornada(s) de hoje incompleta(s)`, priority: "alta", actionLabel: "Ver ponto", href: "/ponto" });
  if (expired) items.push({ id: "documents-expired", description: `${expired} documento(s) vencido(s)`, priority: "alta", actionLabel: "Revisar", href: "/documentos" });
  if (nearExpiry) items.push({ id: "documents-near", description: `${nearExpiry} documento(s) próximo(s) do vencimento`, priority: "media", actionLabel: "Ver documentos", href: "/documentos" });
  return items;
}
