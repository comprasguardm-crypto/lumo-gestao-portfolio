import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  AttendanceStatus,
  CandidateStage,
  DocumentStatus,
  EmployeeStatus,
  MobileAttendanceRecordStatus,
  VacationStatus,
} from "@/types";

type StatusMap<T extends string> = Record<T, { label: string; variant: BadgeProps["variant"] }>;

const employeeStatusMap: StatusMap<EmployeeStatus> = {
  ativo: { label: "Ativo", variant: "success" },
  ferias: { label: "Férias", variant: "info" },
  afastado: { label: "Afastado", variant: "warning" },
  desligado: { label: "Desligado", variant: "danger" },
};

const vacationStatusMap: StatusMap<VacationStatus> = {
  em_analise: { label: "Em análise", variant: "warning" },
  aprovada: { label: "Aprovada", variant: "success" },
  rejeitada: { label: "Rejeitada", variant: "danger" },
  cancelada: { label: "Cancelada", variant: "outline" },
  agendada: { label: "Agendada", variant: "info" },
};

const documentStatusMap: StatusMap<DocumentStatus> = {
  assinado: { label: "Assinado", variant: "success" },
  aguardando_assinatura: { label: "Aguardando assinatura", variant: "warning" },
  vencido: { label: "Vencido", variant: "danger" },
  pendente: { label: "Pendente", variant: "outline" },
  disponivel: { label: "Disponível", variant: "info" },
  novo: { label: "Novo", variant: "ai" },
};

const attendanceStatusMap: StatusMap<AttendanceStatus> = {
  completo: { label: "Completo", variant: "success" },
  incompleto: { label: "Incompleto", variant: "warning" },
  ajuste_solicitado: { label: "Ajuste solicitado", variant: "info" },
  ajustado: { label: "Ajustado", variant: "outline" },
  falta: { label: "Falta", variant: "danger" },
  folga: { label: "Folga", variant: "outline" },
  ferias: { label: "Férias", variant: "info" },
  afastamento: { label: "Afastamento", variant: "warning" },
};

const mobileRecordStatusMap: StatusMap<MobileAttendanceRecordStatus> = {
  validado: { label: "Validado", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  suspeito: { label: "Suspeito", variant: "danger" },
};

const candidateStageMap: StatusMap<CandidateStage> = {
  candidatos: { label: "Candidatos", variant: "outline" },
  triagem: { label: "Triagem", variant: "info" },
  entrevista: { label: "Entrevista", variant: "warning" },
  aprovados: { label: "Aprovados", variant: "success" },
  contratados: { label: "Contratados", variant: "ai" },
};

function makeBadge<T extends string>(map: StatusMap<T>) {
  return function StatusBadgeComponent({ status }: { status: T }) {
    const config = map[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
}

export const EmployeeStatusBadge = makeBadge(employeeStatusMap);
export const VacationStatusBadge = makeBadge(vacationStatusMap);
export const DocumentStatusBadge = makeBadge(documentStatusMap);
export const AttendanceStatusBadge = makeBadge(attendanceStatusMap);
export const MobileRecordStatusBadge = makeBadge(mobileRecordStatusMap);
export const CandidateStageBadge = makeBadge(candidateStageMap);
