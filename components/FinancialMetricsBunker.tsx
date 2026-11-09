'use client';

import React from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  Crown, 
  Flame, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight,
  Zap,
  Users
} from 'lucide-react';
import { FinancialBunkerMetrics } from '@/lib/actions/finance-bunker-actions';

interface FinancialMetricsBunkerProps {
  metrics: FinancialBunkerMetrics | null;
  loading?: boolean;
}

export function FinancialMetricsBunker({ metrics, loading }: FinancialMetricsBunkerProps) {
  const totalRevenue = metrics?.totalRevenue ?? 0;
  const totalDebt = metrics?.totalDebt ?? 0;
  const activeMembershipsCount = metrics?.activeMembershipsCount ?? 0;
  const activePro99Count = metrics?.activePro99Count ?? 0;
  const activeElite149Count = metrics?.activeElite149Count ?? 0;
  const courtFeesCollected = metrics?.courtFeesCollected ?? 0;
  const courtFeesCount = metrics?.courtFeesCount ?? 0;

  return (
    <div className="space-y-4">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span>Métricas Financieras del Búnker</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ECC LIVE
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Consolidación en tiempo real: pagos en duela, cuotas de $50 y membresías de suscripción.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sincronizado con Deportivo Carmen Serdán</span>
        </div>
      </div>

      {/* 4 TARJETAS DE ALTO IMPACTO VISUAL (DARK THEME CON ACENTOS NEÓN VERDE/ÁMBAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TARJETA A: INGRESOS TOTALES */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0c131a] via-[#101924] to-[#080d14] border border-emerald-500/40 rounded-3xl p-5 shadow-xl shadow-emerald-950/20 group hover:border-emerald-400/80 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              a) Ingresos Totales
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
              ${loading ? '...' : totalRevenue.toLocaleString('es-MX')}
              <span className="text-xs text-emerald-400 font-bold">MXN</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> Transacciones + Cuotas
              </span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Movimientos:</span>
            <span className="text-white font-bold">{metrics?.transactionsCount ?? 0} registros</span>
          </div>
        </div>

        {/* TARJETA B: ADEUDOS PENDIENTES */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1015] via-[#22131b] to-[#120a0e] border-2 border-rose-500/50 rounded-3xl p-5 shadow-xl shadow-rose-950/30 group hover:border-rose-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              b) Adeudos Pendientes
            </span>
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-rose-400 font-mono tracking-tight flex items-baseline gap-1.5">
              ${loading ? '...' : totalDebt.toLocaleString('es-MX')}
              <span className="text-xs text-rose-300/80 font-bold">MXN</span>
            </div>
            <p className="text-[11px] text-rose-300/70 font-mono">
              Por cobrar a tutores y atletas en duela
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-950/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Alumnos con adeudo:</span>
            <span className="text-rose-400 font-black">{metrics?.debtorsCount ?? 0} atletas</span>
          </div>
        </div>

        {/* TARJETA C: MEMBRESÍAS ACTIVAS */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161224] via-[#1d1630] to-[#0f0b18] border border-amber-500/40 rounded-3xl p-5 shadow-xl shadow-purple-950/20 group hover:border-amber-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-amber-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              c) Membresías Activas
            </span>
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
              {loading ? '...' : activeMembershipsCount}
              <span className="text-xs text-amber-400 font-bold">suscripciones</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Folios Pro $99 y Familiar $149 vigentes
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-amber-300">Pro $99:</span>
              <span className="text-white font-bold">{activePro99Count}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-purple-300">Familiar $149:</span>
              <span className="text-white font-bold">{activeElite149Count}</span>
            </div>
          </div>
        </div>

        {/* TARJETA D: CUOTAS DE DUELA RECAUDADAS */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0c171e] via-[#10222a] to-[#071015] border border-cyan-500/40 rounded-3xl p-5 shadow-xl shadow-cyan-950/20 group hover:border-cyan-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              d) Cuotas de Duela ($50 MXN)
            </span>
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight flex items-baseline gap-1.5">
              ${loading ? '...' : courtFeesCollected.toLocaleString('es-MX')}
              <span className="text-xs text-cyan-400 font-bold">MXN</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Recaudación de $50 MXN por clase en cancha
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Clases liquidadas:</span>
            <span className="text-cyan-300 font-bold">{courtFeesCount} clases</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FinancialMetricsBunker;
