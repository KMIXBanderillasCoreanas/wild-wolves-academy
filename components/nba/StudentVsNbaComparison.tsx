// components/nba/StudentVsNbaComparison.tsx
// Visualización D: Student vs NBA Comparison (Inspirado en Taipy.io & Capa 4 de Normalización)
'use client';

import React, { useState } from 'react';
import { Target, Sliders, Shield, Award, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';
import { generateStudentVsNbaBenchmark, AgeCategory, PlayerPositionRole, CompetitionLevel } from '@/lib/nba-intelligence/normalizerEngine';

export function StudentVsNbaComparison() {
  // Estado de los filtros de normalización científica
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('U16');
  const [position, setPosition] = useState<PlayerPositionRole>('Shooting Guard');
  const [competitionLevel, setCompetitionLevel] = useState<CompetitionLevel>('Formativo Local (Carmen Serdán)');
  
  // Toggles de leyendas en el radar
  const [showStudent, setShowStudent] = useState<boolean>(true);
  const [showCurry, setShowCurry] = useState<boolean>(true);
  const [showLebron, setShowLebron] = useState<boolean>(true);
  const [showJordan, setShowJordan] = useState<boolean>(true);

  // Datos del alumno formativo (Wild Wolves Academy)
  const studentSample = {
    name: 'Mateo R. (Cantera Wild Wolves)',
    minutesPerGame: 22,
    pts: 14.5,
    fgPct: 48.0,
    fg3Pct: 37.5,
    ftPct: 82.0,
    ast: 4.2,
    reb: 5.1,
    stl: 2.1,
    blk: 0.6
  };

  const benchmark = generateStudentVsNbaBenchmark(studentSample, {
    ageCategory,
    position,
    competitionLevel,
    minutesPerGame: studentSample.minutesPerGame
  });

  const pillars = benchmark.radarPillars;
  const numPillars = pillars.length;

  // Función trigonométrica para calcular coordenadas polares del Radar (8 Pilares)
  // Centro: (150, 150), Radio Máximo: 110
  const getCoordinates = (value: number, index: number, maxRadius: number = 110) => {
    const angle = (Math.PI * 2 / numPillars) * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = 150 + r * Math.cos(angle);
    const y = 150 + r * Math.sin(angle);
    return { x, y };
  };

  // Construir polígonos SVG para cada trace
  const studentPoints = pillars.map((p, i) => {
    const { x, y } = getCoordinates(p.studentNormalized, i);
    return `${x},${y}`;
  }).join(' ');

  const curryPoints = pillars.map((p, i) => {
    const { x, y } = getCoordinates(p.curryNormalized, i);
    return `${x},${y}`;
  }).join(' ');

  const lebronPoints = pillars.map((p, i) => {
    const { x, y } = getCoordinates(p.lebronNormalized, i);
    return `${x},${y}`;
  }).join(' ');

  const jordanPoints = pillars.map((p, i) => {
    const { x, y } = getCoordinates(p.jordanNormalized, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl my-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
            <Target className="w-4 h-4 text-rose-500" />
            Módulo D · Student vs NBA Comparison (Taipy Multivariable Radar)
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Comparativa de Brecha: Alumno vs. Élite NBA
          </h2>
        </div>

        {/* Dynamic Compatibility Score */}
        <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Afinidad de Arquetipo</div>
            <div className="text-sm font-black text-white">{benchmark.primaryArchetypeMatch}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center font-black text-orange-400 text-lg">
            {benchmark.overallCompatibilityScore}%
          </div>
        </div>
      </div>

      {/* Normalization Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
        {/* Selector 1: Categoría de Edad */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
            Categoría Formativa (Edad)
          </label>
          <select
            value={ageCategory}
            onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
          >
            <option value="U10">U-10 (Mini Básquetbol · Balón #5)</option>
            <option value="U12">U-12 (Pasarela Menor)</option>
            <option value="U14">U-14 (Pasarela Mayor)</option>
            <option value="U16">U-16 (Cadetes / Juvenil A)</option>
            <option value="U18">U-18 (Juvenil Mayor / Preparatoria)</option>
            <option value="U21">U-21 (Colegial / Sub-21)</option>
          </select>
        </div>

        {/* Selector 2: Posición / Rol */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
            Posición / Rol en Duela
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as PlayerPositionRole)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
          >
            <option value="Point Guard">Base / Armador (Point Guard)</option>
            <option value="Shooting Guard">Escolta / Tirador (Shooting Guard)</option>
            <option value="Small Forward">Alero (Small Forward)</option>
            <option value="Power Forward">Ala-Pívot (Power Forward)</option>
            <option value="Center">Pívot (Center)</option>
          </select>
        </div>

        {/* Selector 3: Nivel de Competición */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
            Nivel de Competición
          </label>
          <select
            value={competitionLevel}
            onChange={(e) => setCompetitionLevel(e.target.value as CompetitionLevel)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
          >
            <option value="Formativo Local (Carmen Serdán)">Formativo Local (Carmen Serdán)</option>
            <option value="Estatal CDMX">Torneo Estatal CDMX</option>
            <option value="Nacional ADEMEBA/FMB">Nacional ADEMEBA / FMB</option>
            <option value="Colegial/NCAA">Nivel Colegial / Pre-NCAA</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Comparative Bars (Matches Image D Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-center">
        
        {/* Left 7 Cols: Taipy Dark Radar Spider Chart */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-md aspect-square relative flex items-center justify-center">
            
            <svg viewBox="0 0 300 300" className="w-full h-full select-none drop-shadow-2xl">
              {/* Concentric Web Rings (20%, 40%, 60%, 80%, 100%) */}
              {[20, 40, 60, 80, 100].map((level, idx) => {
                const ringPoints = pillars.map((_, i) => {
                  const { x, y } = getCoordinates(level, i);
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polygon
                    key={idx}
                    points={ringPoints}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth={level === 100 ? 1.5 : 1}
                    strokeDasharray={level === 100 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {pillars.map((_, i) => {
                const { x, y } = getCoordinates(100, i);
                return (
                  <line
                    key={i}
                    x1="150"
                    y1="150"
                    x2={x}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Jordan Historical Trace (Grey Line) */}
              {showJordan && (
                <polygon
                  points={jordanPoints}
                  fill="rgba(148, 163, 184, 0.12)"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              )}

              {/* LeBron James Trace (Red Line) */}
              {showLebron && (
                <polygon
                  points={lebronPoints}
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              )}

              {/* Stephen Curry Trace (Cyan Line) */}
              {showCurry && (
                <polygon
                  points={curryPoints}
                  fill="rgba(6, 182, 212, 0.15)"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              )}

              {/* Student Wild Wolves Trace (Vibrant Orange / Amber with dots) */}
              {showStudent && (
                <>
                  <polygon
                    points={studentPoints}
                    fill="rgba(249, 115, 22, 0.35)"
                    stroke="#f97316"
                    strokeWidth="3"
                    className="transition-all duration-500"
                  />
                  {pillars.map((p, i) => {
                    const { x, y } = getCoordinates(p.studentNormalized, i);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#f97316"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </>
              )}

              {/* Pillar Text Labels */}
              {pillars.map((p, i) => {
                const { x, y } = getCoordinates(120, i);
                return (
                  <text
                    key={i}
                    x={x}
                    y={y + 4}
                    fill="#cbd5e1"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.key}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Interactive Legend Toggles matching Image D */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setShowStudent(!showStudent)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                showStudent ? 'bg-orange-600/20 text-orange-400 border-orange-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>{studentSample.name.split('(')[0]} (Wild Wolves)</span>
            </button>

            <button
              onClick={() => setShowCurry(!showCurry)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                showCurry ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Stephen Curry</span>
            </button>

            <button
              onClick={() => setShowLebron(!showLebron)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                showLebron ? 'bg-rose-600/20 text-rose-400 border-rose-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>LeBron James</span>
            </button>

            <button
              onClick={() => setShowJordan(!showJordan)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition border ${
                showJordan ? 'bg-slate-800 text-slate-300 border-slate-600' : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Michael Jordan</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Technical Gap Report & Bar Progressions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 block mb-3">
              MÉTRICAS NORMALIZADAS (PER 36M / EDAD)
            </span>

            <div className="flex flex-col gap-3.5">
              {pillars.slice(0, 5).map((pillar, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{pillar.labelEs}</span>
                    <span className="text-orange-400 font-mono">{pillar.studentNormalized} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${pillar.studentNormalized}%` }}
                      className="bg-orange-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Gap Insights */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Fortalezas Destacadas
            </div>
            <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
              {benchmark.technicalGapReport.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400 pt-2">
              <AlertCircle className="w-4 h-4" />
              Plan de Perfeccionamiento en Duela
            </div>
            <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
              {benchmark.technicalGapReport.priorityImprovements.map((imp, i) => (
                <li key={i}>{imp}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
