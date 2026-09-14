"use client";

import { FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Employee, EmployeeStatus } from "@/types";
import { createEmployee, updateEmployee } from "@/services/employees.service";
import { hasBackendSession } from "@/lib/supabase-rest";

const emptyForm = {
  name: "",
  cpf: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  branch: "Matriz",
  admissionDate: new Date().toISOString().slice(0, 10),
  matricula: "",
  status: "ativo" as EmployeeStatus,
};

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const connected = hasBackendSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        cpf: employee.cpf ?? "",
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        branch: employee.branch,
        admissionDate: employee.admissionDate.slice(0, 10),
        matricula: employee.matricula,
        status: employee.status,
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [employee, open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.department.trim() || !form.email.trim() || (connected && !form.cpf.trim())) {
      setError(connected ? "Preencha nome, CPF, e-mail, cargo e setor." : "Preencha nome, e-mail, cargo e setor.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (employee) await updateEmployee(employee.id, form);
      else await createEmployee(form);
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar o colaborador.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Editar colaborador" : "Novo colaborador"}</DialogTitle>
          <DialogDescription>
            {employee ? "Atualize os dados cadastrais do colaborador." : "Cadastre uma nova pessoa no quadro da empresa."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome completo"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CPF"><Input value={form.cpf} placeholder="000.000.000-00" onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></Field>
            <Field label="E-mail"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {!connected && <Field label="Telefone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>}
            <Field label="Cargo"><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
            <Field label="Setor"><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
            {!connected && <Field label="Filial"><Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></Field>}
            {!connected && <Field label="Matrícula"><Input value={form.matricula} placeholder="Gerada automaticamente" onChange={(e) => setForm({ ...form, matricula: e.target.value })} /></Field>}
            <Field label="Admissão"><Input type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} /></Field>
            <Field label="Status">
              <select className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}>
                <option value="ativo">Ativo</option>{!connected && <><option value="ferias">Férias</option><option value="afastado">Afastado</option></>}<option value="desligado">Desligado</option>
              </select>
            </Field>
          </div>
          {connected && <p className="text-xs text-lumo-slate">No modo conectado, apenas campos existentes no backend são editáveis. Telefone, filial e matrícula permanecem fora do cadastro real até existir suporte no schema.</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>{label}</span>{children}</label>;
}
