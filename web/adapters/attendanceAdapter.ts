// Adapter para os dados de ponto vindos do Guará Ponto.
import { AttendanceEntry, MobileAttendanceRecord } from "@/types";

export function adaptAttendanceEntry(raw: unknown): AttendanceEntry {
  // TODO: mapear payload real do Guará Ponto.
  return raw as AttendanceEntry;
}

export function adaptMobileAttendanceRecord(raw: unknown): MobileAttendanceRecord {
  // TODO: mapear payload real de marcações feitas pelo app.
  return raw as MobileAttendanceRecord;
}
