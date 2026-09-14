// Adapter para os documentos vindos do RH Guará.
import { EmployeeDocument } from "@/types";

export function adaptDocument(raw: unknown): EmployeeDocument {
  // TODO: mapear payload real de documentos.
  return raw as EmployeeDocument;
}
