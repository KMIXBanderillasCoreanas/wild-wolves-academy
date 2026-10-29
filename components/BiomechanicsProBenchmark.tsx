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
  RotateCcw
} from 'lucide-react';
import { requestBiomechanicsAuditAction } from '@/app/actions/biomechanics-actions';

interface ProBenchMetrics {
  reactionTimeMs: number;
  gatheringTimeMs: number;
  releaseTimeMs: number;
  jumpApexHeightCm: number;
  defensiveStanceScore: number;
  hipTrackingAwareness: number;
}

interface BiomechanicsProBenchmarkProps {
  athleteName: string;
  studentId?: string;
  studentMetrics?: Partial<ProBenchMetrics>;
}

export default function BiomechanicsProBenchmark({
  athleteName = 'Bruno Sánchez',
  studentId = 'demo-student',
  studentMetrics
}: BiomechanicsProBenchmarkProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Métricas del Atleta (Valores reales o estimaciones del último test)
  const metrics: ProBenchMetrics = {
    reactionTimeMs: studentMetrics?.reactionTimeMs ?? 295,
    gatheringTimeMs: studentMetrics?.gatheringTimeMs ?? 430,
    releaseTimeMs: studentMetrics?.releaseTimeMs ?? 375,
    jumpApexHeightCm: studentMetrics?.jumpApexHeightCm ?? 52.0,
    defensiveStanceScore: studentMetrics?.defensiveStanceScore ?? 78.0,
    hipTrackingAwareness: studentMetrics?.hipTrackingAwareness ?? 82.0
  };

  // Parámetros de referencia Élite Pro NBA
  const nbaBenchmark = {
    reactionTimeMs: 215, // Más rápido es mejor
    gatheringTimeMs: 320, // Más rápido es mejor
    releaseTimeMs: 310, // Estándar Curry/Lillard: ~300-330ms
    jumpApexHeightCm: 72.0, // Más alto es mejor
    defensiveStanceScore: 92.0, // Mayor es mejor
    hipTrackingAwareness: 94.0 // Mayor es mejor
  };

  // Cálculo de Porcentajes de Brecha (Normalizados a 100% de escala visual)
  const calcEfficiency = (student: number, pro: number, lowerIsBetter: boolean) => {
    if (lowerIsBetter) {
      // Si menor es mejor, la eficiencia sube mientras más cerca esté del benchmark inferior
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
      nbaVal: `${nbaBenchmark.reactionTimeMs} ms`,
      pct: calcEfficiency(metrics.reactionTimeMs, nbaBenchmark.reactionTimeMs, true),
      desc: 'Tiempo desde el estímulo visual defensivo hasta el primer paso de propulsión.',
      delta: `+${metrics.reactionTimeMs - nbaBenchmark.reactionTimeMs} ms vs NBA`
    },
    {
      id: 'release',
      title: 'Tiempo de Liberación de Tiro (Release Speed)',
      studentVal: `${metrics.releaseTimeMs} ms`,
      nbaVal: `${nbaBenchmark.releaseTimeMs} ms`,
      pct: calcEfficiency(metrics.releaseTimeMs, nbaBenchmark.releaseTimeMs, true),
      desc: 'Mecánica de disparo en el punto de apex con muñeca activa y quiebre de 90°.',
      delta: `+${metrics.releaseTimeMs - nbaBenchmark.releaseTimeMs} ms vs NBA`
    },
    {
      id: 'stance',
      title: 'Postura Defensiva (Stance & Cadera)',
      studentVal: `${metrics.defensiveStanceScore} pts`,
      nbaVal: `${nbaBenchmark.defensiveStanceScore} pts`,
      pct: calcEfficiency(metrics.defensiveStanceScore, nbaBenchmark.defensiveStanceScore, false),
      desc: 'Mano adelantada al ombligo atacante, centro de gravedad bajo y ojos a la cadera.',
      delta: `${metrics.defensiveStanceScore - nbaBenchmark.defensiveStanceScore} pts vs NBA`
    },
    {
      id: 'gathering',
      title: 'Gathering & Paso Cero (Subida del Balón)',
      studentVal: `${metrics.gatheringTimeMs} ms`,
      nbaVal: `${nbaBenchmark.gatheringTimeMs} ms`,
      pct: calcEfficiency(metrics.gatheringTimeMs, nbaBenchmark.gatheringTimeMs, true),
      desc: 'Tiempo de transición desde el bote de ataque hasta el set de tiro.',
      delta: `+${metrics.gatheringTimeMs - nbaBenchmark.gatheringTimeMs} ms vs NBA`
    }
  ];

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
        planType: 'free'
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

  return (
    <div className="bg-[#0b0e14] border border-[#1e293b] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Luz de acento HUD */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ENCABEZADO DE TELEMETRÍA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> TELEMETRÍA CINEMÁTICA V3.2
            </span>
            <span className="text-[11px] font-mono text-zinc-400">FIBA / NBA BENCHMARK</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5 flex items-center gap-2">
            Reporte de Brecha: Atleta vs. Estándar Pro NBA
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Comparativa en milisegundos y grados cinemáticos de <span className="text-orange-400 font-bold">{athleteName}</span> contra el benchmark élite.
          </p>
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
        <div className="mt-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Aviso del Sistema de Consultas:</p>
            <p className="text-zinc-300 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* BARRAS DE PROGRESO DE BRECHA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {benchmarks.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-zinc-700 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">{item.title}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-orange-400 border border-zinc-700">
                {item.delta}
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{item.desc}</p>

            {/* Medidores comparativos */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Atleta: <strong className="text-white">{item.studentVal}</strong></span>
                <span className="text-zinc-400">Pro NBA: <strong className="text-emerald-400">{item.nbaVal}</strong></span>
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
                <span>Índice de Acoplamiento Pro</span>
                <span className="font-mono font-bold text-zinc-300">{item.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFORME DESPLEGADO DE LA IA (LOBO TÁCTICO) */}
      {aiReport && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-[#121824] to-[#0c1017] border border-orange-500/30 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-sm font-black uppercase text-orange-400 tracking-wide">
                Diagnóstico del Lobo Táctico (FIBA / NBA Analysis)
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
}
