"use client";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const SESSION_KEY = "lumo.supabase.session";
const DEMO_KEY = "lumo.demo-mode";

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

export interface BackendContext {
  session: SupabaseSession;
  profile: { user_id: string; company_id: string; full_name?: string; role: string; active: boolean };
  employee: { id: string; name: string; linked_user_id?: string; work_email?: string | null } | null;
}

function browser() { return typeof window !== "undefined"; }

function assertSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}

function friendlyError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("jwt") || normalized.includes("token") || normalized.includes("session")) return "Sua sessão expirou. Entre novamente.";
  if (normalized.includes("permission denied") || normalized.includes("row-level security") || normalized.includes("rls") || normalized.includes("forbidden")) return "Você não possui permissão para realizar esta ação.";
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha inválidos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("duplicate") || normalized.includes("already exists")) return "Já existe um registro com essas informações.";
  return message;
}

export function getStoredSession(): SupabaseSession | null {
  if (!browser()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as SupabaseSession; } catch { return null; }
}

function saveSession(session: SupabaseSession) {
  if (!browser()) return;
  const normalized = session.expires_at
    ? session
    : { ...session, expires_at: Math.floor(Date.now() / 1000) + (session.expires_in || 3600) };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  window.localStorage.removeItem(DEMO_KEY);
}

export function isDemoMode() { return false; }
export function enableDemoMode() {
  if (!browser()) return;
  window.localStorage.removeItem(DEMO_KEY);
}
export function clearSession() { if (browser()) window.localStorage.removeItem(SESSION_KEY); }

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const raw = data?.msg || data?.message || data?.error_description || data?.error || `Erro ${response.status}`;
    throw new Error(friendlyError(String(raw)));
  }
  return data as T;
}

export async function signInWithPassword(email: string, password: string) {
  assertSupabaseConfig();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  const session = await parseResponse<SupabaseSession>(response);
  saveSession(session);
  return session;
}

export async function requestPasswordReset(email: string) {
  assertSupabaseConfig();
  const redirect = browser() ? `${window.location.origin}/set-password` : "";
  const endpoint = redirect ? `${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirect)}` : `${SUPABASE_URL}/auth/v1/recover`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  await parseResponse<Record<string, unknown>>(response);
}

async function refreshSession(session: SupabaseSession) {
  assertSupabaseConfig();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const refreshed = await parseResponse<SupabaseSession>(response);
  saveSession(refreshed);
  return refreshed;
}

export async function getAccessToken() {
  let session = getStoredSession();
  if (!session) return null;
  const expiresAt = session.expires_at || 0;
  if (expiresAt && expiresAt <= Math.floor(Date.now() / 1000) + 60) {
    try { session = await refreshSession(session); } catch { clearSession(); return null; }
  }
  return session.access_token;
}

export function hasBackendSession() { return Boolean(getStoredSession()) && !isDemoMode(); }

export async function signOut() {
  assertSupabaseConfig();
  const token = await getAccessToken();
  if (token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }
  clearSession();
  if (browser()) window.localStorage.removeItem(DEMO_KEY);
}

async function authenticatedFetch(path: string, init: RequestInit = {}, jsonBody = true) {
  assertSupabaseConfig();
  const token = await getAccessToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      ...(jsonBody && init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
}

export function acceptSessionFromRecoveryUrl(): SupabaseSession | null {
  if (!browser()) return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const accessToken = hash.get("access_token") || query.get("access_token");
  const refreshToken = hash.get("refresh_token") || query.get("refresh_token");
  const errorDescription = hash.get("error_description") || query.get("error_description");
  if (errorDescription) throw new Error(decodeURIComponent(errorDescription));
  if (!accessToken || !refreshToken) return null;
  const expiresIn = Number(hash.get("expires_in") || query.get("expires_in") || 3600);
  const session: SupabaseSession = { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn, token_type: "bearer", user: { id: "recovery" } };
  saveSession(session);
  return session;
}

export async function updateCurrentPassword(password: string) {
  if (password.length < 8) throw new Error("Use uma senha com pelo menos 8 caracteres.");
  const response = await authenticatedFetch(`/auth/v1/user`, { method: "PUT", body: JSON.stringify({ password }) });
  return parseResponse<Record<string, unknown>>(response);
}

export async function restSelect<T>(table: string, query: string) {
  const response = await authenticatedFetch(`/rest/v1/${table}?${query}`);
  return parseResponse<T>(response);
}

export async function restInsert<T>(table: string, value: unknown) {
  const response = await authenticatedFetch(`/rest/v1/${table}`, {
    method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(value),
  });
  const rows = await parseResponse<T[]>(response);
  return rows[0] as T;
}

export async function restUpdate<T>(table: string, filters: string, value: unknown) {
  const response = await authenticatedFetch(`/rest/v1/${table}?${filters}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(value),
  });
  const rows = await parseResponse<T[]>(response);
  if (!rows.length) throw new Error("Nenhum registro foi atualizado. Verifique sua permissão.");
  return rows[0] as T;
}

export async function restDelete(table: string, filters: string) {
  const response = await authenticatedFetch(`/rest/v1/${table}?${filters}`, {
    method: "DELETE", headers: { Prefer: "return=representation" },
  });
  return parseResponse<unknown[]>(response);
}

export async function invokeFunction<T>(slug: string, body: unknown) {
  const response = await authenticatedFetch(`/functions/v1/${slug}`, { method: "POST", body: JSON.stringify(body) });
  return parseResponse<T>(response);
}

function encodeStoragePath(path: string) {
  return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

export async function storageUpload(bucket: string, path: string, file: File) {
  const response = await authenticatedFetch(`/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" },
    body: file,
  }, false);
  return parseResponse<{ Key?: string; key?: string; Id?: string }>(response);
}

export async function storageRemove(bucket: string, paths: string[]) {
  const response = await authenticatedFetch(`/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: "DELETE",
    body: JSON.stringify({ prefixes: paths }),
  });
  return parseResponse<unknown>(response);
}

export async function storageCreateSignedUrl(bucket: string, path: string, expiresIn = 300) {
  const response = await authenticatedFetch(`/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`, {
    method: "POST",
    body: JSON.stringify({ expiresIn }),
  });
  const data = await parseResponse<{ signedURL?: string; signedUrl?: string }>(response);
  const relative = data.signedURL || data.signedUrl;
  if (!relative) throw new Error("Não foi possível gerar o acesso seguro ao documento.");
  return relative.startsWith("http") ? relative : `${SUPABASE_URL}/storage/v1${relative.startsWith("/") ? "" : "/"}${relative}`;
}

export async function getBackendContext(): Promise<BackendContext> {
  const session = getStoredSession();
  if (!session?.user?.id) throw new Error("Sessão inválida.");
  const userId = encodeURIComponent(session.user.id);
  const profiles = await restSelect<BackendContext["profile"][]>(
    "ponto_profiles",
    `select=user_id,company_id,full_name,role,active&user_id=eq.${userId}&limit=1`
  );
  const profile = profiles[0];
  if (!profile?.active || !profile.company_id) throw new Error("Seu usuário não está vinculado a uma empresa ativa.");
  const employees = await restSelect<Array<{ id: string; name: string; linked_user_id?: string; work_email?: string | null }>>(
    "ponto_employees",
    `select=id,name,linked_user_id,work_email&company_id=eq.${encodeURIComponent(profile.company_id)}&linked_user_id=eq.${userId}&active=eq.true&limit=1`
  );
  return { session, profile, employee: employees[0] || null };
}
