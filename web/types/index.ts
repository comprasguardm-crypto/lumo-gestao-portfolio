// Tipos de domínio da Lumo Gestão.
// Esta camada representa o contrato esperado do backend existente
// (RH Guará / Guará Ponto). Nenhuma regra de negócio deve viver aqui —
// apenas o formato dos dados que o front-end consome.

export type UserRole =
  | "administrador"
  | "rh"
  | "gestor"
  | "financeiro"
  | "colaborador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  branch?: string;
  cnpj?: string;
  plan: SubscriptionPlanTier;
}

export type EmployeeStatus = "ativo" | "ferias" | "afastado" | "desligado";

export interface Employee {
  id: string;
  name: string;
  cpf?: string;
  avatarUrl?: string;
  role: string;
  department: string;
  branch: string;
  status: EmployeeStatus;
  admissionDate: string; // ISO date
  email: string;
  phone: string;
  managerName?: string;
  matricula: string;
}

export type AttendanceStatus =
  | "completo"
  | "incompleto"
  | "ajuste_solicitado"
  | "ajustado"
  | "falta"
  | "folga"
  | "ferias"
  | "afastamento";

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // ISO date
  checkIn?: string; // HH:mm
  lunchOut?: string;
  lunchIn?: string;
  checkOut?: string;
  workedHours?: string;
  status: AttendanceStatus;
}

export type MobileAttendanceRecordStatus =
  | "validado"
  | "pendente"
  | "suspeito";

export interface MobileAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  time: string;
  type: "entrada" | "saida_intervalo" | "retorno_intervalo" | "saida";
  photoUrl?: string;
  latitude: number;
  longitude: number;
  distanceFromAllowedMeters: number;
  gpsAccuracyMeters: number;
  device: string;
  status: MobileAttendanceRecordStatus;
}

export type VacationStatus =
  | "em_analise"
  | "aprovada"
  | "rejeitada"
  | "cancelada"
  | "agendada";

export interface Vacation {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: VacationStatus;
  approver?: string;
}

export type DocumentCategory =
  | "contratos"
  | "atestados"
  | "pessoais"
  | "termos"
  | "politicas"
  | "holerite";

export type DocumentStatus = "assinado" | "aguardando_assinatura" | "vencido" | "pendente" | "disponivel" | "novo";

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  updatedAt: string;
  fileName?: string;
  storagePath?: string;
  mimeType?: string;
  fileSize?: number;
  issuedAt?: string;
  expiresAt?: string;
  reminderDays?: number;
  note?: string;
}

export type CandidateStage =
  | "candidatos"
  | "triagem"
  | "entrevista"
  | "aprovados"
  | "contratados";

export interface RecruitmentCandidate {
  id: string;
  name: string;
  role: string;
  stage: CandidateStage;
  date: string;
  responsible: string;
  avatarUrl?: string;
}

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardMetrics {
  employeesTotal: number;
  presentToday: number;
  employeesChangePct: number;
  vacationsPending: number;
  vacationsAwaitingApproval: number;
  admissionsThisMonth: number;
  admissionsThisWeek: number;
  documentsAwaitingSignature: number;
  attendancePendingAdjustments: number;
  birthdaysThisWeek: number;
  employeesByArea: { area: string; total: number }[];
}

export interface RecentActivity {
  id: string;
  employeeName: string;
  action: string;
  timeAgo: string;
}

export type PendingItemPriority = "alta" | "media" | "baixa";

export interface PendingItem {
  id: string;
  description: string;
  priority: PendingItemPriority;
  actionLabel: string;
  href: string;
}

export type SubscriptionPlanTier = "starter" | "professional" | "business";

export interface SubscriptionPlan {
  id: SubscriptionPlanTier;
  name: string;
  employeeLimit: number | "ilimitado";
  priceMonthly: number;
  highlight?: boolean;
  features: string[];
}

export type PermissionKey =
  | "pessoas.ver"
  | "pessoas.editar"
  | "ponto.ver"
  | "ponto.aprovar"
  | "ferias.aprovar"
  | "documentos.gerenciar"
  | "financeiro.ver"
  | "configuracoes.gerenciar";

export interface Permission {
  key: PermissionKey;
  label: string;
  roles: UserRole[];
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
