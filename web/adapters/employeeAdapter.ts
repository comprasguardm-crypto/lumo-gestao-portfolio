// Converte o formato retornado pelo backend do RH Guará para o tipo
// `Employee` usado pelo front-end da Lumo Gestão.
//
// Enquanto o backend real não está conectado, este adapter apenas repassa
// os dados mockados. Quando a API existente for integrada, a lógica de
// mapeamento (nomes de campos, formatos de data, etc.) deve ser implementada
// aqui — sem tocar em componentes ou páginas.

import { Employee } from "@/types";

export function adaptEmployee(raw: unknown): Employee {
  // TODO: mapear o payload real do RH Guará quando a API estiver disponível.
  return raw as Employee;
}

export function adaptEmployeeList(raw: unknown[]): Employee[] {
  return raw.map(adaptEmployee);
}
