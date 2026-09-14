"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PeopleTable } from "@/components/people/people-table";
import { EmployeeDialog } from "@/components/people/employee-dialog";
import { TableSkeleton, ErrorState } from "@/components/shared/states";
import { useAsyncData } from "@/hooks/use-async-data";
import { listEmployees } from "@/services/employees.service";

export default function PessoasPage() {
  const { data: employees, isLoading, isError, reload } = useAsyncData(listEmployees, []);
  const [createOpen, setCreateOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInitialQuery(params.get("search") ?? "");
    if (params.get("novo") === "1") setCreateOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-lumo-ink">Pessoas</h1>
          <p className="mt-1 text-sm text-lumo-slate">Gerencie o quadro de colaboradores da empresa.</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" /> Novo colaborador
        </Button>
      </div>

      {isError && <ErrorState onRetry={reload} />}
      {!isError && isLoading && (
        <div className="rounded-lg border border-slate-200/80 bg-white shadow-soft">
          <TableSkeleton rows={8} cols={7} />
        </div>
      )}
      {!isError && !isLoading && employees && (
        <PeopleTable employees={employees} initialQuery={initialQuery} onChanged={reload} />
      )}

      <EmployeeDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={reload} />
    </div>
  );
}
