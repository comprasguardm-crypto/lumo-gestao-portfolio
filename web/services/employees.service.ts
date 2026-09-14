import { mockEmployees } from "@/mocks/employees";
import { Employee } from "@/types";
import { readLocalList, writeLocalList } from "@/lib/local-storage";
import { getBackendContext, hasBackendSession, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";

const SIMULATED_DELAY_MS = 120;
const STORAGE_KEY = "lumo.employees";

type BackendEmployee = {
  id: string;
  name: string;
  cpf: string;
  function?: string | null;
  admission_date?: string | null;
  active: boolean;
  work_email?: string | null;
  department?: string | null;
};

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));
}

function mapBackend(raw: BackendEmployee): Employee {
  return {
    id: raw.id,
    name: raw.name,
    cpf: raw.cpf,
    role: raw.function || "",
    department: raw.department || "Outros",
    branch: "—",
    status: raw.active ? "ativo" : "desligado",
    admissionDate: raw.admission_date || "",
    email: raw.work_email || "",
    phone: "",
    matricula: raw.id.slice(0, 8).toUpperCase(),
  };
}

function loadEmployees(): Employee[] {
  return readLocalList<Employee>(STORAGE_KEY, mockEmployees);
}

export async function listEmployees(): Promise<Employee[]> {
  if (hasBackendSession()) {
    const { profile } = await getBackendContext();
    const rows = await restSelect<BackendEmployee[]>(
      "ponto_employees",
      `select=id,name,cpf,function,admission_date,active,work_email,department&company_id=eq.${encodeURIComponent(profile.company_id)}&order=name.asc`
    );
    return rows.map(mapBackend);
  }
  return delay(loadEmployees());
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  if (hasBackendSession()) {
    const { profile } = await getBackendContext();
    const rows = await restSelect<BackendEmployee[]>(
      "ponto_employees",
      `select=id,name,cpf,function,admission_date,active,work_email,department&company_id=eq.${encodeURIComponent(profile.company_id)}&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    return rows[0] ? mapBackend(rows[0]) : undefined;
  }
  return delay(loadEmployees().find((item) => item.id === id));
}

export async function createEmployee(input: Partial<Employee>): Promise<Employee> {
  if (hasBackendSession()) {
    const cpf = String(input.cpf || "").replace(/\D/g, "");
    if (cpf.length !== 11) throw new Error("Informe um CPF com 11 dígitos.");
    const { profile } = await getBackendContext();
    const created = await restInsert<BackendEmployee>("ponto_employees", {
      company_id: profile.company_id,
      name: input.name?.trim(),
      cpf,
      function: input.role?.trim() || null,
      department: input.department?.trim() || null,
      admission_date: input.admissionDate || null,
      work_email: input.email?.trim().toLowerCase() || null,
      active: input.status !== "desligado",
      is_partner: false,
    });
    return mapBackend(created);
  }

  const employees = loadEmployees();
  const nextMatricula = String(Math.max(0, ...employees.map((e) => Number.parseInt(e.matricula || "0", 10) || 0)) + 1).padStart(5, "0");
  const created: Employee = {
    id: `e-${Date.now()}`,
    name: input.name?.trim() ?? "",
    cpf: input.cpf?.trim(),
    role: input.role?.trim() ?? "",
    department: input.department?.trim() ?? "",
    branch: input.branch?.trim() || "Matriz",
    status: input.status ?? "ativo",
    admissionDate: input.admissionDate ?? new Date().toISOString().slice(0, 10),
    email: input.email?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    managerName: input.managerName?.trim() || undefined,
    matricula: input.matricula?.trim() || nextMatricula,
  };
  writeLocalList(STORAGE_KEY, [created, ...employees]);
  return delay(created);
}

export async function updateEmployee(id: string, input: Partial<Employee>): Promise<Employee> {
  if (hasBackendSession()) {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.cpf !== undefined) {
      const cpf = input.cpf.replace(/\D/g, "");
      if (cpf.length !== 11) throw new Error("Informe um CPF com 11 dígitos.");
      payload.cpf = cpf;
    }
    if (input.role !== undefined) payload.function = input.role.trim() || null;
    if (input.department !== undefined) payload.department = input.department.trim() || null;
    if (input.admissionDate !== undefined) payload.admission_date = input.admissionDate || null;
    if (input.email !== undefined) payload.work_email = input.email.trim().toLowerCase() || null;
    if (input.status !== undefined) payload.active = input.status !== "desligado";
    const { profile } = await getBackendContext();
    const updated = await restUpdate<BackendEmployee>("ponto_employees", `company_id=eq.${encodeURIComponent(profile.company_id)}&id=eq.${encodeURIComponent(id)}`, payload);
    return mapBackend(updated);
  }

  const employees = loadEmployees();
  const index = employees.findIndex((employee) => employee.id === id);
  if (index < 0) throw new Error("Colaborador não encontrado");
  const updated = { ...employees[index], ...input, id };
  employees[index] = updated;
  writeLocalList(STORAGE_KEY, employees);
  return delay(updated);
}
