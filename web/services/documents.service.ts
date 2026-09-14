import { mockDocuments } from "@/mocks/documents";
import { adaptDocument } from "@/adapters/documentAdapter";
import { DocumentCategory, DocumentStatus, EmployeeDocument } from "@/types";
import { readLocalList, writeLocalList } from "@/lib/local-storage";
import { getBackendContext, hasBackendSession, restDelete, restInsert, restSelect, storageCreateSignedUrl, storageRemove, storageUpload } from "@/lib/supabase-rest";
import { listEmployees } from "@/services/employees.service";

const SIMULATED_DELAY_MS = 120;
const STORAGE_KEY = "lumo.documents";
const BUCKET = "ponto-documents";

function delay<T>(value: T): Promise<T> { return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS)); }
function loadDocuments(): EmployeeDocument[] { return readLocalList<EmployeeDocument>(STORAGE_KEY, mockDocuments.map(adaptDocument)); }

type BackendDocument = {
  id: string; company_id?: string | null; employee_id: string; category: string; title: string; file_name: string;
  mime_type?: string | null; file_size?: number | string | null; storage_path: string; note?: string | null;
  created_at: string; issued_at?: string | null; expires_at?: string | null; reminder_days?: number | null; document_status: string;
};

function mapCategory(value: string): DocumentCategory {
  const allowed: DocumentCategory[] = ["contratos", "atestados", "pessoais", "termos", "politicas", "holerite"];
  return allowed.includes(value as DocumentCategory) ? value as DocumentCategory : "pessoais";
}
function mapStatus(value: string, expiresAt?: string | null): DocumentStatus {
  if (expiresAt && new Date(`${expiresAt}T23:59:59`).getTime() < Date.now()) return "vencido";
  const map: Record<string, DocumentStatus> = {
    signed: "assinado", assinado: "assinado", awaiting_signature: "aguardando_assinatura", aguardando_assinatura: "aguardando_assinatura",
    pending: "pendente", pendente: "pendente", available: "disponivel", disponivel: "disponivel", new: "novo", novo: "novo", expired: "vencido", vencido: "vencido",
  };
  return map[value] || "disponivel";
}

async function mapRows(rows: BackendDocument[]): Promise<EmployeeDocument[]> {
  const employees = await listEmployees();
  const names = new Map(employees.map((e) => [e.id, e.name]));
  return rows.map((row) => ({
    id: row.id, employeeId: row.employee_id, employeeName: names.get(row.employee_id) || "Colaborador", title: row.title,
    category: mapCategory(row.category), status: mapStatus(row.document_status, row.expires_at), updatedAt: row.created_at,
    fileName: row.file_name, storagePath: row.storage_path, mimeType: row.mime_type || undefined,
    fileSize: row.file_size == null ? undefined : Number(row.file_size), issuedAt: row.issued_at || undefined,
    expiresAt: row.expires_at || undefined, reminderDays: row.reminder_days ?? undefined, note: row.note || undefined,
  }));
}

export async function listDocuments(): Promise<EmployeeDocument[]> {
  if (hasBackendSession()) {
    const { profile } = await getBackendContext();
    const rows = await restSelect<BackendDocument[]>("ponto_employee_documents", `select=id,company_id,employee_id,category,title,file_name,mime_type,file_size,storage_path,note,created_at,issued_at,expires_at,reminder_days,document_status&company_id=eq.${encodeURIComponent(profile.company_id)}&order=created_at.desc`);
    return mapRows(rows);
  }
  return delay(loadDocuments());
}

export async function createDocument(input: { employeeId: string; title: string; category: DocumentCategory; file?: File; issuedAt?: string; expiresAt?: string; reminderDays?: number; note?: string }): Promise<EmployeeDocument> {
  const employees = await listEmployees();
  const employee = employees.find((item) => item.id === input.employeeId);
  if (!employee) throw new Error("Colaborador não encontrado.");

  if (hasBackendSession()) {
    if (!input.file) throw new Error("Selecione um arquivo para enviar.");
    if (input.file.size > 15 * 1024 * 1024) throw new Error("O arquivo deve ter no máximo 15 MB.");
    const { profile, session } = await getBackendContext();
    const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "documento";
    const storagePath = `${profile.company_id}/${employee.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    await storageUpload(BUCKET, storagePath, input.file);
    try {
      const row = await restInsert<BackendDocument>("ponto_employee_documents", {
        company_id: profile.company_id, employee_id: employee.id, category: input.category, title: input.title.trim(),
        file_name: input.file.name, mime_type: input.file.type || null, file_size: input.file.size, storage_path: storagePath,
        note: input.note?.trim() || null, created_by: session.user.id, issued_at: input.issuedAt || null,
        expires_at: input.expiresAt || null, reminder_days: Math.max(0, input.reminderDays || 0), document_status: "available",
      });
      return (await mapRows([row]))[0];
    } catch (error) {
      await storageRemove(BUCKET, [storagePath]).catch(() => null);
      throw error;
    }
  }

  const created: EmployeeDocument = { id: `d-${Date.now()}`, employeeId: employee.id, employeeName: employee.name, title: input.title.trim(), category: input.category, status: "novo", updatedAt: new Date().toISOString(), fileName: input.file?.name, issuedAt: input.issuedAt, expiresAt: input.expiresAt, reminderDays: input.reminderDays, note: input.note };
  const documents = loadDocuments(); writeLocalList(STORAGE_KEY, [created, ...documents]); return delay(created);
}

export async function getDocumentDownloadUrl(document: EmployeeDocument) {
  if (!hasBackendSession()) {
    const blob = new Blob([`${document.title}\nColaborador: ${document.employeeName}\nDocumento demonstrativo do Lumo Gestão.`], { type: "text/plain;charset=utf-8" });
    return URL.createObjectURL(blob);
  }
  if (!document.storagePath) throw new Error("Arquivo não encontrado para este documento.");
  return storageCreateSignedUrl(BUCKET, document.storagePath, 300);
}

export async function deleteDocument(document: EmployeeDocument) {
  if (hasBackendSession()) {
    const { profile } = await getBackendContext();
    await restDelete("ponto_employee_documents", `company_id=eq.${encodeURIComponent(profile.company_id)}&id=eq.${encodeURIComponent(document.id)}`);
    if (document.storagePath) await storageRemove(BUCKET, [document.storagePath]).catch(() => null);
    return;
  }
  writeLocalList(STORAGE_KEY, loadDocuments().filter((item) => item.id !== document.id));
}
