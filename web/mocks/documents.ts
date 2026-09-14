import { EmployeeDocument } from "@/types";

export const mockDocuments: EmployeeDocument[] = [
  { id: "d1", employeeId: "e1", employeeName: "João Silva", title: "Contrato de trabalho", category: "contratos", status: "assinado", updatedAt: "2024-02-10" },
  { id: "d2", employeeId: "e2", employeeName: "Mariana Costa", title: "Atestado médico — 3 dias", category: "atestados", status: "pendente", updatedAt: "2026-09-05" },
  { id: "d3", employeeId: "e3", employeeName: "Carlos Lima", title: "Termo de confidencialidade", category: "termos", status: "aguardando_assinatura", updatedAt: "2026-09-01" },
  { id: "d4", employeeId: "e8", employeeName: "Juliana Rocha", title: "Política de home office", category: "politicas", status: "assinado", updatedAt: "2026-08-20" },
  { id: "d5", employeeId: "e9", employeeName: "Diego Martins", title: "RG e CPF", category: "pessoais", status: "vencido", updatedAt: "2023-05-15" },
  { id: "d6", employeeId: "e12", employeeName: "Beatriz Santos", title: "Holerite — agosto/2026", category: "holerite", status: "disponivel", updatedAt: "2026-09-01" },
  { id: "d7", employeeId: "e15", employeeName: "Gustavo Ribeiro", title: "Contrato de trabalho — aditivo", category: "contratos", status: "aguardando_assinatura", updatedAt: "2026-08-28" },
  { id: "d8", employeeId: "e18", employeeName: "Vanessa Duarte", title: "Atestado médico — 1 dia", category: "atestados", status: "assinado", updatedAt: "2026-07-30" },
  { id: "d9", employeeId: "e20", employeeName: "Renata Cavalcanti", title: "Comprovante de residência", category: "pessoais", status: "novo", updatedAt: "2026-09-07" },
  { id: "d10", employeeId: "e22", employeeName: "Priscila Nogueira", title: "Política de uso de imagem", category: "politicas", status: "aguardando_assinatura", updatedAt: "2026-09-02" },
  { id: "d11", employeeId: "e24", employeeName: "Sabrina Lopes", title: "Holerite — agosto/2026", category: "holerite", status: "disponivel", updatedAt: "2026-09-01" },
  { id: "d12", employeeId: "e6", employeeName: "Patrícia Alves", title: "Termo de equipamento", category: "termos", status: "assinado", updatedAt: "2026-06-11" },
];
