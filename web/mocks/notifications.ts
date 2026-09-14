import { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  { id: "n1", message: "João solicitou férias.", createdAt: "2026-09-08T10:20:00", read: false },
  { id: "n2", message: "Documento de Maria vence em 7 dias.", createdAt: "2026-09-08T09:05:00", read: false },
  { id: "n3", message: "Carlos possui ajuste de ponto pendente.", createdAt: "2026-09-07T17:40:00", read: false },
  { id: "n4", message: "Nova candidatura para Desenvolvedor.", createdAt: "2026-09-07T14:12:00", read: true },
  { id: "n5", message: "Admissão de Igor Farias foi concluída.", createdAt: "2026-09-06T11:00:00", read: true },
  { id: "n6", message: "Relatório de folha de setembro está disponível.", createdAt: "2026-09-05T08:30:00", read: true },
  { id: "n7", message: "Rodrigo Vieira teve afastamento registrado.", createdAt: "2026-09-04T16:10:00", read: true },
  { id: "n8", message: "3 documentos aguardam assinatura.", createdAt: "2026-09-03T09:00:00", read: true },
];
