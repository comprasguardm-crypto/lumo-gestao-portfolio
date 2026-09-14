import { mockNotifications } from "@/mocks/notifications";
import { Notification } from "@/types";
import { readLocalList, writeLocalList } from "@/lib/local-storage";
import { getBackendContext, hasBackendSession, restInsert, restSelect, restUpdate } from "@/lib/supabase-rest";

const STORAGE_KEY = "lumo.notifications";
const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 100));
const keyFor = (id: string) => `announcement:${id}`;

export async function listNotifications(): Promise<Notification[]> {
  if (hasBackendSession()) {
    const { session, profile } = await getBackendContext();
    type Announcement = { id: string; title: string; body: string; published_at: string };
    type State = { notification_key: string; read_at?: string | null; dismissed_at?: string | null };
    const [announcements, states] = await Promise.all([
      restSelect<Announcement[]>("ponto_company_announcements", `select=id,title,body,published_at&company_id=eq.${encodeURIComponent(profile.company_id)}&active=eq.true&order=published_at.desc&limit=30`),
      restSelect<State[]>("ponto_notification_state", `select=notification_key,read_at,dismissed_at&user_id=eq.${encodeURIComponent(session.user.id)}`),
    ]);
    const state = new Map(states.map((item) => [item.notification_key, item]));
    return announcements
      .filter((item) => !state.get(keyFor(item.id))?.dismissed_at)
      .map((item) => ({
        id: item.id,
        message: item.title ? `${item.title} — ${item.body}` : item.body,
        createdAt: item.published_at,
        read: Boolean(state.get(keyFor(item.id))?.read_at),
      }));
  }
  return delay(readLocalList<Notification>(STORAGE_KEY, mockNotifications));
}

async function saveRead(id: string) {
  const { session } = await getBackendContext();
  const notificationKey = keyFor(id);
  type State = { notification_key: string };
  const rows = await restSelect<State[]>("ponto_notification_state", `select=notification_key&user_id=eq.${encodeURIComponent(session.user.id)}&notification_key=eq.${encodeURIComponent(notificationKey)}&limit=1`);
  const payload = { read_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  if (rows.length) {
    await restUpdate("ponto_notification_state", `user_id=eq.${encodeURIComponent(session.user.id)}&notification_key=eq.${encodeURIComponent(notificationKey)}`, payload);
  } else {
    await restInsert("ponto_notification_state", { user_id: session.user.id, notification_key: notificationKey, ...payload });
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (hasBackendSession()) return saveRead(id);
  const notifications = readLocalList<Notification>(STORAGE_KEY, mockNotifications).map((item) => item.id === id ? { ...item, read: true } : item);
  writeLocalList(STORAGE_KEY, notifications);
  await delay(undefined);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (hasBackendSession()) {
    const notifications = await listNotifications();
    await Promise.all(notifications.filter((item) => !item.read).map((item) => saveRead(item.id)));
    return;
  }
  writeLocalList(STORAGE_KEY, readLocalList<Notification>(STORAGE_KEY, mockNotifications).map((item) => ({ ...item, read: true })));
  await delay(undefined);
}
