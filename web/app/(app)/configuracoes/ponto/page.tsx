"use client";

import { useEffect, useState } from "react";
import { MapPin, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPointLocation, PointLocationSettings, savePointLocation } from "@/services/location.service";

export default function ConfiguracaoPontoPage() {
  const [settings, setSettings] = useState<PointLocationSettings>();
  const [original, setOriginal] = useState<PointLocationSettings>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { getPointLocation().then((data)=>{ setSettings(data); setOriginal(data); }).catch((e)=>setError(e instanceof Error?e.message:"Não foi possível carregar a localização.")).finally(()=>setLoading(false)); }, []);
  async function save() { if (!settings) return; setSaving(true); setError(""); setMessage(""); try { const updated=await savePointLocation(settings); setSettings(updated); setOriginal(updated); setMessage("Local de ponto salvo no Supabase."); } catch(e){ setError(e instanceof Error?e.message:"Não foi possível salvar."); } finally { setSaving(false); } }
  function reset(){ if(original) setSettings(original); setMessage(""); setError(""); }

  return <div className="space-y-6"><div><h1 className="font-display text-xl font-semibold text-lumo-ink">Local de ponto</h1><p className="mt-1 text-sm text-lumo-slate">Defina GPS, raio e precisão permitidos para marcações no aplicativo.</p></div>
    {message && <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}
    {error && <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    <Card><CardContent className="space-y-5 p-6">{loading || !settings ? <p className="text-sm text-lumo-slate">Carregando configuração...</p> : <>
      <div className="flex flex-wrap items-center gap-2"><MapPin className="h-4 w-4 text-lumo-slate" /><p className="text-sm font-medium text-lumo-ink">{settings.label}</p><Badge variant={settings.active ? "success" : "default"}>{settings.active ? "Ativo" : "Inativo"}</Badge></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Nome do local"><Input value={settings.label} onChange={(e)=>setSettings({...settings,label:e.target.value})}/></Field><Field label="Timezone"><Input value={settings.timezone} onChange={(e)=>setSettings({...settings,timezone:e.target.value})}/></Field><Field label="Latitude"><Input type="number" step="any" value={settings.latitude} onChange={(e)=>setSettings({...settings,latitude:Number(e.target.value)})}/></Field><Field label="Longitude"><Input type="number" step="any" value={settings.longitude} onChange={(e)=>setSettings({...settings,longitude:Number(e.target.value)})}/></Field><Field label="Raio permitido (metros)"><Input type="number" min={20} max={5000} value={settings.radiusM} onChange={(e)=>setSettings({...settings,radiusM:Number(e.target.value)})}/></Field><Field label="Precisão máxima do GPS (metros)"><Input type="number" min={5} max={1000} value={settings.maxAccuracyM} onChange={(e)=>setSettings({...settings,maxAccuracyM:Number(e.target.value)})}/></Field></div>
      <label className="flex items-center gap-2 text-sm text-lumo-ink"><input type="checkbox" checked={settings.active} onChange={(e)=>setSettings({...settings,active:e.target.checked})} className="h-4 w-4 accent-emerald-500"/> Permitir marcações neste local</label>
      <div className="flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 p-6 text-center"><MapPin className="h-7 w-7 text-lumo-turquoise"/><p className="text-xs font-medium text-lumo-ink">{settings.latitude.toFixed(6)}, {settings.longitude.toFixed(6)}</p><p className="text-xs text-lumo-slate">Raio: {settings.radiusM} m · Precisão máxima: {settings.maxAccuracyM} m · {settings.timezone}</p><Button variant="outline" size="sm" onClick={()=>window.open(`https://www.google.com/maps?q=${settings.latitude},${settings.longitude}`,"_blank","noopener,noreferrer")}>Ver no mapa</Button></div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={reset}>Cancelar alterações</Button><Button variant="primary" onClick={save} disabled={saving}><Save className="h-4 w-4"/>{saving?"Salvando...":"Salvar local"}</Button></div>
    </>}</CardContent></Card>
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){ return <label className="space-y-1.5 text-xs font-medium text-lumo-slate"><span>{label}</span>{children}</label>; }
