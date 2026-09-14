"use client";

import { Bell, BellOff } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/states";
import { useAsyncData } from "@/hooks/use-async-data";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notifications.service";

function timeAgoFromIso(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "agora";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function NotificationsPanel() {
  const { data: notifications, isLoading, reload } = useAsyncData(listNotifications, []);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  async function markRead(id: string) {
    try { await markNotificationRead(id); reload(); } catch (error) { console.error("Falha ao marcar notificação como lida", error); }
  }

  async function markAll() {
    try { await markAllNotificationsRead(); reload(); } catch (error) { console.error("Falha ao marcar notificações como lidas", error); }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-[18px] w-[18px] text-lumo-slate" />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-lumo-ai" />}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between gap-3">
            <SheetTitle>Notificações</SheetTitle>
            {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAll}>Marcar todas</Button>}
          </div>
        </SheetHeader>
        <div className="flex flex-col divide-y divide-slate-100">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse bg-slate-50" />)}
          {!isLoading && notifications?.length === 0 && <EmptyState icon={BellOff} title="Nenhuma notificação" description="Você está em dia." className="border-none" />}
          {!isLoading && notifications?.map((n) => (
            <button key={n.id} onClick={() => markRead(n.id)} className="flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-slate-200" : "bg-lumo-ai"}`} />
              <div className="min-w-0">
                <p className={`text-sm text-lumo-ink ${n.read ? "" : "font-medium"}`}>{n.message}</p>
                <p className="mt-0.5 text-xs text-lumo-slate">{timeAgoFromIso(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
