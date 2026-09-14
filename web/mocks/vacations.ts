import { Vacation } from "@/types";

export const mockVacations: Vacation[] = [
  { id: "v1", employeeId: "e2", employeeName: "Mariana Costa", startDate: "2026-09-01", endDate: "2026-09-30", days: 30, status: "aprovada", approver: "Patrícia Alves" },
  { id: "v2", employeeId: "e16", employeeName: "Amanda Teixeira", startDate: "2026-09-15", endDate: "2026-09-29", days: 15, status: "aprovada", approver: "Ana Souza" },
  { id: "v3", employeeId: "e11", employeeName: "Eduardo Barros", startDate: "2026-10-05", endDate: "2026-10-19", days: 15, status: "agendada", approver: "Rafael Nunes" },
  { id: "v4", employeeId: "e9", employeeName: "Diego Martins", startDate: "2026-09-10", endDate: "2026-09-19", days: 10, status: "em_analise" },
  { id: "v5", employeeId: "e15", employeeName: "Gustavo Ribeiro", startDate: "2026-09-22", endDate: "2026-10-01", days: 10, status: "em_analise" },
  { id: "v6", employeeId: "e24", employeeName: "Sabrina Lopes", startDate: "2026-08-01", endDate: "2026-08-15", days: 15, status: "aprovada", approver: "Fernanda Melo" },
  { id: "v7", employeeId: "e18", employeeName: "Vanessa Duarte", startDate: "2026-07-10", endDate: "2026-07-24", days: 14, status: "cancelada" },
  { id: "v8", employeeId: "e22", employeeName: "Priscila Nogueira", startDate: "2026-11-02", endDate: "2026-11-16", days: 15, status: "agendada", approver: "Patrícia Alves" },
];
