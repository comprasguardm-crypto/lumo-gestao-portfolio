import { Permission, SubscriptionPlan } from "@/types";

export const mockPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    employeeLimit: 20,
    priceMonthly: 199,
    features: [
      "Até 20 colaboradores",
      "Cadastro de pessoas e ponto",
      "Férias e documentos básicos",
      "Suporte por e-mail",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    employeeLimit: 100,
    priceMonthly: 499,
    highlight: true,
    features: [
      "Até 100 colaboradores",
      "Todos os módulos de gestão",
      "Recrutamento e desempenho",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
  },
  {
    id: "business",
    name: "Business",
    employeeLimit: "ilimitado",
    priceMonthly: 999,
    features: [
      "Colaboradores ilimitados",
      "Multiempresa",
      "Auditoria completa de ponto",
      "Lumo AI incluída",
      "Gerente de conta dedicado",
    ],
  },
];

export const mockPermissions: Permission[] = [
  { key: "pessoas.ver", label: "Visualizar colaboradores", roles: ["administrador", "rh", "gestor"] },
  { key: "pessoas.editar", label: "Editar colaboradores", roles: ["administrador", "rh"] },
  { key: "ponto.ver", label: "Visualizar ponto", roles: ["administrador", "rh", "gestor"] },
  { key: "ponto.aprovar", label: "Aprovar ajustes de ponto", roles: ["administrador", "rh", "gestor"] },
  { key: "ferias.aprovar", label: "Aprovar férias", roles: ["administrador", "rh", "gestor"] },
  { key: "documentos.gerenciar", label: "Gerenciar documentos", roles: ["administrador", "rh"] },
  { key: "financeiro.ver", label: "Visualizar dados financeiros", roles: ["administrador", "financeiro"] },
  { key: "configuracoes.gerenciar", label: "Gerenciar configurações", roles: ["administrador"] },
];
