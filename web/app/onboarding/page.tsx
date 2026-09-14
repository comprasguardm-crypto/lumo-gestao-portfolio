"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const steps = ["Sua empresa", "Seu perfil", "Pronto"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-lumo-ink font-display text-sm font-bold text-lumo-turquoise">
            L
          </div>
          <span className="font-display text-lg font-semibold text-lumo-ink">Lumo Gestão</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  i <= step ? "bg-lumo-turquoise text-lumo-ink" : "bg-slate-100 text-lumo-slate"
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="h-px w-8 bg-slate-200" />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="space-y-5 p-8">
            {step === 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-lumo-ink" />
                  <h1 className="font-display text-lg font-semibold text-lumo-ink">Conte sobre sua empresa</h1>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-lumo-slate">Nome da empresa</label>
                    <Input placeholder="Ex.: Minha Empresa Ltda." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-lumo-slate">CNPJ</label>
                    <Input placeholder="00.000.000/0001-00" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-lumo-slate">Número de colaboradores</label>
                    <Input placeholder="Ex: 50" type="number" />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-lumo-ink" />
                  <h1 className="font-display text-lg font-semibold text-lumo-ink">Agora, seu perfil</h1>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-lumo-slate">Seu nome</label>
                    <Input placeholder="Ex: Ana Souza" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-lumo-slate">E-mail corporativo</label>
                    <Input placeholder="voce@empresa.com.br" type="email" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-lumo-slate">Senha</label>
                    <Input placeholder="Crie uma senha" type="password" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-lumo-turquoise" />
                <h1 className="font-display text-lg font-semibold text-lumo-ink">Tudo pronto!</h1>
                <p className="text-sm text-lumo-slate">
                  Sua empresa foi cadastrada. Agora é só acessar o painel e começar a organizar seu RH.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-2">
              {step > 0 && step < 2 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  Voltar
                </Button>
              ) : (
                <span />
              )}

              {step < 2 ? (
                <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button asChild variant="primary" className="w-full">
                  <Link href="/">Acessar o painel</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
