'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  Target, 
  TrendingUp, 
  Flame, 
  Calendar, 
  Award, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Dumbbell,
  Timer
} from 'lucide-react';
import BasketballCourtHeatmap from '@/components/BasketballCourtHeatmap';

export interface CleanTabMetrics {
  verticalJumpCm: number;
  sprint20mSeconds: number; // o sprint normalizado
  shootingEfficiencyPct: number;
  overallOvr: number;
  freeThrowsPct: number;
  midRangePct: number;
  threePointPct: number;
  baseline: {
    verticalJumpCm: number;
    sprint20mSeconds: number;
    shootingEfficiencyPct: number;
    entryDate?: string;
  };
  monthlyProgression: Array<{
    month: string;
    verticalJumpCm: number;
    sprint20mSeconds: number;
    shootingPct: number;
    ovr: number;
  }>;
  shotHeatmapData: {
    freeThrowsMade: number;
    freeThrowsAttempts?: number;
    midRangeLeftMade: number;
    midRangeRightMade: number;
    threeCornerLeftMade: number;
    threeWingLeftMade: number;
    threeTopKeyMade: number;
    threeWingRightMade: number;
    threeCornerRightMade: number;
  };
  officialHistory: Array<{
    date: string;
    ovr: number;
    verticalJump: string;
    sprint: string;
    shooting: string;
    evaluator: string;
    status: string;
  }>;
}

interface CleanPortalTabsProps {
  athleteName: string;
  category?: string;
  jerseyNumber?: number | string;
  metrics: CleanTabMetrics;
  mode?: 'student' | 'guardian';
}

