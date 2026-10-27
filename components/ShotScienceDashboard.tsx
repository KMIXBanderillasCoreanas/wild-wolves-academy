'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  Trophy, 
  Award, 
  Crosshair, 
  Zap, 
  Activity, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface ShotRecord {
  shotNumber: number;
  releaseTime: number; // en segundos
  speedMph?: number;
  made: boolean;
}

interface ShotScienceData {
  shotType: 'Catch & Shoot' | 'Off the Dribble' | 'Layup' | 'Step-back';
  avgReleaseTime: number; // segundos
  avgReleaseAngle: number; // grados (ej 46)
  avgLegAngle: number; // grados (ej 139)
  avgSpeedMph: number; // mph (ej 3.7)
  verticalJumpInches: number; // pulgadas o cm
  accuracyPct: number;
  totalMakes: number;
  totalAttempts: number;
  recentShots: ShotRecord[];
}

interface AllTimeVolumeStats {
  totalShots: number;
  totalHours: number;
  totalWorkouts: number;
  monthlyGoalShots: { current: number; target: number };
  monthlyGoalDribble: { current: number; target: number };
  monthlyEffort: {
    month: string;
    makes: number;
    misses: number;
  }[];
}

interface ShotScienceDashboardProps {
  athleteName?: string;
  isCoachView?: boolean;
}

