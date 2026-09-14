import { mockAttendanceToday, mockMobileAttendanceRecords } from "@/mocks/attendance";
import { AttendanceEntry, MobileAttendanceRecord } from "@/types";
import { getBackendContext, hasBackendSession, restInsert, restSelect } from "@/lib/supabase-rest";
import { listEmployees } from "@/services/employees.service";

const SIMULATED_DELAY_MS = 180;
function delay<T>(value: T): Promise<T> { return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS)); }
function todayLocal() {
  const d = new Date();
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function minutes(t?: string | null) {
  if (!t) return null; const [h, m] = t.slice(0, 5).split(":").map(Number); return h * 60 + m;
}
function worked(entry: { entry_time?: string | null; lunch_out?: string | null; lunch_in?: string | null; exit_time?: string | null }) {
  const a = minutes(entry.entry_time), b = minutes(entry.lunch_out), c = minutes(entry.lunch_in), d = minutes(entry.exit_time);
  if (a == null || d == null) return undefined;
  const total = Math.max(0, d - a - (b != null && c != null ? Math.max(0, c - b) : 0));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}h${String(total % 60).padStart(2, "0")}`;
}

export async function listTodayAttendance(): Promise<AttendanceEntry[]> {
  if (hasBackendSession()) {
    type Row = { id: string; employee_id: string; work_date: string; entry_time?: string | null; lunch_out?: string | null; lunch_in?: string | null; exit_time?: string | null };
    const [rows, employees] = await Promise.all([
      restSelect<Row[]>("ponto_entries", `select=id,employee_id,work_date,entry_time,lunch_out,lunch_in,exit_time&work_date=eq.${todayLocal()}&deleted_at=is.null&order=entry_time.asc.nullslast`),
      listEmployees(),
    ]);
    const names = new Map(employees.map((e) => [e.id, e.name]));
    return rows.map((r) => ({
      id: r.id, employeeId: r.employee_id, employeeName: names.get(r.employee_id) || "Colaborador", date: r.work_date,
      checkIn: r.entry_time?.slice(0, 5), lunchOut: r.lunch_out?.slice(0, 5), lunchIn: r.lunch_in?.slice(0, 5), checkOut: r.exit_time?.slice(0, 5),
      workedHours: worked(r), status: r.exit_time ? "completo" : "incompleto",
    }));
  }
  return delay(mockAttendanceToday);
}

export async function listMobileAttendanceRecords(): Promise<MobileAttendanceRecord[]> {
  if (hasBackendSession()) {
    type Punch = { id: string; employee_id: string; punch_type: string; occurred_at: string; latitude: number; longitude: number; accuracy_m: number | string; distance_m: number | string; device_info?: Record<string, unknown> | null };
    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const { profile } = await getBackendContext();
    const [rows, employees] = await Promise.all([
      restSelect<Punch[]>("ponto_punches", `select=id,employee_id,punch_type,occurred_at,latitude,longitude,accuracy_m,distance_m,device_info&company_id=eq.${encodeURIComponent(profile.company_id)}&occurred_at=gte.${encodeURIComponent(start.toISOString())}&order=occurred_at.desc&limit=200`),
      listEmployees(),
    ]);
    const names = new Map(employees.map((e) => [e.id, e.name]));
    const labels: Record<string, MobileAttendanceRecord["type"]> = { entry: "entrada", break_out: "saida_intervalo", break_in: "retorno_intervalo", exit: "saida" };
    return rows.map((r) => {
      const at = new Date(r.occurred_at);
      const device = r.device_info || {};
      return {
        id: r.id, employeeId: r.employee_id, employeeName: names.get(r.employee_id) || "Colaborador",
        date: at.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        time: at.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
        type: labels[r.punch_type] || "entrada",
        latitude: Number(r.latitude), longitude: Number(r.longitude), distanceFromAllowedMeters: Math.round(Number(r.distance_m)), gpsAccuracyMeters: Math.round(Number(r.accuracy_m)),
        device: String(device["model"] || device["platform"] || device["source"] || "Aplicativo Lumo"), status: "validado",
      };
    });
  }
  return delay(mockMobileAttendanceRecords);
}

export interface AttendanceAdjustmentRequest {
  employeeId: string;
  date: string;
  fieldToCorrect: "checkIn" | "lunchOut" | "lunchIn" | "checkOut";
  reportedTime: string;
  justification: string;
}

export async function requestAttendanceAdjustment(payload: AttendanceAdjustmentRequest): Promise<{ success: boolean }> {
  if (hasBackendSession()) {
    const { session, profile } = await getBackendContext();
    await restInsert("ponto_employee_requests", {
      company_id: profile.company_id,
      employee_id: payload.employeeId,
      created_by: session.user.id,
      request_type: "attendance_adjustment",
      reference_date: payload.date,
      message: payload.justification,
      status: "pending",
      approval_payload: { field: payload.fieldToCorrect, reported_time: payload.reportedTime },
    });
    return { success: true };
  }
  return delay({ success: true });
}

export async function listEmployeeAttendance(employeeId: string, limit = 30): Promise<AttendanceEntry[]> {
  if (!hasBackendSession()) {
    return delay(mockAttendanceToday.filter((item) => item.employeeId === employeeId));
  }
  type Row = { id: string; employee_id: string; work_date: string; entry_time?: string | null; lunch_out?: string | null; lunch_in?: string | null; exit_time?: string | null };
  const [rows, employee] = await Promise.all([
    restSelect<Row[]>("ponto_entries", `select=id,employee_id,work_date,entry_time,lunch_out,lunch_in,exit_time&employee_id=eq.${encodeURIComponent(employeeId)}&deleted_at=is.null&order=work_date.desc&limit=${Math.max(1, Math.min(90, limit))}`),
    listEmployees().then((items) => items.find((item) => item.id === employeeId)),
  ]);
  return rows.map((r) => ({
    id: r.id, employeeId: r.employee_id, employeeName: employee?.name || "Colaborador", date: r.work_date,
    checkIn: r.entry_time?.slice(0, 5), lunchOut: r.lunch_out?.slice(0, 5), lunchIn: r.lunch_in?.slice(0, 5), checkOut: r.exit_time?.slice(0, 5),
    workedHours: worked(r), status: r.exit_time ? "completo" : "incompleto",
  }));
}
