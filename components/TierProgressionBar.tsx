"use client";

import React from "react";
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  Zap, 
  Sparkles, 
  AlertTriangle,
  Award,
  Activity
} from "lucide-react";

export interface TierData {
  level: number;
  name: string;
  shortName: string;
  badge: string;
  restSeconds: number;
  requirement: string;
  gymAccess: boolean;
  minJogging: string;
  color: string;
  borderColor: string;
  bgActive: string;
}

export const TIERS_9: TierData[] = [
  {
    level: 1,
    name: "1. Principiante",
    shortName: "Principiante",
    badge: "Iniciación Sedentaria",
    restSeconds: 120,
    requirement: "Diagnóstico Día 1: 1 a 2 vueltas continuas y 25 saltos de cuerda.",
    gymAccess: false,
    minJogging: "10-15 min",
    color: "text-slate-300",
    borderColor: "border-slate-500",
    bgActive: "bg-slate-900/90 text-slate-100",
  },
  {
    level: 2,
    name: "2. Básico",
    shortName: "Básico",
    badge: "Adaptación Motriz",
    restSeconds: 90,
    requirement: "Requiere 3 a 5 vueltas continuas y 40-50 saltos de cuerda continuos.",
    gymAccess: false,
    minJogging: "20 min",
    color: "text-sky-400",
    borderColor: "border-sky-500",
    bgActive: "bg-sky-950/90 text-sky-200",
  },
  {
    level: 3,
    name: "3. Intermedio",
    shortName: "Intermedio",
    badge: "Fuerza Calistenia",
    restSeconds: 60,
    requirement: "Requiere 100 saltos de cuerda sin tropezar y batería 3x25 iniciada.",
    gymAccess: false,
    minJogging: "25 min",
    color: "text-amber-400",
    borderColor: "border-amber-500",
    bgActive: "bg-amber-950/90 text-amber-200",
  },
  {
    level: 4,
    name: "4. Avanzado (Polainas)",
    shortName: "Avanzado",
    badge: "Resistencia 35 Min",
    restSeconds: 45,
    requirement: "Requiere 35 min de trote continuo, 200 saltos y uso de polainas en drills.",
    gymAccess: false,
    minJogging: "35 min",
    color: "text-teal-400",
    borderColor: "border-teal-500",
    bgActive: "bg-teal-950/90 text-teal-200",
  },
  {
    level: 5,
    name: "5. Militar",
    shortName: "Militar",
    badge: "Calistenia Férrea",
    restSeconds: 30,
    requirement: "Requiere trote continuo de 45 min y batería 3x25 estricta de autocarga.",
    gymAccess: false,
    minJogging: "45 min",
    color: "text-emerald-400",
    borderColor: "border-emerald-500",
    bgActive: "bg-emerald-950/90 text-emerald-200",
  },
  {
    level: 6,
    name: "6. Élite",
    shortName: "Élite",
    badge: "Graduación de Cancha",
    restSeconds: 10,
    requirement: "Requiere trote continuo de 1 hora (60 min) sin detenerse y 5 vueltas de desplantes.",
    gymAccess: true,
    minJogging: "60 min (1 hr)",
    color: "text-cyan-400",
    borderColor: "border-cyan-400",
    bgActive: "bg-cyan-950/90 text-cyan-200",
  },
  {
    level: 7,
    name: "7. Bestia Alfa",
    shortName: "Bestia Alfa",
    badge: "Potencia & Sobrecarga",
    restSeconds: 15,
    requirement: "Requiere Rango Élite en cancha + 75 min de trote y peso muerto inicial en sala de cargas.",
    gymAccess: true,
    minJogging: "75 min",
    color: "text-orange-400",
    borderColor: "border-orange-500",
    bgActive: "bg-orange-950/90 text-orange-200",
  },
  {
    level: 8,
    name: "8. Titán Wolf",
    shortName: "Titán Wolf",
    badge: "Maestría Biomecánica",
    restSeconds: 15,
    requirement: "Requiere 90 min de trote continuo, triples consistentes 60%+ y postura óptima certificada.",
    gymAccess: true,
    minJogging: "90 min",
    color: "text-amber-300",
    borderColor: "border-amber-400",
    bgActive: "bg-amber-950/90 text-amber-100",
  },
  {
    level: 9,
    name: "9. ULTRA INSTINTO",
    shortName: "Ultra Instinto",
    badge: "Cúspide de Rendimiento",
    restSeconds: 15,
    requirement: "Requiere 120 min (2 horas) de trote continuo y biomecánica Ultra Instinto automatizada.",
    gymAccess: true,
    minJogging: "120 min (2 hrs)",
    color: "text-fuchsia-300",
    borderColor: "border-fuchsia-500",
    bgActive: "bg-fuchsia-950/90 text-fuchsia-100",
  },
];

export function getTierForMetrics(laps: number, joggingMin: number, rope: number, posture: string): TierData {
  if (joggingMin >= 120 || (posture === "ultra_instinto" && joggingMin >= 90)) {
    return TIERS_9[8]; // 9. Ultra Instinto
  }
  if (joggingMin >= 90 || (joggingMin >= 75 && posture === "optima")) {
    return TIERS_9[7]; // 8. Titán Wolf
  }
  if (joggingMin >= 75 || (laps >= 25 && rope >= 600)) {
    return TIERS_9[6]; // 7. Bestia Alfa
  }
  if (joggingMin >= 60 || (rope >= 500 && laps >= 20)) {
    return TIERS_9[5]; // 6. Élite
  }
  if (joggingMin >= 45 || (rope >= 300 && laps >= 15)) {
    return TIERS_9[4]; // 5. Militar
  }
  if (joggingMin >= 35 || (rope >= 200 && laps >= 10)) {
    return TIERS_9[3]; // 4. Avanzado (Polainas)
  }
  if (joggingMin >= 25 || (rope >= 100 && laps >= 6)) {
    return TIERS_9[2]; // 3. Intermedio
  }
  if (laps >= 3 || rope >= 40 || joggingMin >= 15) {
    return TIERS_9[1]; // 2. Básico
  }
  return TIERS_9[0]; // 1. Principiante
}