export default function ShotScienceDashboard({
  athleteName = 'Bruno Díaz',
  isCoachView = false
}: ShotScienceDashboardProps) {
  const [selectedShotType, setSelectedShotType] = useState<'Catch & Shoot' | 'Off the Dribble' | 'Layup'>('Catch & Shoot');
  const [volumeTimeframe, setVolumeTimeframe] = useState<'WEEKLY' | 'MONTHLY' | 'ALL-TIME'>('ALL-TIME');

  // Datos de telemetría de tiro biomecánico (HomeCourt Shot Science)
  const shotScienceMetrics: Record<'Catch & Shoot' | 'Off the Dribble' | 'Layup', ShotScienceData> = {
    'Catch & Shoot': {
      shotType: 'Catch & Shoot',
      avgReleaseTime: 0.85,
      avgReleaseAngle: 47,
      avgLegAngle: 141,
      avgSpeedMph: 2.5,
      verticalJumpInches: 8.5,
      accuracyPct: 78,
      totalMakes: 39,
      totalAttempts: 50,
      recentShots: [
        { shotNumber: 1, releaseTime: 0.82, speedMph: 2.4, made: true },
        { shotNumber: 2, releaseTime: 0.88, speedMph: 2.6, made: true },
        { shotNumber: 3, releaseTime: 0.79, speedMph: 2.3, made: true },
        { shotNumber: 4, releaseTime: 0.94, speedMph: 2.8, made: false },
        { shotNumber: 5, releaseTime: 0.81, speedMph: 2.5, made: true },
      ]
    },
    'Off the Dribble': {
      shotType: 'Off the Dribble',
      avgReleaseTime: 1.15,
      avgReleaseAngle: 45,
      avgLegAngle: 136,
      avgSpeedMph: 4.8,
      verticalJumpInches: 9.2,
      accuracyPct: 64,
      totalMakes: 32,
      totalAttempts: 50,
      recentShots: [
        { shotNumber: 1, releaseTime: 1.10, speedMph: 4.6, made: true },
        { shotNumber: 2, releaseTime: 1.18, speedMph: 5.1, made: false },
        { shotNumber: 3, releaseTime: 1.22, speedMph: 4.9, made: true },
        { shotNumber: 4, releaseTime: 1.09, speedMph: 4.5, made: true },
        { shotNumber: 5, releaseTime: 1.16, speedMph: 5.0, made: true },
      ]
    },
    'Layup': {
      shotType: 'Layup',
      avgReleaseTime: 0.65,
      avgReleaseAngle: 58,
      avgLegAngle: 152,
      avgSpeedMph: 7.2,
      verticalJumpInches: 14.0,
      accuracyPct: 88,
      totalMakes: 44,
      totalAttempts: 50,
      recentShots: [
        { shotNumber: 1, releaseTime: 0.62, speedMph: 7.0, made: true },
        { shotNumber: 2, releaseTime: 0.68, speedMph: 7.4, made: true },
        { shotNumber: 3, releaseTime: 0.61, speedMph: 7.1, made: true },
        { shotNumber: 4, releaseTime: 0.70, speedMph: 7.6, made: true },
        { shotNumber: 5, releaseTime: 0.64, speedMph: 6.9, made: false },
      ]
    }
  };

  // Datos históricos acumulados del atleta (Devon / Bruno Díaz)
  const volumeStats: Record<'WEEKLY' | 'MONTHLY' | 'ALL-TIME', AllTimeVolumeStats> = {
    'WEEKLY': {
      totalShots: 1450,
      totalHours: 8.5,
      totalWorkouts: 5,
      monthlyGoalShots: { current: 1450, target: 2000 },
      monthlyGoalDribble: { current: 4, target: 6 },
      monthlyEffort: [
        { month: 'Lun', makes: 220, misses: 60 },
        { month: 'Mar', makes: 190, misses: 70 },
        { month: 'Mié', makes: 250, misses: 50 },
        { month: 'Jue', makes: 210, misses: 80 },
        { month: 'Vie', makes: 260, misses: 40 },
        { month: 'Sáb', makes: 270, misses: 50 },
      ]
    },
    'MONTHLY': {
      totalShots: 6850,
      totalHours: 32,
      totalWorkouts: 20,
      monthlyGoalShots: { current: 6850, target: 8000 },
      monthlyGoalDribble: { current: 18, target: 24 },
      monthlyEffort: [
        { month: 'Sem 1', makes: 1200, misses: 350 },
        { month: 'Sem 2', makes: 1350, misses: 400 },
        { month: 'Sem 3', makes: 1400, misses: 320 },
        { month: 'Sem 4', makes: 1550, misses: 280 },
      ]
    },
    'ALL-TIME': {
      totalShots: 31982,
      totalHours: 149,
      totalWorkouts: 112,
      monthlyGoalShots: { current: 31982, target: 50000 },
      monthlyGoalDribble: { current: 86, target: 120 },
      monthlyEffort: [
        { month: 'Nov', makes: 4200, misses: 1800 },
        { month: 'Dic', makes: 5100, misses: 1900 },
        { month: 'Ene', makes: 3800, misses: 1400 },
        { month: 'Feb', makes: 5400, misses: 1600 },
        { month: 'Mar', makes: 4900, misses: 1700 },
        { month: 'Abr', makes: 5800, misses: 1500 },
        { month: 'May', makes: 5200, misses: 1600 },
        { month: 'Jun', makes: 4100, misses: 1300 },
        { month: 'Jul', makes: 5600, misses: 1500 },
        { month: 'Ago', makes: 6100, misses: 1400 },
        { month: 'Sep', makes: 4800, misses: 1600 },
        { month: 'Oct', makes: 5500, misses: 1300 },
      ]
    }
  };

  const activeScience = shotScienceMetrics[selectedShotType];
  const activeVolume = volumeStats[volumeTimeframe];

  return (
    <div className="w-full space-y-6">
      
      {/* 1. CABECERA TELEMETRÍA HOMECOURT */}
      <div className="bg-[#0b0f19] border border-orange-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                SHOT SCIENCE • TELEMETRÍA EN VIVO
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Deportivo Carmen Serdán
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2.5">
              <Crosshair className="w-6 h-6 text-orange-500" />
              <span>Análisis Biomecánico de Tiro: {athleteName}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Registro computacional de tiempos de soltado, ángulos articulares de piernas y elevación vertical.
            </p>
          </div>

          {/* SELECTOR DE MODALIDAD DE TIRO */}
          <div className="flex items-center gap-1.5 bg-[#141926] p-1.5 rounded-2xl border border-zinc-800 self-start lg:self-auto">
            {(['Catch & Shoot', 'Off the Dribble', 'Layup'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedShotType(mode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  selectedShotType === mode
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* 2. REJILLA DE 4 TARJETAS PRINCIPALES DE SHOT SCIENCE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          
          {/* RELEASE TIME */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
              Tiempo de Soltado
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {activeScience.avgReleaseTime}s
              </span>
              <span className="text-[11px] font-mono text-orange-400">AVG</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Meta Élite: &lt; 0.9s
            </span>
          </div>

          {/* RELEASE ANGLE */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
              Ángulo de Salida
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {activeScience.avgReleaseAngle}°
              </span>
              <span className="text-[11px] font-mono text-amber-500">Parábola</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Rango Óptimo: 45° - 48°
            </span>
          </div>

          {/* LEG ANGLE (FLEXIÓN) */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
              Flexión Piernas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {activeScience.avgLegAngle}°
              </span>
              <span className="text-[11px] font-mono text-emerald-500">Carga</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Biomecánica: 135° - 145°
            </span>
          </div>

          {/* SPEED / VERTICAL */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
              Velocidad &amp; Salto
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                {activeScience.avgSpeedMph}
              </span>
              <span className="text-[11px] font-mono text-cyan-500">MPH</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Elevación: {activeScience.verticalJumpInches}&quot; ({Math.round(activeScience.verticalJumpInches * 2.54)} cm)
            </span>
          </div>
        </div>

        {/* 3. GRÁFICA SHOT-BY-SHOT (TIRO POR TIRO ESTILO HOMECOURT) */}
        <div className="mt-6 bg-[#0e121d] border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-black uppercase text-white tracking-wider">
                Consistencia Tiro por Tiro ({selectedShotType})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Efectividad: <strong className="text-orange-400">{activeScience.accuracyPct}%</strong> ({activeScience.totalMakes}/{activeScience.totalAttempts})
            </span>
          </div>

          {/* BARRAS DE SOLTADO (0.0s - 2.0s) */}
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-2 h-36 border-b border-zinc-800 pb-2 px-2">
              {activeScience.recentShots.map((shot) => {
                const heightPct = Math.min(100, (shot.releaseTime / 2.0) * 100);
                return (
                  <div key={shot.shotNumber} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition">
                      {shot.releaseTime}s
                    </span>
                    <div 
                      className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                        shot.made 
                          ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-lg shadow-orange-500/20' 
                          : 'bg-zinc-700 opacity-60'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${shot.made ? 'bg-orange-500' : 'bg-zinc-600'}`} />
                      <span className="text-[9px] font-mono text-zinc-500">#{shot.shotNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-2">
              <span>0.0s</span>
              <span>1.0s (Objetivo)</span>
              <span>2.0s</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PANEL DE VOLUMEN TOTAL HISTÓRICO Y ANILLOS DE OBJETIVO */}
      <div className="bg-[#0b0f19] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
        
        {/* ENCABEZADO Y SELECTOR DE PERIODO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
                Volumen Acumulado de Práctica &amp; Esfuerzo
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Métricas innegociables de constancia y tiros totales en duela.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#141926] p-1 rounded-xl border border-zinc-800 self-start sm:self-auto font-mono text-[11px]">
            {(['WEEKLY', 'MONTHLY', 'ALL-TIME'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setVolumeTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  volumeTimeframe === tf
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* 3 GRANDES NÚMEROS: TIROS, HORAS, WORKOUTS */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-6 border-b border-zinc-800/80 text-center">
          <div>
            <span className="text-2xl sm:text-4xl font-black text-white font-mono block tracking-tight">
              {activeVolume.totalShots.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
              Tiros Totales
            </span>
          </div>

          <div className="border-x border-zinc-800/80 px-2">
            <span className="text-2xl sm:text-4xl font-black text-orange-400 font-mono block tracking-tight">
              {activeVolume.totalHours}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
              Horas Duela
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono block tracking-tight">
              {activeVolume.totalWorkouts}
            </span>
            <span className="text-[10px] sm:text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
              Sesiones
            </span>
          </div>
        </div>

        {/* 4. GRÁFICA DE ESFUERZO MENSUAL: MAKE VS MISS */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">
                Esfuerzo Histórico (Make vs Miss)
              </h4>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                <span className="text-zinc-300">Aciertos (Make)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600" />
                <span className="text-zinc-400">Fallos (Miss)</span>
              </div>
            </div>
          </div>

          {/* BARRAS APILADAS MENSUALES */}
          <div className="bg-[#0e121d] border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-48 border-b border-zinc-800 pb-2">
              {activeVolume.monthlyEffort.map((item, idx) => {
                const total = item.makes + item.misses;
                const maxScale = 7500;
                const makeHeightPct = (item.makes / maxScale) * 100;
                const missHeightPct = (item.misses / maxScale) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full max-w-[28px] flex flex-col justify-end">
                      {/* Miss (Gris/Azul marino) */}
                      <div 
                        className="w-full bg-zinc-600 rounded-t-sm"
                        style={{ height: `${missHeightPct}%` }}
                        title={`Fallos: ${item.misses}`}
                      />
                      {/* Make (Naranja) */}
                      <div 
                        className="w-full bg-orange-500 rounded-b-sm"
                        style={{ height: `${makeHeightPct}%` }}
                        title={`Aciertos: ${item.makes}`}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 mt-2 truncate w-full text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-2 px-1">
              <span>0 Tiros</span>
              <span>3,750</span>
              <span>7,500 Tiros / Mes</span>
            </div>
          </div>
        </div>

        {/* 5. ESCUDOS Y LOGROS DE DISCIPLINA (ACHIEVEMENTS HOMECOURT) */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">
                Logros e Insignias Desbloqueadas en Duela
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Certificado por Head Coach Ricardo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* ESCUDO DORADO */}
            <div className="bg-[#121624] border border-amber-500/40 p-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-amber-500/5">
              <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 flex flex-col items-center justify-center text-black font-black shrink-0 shadow-md">
                <span className="text-base leading-none">65%</span>
                <span className="text-[8px] font-mono uppercase tracking-wider">3PT</span>
              </div>
              <div>
                <span className="text-xs font-black uppercase text-white block">
                  Francotirador de Élite
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block">
                  Efectividad superior al 65% en 5 spots
                </span>
                <span className="text-[9px] text-amber-400 font-mono font-bold mt-1 inline-block">
                  Badge × 1
                </span>
              </div>
            </div>

            {/* ESCUDO PLATEADO */}
            <div className="bg-[#121624] border border-zinc-700 p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-zinc-200 to-zinc-400 flex flex-col items-center justify-center text-black font-black shrink-0 shadow-md">
                <span className="text-base leading-none">10</span>
                <span className="text-[8px] font-mono uppercase tracking-wider">RACHA</span>
              </div>
              <div>
                <span className="text-xs font-black uppercase text-white block">
                  Racha Implacable
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block">
                  10 tiros libres consecutivos sin fallo
                </span>
                <span className="text-[9px] text-zinc-300 font-mono font-bold mt-1 inline-block">
                  Badge × 1
                </span>
              </div>
            </div>

            {/* ESCUDO BRONCE */}
            <div className="bg-[#121624] border border-amber-800/40 p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-amber-700 to-amber-900 flex flex-col items-center justify-center text-amber-100 font-black shrink-0 shadow-md">
                <span className="text-base leading-none">50</span>
                <span className="text-[8px] font-mono uppercase tracking-wider">3PT</span>
              </div>
              <div>
                <span className="text-xs font-black uppercase text-white block">
                  Volumen Maestro
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block">
                  50 triples encestados en sesión oficial
                </span>
                <span className="text-[9px] text-amber-600 font-mono font-bold mt-1 inline-block">
                  Badge × 1
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
