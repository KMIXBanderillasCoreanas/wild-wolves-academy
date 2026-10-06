'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  Legend 
} from 'recharts';
import { BasketballMetrics } from '@/lib/types';
import { 
  Target, 
  Dribbble, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Award, 
  Layers, 
  Info 
} from 'lucide-react';

interface RadarChart360Props {
  metrics: BasketballMetrics;
  benchmarkMetrics?: BasketballMetrics;
  athleteName: string;
}

export function RadarChart360({ metrics, benchmarkMetrics, athleteName }: RadarChart360Props) {
  const [showBenchmark, setShowBenchmark] = useState(true);

  const defaultBenchmark: BasketballMetrics = benchmarkMetrics || {
    shooting: 75,
    ballHandling: 75,
    verticalJump: 70,
    agilitySpeed: 75,
    defensiveIQ: 70,
    staminaFitness: 75,
  };

  const radarData = [
    {
      subject: 'Tiro (% Shooting)',
      athlete: metrics.shooting,
      benchmark: defaultBenchmark.shooting,
      fullMark: 100,
      icon: Target,
      desc: 'Eficacia perimetral 3PT, tiro de media y libres.',
    },
    {
      subject: 'Manejo de Balón',
      athlete: metrics.ballHandling,
      benchmark: defaultBenchmark.ballHandling,
      fullMark: 100,
      icon: Dribbble,
      desc: 'Control bimanual, drible con cambio de ritmo y retención.',
    },
    {
      subject: 'Salto Vertical',
      athlete: metrics.verticalJump,
      benchmark: defaultBenchmark.verticalJump,
      fullMark: 100,
      icon: Zap,
      desc: 'Potencia de despegue y explosividad en combine.',
    },
    {
      subject: 'Agilidad & Sprint',
      athlete: metrics.agilitySpeed,
      benchmark: defaultBenchmark.agilitySpeed,
      fullMark: 100,
      icon: Activity,
      desc: 'Tiempo en Lane Agility Drill y transición defensiva.',
    },
    {
      subject: 'Defensa & IQ',
      athlete: metrics.defensiveIQ,
      benchmark: defaultBenchmark.defensiveIQ,
      fullMark: 100,
      icon: ShieldCheck,
      desc: 'Desplazamiento lateral, lecturas y anticipación táctica.',
    },
    {
      subject: 'Stamina / Resistencia',
      athlete: metrics.staminaFitness,
      benchmark: defaultBenchmark.staminaFitness,
      fullMark: 100,
      icon: Award,
      desc: 'Capacidad aeróbica (Beep Test) e intensidad de 4to cuarto.',
    },
  ];

  const overallRating = Math.round(
    Object.values(metrics).reduce((a, b) => a + b, 0) / 6
  );
  const benchmarkRating = Math.round(
    Object.values(defaultBenchmark).reduce((a, b) => a + b, 0) / 6
  );
  const diff = overallRating - benchmarkRating;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Radar 360° Combine
            </span>
            <span className="text-xs text-slate-400">Escala Normalizada NCAA / FIBA</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Evaluación Biomecánica Integral
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Perfil de <strong className="text-white">{athleteName}</strong> frente al estándar de la academia
          </p>
        </div>

        {/* Global OAR Rating badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800/90 rounded-2xl border border-slate-700 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OAR General</div>
            <div className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
              {overallRating}
              <span className="text-xs font-bold text-emerald-400">
                {diff >= 0 ? `+${diff}` : diff}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              showBenchmark
                ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-orange-400" />
            <span>{showBenchmark ? 'Ocultar Benchmark' : 'Ver Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Recharts Radar + Quick Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart */}
        <div className="lg:col-span-7 h-[360px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name={athleteName}
                dataKey="athlete"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.45}
                strokeWidth={2.5}
              />
              {showBenchmark && (
                <Radar
                  name="Benchmark Academia (Top 10%)"
                  dataKey="benchmark"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                        <p className="font-bold text-white text-xs mb-1">{data.subject}</p>
                        <p className="text-xs text-orange-400 font-semibold">
                          {athleteName}: <span className="text-white">{data.athlete}/100</span>
                        </p>
                        {showBenchmark && (
                          <p className="text-xs text-sky-400 font-semibold">
                            Benchmark: <span className="text-white">{data.benchmark}/100</span>
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">{data.desc}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '8px' }}
                formatter={(val) => <span className="text-xs font-semibold text-slate-300">{val}</span>}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 6 Metric Breakdown Badges */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {radarData.map((item) => {
            const Icon = item.icon;
            const delta = item.athlete - item.benchmark;
            return (
              <div 
                key={item.subject}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    delta >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {delta >= 0 ? `+${delta}` : delta}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">{item.subject.split('(')[0]}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-white">{item.athlete}</span>
                  <span className="text-[10px] text-slate-400">meta: {item.benchmark}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-700/60 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(item.athlete, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-orange-400" />
          <span>Datos analizados bajo metodología HoopPerformance OS v0.3.0</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">Wild Wolves Combine Analytics</span>
      </div>
    </div>
  );
}
