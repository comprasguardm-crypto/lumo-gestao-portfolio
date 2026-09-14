import { getBackendContext, hasBackendSession, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";
import { readLocalValue, writeLocalValue } from "@/lib/local-storage";

export interface PointLocationSettings {
  companyId?: string;
  label: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  maxAccuracyM: number;
  timezone: string;
  active: boolean;
}

const STORAGE_KEY = "lumo.point-location";
const demoDefaults: PointLocationSettings = { label: "Sede de demonstração", latitude: -23.55052, longitude: -46.633308, radiusM: 100, maxAccuracyM: 50, timezone: "America/Sao_Paulo", active: true };
const newCompanyDefaults: PointLocationSettings = { label: "Sede principal", latitude: 0, longitude: 0, radiusM: 100, maxAccuracyM: 50, timezone: "America/Sao_Paulo", active: false };

type Row = { company_id: string; label: string; latitude: number; longitude: number; radius_m: number; max_accuracy_m: number; timezone: string; active: boolean };
function map(row: Row): PointLocationSettings { return { companyId: row.company_id, label: row.label, latitude: row.latitude, longitude: row.longitude, radiusM: row.radius_m, maxAccuracyM: row.max_accuracy_m, timezone: row.timezone, active: row.active }; }

export async function getPointLocation(): Promise<PointLocationSettings> {
  if (!hasBackendSession()) return readLocalValue(STORAGE_KEY, demoDefaults);
  const { profile } = await getBackendContext();
  const rows = await restSelect<Row[]>("ponto_company_locations", `select=company_id,label,latitude,longitude,radius_m,max_accuracy_m,timezone,active&company_id=eq.${encodeURIComponent(profile.company_id)}&limit=1`);
  return rows[0] ? map(rows[0]) : { ...newCompanyDefaults, companyId: profile.company_id };
}

export async function savePointLocation(settings: PointLocationSettings): Promise<PointLocationSettings> {
  if (settings.latitude < -90 || settings.latitude > 90) throw new Error("Latitude inválida.");
  if (settings.longitude < -180 || settings.longitude > 180) throw new Error("Longitude inválida.");
  if (settings.radiusM < 20 || settings.radiusM > 5000) throw new Error("O raio permitido deve ficar entre 20 e 5.000 metros.");
  if (settings.maxAccuracyM < 5 || settings.maxAccuracyM > 1000) throw new Error("A precisão máxima deve ficar entre 5 e 1.000 metros.");
  if (!settings.timezone.trim()) throw new Error("Informe o fuso horário.");
  if (!hasBackendSession()) { writeLocalValue(STORAGE_KEY, settings); return settings; }
  const { profile, session } = await getBackendContext();
  if (profile.role !== "admin") throw new Error("Somente o administrador pode alterar a localização do ponto.");
  const payload = { company_id: profile.company_id, label: settings.label.trim() || "Sede principal", latitude: settings.latitude, longitude: settings.longitude, radius_m: settings.radiusM, max_accuracy_m: settings.maxAccuracyM, timezone: settings.timezone.trim(), active: settings.active, updated_by: session.user.id, updated_at: new Date().toISOString() };
  const existing = await restSelect<Row[]>("ponto_company_locations", `select=company_id,label,latitude,longitude,radius_m,max_accuracy_m,timezone,active&company_id=eq.${encodeURIComponent(profile.company_id)}&limit=1`);
  const row = existing.length ? await restUpdate<Row>("ponto_company_locations", `company_id=eq.${encodeURIComponent(profile.company_id)}`, payload) : await restInsert<Row>("ponto_company_locations", payload);
  return map(row);
}
