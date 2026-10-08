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
  Zap, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Info,
  Flame,
  TrendingUp
} from 'lucide-react';

interface RadarChart360Props {
  metricsCurrent?: BasketballMetrics;
  metricsPrevious?: BasketballMetrics;
  athleteName?: string;
}

export function RadarChart360({ metricsCurrent, metricsPrevious, athleteName = 'Atleta' }: RadarChart360Props) {
  const [showPreviousMonth, setShowPreviousMonth] = useState(true);

  const cur = metricsCurrent || {
    freeThrow: 70,
    midRange: 68,
    threePoint: 65,
    verticalJump: 72,
    sprint100m: 75,
    agilityTTest: 74,
  };

  const prev = metricsPrevious || {
    freeThrow: 60,
    midRange: 60,
    threePoint: 55,
    verticalJump: 65,
    sprint100m: 70,
    agilityTTest: 68,
  };

  const radarData = [
    {
      subject: 'Tiros Libres (20T)',
      actual: cur.freeThrow,
      anterior: prev.freeThrow,
      fullMark: 100,
      icon: Target,
      desc: '% Efectividad en tiros libres sobre base de 20 lanzamientos reglamentarios.',
    },
    {
      subject: 'Media Distancia',
      actual: cur.midRange,
      anterior: prev.midRange,
      fullMark: 100,
      icon: Target,
      desc: '% Efectividad en tiro tras bote y suspensión en media distancia.',
    },
    {
      subject: 'Tiro de 3 / Larga',
      actual: cur.threePoint,
      anterior: prev.threePoint,
      fullMark: 100,
      icon: Target,
      desc: '% Efectividad en lanzamientos de 3 puntos (spot-up y transición).',
    },
    {
      subject: 'Salto Vertical (cm)',
      actual: cur.verticalJump,
      anterior: prev.verticalJump,
      fullMark: 100,
      icon: Zap,
      desc: 'Salto vertical máximo medido y normalizado a escala combine.',
    },
    {
      subject: 'Velocidad 100m',
      actual: cur.sprint100m,
      anterior: prev.sprint100m,
      fullMark: 100,
      icon: Activity,
      desc: 'Sprint en 100m planos convertido a escala de rendimiento explosivo.',
    },
    {
      subject: 'Agilidad T-Test',
      actual: cur.agilityTTest,
      anterior: prev.agilityTTest,
      fullMark: 100,
      icon: ShieldCheck,
      desc: 'Agilidad y desplazamientos laterales en circuito T-Test defensivo.',
    },
  ];

  const currentAverage = Math.round(
    Object.values(cur).reduce((a, b) => a + b, 0) / 6
  );
  const previousAverage = Math.round(
    Object.values(prev).reduce((a, b) => a + b, 0) / 6
  );
  const delta = currentAverage - previousAverage;

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-none relative overflow-hidden">
      {/* Cabecera Técnica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
              RADAR 360° COMBINE
            </span>
            <span className="text-zinc-400 text-xs font-mono">Comparativa Mensual</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Rendimiento Biomecánico: Mes Actual vs. Mes Anterior
          </h3>
          <p className="text-xs text-zinc-400">
            Evolución de los 6 ejes deportivos de <span className="text-white font-medium">{athleteName}</span>
          </p>
        </div>

        {/* Insignias de promedio numérico en tipografía monoespaciada */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 bg-[#0a0e17] rounded-xl border border-[#27272a] text-center">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Promedio Actual</div>
            <div className="text-xl font-mono font-black text-orange-500 flex items-center justify-center gap-1">
              {currentAverage}
              <span className={`text-[11px] font-mono font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {delta >= 0 ? `+${delta}` : delta}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowPreviousMonth(!showPreviousMonth)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              showPreviousMonth
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-[#0a0e17] border-[#27272a] text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{showPreviousMonth ? 'Ocultar Mes Anterior' : 'Ver Mes Anterior'}</span>
          </button>
        </div>
      </div>

      {/* Gráfico y Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Recharts Spider Chart */}
        <div className="lg:col-span-7 h-[340px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#d4d4d8', fontSize: 11, fontFamily: 'monospace' }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
              />
              <Radar
                name="Mes Actual"
                dataKey="actual"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              {showPreviousMonth && (
                <Radar
                  name="Mes Anterior"
                  dataKey="anterior"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              )}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0a0e17] border border-[#27272a] p-3 rounded-xl font-mono text-xs shadow-xl">
                        <p className="font-bold text-white mb-1">{data.subject}</p>
                        <p className="text-orange-400 font-bold">
                          Mes Actual: <span className="text-white">{data.actual}/100</span>
                        </p>
                        {showPreviousMonth && (
                          <p className="text-sky-400">
                            Mes Anterior: <span className="text-white">{data.anterior}/100</span>
                          </p>
                        )}
                        <p className="text-[10px] text-zinc-400 mt-1 max-w-[220px] font-sans">{data.desc}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '8px', fontFamily: 'monospace', fontSize: '11px' }}
                formatter={(val) => <span className="text-zinc-300">{val}</span>}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Desglose de los 6 Ejes con Tipografía Monoespaciada y Badges Limpios */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
          {radarData.map((item) => {
            const diffAxis = item.actual - item.anterior;
            return (
              <div 
                key={item.subject}
                className="bg-[#0a0e17] border border-[#27272a] rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[100px]">{item.subject}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    diffAxis >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {diffAxis >= 0 ? `+${diffAxis}` : diffAxis}
                  </span>
                </div>
                
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-mono font-black text-white">{item.actual}</span>
                  <span className="text-[10px] font-mono text-zinc-500">ant: {item.anterior}</span>
                </div>

                <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(item.actual, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#27272a] text-[10px] font-mono text-zinc-500 flex items-center justify-between">
        <span>Evaluaciones estandarizadas bajo métricas de combine HoopPerformance</span>
        <span>Wild Wolves Analytics Engine</span>
      </div>
    </div>
  );
}
