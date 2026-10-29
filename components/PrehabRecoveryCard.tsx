'use client';

import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Flame, 
  Droplet, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Zap,
  AlertCircle
} from 'lucide-react';
import { requestPrehabConsultationAction } from '@/app/actions/biomechanics-actions';

interface PrehabSectionProps {
  athleteName: string;
  studentId?: string;
  bioimpedance?: {
    fatPercent?: number;
    waterPercent?: number;
    muscleMassKg?: number;
    lastWeighInDate?: string;
  };
}

export default function PrehabRecoveryCard({
  athleteName = 'Bruno Sánchez',
  studentId = 'demo-student',
  bioimpedance
}: PrehabSectionProps) {
  const [selectedZone, setSelectedZone] = useState<'tobillo' | 'rodilla' | 'isquiotibiales' | 'lumbar'>('tobillo');
  const [loading, setLoading] = useState(false);
  const [consultationResult, setConsultationResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fat = bioimpedance?.fatPercent ?? 18.2;
  const water = bioimpedance?.waterPercent ?? 54.5;

  const protocols = [
    {
      id: 'tobillo' as const,
      name: 'Anti-Esguince Tobillo',
      tag: 'Propiocepción & Peroneos',
      icon: '🦶',
      time: '6 min',
      focus: 'Estabilidad de aterrizaje en rebotes y absorción excéntrica.'
    },
    {
      id: 'rodilla' as const,
      name: 'Protección Rotuliana',
      tag: 'Isométrico Cuádriceps',
      icon: '🦵',
      time: '8 min',
      focus: 'Prevención de rodilla de saltador; descompresión en desaceleración brusca.'
    },
    {
      id: 'isquiotibiales' as const,
      name: 'Cadena Posterior',
      tag: 'Flexibilidad Isquiosural',
      icon: '⚡',
      time: '10 min',
      focus: 'Alivio de sobrecarga tras sprints y saltos continuos.'
    },
    {
      id: 'lumbar' as const,
      name: 'Descompresión Lumbar',
      tag: 'Sacroilíaca & Postura',
      icon: '🛡️',
      time: '7 min',
      focus: 'Corrección de postura defensiva baja prolongada y fatiga de columna.'
    }
  ];

  const handleConsultarQuiropractico = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const activeProto = protocols.find(p => p.id === selectedZone);
      const res = await requestPrehabConsultationAction({
        userId: studentId,
        athleteName,
        targetArea: selectedZone,
        symptom: `Consulta preventiva para ${activeProto?.name}. Enfoque en ${activeProto?.focus}`,
        bioimpedanceFatPercent: fat,
        bioimpedanceWaterPercent: water,
        planType: 'free'
      });

      if (res.success && res.data) {
        setConsultationResult(res.data);
      } else {
        setErrorMsg(res.error || 'No fue posible cargar el plan quiropráctico.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0e14] border border-[#1e293b] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Fondo de brillo sutil */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-teal-400" /> PRE-HAB & COOL-DOWN V3.2
            </span>
            <span className="text-[11px] font-mono text-zinc-400">SALUD ARTICULAR QUIROPRÁCTICA</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5">
            Salud Preventiva y Estiramientos
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Prescripción adaptada a la bioimpedancia de <span className="text-teal-400 font-bold">{athleteName}</span> para blindar articulaciones antes y después del juego.
          </p>
        </div>

        {/* CÁPSULA DE BIOIMPEDANCIA VINCULADA */}
        <div className="flex items-center gap-3 bg-[#111622] border border-zinc-800 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
            <div className="text-[10px] font-mono">
              <span className="text-zinc-500 block">Agua Corporal</span>
              <span className="font-bold text-white">{water}%</span>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-[10px] font-mono">
              <span className="text-zinc-500 block">% Grasa</span>
              <span className="font-bold text-white">{fat}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR / CUOTA ALERT */}
      {errorMsg && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Aviso de Cuota de Consultas:</p>
            <p className="text-zinc-300 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* SELECTOR DE ZONAS ARTICULARES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {protocols.map((proto) => {
          const isSelected = selectedZone === proto.id;
          return (
            <button
              key={proto.id}
              onClick={() => {
                setSelectedZone(proto.id);
                setConsultationResult(null);
              }}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-950/40'
                  : 'bg-[#10141d] border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-2xl">{proto.icon}</span>
                <h4 className="text-xs font-bold text-white mt-2">{proto.name}</h4>
                <p className="text-[10px] text-teal-400 font-mono mt-0.5">{proto.tag}</p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {proto.time}
                </span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* DESCRIPCIÓN Y BOTÓN DE PRESCRIPCIÓN */}
      <div className="mt-5 p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
            Objetivo Táctico de Protección:
          </span>
          <p className="text-xs text-zinc-300 mt-0.5">
            {protocols.find(p => p.id === selectedZone)?.focus}
          </p>
        </div>

        <button
          onClick={handleConsultarQuiropractico}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-teal-950/50 disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generando Protocolo...' : 'Generar Rutina con Lobo Táctico'}
        </button>
      </div>

      {/* REPORTE QUIROPRÁCTICO GENERADO */}
      {consultationResult && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-[#0c1619] to-[#0a1014] border border-teal-500/40 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-teal-900/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
              <h4 className="text-sm font-black uppercase text-teal-400 tracking-wide">
                Protocolo Personalizado Pre-hab & Cool-down
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Quiropráctica Deportiva FIBA</span>
          </div>

          <div className="mt-4 text-xs text-zinc-300 leading-relaxed space-y-3 whitespace-pre-line font-sans">
            {consultationResult}
          </div>
        </div>
      )}
    </div>
  );
}