interface TierProgressionBarProps {
  currentLevel: number; // 1 to 9
  onSelectTier?: (tier: TierData) => void;
  compact?: boolean;
}

export default function TierProgressionBar({ currentLevel, onSelectTier, compact = false }: TierProgressionBarProps) {
  const activeLevel = Math.max(1, Math.min(9, currentLevel || 1));
  const activeTier = TIERS_9[activeLevel - 1];
  const isGymUnlocked = activeLevel >= 6; // Nivel 6 (Élite) otorga la graduación de cancha para sala de pesas

  return (
    <div className="bg-[#0b0e17] border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl font-sans space-y-5">
      {/* Encabezado del Escalafón */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
              Escalafón Biológico Oficial (9 Tiers)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Progresión atlética continua de Wild Wolves CDMX en Cancha Carmen Serdán
          </p>
        </div>

        {/* Chip de Nivel Actual y Descanso */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-400 text-xs font-bold font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>NIVEL {activeLevel}: {activeTier.shortName}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{activeTier.restSeconds}s Descanso</span>
          </div>
        </div>
      </div>

      {/* Barra Visual de Progresión de 9 Tiers (Scrollable en móvil) */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        <div className="grid grid-cols-9 gap-1.5 min-w-[760px] sm:min-w-0">
          {TIERS_9.map((tier) => {
            const isCompleted = tier.level < activeLevel;
            const isCurrent = tier.level === activeLevel;
            const isLocked = tier.level > activeLevel;

            return (
              <button
                key={tier.level}
                type="button"
                onClick={() => onSelectTier?.(tier)}
                className={`flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition cursor-pointer relative ${
                  isCurrent
                    ? `${tier.borderColor} ${tier.bgActive} border-2 shadow-lg shadow-orange-500/15 scale-102`
                    : isCompleted
                    ? "bg-zinc-900/80 border-emerald-500/40 text-zinc-300 hover:border-emerald-500"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-500 hover:border-zinc-700 opacity-70"
                }`}
              >
                {/* Indicador de Estado */}
                <div className="mb-1">
                  {isCurrent ? (
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black flex items-center justify-center text-[10px] font-black animate-pulse">
                      {tier.level}
                    </span>
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>

                <span className="text-[10px] font-black tracking-tight leading-tight line-clamp-1 block">
                  {tier.shortName}
                </span>

                <span className="text-[9px] font-mono mt-1 opacity-75">
                  {tier.restSeconds}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta de Detalle del Nivel Actual y Siguiente Desafío */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        
        {/* Nivel Activo */}
        <div className={`p-4 rounded-2xl border ${activeTier.borderColor} bg-zinc-900/70 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">
                Tu Rango Vigente
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 ${activeTier.color}`}>
                NIVEL {activeTier.level} DE 9
              </span>
            </div>
            <h4 className="text-base font-black text-white uppercase tracking-tight">
              {activeTier.name}
            </h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              {activeTier.requirement}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Descanso Obligatorio:</span>
            <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-md">
              {activeTier.restSeconds} segundos
            </span>
          </div>
        </div>

        {/* Desafío Siguiente (Candado / Requisito) */}
        {activeLevel < 9 ? (
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Requisito Siguiente Nivel
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  NIVEL {activeLevel + 1}: {TIERS_9[activeLevel].shortName}
                </span>
              </div>
              <h4 className="text-sm font-black text-zinc-200 uppercase tracking-tight">
                Para ascender a {TIERS_9[activeLevel].shortName}:
              </h4>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed font-sans">
                {TIERS_9[activeLevel].requirement}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Meta Trote Continuo:</span>
              <span className="font-bold text-amber-400">
                {TIERS_9[activeLevel].minJogging}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-fuchsia-500/50 bg-fuchsia-950/40 flex flex-col justify-center text-center">
            <Sparkles className="w-6 h-6 text-fuchsia-400 mx-auto mb-1 animate-pulse" />
            <span className="text-sm font-black text-fuchsia-200 uppercase tracking-wide">
              Cúspide de Ultra Instinto Alcanzada
            </span>
            <p className="text-xs text-zinc-300 mt-1">
              Atleta consagrado. Mantén 2 horas de trote y efectividad absoluta en cancha.
            </p>
          </div>
        )}
      </div>

      {/* CONTROL DE SALA DE PESAS & PESO MUERTO (NIVEL 7+ OBLIGATORIO) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isGymUnlocked 
          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
          : "bg-zinc-950/80 border-red-500/30 text-zinc-400"
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isGymUnlocked ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-500"
            }`}>
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wide">
                  Sala de Cargas & Peso Muerto
                </span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                  isGymUnlocked
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1"
                }`}>
                  {isGymUnlocked ? "Graduación de Cancha Obtenida" : (
                    <>
                      <Lock className="w-2.5 h-2.5" />
                      Graduación de Cancha Requerida
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed">
                {isGymUnlocked ? (
                  "El atleta ha demostrado resistencia calisténica superior en duela (Rango Élite+). Acceso habilitado a sentadilla con barra, peso muerto y cargas progresivas."
                ) : (
                  "Área de sobrecarga bloqueada preventivamente. La política biológica exige alcanzar primero el Rango Élite (60 min trote continuo + 500 saltos) para blindar articulaciones antes de levantar peso muerto."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