export default function CleanPortalTabs({
  athleteName,
  category = 'U-17 Competitivo',
  jerseyNumber = '11',
  metrics,
  mode = 'student'
}: CleanPortalTabsProps) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'curva' | 'mapa_tiro' | 'historial'>('resumen');

  const tabs = [
    { id: 'resumen', label: 'Resumen Actual', icon: Zap, badge: 'Top 3' },
    { id: 'curva', label: 'Curva de Progresión', icon: TrendingUp, badge: 'Evolución' },
    { id: 'mapa_tiro', label: 'Mapa de Tiro en Duela', icon: Target, badge: 'Interactivo' },
    { id: 'historial', label: 'Historial Oficial', icon: Calendar, badge: 'Mes a Mes' }
  ] as const;

  return (
    <div className="w-full space-y-6">
      {/* NAVEGACIÓN POR PESTAÑAS HORIZONTALES LIMPIAS */}
      <div className="bg-[#0b0e17] border border-zinc-800 rounded-2xl p-1.5 shadow-xl flex flex-wrap sm:flex-nowrap gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 ring-1 ring-orange-400/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold hidden md:inline shrink-0 ${
                isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}

      {/* ========================================================================= */}
      {/* TAB 1: RESUMEN ACTUAL (3 MÉTRICAS ESTELARES DE ALTO IMPACTO)              */}
      {/* ========================================================================= */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Tarjetas Principales de Alto Impacto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Métrica 1: Salto Vertical */}
            <div className="bg-gradient-to-b from-[#131620] to-[#0b0e17] border border-zinc-800 hover:border-orange-500/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group transition">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-2xl rounded-full group-hover:bg-orange-500/20 transition" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 font-bold px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  Potencia de Despegue
                </span>
                <Dumbbell className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Salto Vertical</h3>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {metrics.verticalJumpCm}
                </span>
                <span className="text-zinc-400 font-mono text-sm font-bold">cm</span>
              </div>
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Línea Base: {metrics.baseline.verticalJumpCm} cm</span>
                <span className="text-emerald-400 font-bold">
                  +{Math.max(0, metrics.verticalJumpCm - metrics.baseline.verticalJumpCm)} cm
                </span>
              </div>
            </div>

            {/* Métrica 2: Sprint 20m */}
            <div className="bg-gradient-to-b from-[#131620] to-[#0b0e17] border border-zinc-800 hover:border-blue-500/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group transition">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  Velocidad & Explosividad
                </span>
                <Timer className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Sprint 20m</h3>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {metrics.sprint20mSeconds}
                </span>
                <span className="text-zinc-400 font-mono text-sm font-bold">seg</span>
              </div>
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Línea Base: {metrics.baseline.sprint20mSeconds}s</span>
                <span className="text-emerald-400 font-bold">
                  {(metrics.baseline.sprint20mSeconds - metrics.sprint20mSeconds).toFixed(1)}s más rápido
                </span>
              </div>
            </div>

            {/* Métrica 3: Eficiencia de Tiro */}
            <div className="bg-gradient-to-b from-[#131620] to-[#0b0e17] border border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group transition">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Puntería Global
                </span>
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Eficiencia de Tiro</h3>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {metrics.shootingEfficiencyPct}%
                </span>
                <span className="text-emerald-400 font-mono text-xs font-bold uppercase">Élite Duela</span>
              </div>
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Base: {metrics.baseline.shootingEfficiencyPct}%</span>
                <span className="text-emerald-400 font-bold">
                  +{Math.max(0, metrics.shootingEfficiencyPct - metrics.baseline.shootingEfficiencyPct)}%
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Valoración General (OVR) y Estatus Deportivo */}
          <div className="bg-[#0b0e17] border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/30">
                {metrics.overallOvr}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-black text-lg">{athleteName}</h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-orange-400 border border-zinc-700">
                    #{jerseyNumber}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Categoría {category} • Deportivo Carmen Serdán
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Tiro Libre</span>
                <span className="text-base font-black text-emerald-400">{metrics.freeThrowsPct}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Media Distancia</span>
                <span className="text-base font-black text-amber-400">{metrics.midRangePct}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Triples (3PT)</span>
                <span className="text-base font-black text-orange-400">{metrics.threePointPct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CURVA DE PROGRESIÓN (LÍNEA BASE VS. MES EN CURSO)                  */}
      {/* ========================================================================= */}
      {activeTab === 'curva' && (
        <div className="bg-[#0b0e17] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Curva de Evolución Mensual
              </h3>
              <p className="text-zinc-400 text-xs mt-0.5">
                Comparativa directa entre la línea base inicial de ingreso y el mes actual.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" /> Línea Base
              </span>
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Mes Actual
              </span>
            </div>
          </div>

          {/* Gráfico de Barras / Progresión Visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Comparativa Salto Vertical */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase">Evolución Salto Vertical</span>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Día de Ingreso</span>
                      <span className="text-zinc-400 font-mono">{metrics.baseline.verticalJumpCm} cm</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-zinc-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (metrics.baseline.verticalJumpCm / 80) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-bold">Mes en Curso</span>
                      <span className="text-orange-400 font-mono font-bold">{metrics.verticalJumpCm} cm</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (metrics.verticalJumpCm / 80) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                <span>Ganancia Neta:</span>
                <span className="font-bold">+{Math.max(0, metrics.verticalJumpCm - metrics.baseline.verticalJumpCm)} cm</span>
              </div>
            </div>

            {/* Comparativa Sprint 20m */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase">Evolución Sprint 20m</span>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Día de Ingreso</span>
                      <span className="text-zinc-400 font-mono">{metrics.baseline.sprint20mSeconds}s</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-zinc-600 h-2.5 rounded-full" 
                        style={{ width: '65%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-bold">Mes en Curso</span>
                      <span className="text-blue-400 font-mono font-bold">{metrics.sprint20mSeconds}s</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full" 
                        style={{ width: '85%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                <span>Reducción de Tiempo:</span>
                <span className="font-bold">{(metrics.baseline.sprint20mSeconds - metrics.sprint20mSeconds).toFixed(1)}s</span>
              </div>
            </div>

            {/* Comparativa Tiro Global */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400 uppercase">Evolución Tiro Global</span>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Día de Ingreso</span>
                      <span className="text-zinc-400 font-mono">{metrics.baseline.shootingEfficiencyPct}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-zinc-600 h-2.5 rounded-full" 
                        style={{ width: `${metrics.baseline.shootingEfficiencyPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white font-bold">Mes en Curso</span>
                      <span className="text-emerald-400 font-mono font-bold">{metrics.shootingEfficiencyPct}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" 
                        style={{ width: `${metrics.shootingEfficiencyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                <span>Incremento de Puntería:</span>
                <span className="font-bold">+{Math.max(0, metrics.shootingEfficiencyPct - metrics.baseline.shootingEfficiencyPct)}%</span>
              </div>
            </div>
          </div>

          {/* Histórico Mes a Mes en Barras */}
          <div className="pt-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
              Evolución OVR por Meses Registrados
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {metrics.monthlyProgression.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">{item.month}</span>
                  <span className="text-2xl font-black text-orange-400">{item.ovr}</span>
                  <span className="text-[10px] text-zinc-400 block mt-1 font-mono">
                    {item.verticalJumpCm}cm • {item.shootingPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MAPA DE TIRO & DESGLOSE EN DUELA (INTERACTIVO POR ZONAS)           */}
      {/* ========================================================================= */}
      {activeTab === 'mapa_tiro' && (
        <div className="space-y-6">
          <div className="bg-[#0b0e17] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Mapa Táctico de Tiro en Duela Carmen Serdán
                </h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Visualización táctica de efectividad por zonas: Perímetro 3PT, Mid-Range y Tiro Libre.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  Efectividad Total: {metrics.shootingEfficiencyPct}%
                </span>
              </div>
            </div>

            {/* Componente React de Heatmap Oficial */}
            <BasketballCourtHeatmap
              data={{
                freeThrowsMade: metrics.shotHeatmapData.freeThrowsMade,
                midRangeLeftMade: metrics.shotHeatmapData.midRangeLeftMade,
                midRangeRightMade: metrics.shotHeatmapData.midRangeRightMade,
                threeCornerLeftMade: metrics.shotHeatmapData.threeCornerLeftMade,
                threeWingLeftMade: metrics.shotHeatmapData.threeWingLeftMade,
                threeTopKeyMade: metrics.shotHeatmapData.threeTopKeyMade,
                threeWingRightMade: metrics.shotHeatmapData.threeWingRightMade,
                threeCornerRightMade: metrics.shotHeatmapData.threeCornerRightMade,
                athleteName
              }}
              showPhysicals={false}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HISTORIAL OFICIAL (TABLA RESUMIDA MES A MES)                       */}
      {/* ========================================================================= */}
      {activeTab === 'historial' && (
        <div className="bg-[#0b0e17] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Historial Oficial Mes a Mes
              </h3>
              <p className="text-zinc-400 text-xs mt-0.5">
                Registro inmutable de evaluaciones de Test Day aplicadas en duela.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Calificación OVR</th>
                  <th className="py-3 px-3">Salto Vertical</th>
                  <th className="py-3 px-3">Sprint 20m</th>
                  <th className="py-3 px-3">Tiro Global</th>
                  <th className="py-3 px-3">Evaluador</th>
                  <th className="py-3 px-3">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {metrics.officialHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-3 text-white font-bold">{row.date}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-black">
                        {row.ovr} OVR
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-300">{row.verticalJump}</td>
                    <td className="py-3.5 px-3 text-zinc-300">{row.sprint}</td>
                    <td className="py-3.5 px-3 text-emerald-400 font-bold">{row.shooting}</td>
                    <td className="py-3.5 px-3 text-zinc-400 font-sans">{row.evaluator}</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
