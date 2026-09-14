"use client";

import { useState } from "react";
import {
  UserCheck,
  UserX,
  AlarmClock,
  TimerReset,
  ListChecks,
  Smartphone,
  MapPin,
  Download,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AttendanceStatusBadge, MobileRecordStatusBadge } from "@/components/shared/status-badge";
import { CardSkeleton, TableSkeleton, EmptyState } from "@/components/shared/states";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAsyncData } from "@/hooks/use-async-data";
import { listTodayAttendance, listMobileAttendanceRecords } from "@/services/attendance.service";
import { downloadCsv } from "@/lib/export";
import { MobileAttendanceRecord } from "@/types";

const TYPE_LABEL: Record<MobileAttendanceRecord["type"], string> = {
  entrada: "Entrada",
  saida_intervalo: "Saída intervalo",
  retorno_intervalo: "Retorno",
  saida: "Saída",
};

export default function PontoPage() {
  const {
    data: attendance,
    isLoading: loadingAttendance,
    reload: reloadAttendance,
  } = useAsyncData(listTodayAttendance, [], 3000);

  const {
    data: mobileRecords,
    isLoading: loadingMobile,
    reload: reloadMobile,
  } = useAsyncData(listMobileAttendanceRecords, [], 3000);

  const [location, setLocation] = useState<MobileAttendanceRecord>();

  const present = attendance?.filter((a) => a.checkIn).length ?? 0;
  const absent = attendance?.filter((a) => a.status === "falta").length ?? 0;
  const late = attendance?.filter((a) => a.checkIn && a.checkIn > "08:15").length ?? 0;
  const pending =
    attendance?.filter((a) => a.status === "incompleto" || a.status === "ajuste_solicitado").length ?? 0;

  function exportMirror() {
    if (!attendance) return;
    downloadCsv(
      "espelho-ponto-hoje.csv",
      ["Colaborador", "Entrada", "Saída almoço", "Retorno", "Saída", "Horas", "Status"],
      attendance.map((a) => [
        a.employeeName,
        a.checkIn,
        a.lunchOut,
        a.lunchIn,
        a.checkOut,
        a.workedHours,
        a.status,
      ]),
    );
  }

  function refreshNow() {
    reloadAttendance();
    reloadMobile();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-lumo-ink">Ponto</h1>
          <p className="mt-1 text-sm text-lumo-slate">
            Acompanhe as marcações de hoje e as pendências de ajuste.
          </p>
          <p className="mt-1 text-xs text-lumo-slate">
            Atualização automática a cada 3 segundos.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshNow}>
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar agora
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {loadingAttendance || !attendance ? (
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Presentes hoje" value={present} icon={UserCheck} tone="positive" />
            <MetricCard label="Ausentes" value={absent} icon={UserX} tone="warning" />
            <MetricCard label="Atrasados" value={late} icon={AlarmClock} tone="warning" />
            <MetricCard label="Horas extras" value="—" icon={TimerReset} />
            <MetricCard label="Pendências" value={pending} icon={ListChecks} tone="warning" />
          </>
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Marcações de hoje</CardTitle>
            <CardDescription>Entrada, intervalo e saída de cada colaborador</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportMirror}>
            <Download className="h-3.5 w-3.5" />
            Exportar espelho
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loadingAttendance || !attendance ? (
            <TableSkeleton rows={6} cols={7} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída almoço</TableHead>
                  <TableHead>Retorno</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Horas trabalhadas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-lumo-ink">{entry.employeeName}</TableCell>
                    <TableCell className="text-lumo-slate">{entry.checkIn ?? "—"}</TableCell>
                    <TableCell className="text-lumo-slate">{entry.lunchOut ?? "—"}</TableCell>
                    <TableCell className="text-lumo-slate">{entry.lunchIn ?? "—"}</TableCell>
                    <TableCell className="text-lumo-slate">{entry.checkOut ?? "—"}</TableCell>
                    <TableCell className="text-lumo-slate">{entry.workedHours ?? "—"}</TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={entry.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-lumo-slate" />
            Registros pelo aplicativo
          </CardTitle>
          <CardDescription>
            Auditoria das marcações feitas pelo app: horário, tipo, GPS e distância do local permitido.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingMobile || !mobileRecords ? (
            <TableSkeleton rows={4} cols={8} />
          ) : mobileRecords.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title="Nenhum registro pelo app"
              description="As marcações feitas pelo aplicativo aparecerão aqui automaticamente."
              className="border-none"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Data / hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Distância</TableHead>
                  <TableHead>Precisão GPS</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mobileRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-lumo-ink">{record.employeeName}</TableCell>
                    <TableCell className="text-lumo-slate">
                      {record.date} · {record.time}
                    </TableCell>
                    <TableCell className="text-lumo-slate">{TYPE_LABEL[record.type]}</TableCell>
                    <TableCell className="text-lumo-slate">{record.distanceFromAllowedMeters} m</TableCell>
                    <TableCell className="text-lumo-slate">±{record.gpsAccuracyMeters} m</TableCell>
                    <TableCell className="text-lumo-slate">{record.device}</TableCell>
                    <TableCell>
                      <MobileRecordStatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setLocation(record)}>
                        <MapPin className="h-3.5 w-3.5" />
                        Ver localização
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(location)} onOpenChange={(open) => !open && setLocation(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Localização da marcação</DialogTitle>
            <DialogDescription>
              {location?.employeeName} · {location?.date} {location?.time}
            </DialogDescription>
          </DialogHeader>
          {location && (
            <div className="space-y-4">
              <div className="rounded-[10px] bg-slate-50 p-4 text-sm text-lumo-ink">
                <p>Tipo: {TYPE_LABEL[location.type]}</p>
                <p>Latitude: {location.latitude}</p>
                <p>Longitude: {location.longitude}</p>
                <p>Distância do local permitido: {location.distanceFromAllowedMeters} m</p>
                <p>Precisão do GPS: ±{location.gpsAccuracyMeters} m</p>
              </div>
              <Button
                variant="primary"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <MapPin className="h-4 w-4" />
                Abrir no mapa
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
