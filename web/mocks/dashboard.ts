import { DashboardMetrics, PendingItem, RecentActivity } from "@/types";

export const mockDashboardMetrics: DashboardMetrics = {
  employeesTotal: 142,
  presentToday: 118,
  employeesChangePct: 12,
  vacationsPending: 8,
  vacationsAwaitingApproval: 2,
  admissionsThisMonth: 5,
  admissionsThisWeek: 2,
  documentsAwaitingSignature: 12,
  attendancePendingAdjustments: 7,
  birthdaysThisWeek: 4,
  employeesByArea: [
    { area: "Produção", total: 48 },
    { area: "Administrativo", total: 32 },
    { area: "Comercial", total: 24 },
    { area: "Financeiro", total: 18 },
    { area: "Outros", total: 20 },
  ],
};

export const mockRecentActivities: RecentActivity[] = [
  { id: "a1", employeeName: "João Silva", action: "Admissão concluída", timeAgo: "2h" },
  { id: "a2", employeeName: "Mariana Costa", action: "Solicitou férias", timeAgo: "4h" },
  { id: "a3", employeeName: "Carlos Lima", action: "Documento assinado", timeAgo: "6h" },
  { id: "a4", employeeName: "Fernanda Melo", action: "Alteração de cargo", timeAgo: "1d" },
  { id: "a5", employeeName: "Beatriz Santos", action: "Nova candidatura recebida", timeAgo: "1d" },
  { id: "a6", employeeName: "Diego Martins", action: "Ajuste de ponto aprovado", timeAgo: "2d" },
];

export const mockPendingItems: PendingItem[] = [
  { id: "p1", description: "3 solicitações de férias aguardando aprovação", priority: "alta", actionLabel: "Revisar", href: "/ferias" },
  { id: "p2", description: "2 colaboradores sem documento obrigatório", priority: "alta", actionLabel: "Revisar", href: "/documentos" },
  { id: "p3", description: "5 ajustes de ponto pendentes", priority: "media", actionLabel: "Revisar", href: "/ponto" },
  { id: "p4", description: "1 admissão incompleta", priority: "baixa", actionLabel: "Revisar", href: "/pessoas" },
];
