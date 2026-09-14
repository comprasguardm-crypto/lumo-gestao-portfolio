import { Company, User } from "@/types";

export const mockCompanies: Company[] = [
  { id: "c1", name: "Empresa Demo", branch: "Matriz", plan: "professional" },
  { id: "c2", name: "Unidade São Paulo", branch: "SP", plan: "professional" },
  { id: "c3", name: "Unidade Curitiba", branch: "PR", plan: "professional" },
];

export const mockCurrentUser: User = {
  id: "u1",
  name: "Marina Souza",
  email: "marina.souza@example.com",
  role: "rh",
  companyId: "c1",
};
