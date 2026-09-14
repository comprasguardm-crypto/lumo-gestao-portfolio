import { getBackendContext, hasBackendSession, restSelect } from "@/lib/supabase-rest";

export type PerformanceSnapshot = { period: string; openReviews: number; completedReviews: number; averageScore: number; developmentPlans: number };
const demo: PerformanceSnapshot[] = [
  { period: "2026-03", openReviews: 20, completedReviews: 42, averageScore: 3.4, developmentPlans: 4 },
  { period: "2026-04", openReviews: 18, completedReviews: 45, averageScore: 3.6, developmentPlans: 5 },
  { period: "2026-05", openReviews: 17, completedReviews: 48, averageScore: 3.7, developmentPlans: 6 },
  { period: "2026-06", openReviews: 16, completedReviews: 52, averageScore: 3.9, developmentPlans: 7 },
  { period: "2026-07", openReviews: 15, completedReviews: 55, averageScore: 4.0, developmentPlans: 8 },
  { period: "2026-08", openReviews: 14, completedReviews: 58, averageScore: 4.2, developmentPlans: 9 },
];
export async function listPerformanceSnapshots(): Promise<PerformanceSnapshot[]> {
  if (!hasBackendSession()) return demo;
  const { profile } = await getBackendContext();
  type Row = { period: string; open_reviews: number; completed_reviews: number; average_score: number | string; development_plans: number };
  const rows = await restSelect<Row[]>("lumo_performance_snapshots", `select=period,open_reviews,completed_reviews,average_score,development_plans&company_id=eq.${encodeURIComponent(profile.company_id)}&order=period.asc&limit=12`);
  return rows.map((r) => ({ period: r.period, openReviews: r.open_reviews, completedReviews: r.completed_reviews, averageScore: Number(r.average_score || 0), developmentPlans: r.development_plans }));
}
