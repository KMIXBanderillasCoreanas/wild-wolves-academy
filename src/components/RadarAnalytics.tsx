'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';
import { BasketballMetrics } from '@/types/basketball';
import { 
  Target, 
  Zap, 
  Dribbble, 
  ShieldCheck, 
  Activity, 
  Award,
  Layers,
  Info
} from 'lucide-react';

interface RadarAnalyticsProps {
  currentMetrics: BasketballMetrics;
  benchmarkMetrics: BasketballMetrics;
  athleteName: string;
}

export function RadarAnalytics({ currentMetrics, benchmarkMetrics, athleteName }: RadarAnalyticsProps) {
  const [showBenchmark, setShowBenchmark] = useState(true);

  const radarData = [
    {
      subject: 'Tiro (% Shooting)',
      athlete: currentMetrics.shooting,
      benchmark: benchmarkMetrics.shooting,
      fullMark: 100,
      icon: Target,
      description: 'Efectividad en tiro exterior (3PT), media distancia y tiros libres.',
    },
    {
      subject: 'Manejo de Balón',
      athlete: currentMetrics.ballHandling,
      benchmark: benchmarkMetrics.ballHandling,
      fullMark: 100,
      icon: Dribbble,
      description: 'Velocidad de drible, control con ambas manos y toma de decisiones.',
    },
    {
      subject: 'Salto Vertical',
      athlete: currentMetrics.verticalJump,
      benchmark: benchmarkMetrics.verticalJump,
      fullMark: 100,
      icon: Zap,
      description: 'Potencia de despegue vertical a 1 y 2 pies (explosividad).',
    },
    {
      subject: 'Agilidad & Velocidad',
      athlete: currentMetrics.agilitySpeed,
      benchmark: benchmarkMetrics.agilitySpeed,
      fullMark: 100,
      icon: Activity,
      description: 'Test de agilidad de carril (Lane Agility) y velocidad en transición.',
    },
    {
      subject: 'Defensa & IQ',
      athlete: currentMetrics.defensiveIQ,
      benchmark: benchmarkMetrics.defensiveIQ,
      fullMark: 100,
      icon: ShieldCheck,
      description: 'Desplazamiento lateral, lecturas tácticas e instinto defensivo.',
    },
    {
      subject: 'Resistencia / Stamina',
      athlete: currentMetrics.staminaFitness,
      benchmark: benchmarkMetrics.staminaFitness,
      fullMark: 100,
      icon: Award,
      description: 'Capacidad aeróbica (Beep Test) y mantenimiento de intensidad.',
    },
  ];

  // Calculate Overall Athletic Rating (OAR)
  const athleteAverage = Math.round(
    Object.values(currentMetrics).reduce((a, b) => a + b, 0) / 6
  );
  const benchmarkAverage = Math.round(
    Object.values(benchmarkMetrics).reduce((a, b) => a + b, 0) / 6
  );
  const deltaAverage = athleteAverage - benchmarkAverage;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Biométrica & Rendimiento
            </span>
            <span className="text-slate-400 text-xs">Test Oficial HoopPerformance v0.3</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Radar de Habilidades Atléticas
          </h2>
          <p className="text-sm text-slate-400">
            Comparativa multifactorial de <span className="text-white font-semibold">{athleteName}</span> vs. Benchmark Wild Wolves
          </p>
        </div>

        {/* Global Rating Badge & Toggle */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">OAR Global</div>
            <div className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
              {athleteAverage}
              <span className="text-xs font-semibold text-emerald-400">
                {deltaAverage >= 0 ? `+${deltaAverage}` : deltaAverage}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all flex items-center gap-2 ${
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

      {/* Main Radar Visualizer & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart (Recharts) */}
        <div className="lg:col-span-7 h-[380px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }} 
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
                        <p className="font-bold text-white text-sm mb-1">{data.subject}</p>
                        <p className="text-xs text-orange-400 font-semibold">
                          {athleteName}: <span className="text-white">{data.athlete} / 100</span>
                        </p>
                        {showBenchmark && (
                          <p className="text-xs text-sky-400 font-semibold">
                            Benchmark Academia: <span className="text-white">{data.benchmark} / 100</span>
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">{data.description}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-xs font-semibold text-slate-300">{value}</span>}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {radarData.map((item) => {
            const Icon = item.icon;
            const diff = item.athlete - item.benchmark;
            return (
              <div 
                key={item.subject}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    diff >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {diff >= 0 ? `+${diff}` : diff} pts
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-300 truncate">{item.subject.split('(')[0]}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black text-white">{item.athlete}</span>
                  <span className="text-[11px] text-slate-400">meta: {item.benchmark}</span>
                </div>
                {/* Visual Progress bar */}
                <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
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

      {/* Explanatory Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span>Las puntuaciones del radar se normalizan en escala de 0 a 100 con base en percentiles de la NCAA D1 / FIBA Americas.</span>
        </div>
        <div className="hidden sm:block text-slate-500 text-[11px]">Wild Wolves Analytics Engine</div>
      </div>
    </div>
  );
}
