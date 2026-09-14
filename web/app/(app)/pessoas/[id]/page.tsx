"use client";

import { useParams } from "next/navigation";
import { Mail, Phone, Calendar, Building2, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeStatusBadge, DocumentStatusBadge, VacationStatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { getEmployeeById } from "@/services/employees.service";
import { listDocuments } from "@/services/documents.service";
import { listVacations } from "@/services/vacations.service";
import { listEmployeeAttendance } from "@/services/attendance.service";
import { formatDate, initials } from "@/lib/utils";
import { FileText, Palmtree } from "lucide-react";

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const { data: employee, isLoading, isError, reload } = useAsyncData(
    () => getEmployeeById(params.id),
    [params.id]
  );
  const { data: documents } = useAsyncData(listDocuments, []);
  const { data: vacations } = useAsyncData(listVacations, []);
  const { data: attendance } = useAsyncData(() => listEmployeeAttendance(params.id, 30), [params.id]);

  if (isError) return <ErrorState onRetry={reload} />;

  if (isLoading || !employee) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const employeeDocuments = documents?.filter((d) => d.employeeId === employee.id) ?? [];
  const employeeVacations = vacations?.filter((v) => v.employeeId === employee.id) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-lumo-ink">{employee.name}</h1>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className="text-sm text-lumo-slate">
              {employee.role} · {employee.department}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1 text-xs text-lumo-slate">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {employee.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {employee.phone}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Admitido em {formatDate(employee.admissionDate)}</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {employee.branch}</span>
              {employee.managerName && (
                <span className="flex items-center gap-1.5"><UserCircle2 className="h-3.5 w-3.5" /> Gestor: {employee.managerName}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="ferias">Férias</TabsTrigger>
          <TabsTrigger value="ponto">Ponto</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <Card>
            <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              <InfoRow label="Matrícula" value={employee.matricula} />
              <InfoRow label="Departamento" value={employee.department} />
              <InfoRow label="Filial" value={employee.branch} />
              <InfoRow label="Status" value={<EmployeeStatusBadge status={employee.status} />} />
              <InfoRow label="E-mail" value={employee.email} />
              <InfoRow label="Telefone" value={employee.phone} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card>
            <CardContent className="p-6">
              {employeeDocuments.length === 0 ? (
                <EmptyState icon={FileText} title="Nenhum documento" description="Este colaborador ainda não possui documentos cadastrados." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {employeeDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-lumo-ink">{doc.title}</p>
                        <p className="text-xs text-lumo-slate">Atualizado em {formatDate(doc.updatedAt)}</p>
                      </div>
                      <DocumentStatusBadge status={doc.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ferias">
          <Card>
            <CardContent className="p-6">
              {employeeVacations.length === 0 ? (
                <EmptyState icon={Palmtree} title="Nenhum registro de férias" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {employeeVacations.map((v) => (
                    <li key={v.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-lumo-ink">
                          {formatDate(v.startDate)} – {formatDate(v.endDate)}
                        </p>
                        <p className="text-xs text-lumo-slate">{v.days} dias</p>
                      </div>
                      <VacationStatusBadge status={v.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ponto">
          <Card>
            <CardContent className="p-6">
              {!attendance?.length ? (
                <EmptyState icon={UserCircle2} title="Sem registros de ponto" description="Nenhuma jornada foi encontrada para este colaborador." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="border-b border-slate-200 text-xs text-lumo-slate">
                      <tr><th className="py-2">Data</th><th>Entrada</th><th>Intervalo</th><th>Retorno</th><th>Saída</th><th>Trabalhado</th><th>Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 font-medium text-lumo-ink">{formatDate(item.date)}</td>
                          <td>{item.checkIn || "—"}</td><td>{item.lunchOut || "—"}</td><td>{item.lunchIn || "—"}</td><td>{item.checkOut || "—"}</td>
                          <td>{item.workedHours || "—"}</td><td className="capitalize">{item.status.replaceAll("_", " ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-4 border-l border-slate-200 pl-4">
                <li className="relative text-sm text-lumo-ink">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-lumo-turquoise" />
                  Admissão registrada em {formatDate(employee.admissionDate)}
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desempenho">
          <Card>
            <CardContent className="p-6">
              <EmptyState title="Sem avaliações registradas" description="As avaliações de desempenho aparecerão aqui." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-lumo-slate">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-lumo-ink">{value}</p>
    </div>
  );
}
