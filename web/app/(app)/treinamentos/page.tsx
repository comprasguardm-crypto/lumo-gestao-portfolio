"use client";

import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/shared/states";
import { useAsyncData } from "@/hooks/use-async-data";
import { listTrainings } from "@/services/training.service";

export default function TreinamentosPage() {
  const { data: trainings, isLoading, isError, reload } = useAsyncData(listTrainings, []);
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-xl font-semibold text-lumo-ink">Treinamentos</h1><p className="mt-1 text-sm text-lumo-slate">Trilhas de capacitação registradas para a empresa atual.</p></div>
      {isError && <ErrorState onRetry={reload} />}
      {isLoading || !trainings ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><CardSkeleton/><CardSkeleton/></div> : trainings.length === 0 ? <EmptyState icon={GraduationCap} title="Nenhum treinamento cadastrado" description="Quando a empresa cadastrar ou importar treinamentos, eles aparecerão aqui." /> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {trainings.map((t) => <Card key={t.id}><CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-lumo-slate" /> {t.title}</CardTitle><CardDescription>{t.enrolled} colaboradores inscritos</CardDescription></div>{t.progress === 100 && <Badge variant="success">Concluído</Badge>}</CardHeader><CardContent><Progress value={t.progress} /><p className="mt-2 text-xs text-lumo-slate">{t.progress}% de conclusão média</p></CardContent></Card>)}
      </div>}
    </div>
  );
}
