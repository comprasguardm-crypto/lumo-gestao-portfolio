"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Eye, Pencil, Search, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmployeeStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate, initials } from "@/lib/utils";
import { Employee, EmployeeStatus } from "@/types";
import { Users } from "lucide-react";
import { EmployeeDialog } from "@/components/people/employee-dialog";
import { grantEmployeeMobileAccess } from "@/services/employee-access.service";

const PAGE_SIZE = 8;

const statusFilters: { label: string; value: EmployeeStatus | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "Ativo", value: "ativo" },
  { label: "Férias", value: "ferias" },
  { label: "Afastado", value: "afastado" },
  { label: "Desligado", value: "desligado" },
];

export function PeopleTable({ employees, initialQuery = "", onChanged }: { employees: Employee[]; initialQuery?: string; onChanged: () => void }) {
  const [query, setQuery] = useState(initialQuery);
  const [editing, setEditing] = useState<Employee | undefined>();
  const [feedback, setFeedback] = useState("");
  const [accessWorkingId, setAccessWorkingId] = useState<string | null>(null);

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "todos">("todos");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesQuery =
        query.trim().length === 0 ||
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.role.toLowerCase().includes(query.toLowerCase()) ||
        e.department.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "todos" || e.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [employees, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lumo-slate" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome, cargo ou setor..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "border-lumo-ink bg-lumo-ink text-white"
                  : "border-slate-200 text-lumo-slate hover:bg-slate-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum colaborador encontrado"
          description="Tente ajustar a busca ou os filtros aplicados."
        />
      ) : (
        <div className="rounded-lg border border-slate-200/80 bg-white shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Filial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Link href={`/pessoas/${employee.id}`} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[11px]">{initials(employee.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-lumo-ink hover:underline">{employee.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-lumo-slate">{employee.role}</TableCell>
                  <TableCell className="text-lumo-slate">{employee.department}</TableCell>
                  <TableCell className="text-lumo-slate">{employee.branch}</TableCell>
                  <TableCell>
                    <EmployeeStatusBadge status={employee.status} />
                  </TableCell>
                  <TableCell className="text-lumo-slate">{formatDate(employee.admissionDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/pessoas/${employee.id}`}>
                            <Eye className="h-4 w-4" /> Ver perfil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditing(employee)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={accessWorkingId === employee.id}
                          onSelect={async () => {
                            const email = window.prompt("E-mail para acesso ao aplicativo Lumo", employee.email || "");
                            if (!email) return;
                            setAccessWorkingId(employee.id);
                            setFeedback("");
                            try {
                              const message = await grantEmployeeMobileAccess(employee.id, email);
                              setFeedback(message);
                              onChanged();
                            } catch (error) {
                              setFeedback(error instanceof Error ? error.message : "Não foi possível liberar o acesso Mobile.");
                            } finally {
                              setAccessWorkingId(null);
                            }
                          }}
                        >
                          <Smartphone className="h-4 w-4" /> Liberar acesso Mobile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-lumo-slate">
              Mostrando {paged.length} de {filtered.length} colaboradores
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="px-2 text-xs text-lumo-slate">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}
      {feedback && (
        <p className={cn("rounded-lg border px-3 py-2 text-sm", feedback.toLowerCase().includes("sucesso") || feedback.toLowerCase().includes("convite") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-lumo-slate")}>
          {feedback}
        </p>
      )}
      <EmployeeDialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(undefined)} employee={editing} onSaved={onChanged} />
    </div>
  );
}
