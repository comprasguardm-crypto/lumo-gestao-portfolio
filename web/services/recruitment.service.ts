import { RecruitmentCandidate, CandidateStage } from "@/types";
import { getBackendContext, hasBackendSession, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";
import { readLocalList, writeLocalList } from "@/lib/local-storage";

const STORAGE_KEY = "lumo.demo.candidates";
const SIMULATED_DELAY_MS = 100;
const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));

const demoSeed: RecruitmentCandidate[] = [
  { id: "demo-cd-1", name: "Candidato Demo", role: "Analista", responsible: "RH", date: new Date().toISOString().slice(0, 10), stage: "triagem" },
];

function demoCandidates() { return readLocalList<RecruitmentCandidate>(STORAGE_KEY, demoSeed); }

type BackendCandidate = { id: string; company_id: string; name: string; role: string; responsible: string; stage: CandidateStage; created_at: string };
function mapRow(row: BackendCandidate): RecruitmentCandidate {
  return { id: row.id, name: row.name, role: row.role, responsible: row.responsible, stage: row.stage, date: row.created_at.slice(0, 10) };
}

export async function listCandidates(): Promise<RecruitmentCandidate[]> {
  if (!hasBackendSession()) return delay(demoCandidates());
  const { profile } = await getBackendContext();
  const rows = await restSelect<BackendCandidate[]>("lumo_recruitment_candidates", `select=id,company_id,name,role,responsible,stage,created_at&company_id=eq.${encodeURIComponent(profile.company_id)}&order=created_at.desc`);
  return rows.map(mapRow);
}

export async function createCandidate(input: Omit<RecruitmentCandidate, "id" | "date" | "stage"> & { stage?: CandidateStage }): Promise<RecruitmentCandidate> {
  if (!input.name.trim() || !input.role.trim()) throw new Error("Informe nome e vaga/cargo.");
  if (!hasBackendSession()) {
    const created: RecruitmentCandidate = { id: `demo-cd-${Date.now()}`, name: input.name.trim(), role: input.role.trim(), responsible: input.responsible.trim() || "RH", date: new Date().toISOString().slice(0, 10), stage: input.stage ?? "candidatos" };
    writeLocalList(STORAGE_KEY, [created, ...demoCandidates()]);
    return delay(created);
  }
  const { profile, session } = await getBackendContext();
  if (!['admin', 'gestor'].includes(profile.role)) throw new Error("Seu perfil não pode cadastrar candidatos.");
  const row = await restInsert<BackendCandidate>("lumo_recruitment_candidates", {
    company_id: profile.company_id,
    name: input.name.trim(),
    role: input.role.trim(),
    responsible: input.responsible.trim() || "RH",
    stage: input.stage ?? "candidatos",
    created_by: session.user.id,
    updated_at: new Date().toISOString(),
  });
  return mapRow(row);
}

export async function moveCandidateStage(candidateId: string, stage: CandidateStage): Promise<{ success: boolean }> {
  if (!hasBackendSession()) {
    const rows = demoCandidates();
    const index = rows.findIndex((item) => item.id === candidateId);
    if (index < 0) return delay({ success: false });
    rows[index] = { ...rows[index], stage };
    writeLocalList(STORAGE_KEY, rows);
    return delay({ success: true });
  }
  const { profile } = await getBackendContext();
  if (!['admin', 'gestor'].includes(profile.role)) throw new Error("Seu perfil não pode alterar o processo seletivo.");
  await restUpdate<BackendCandidate>("lumo_recruitment_candidates", `company_id=eq.${encodeURIComponent(profile.company_id)}&id=eq.${encodeURIComponent(candidateId)}`, { stage, updated_at: new Date().toISOString() });
  return { success: true };
}
