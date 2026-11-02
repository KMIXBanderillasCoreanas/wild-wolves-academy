'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  ShieldAlert, 
  Award, 
  ChevronRight, 
  Cpu, 
  Sparkles, 
  Clock, 
  Crosshair, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  FileText,
  Lock,
  Flame,
  Dumbbell,
  Users
} from 'lucide-react';
import { requestBiomechanicsAuditAction } from '@/app/actions/biomechanics-actions';
import PaywallLockCard from '@/components/PaywallLockCard';
import { NBA_LEGENDS_BENCHMARKS, LegendBenchmark } from '@/lib/legendsBenchmark';

interface ProBenchMetrics {
  reactionTimeMs: number;
  gatheringTimeMs: number;
  releaseTimeMs: number;
  jumpApexHeightCm: number;
  defensiveStanceScore: number;
  hipTrackingAwareness: number;
}

export interface BiomechanicsProBenchmarkProps {
  athleteName?: string;
  studentId?: string;
  studentMetrics?: Partial<ProBenchMetrics>;
  isGuardianView?: boolean;
  isPro?: boolean;
}

export default function BiomechanicsProBenchmark({
  athleteName = 'Bruno Sánchez',
  studentId = 'demo-student',
  studentMetrics,
  isGuardianView = false,
  isPro = false
}: BiomechanicsProBenchmarkProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLegendId, setSelectedLegendId] = useState<string>('nba_base');

  // Métricas del Atleta (Valores reales o estimaciones del último test)
  const metrics: ProBenchMetrics = {
    reactionTimeMs: studentMetrics?.reactionTimeMs ?? 295,
    gatheringTimeMs: studentMetrics?.gatheringTimeMs ?? 430,
    releaseTimeMs: studentMetrics?.releaseTimeMs ?? 375,
    jumpApexHeightCm: studentMetrics?.jumpApexHeightCm ?? 52.0,
    defensiveStanceScore: studentMetrics?.defensiveStanceScore ?? 78.0,
    hipTrackingAwareness: studentMetrics?.hipTrackingAwareness ?? 82.0
  };

  // Leyenda actualmente seleccionada
  const activeLegend: LegendBenchmark = 
    NBA_LEGENDS_BENCHMARKS.find((l) => l.id === selectedLegendId) || NBA_LEGENDS_BENCHMARKS[0];

  // Cálculo de Porcentajes de Brecha (Normalizados a 100% de escala visual)
  const calcEfficiency = (student: number, pro: number, lowerIsBetter: boolean) => {
    if (lowerIsBetter) {
      const ratio = pro / Math.max(student, 1);
      return Math.min(Math.round(ratio * 100), 100);
    }
    const ratio = student / Math.max(pro, 1);
    return Math.min(Math.round(ratio * 100), 100);
  };

  const benchmarks = [
    {
      id: 'reaction',
      title: 'Velocidad de Reacción (Corte & Pase)',
      studentVal: `${metrics.reactionTimeMs} ms`,
      targetVal: `${activeLegend.reactionTimeMs} ms`,
      pct: calcEfficiency(metrics.reactionTimeMs, activeLegend.reactionTimeMs, true),
      desc: 'Tiempo desde el estímulo visual defensivo hasta el primer paso de propulsión.',
      delta: `+${metrics.reactionTimeMs - activeLegend.reactionTimeMs} ms vs ${activeLegend.legend_name.split(' ')[0]}`
    },
    {
      id: 'release',
      title: 'Tiempo de Liberación de Tiro (Release Speed)',
      studentVal: `${metrics.releaseTimeMs} ms`,
      targetVal: `${activeLegend.releaseTimeMs} ms`,
      pct: calcEfficiency(metrics.releaseTimeMs, activeLegend.releaseTimeMs, true),
      desc: 'Mecánica de disparo en el punto de apex con muñeca activa y quiebre de 90°.',
      delta: `+${metrics.releaseTimeMs - activeLegend.releaseTimeMs} ms vs ${activeLegend.legend_name.split(' ')[0]}`
    },
    {
      id: 'stance',
      title: 'Postura Defensiva (Stance & Cadera)',
      studentVal: `${metrics.defensiveStanceScore} pts`,
      targetVal: `${activeLegend.defensiveStanceScore} pts`,
      pct: calcEfficiency(metrics.defensiveStanceScore, activeLegend.defensiveStanceScore, false),
      desc: 'Mano adelantada al ombligo atacante, centro de gravedad bajo y ojos a la cadera.',
      delta: `${metrics.defensiveStanceScore - activeLegend.defensiveStanceScore} pts vs ${activeLegend.legend_name.split(' ')[0]}`
    },
    {
      id: 'gathering',
      title: 'Gathering & Paso Cero (Subida del Balón)',
      studentVal: `${metrics.gatheringTimeMs} ms`,
      targetVal: `${activeLegend.gatheringTimeMs} ms`,
      pct: calcEfficiency(metrics.gatheringTimeMs, activeLegend.gatheringTimeMs, true),
      desc: 'Tiempo de transición desde el bote de ataque hasta el set de tiro.',
      delta: `+${metrics.gatheringTimeMs - activeLegend.gatheringTimeMs} ms vs ${activeLegend.legend_name.split(' ')[0]}`
    },
    {
      id: 'jumpApex',
      title: 'Elevación Vertical en Apex',
      studentVal: `${metrics.jumpApexHeightCm} cm`,
      targetVal: `${activeLegend.jumpApexHeightCm} cm`,
      pct: calcEfficiency(metrics.jumpApexHeightCm, activeLegend.jumpApexHeightCm, false),
      desc: 'Capacidad de salto vertical para suspensión de tiro y disputa aérea.',
      delta: `${metrics.jumpApexHeightCm - activeLegend.jumpApexHeightCm} cm vs ${activeLegend.legend_name.split(' ')[0]}`
    },
    {
      id: 'hipTracking',
      title: 'Conciencia Espacial & Lectura de Cadera',
      studentVal: `${metrics.hipTrackingAwareness} pts`,
      targetVal: `${activeLegend.hipTrackingAwareness} pts`,
      pct: calcEfficiency(metrics.hipTrackingAwareness, activeLegend.hipTrackingAwareness, false),
      desc: 'Anticipación cinemática al atacante con rotación pélvica de 45°.',
      delta: `${metrics.hipTrackingAwareness - activeLegend.hipTrackingAwareness} pts vs ${activeLegend.legend_name.split(' ')[0]}`
    }
  ];

  const avgEfficiency = Math.round(
    benchmarks.reduce((acc, curr) => acc + curr.pct, 0) / benchmarks.length
  );

  const handleRunAiAudit = async () => {
    setAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await requestBiomechanicsAuditAction({
        userId: studentId,
        athleteName,
        shotType: 'jump_shot_apex',
        reactionTimeMs: metrics.reactionTimeMs,
        gatheringTimeMs: metrics.gatheringTimeMs,
        releaseTimeMs: metrics.releaseTimeMs,
        jumpApexHeightCm: metrics.jumpApexHeightCm,
        defensiveStanceScore: metrics.defensiveStanceScore,
        hipTrackingAwareness: metrics.hipTrackingAwareness,
        planType: isPro ? 'pro' : 'free'
      });

      if (res.success && res.data) {
        setAiReport(res.data);
      } else {
        setErrorMessage(res.error || 'No fue posible completar la auditoría cinemática.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el motor neural.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Contenido de telemetría cinemática
  const cinematicContent = (
    <div className="space-y-6">
      {/* TARJETA RESUMEN DE LA LEYENDA ACTIVA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121722] via-[#0d121c] to-[#141b2a] border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
            {activeLegend.iconTag}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                {activeLegend.legend_name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-orange-400 font-bold border border-zinc-700">
                {activeLegend.jerseyNumber} • {activeLegend.team}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {activeLegend.era}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-snug">
              {activeLegend.description}
            </p>
          </div>
        </div>

        <div className="p-2.5 px-3.5 rounded-xl bg-black/50 border border-zinc-800 shrink-0 text-right md:text-left">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
            {activeLegend.specialtyMetricName}
          </span>
          <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
            {activeLegend.specialtyMetricValue}
          </span>
        </div>
      </div>

      {/* BOTÓN DE AUDITORÍA Y ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-800/80 gap-3">
        <div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase">
            Desglose de Milisegundos y Ángulos vs {activeLegend.legend_name}
          </span>
          <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
            Cinemática y Brecha en Duela
          </h4>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={analyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-orange-600/30 disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Procesando en Bus Neural...' : 'Auditar con Lobo Táctico'}
        </button>
      </div>

      {/* ERROR / CUOTA ALERT */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Aviso del Sistema de Consultas:</p>
            <p className="text-zinc-300 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* BARRAS DE PROGRESO DE BRECHA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {benchmarks.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-zinc-700 transition space-y-2.5"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-zinc-200 truncate">{item.title}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-orange-400 border border-zinc-700 shrink-0">
                {item.delta}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 line-clamp-2">{item.desc}</p>

            {/* Medidores comparativos */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Atleta: <strong className="text-white">{item.studentVal}</strong></span>
                <span className="text-zinc-400">{activeLegend.legend_name.split(' ')[0]}: <strong className="text-emerald-400">{item.targetVal}</strong></span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    item.pct >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : item.pct >= 70
                      ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                      : 'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5">
                <span>Acoplamiento al Perfil</span>
                <span className="font-mono font-bold text-zinc-300">{item.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFORME DESPLEGADO DE LA IA (LOBO TÁCTICO) */}
      {aiReport && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121824] to-[#0c1017] border border-orange-500/30 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-sm font-black uppercase text-orange-400 tracking-wide">
                Diagnóstico del Lobo Táctico (FIBA / NBA vs {activeLegend.legend_name})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">DeepSeek-v4.1 Biomechanics</span>
          </div>

          <div className="mt-4 text-xs text-zinc-300 leading-relaxed space-y-3 whitespace-pre-line font-sans">
            {aiReport}
          </div>
        </div>
      )}
    </div>
  );

  // Determinar si el contenido actual requiere Paywall
  // 1. Si es vista de tutor y no es pro: se protege con Pack Familiar Élite $149
  // 2. Si es vista de alumno y seleccionó una leyenda premium (Curry, Jordan, LeBron, Bird) y no es pro: se protege con Lobo Pro $99
  const isTargetLocked = isGuardianView 
    ? (!isPro)
    : (activeLegend.isPremium && !isPro);

  const lockTitle = isGuardianView
    ? "Comparativa Cinemática Avanzada en Milisegundos"
    : `Comparativa Exclusiva contra ${activeLegend.legend_name}`;

  const lockBadge = isGuardianView ? "Pack Familiar Élite $149" : "Lobo Pro $99";
  const lockPlan = isGuardianView ? "Pack Familiar Élite" : "Atleta Lobo Pro";
  const lockPrice = isGuardianView ? "$149 MXN" : "$99 MXN";

  const lockDescription = isGuardianView
    ? `El desglose segundo a segundo de tiempo de liberación (release), gathering y cinemática de cadera contra ${activeLegend.legend_name} está reservado para el Pack Familiar Élite ($149 MXN).`
    : `La comparativa cinemática especializada contra leyendas históricas de la NBA (${activeLegend.legend_name} - ${activeLegend.archetype}) es una herramienta exclusiva para miembros Lobo Pro ($99 MXN).`;

  return (
    <div className="bg-[#0b0e14] border border-[#1e293b] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Luz de acento HUD */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ENCABEZADO DE TELEMETRÍA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-zinc-800/80 gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> TELEMETRÍA CINEMÁTICA V3.2
            </span>
            <span className="text-[11px] font-mono text-zinc-400">FIBA / NBA LEGENDS BENCHMARK</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5 flex items-center gap-2">
            Reporte de Brecha: Atleta vs. Leyendas de la NBA
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compara la cinemática, velocidad de tiro y reacción de <span className="text-orange-400 font-bold">{athleteName}</span> contra los más grandes de la historia.
          </p>
        </div>

        {/* Indicador de estado de suscripción */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full border ${
            isPro 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}>
            {isPro ? '⭐ MODO PRO ACTIVO' : 'FREE MODE (ESTÁNDAR BASE)'}
          </span>
        </div>
      </div>

      {/* SELECTOR INTERACTIVO DE LEYENDAS */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-400" /> Selecciona la Leyenda de Referencia:
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {NBA_LEGENDS_BENCHMARKS.length} perfiles disponibles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {NBA_LEGENDS_BENCHMARKS.map((legend) => {
            const isSelected = legend.id === selectedLegendId;
            const isLockedForUser = legend.isPremium && !isPro;

            return (
              <button
                key={legend.id}
                onClick={() => setSelectedLegendId(legend.id)}
                className={`p-3 rounded-2xl border text-left transition relative cursor-pointer group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1b2333] to-[#101624] border-orange-500 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10'
                    : 'bg-[#0f1422] border-zinc-800/90 hover:border-zinc-700 hover:bg-[#141b2a]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{legend.iconTag}</span>
                    {isLockedForUser ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> PRO
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        LIBRE
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-white truncate group-hover:text-orange-400 transition">
                    {legend.legend_name.split(' ')[0]} {legend.legend_name.split(' ')[1] || ''}
                  </h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {legend.archetype.split('/')[0]}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-500">Release:</span>
                  <span className="font-bold text-zinc-300">{legend.releaseTimeMs}ms</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ESQUEMA HÍBRIDO PARA TUTORES: RESUMEN EJECUTIVO EN LENGUAJE HUMANO (GRATIS) */}
      {isGuardianView && (
        <div className="bg-gradient-to-r from-[#121927] to-[#0f1422] border-2 border-emerald-500/40 rounded-2xl p-5 mb-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-black block">
                  Resumen Ejecutivo para Familias (Acceso Libre)
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  Diagnóstico Formativo de {athleteName} vs {activeLegend.legend_name}
                </h4>
              </div>
            </div>
            <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              🟢 {avgEfficiency}% Acoplamiento al Perfil
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
            Tu atleta se encuentra a un <strong className="text-emerald-300">{avgEfficiency}% de acoplamiento neuromuscular</strong> comparado con los patrones de {activeLegend.legend_name}. Muestra gran disciplina física, velocidad lateral y postura en el Deportivo Carmen Serdán.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">
                🟢 Fortaleza Clave
              </span>
              <p className="text-xs text-zinc-300">
                Postura defensiva activa y lectura en transición defensiva.
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">
                🟡 Enfoque en Duela
              </span>
              <p className="text-xs text-zinc-300">
                Acelerar el Gathering y Paso Cero para elevar el balón sin frenar el impulso.
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-black uppercase text-sky-400 block mb-1">
                💡 Tarea en el Hogar
              </span>
              <p className="text-xs text-zinc-300">
                300 saltos de cuerda diarios y 15 min de bote bajo alternado para reactividad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* COMPARATIVA CINEMÁTICA EN MILISEGUNDOS (BLOQUEO CONDICIONAL POR LEYENDA O PACK TUTOR) */}
      {isTargetLocked ? (
        <PaywallLockCard
          isLocked={true}
          title={lockTitle}
          badgeText={lockBadge}
          planName={lockPlan}
          planPrice={lockPrice}
          description={lockDescription}
          studentName={athleteName}
        >
          {cinematicContent}
        </PaywallLockCard>
      ) : (
        cinematicContent
      )}
    </div>
  );
}
