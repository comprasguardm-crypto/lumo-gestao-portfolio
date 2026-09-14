import { getBackendContext, hasBackendSession, restSelect } from "@/lib/supabase-rest";

export type TrainingItem = { id: string; title: string; enrolled: number; progress: number };
const demo: TrainingItem[] = [
  { id: "demo-training-1", title: "Integração de novos colaboradores", enrolled: 12, progress: 80 },
  { id: "demo-training-2", title: "Segurança do trabalho", enrolled: 48, progress: 62 },
  { id: "demo-training-3", title: "Liderança para gestores", enrolled: 9, progress: 35 },
  { id: "demo-training-4", title: "LGPD na prática", enrolled: 22, progress: 100 },
];

export async function listTrainings(): Promise<TrainingItem[]> {
  if (!hasBackendSession()) return demo;
  const { profile } = await getBackendContext();
  type Row = { id: string; title: string; enrolled: number; progress: number | string };
  const rows = await restSelect<Row[]>("lumo_trainings", `select=id,title,enrolled,progress&company_id=eq.${encodeURIComponent(profile.company_id)}&active=eq.true&order=created_at.desc`);
  return rows.map((r) => ({ id: r.id, title: r.title, enrolled: Number(r.enrolled || 0), progress: Number(r.progress || 0) }));
}
