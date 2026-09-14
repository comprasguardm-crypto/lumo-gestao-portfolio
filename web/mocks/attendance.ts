import { AttendanceEntry, MobileAttendanceRecord } from "@/types";

export const mockAttendanceToday: AttendanceEntry[] = [
  { id: "at1", employeeId: "e1", employeeName: "João Silva", date: "2026-09-08", checkIn: "07:58", lunchOut: "12:01", lunchIn: "13:00", checkOut: "17:02", workedHours: "08h03", status: "completo" },
  { id: "at2", employeeId: "e5", employeeName: "Rafael Nunes", date: "2026-09-08", checkIn: "08:04", lunchOut: "12:15", lunchIn: "13:10", checkOut: "18:20", workedHours: "09h11", status: "completo" },
  { id: "at3", employeeId: "e7", employeeName: "Bruno Cardoso", date: "2026-09-08", status: "afastamento" },
  { id: "at4", employeeId: "e8", employeeName: "Juliana Rocha", date: "2026-09-08", checkIn: "08:32", lunchOut: "12:00", lunchIn: "12:58", status: "incompleto" },
  { id: "at5", employeeId: "e11", employeeName: "Eduardo Barros", date: "2026-09-08", checkIn: "07:55", lunchOut: "12:00", lunchIn: "13:00", checkOut: "17:00", workedHours: "08h05", status: "completo" },
  { id: "at6", employeeId: "e13", employeeName: "Thiago Almeida", date: "2026-09-08", status: "falta" },
  { id: "at7", employeeId: "e16", employeeName: "Amanda Teixeira", date: "2026-09-08", status: "ferias" },
  { id: "at8", employeeId: "e18", employeeName: "Vanessa Duarte", date: "2026-09-08", checkIn: "08:01", lunchOut: "12:03", lunchIn: "13:02", checkOut: "17:01", workedHours: "07h55", status: "ajustado" },
  { id: "at9", employeeId: "e21", employeeName: "Igor Farias", date: "2026-09-08", checkIn: "08:19", status: "ajuste_solicitado" },
  { id: "at10", employeeId: "e24", employeeName: "Sabrina Lopes", date: "2026-09-08", checkIn: "07:50", lunchOut: "12:00", lunchIn: "13:00", checkOut: "17:45", workedHours: "08h55", status: "completo" },
];

export const mockMobileAttendanceRecords: MobileAttendanceRecord[] = [
  { id: "mr1", employeeId: "e1", employeeName: "João Silva", date: "2026-09-08", time: "07:58", type: "entrada", latitude: -23.5613, longitude: -46.6558, distanceFromAllowedMeters: 12, gpsAccuracyMeters: 8, device: "iPhone 13 · iOS 18.1", status: "validado" },
  { id: "mr2", employeeId: "e8", employeeName: "Juliana Rocha", date: "2026-09-08", time: "08:32", type: "entrada", latitude: -23.5622, longitude: -46.6541, distanceFromAllowedMeters: 340, gpsAccuracyMeters: 65, device: "Moto G73 · Android 14", status: "suspeito" },
  { id: "mr3", employeeId: "e21", employeeName: "Igor Farias", date: "2026-09-08", time: "08:19", type: "entrada", latitude: -23.5608, longitude: -46.6549, distanceFromAllowedMeters: 45, gpsAccuracyMeters: 40, device: "Samsung A54 · Android 14", status: "pendente" },
  { id: "mr4", employeeId: "e11", employeeName: "Eduardo Barros", date: "2026-09-08", time: "07:55", type: "entrada", latitude: -23.5611, longitude: -46.6560, distanceFromAllowedMeters: 8, gpsAccuracyMeters: 6, device: "iPhone 12 · iOS 17.6", status: "validado" },
];
