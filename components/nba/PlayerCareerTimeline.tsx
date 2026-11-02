// components/nba/PlayerCareerTimeline.tsx
// Visualización B: Player Career Timeline (Inspirado en Mahdi Safiri & DunkAPI)
'use client';

import React, { useState } from 'react';
import { Calendar, TrendingUp, ShieldAlert, BarChart3, User, Award, Flame } from 'lucide-react';

export function PlayerCareerTimeline() {
  const [activeLegend, setActiveLegend] = useState<'lebron' | 'curry' | 'jordan'>('lebron');
  const [offenseTab, setOffenseTab] = useState<'3pt' | 'fg' | 'ft' | 'ppg'>('3pt');
  const [defenseTab, setDefenseTab] = useState<'reb' | 'stl' | 'blk'>('stl');

  const timelines = {
    lebron: {
      name: 'LeBron James',
      height: `6'9" (2.06 m)`,
      weight: '250 lbs (113 kg)',
      gamesPlayed: 1703,
      totalPoints: '46.67K',
      totalAssists: '12.44K',
      totalRebounds: '11.12K',
      mvpCount: 4,
      allStarCount: 20,
      teamsScore: [
        { team: 'Cleveland Cavaliers', ppg: 27.66, years: '2003-10, 2014-18', color: 'from-amber-600 to-red-800' },
        { team: 'Los Angeles Lakers', ppg: 27.18, years: '2018-Presente', color: 'from-purple-600 to-yellow-500' },
        { team: 'Miami Heat', ppg: 26.92, years: '2010-14', color: 'from-red-600 to-black' }
      ],
      shotsShareByTeam: [
        { team: 'MIA', twoPct: 76, threePct: 24, fgPct: 54 },
        { team: 'LAL', twoPct: 71, threePct: 29, fgPct: 52 },
        { team: 'CLE', twoPct: 73, threePct: 27, fgPct: 50 }
      ],
      seasons: [
        { year: 2004, threePct: 29.0, fgPct: 41.7, ftPct: 75.4, ppg: 20.9, stl: 1.6, blk: 0.7, reb: 5.5 },
        { year: 2006, threePct: 33.5, fgPct: 48.0, ftPct: 73.8, ppg: 31.4, stl: 1.6, blk: 0.8, reb: 7.0 },
        { year: 2008, threePct: 31.5, fgPct: 48.4, ftPct: 71.2, ppg: 30.0, stl: 1.8, blk: 1.1, reb: 7.9 },
        { year: 2010, threePct: 33.3, fgPct: 50.3, ftPct: 76.7, ppg: 29.7, stl: 1.6, blk: 1.0, reb: 7.3 },
        { year: 2012, threePct: 36.2, fgPct: 53.1, ftPct: 77.1, ppg: 27.1, stl: 1.9, blk: 0.8, reb: 7.9 },
        { year: 2013, threePct: 40.6, fgPct: 56.5, ftPct: 75.3, ppg: 26.8, stl: 1.7, blk: 0.9, reb: 8.0 },
        { year: 2016, threePct: 30.9, fgPct: 52.0, ftPct: 73.1, ppg: 25.3, stl: 1.4, blk: 0.6, reb: 7.4 },
        { year: 2018, threePct: 36.7, fgPct: 54.2, ftPct: 73.1, ppg: 27.5, stl: 1.4, blk: 0.9, reb: 8.6 },
        { year: 2020, threePct: 34.8, fgPct: 49.3, ftPct: 69.3, ppg: 25.3, stl: 1.2, blk: 0.5, reb: 7.8 },
        { year: 2022, threePct: 35.9, fgPct: 52.4, ftPct: 75.6, ppg: 30.3, stl: 1.3, blk: 1.1, reb: 8.2 },
        { year: 2024, threePct: 41.0, fgPct: 54.0, ftPct: 75.0, ppg: 25.7, stl: 1.2, blk: 0.5, reb: 7.3 }
      ]
    },
    curry: {
      name: 'Stephen Curry',
      height: `6'2" (1.88 m)`,
      weight: '185 lbs (84 kg)',
      gamesPlayed: 1040,
      totalPoints: '24.8K',
      totalAssists: '6.2K',
      totalRebounds: '4.8K',
      mvpCount: 2,
      allStarCount: 10,
      teamsScore: [
        { team: 'Golden State Warriors', ppg: 24.80, years: '2009-Presente (Dynasty)', color: 'from-blue-600 to-amber-500' }
      ],
      shotsShareByTeam: [
        { team: 'GSW', twoPct: 48, threePct: 52, fgPct: 47 }
      ],
      seasons: [
        { year: 2010, threePct: 43.7, fgPct: 46.2, ftPct: 88.5, ppg: 17.5, stl: 1.9, blk: 0.2, reb: 4.5 },
        { year: 2013, threePct: 45.3, fgPct: 45.1, ftPct: 90.0, ppg: 22.9, stl: 1.6, blk: 0.2, reb: 4.0 },
        { year: 2015, threePct: 44.3, fgPct: 48.7, ftPct: 91.4, ppg: 23.8, stl: 2.0, blk: 0.2, reb: 4.3 },
        { year: 2016, threePct: 45.4, fgPct: 50.4, ftPct: 90.8, ppg: 30.1, stl: 2.1, blk: 0.2, reb: 5.4 },
        { year: 2018, threePct: 42.3, fgPct: 49.5, ftPct: 92.1, ppg: 26.4, stl: 1.6, blk: 0.2, reb: 5.1 },
        { year: 2021, threePct: 42.1, fgPct: 48.2, ftPct: 91.6, ppg: 32.0, stl: 1.2, blk: 0.1, reb: 5.5 },
        { year: 2024, threePct: 40.8, fgPct: 45.0, ftPct: 92.4, ppg: 26.4, stl: 0.7, blk: 0.4, reb: 4.5 }
      ]
    },
    jordan: {
      name: 'Michael Jordan',
      height: `6'6" (1.98 m)`,
      weight: '216 lbs (98 kg)',
      gamesPlayed: 1072,
      totalPoints: '32.29K',
      totalAssists: '5.63K',
      totalRebounds: '6.67K',
      mvpCount: 5,
      allStarCount: 14,
      teamsScore: [
        { team: 'Chicago Bulls (1st 3-Peat)', ppg: 31.50, years: '1984-93', color: 'from-red-600 to-black' },
        { team: 'Chicago Bulls (2nd 3-Peat)', ppg: 29.60, years: '1995-98', color: 'from-red-700 to-slate-900' },
        { team: 'Washington Wizards', ppg: 21.20, years: '2001-03', color: 'from-blue-800 to-slate-700' }
      ],
      shotsShareByTeam: [
        { team: 'CHI (1)', twoPct: 92, threePct: 8, fgPct: 51 },
        { team: 'CHI (2)', twoPct: 86, threePct: 14, fgPct: 48 },
        { team: 'WAS', twoPct: 95, threePct: 5, fgPct: 43 }
      ],
      seasons: [
        { year: 1985, threePct: 17.3, fgPct: 51.5, ftPct: 84.5, ppg: 28.2, stl: 2.4, blk: 0.8, reb: 6.5 },
        { year: 1987, threePct: 18.2, fgPct: 48.2, ftPct: 85.7, ppg: 37.1, stl: 2.9, blk: 1.5, reb: 5.2 },
        { year: 1988, threePct: 13.2, fgPct: 53.5, ftPct: 84.1, ppg: 35.0, stl: 3.2, blk: 1.6, reb: 5.5 },
        { year: 1989, threePct: 27.6, fgPct: 53.8, ftPct: 85.0, ppg: 32.5, stl: 2.9, blk: 0.8, reb: 8.0 },
        { year: 1991, threePct: 31.2, fgPct: 53.9, ftPct: 85.1, ppg: 31.5, stl: 2.7, blk: 1.0, reb: 6.0 },
        { year: 1993, threePct: 35.2, fgPct: 49.5, ftPct: 83.7, ppg: 32.6, stl: 2.8, blk: 0.8, reb: 6.7 },
        { year: 1996, threePct: 42.7, fgPct: 49.5, ftPct: 83.4, ppg: 30.4, stl: 2.2, blk: 0.5, reb: 6.6 },
        { year: 1998, threePct: 23.8, fgPct: 46.5, ftPct: 78.4, ppg: 28.7, stl: 1.7, blk: 0.5, reb: 5.8 }
      ]
    }
  };

  const current = timelines[activeLegend];

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl my-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Calendar className="w-4 h-4 text-amber-500" />
            Módulo B · Player Career Timeline (Historial Multidecadas)
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Línea de Tiempo y Evolución Histórica
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {(['lebron', 'curry', 'jordan'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveLegend(key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeLegend === key
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {key === 'lebron' ? 'LeBron James' : key === 'curry' ? 'Stephen Curry' : 'Michael Jordan'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Matches Image B Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Sub-Column: Score Per Game by Team (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Puntos Por Partido / Franquicia</span>
          {current.teamsScore.map((t, idx) => (
            <div key={idx} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">{t.years}</div>
              <div className="text-sm font-bold text-white mt-0.5">{t.team}</div>
              <div className="text-2xl font-black text-amber-400 mt-2 flex items-baseline gap-1">
                {t.ppg} <span className="text-xs text-slate-400 font-normal">PPG</span>
              </div>
            </div>
          ))}

          {/* Bio Box */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-black text-lg border border-orange-500/30">
                {current.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-sm font-black text-white">{current.name}</div>
                <div className="text-xs text-slate-400">{current.height} · {current.weight}</div>
              </div>
            </div>
            <div className="text-xs text-slate-300 mt-3 leading-relaxed">
              Ha disputado <strong className="text-white">{current.gamesPlayed}</strong> partidos en la NBA con{' '}
              <strong className="text-amber-400">{current.totalPoints}</strong> puntos,{' '}
              <strong className="text-white">{current.totalAssists}</strong> asistencias,{' '}
              <strong className="text-white">{current.totalRebounds}</strong> rebotes,{' '}
              <strong className="text-amber-400">{current.mvpCount}</strong> MVPs y{' '}
              <strong className="text-white">{current.allStarCount}</strong> selecciones All-Star.
            </div>
          </div>
        </div>

        {/* Center Sub-Column: Yearly Offense Bar Chart & Defense Trend (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Offense Panel */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase text-white">OFENSIVA POR TEMPORADA</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['3pt', 'fg', 'ft', 'ppg'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setOffenseTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      offenseTab === tab ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === '3pt' ? '3P %' : tab === 'fg' ? 'FG %' : tab === 'ft' ? 'FT %' : 'PPG'}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Yearly Bars */}
            <div className="h-44 flex items-end justify-between gap-1.5 pt-6 border-b border-slate-800 pb-2">
              {current.seasons.map((s, idx) => {
                const val = offenseTab === '3pt' ? s.threePct : offenseTab === 'fg' ? s.fgPct : offenseTab === 'ft' ? s.ftPct : s.ppg;
                const max = offenseTab === 'ppg' ? 40 : 100;
                const heightPct = Math.min(100, Math.round((val / max) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <span className="text-[9px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition absolute -top-5">
                      {val}{offenseTab === 'ppg' ? '' : '%'}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-amber-500 hover:bg-amber-400 rounded-t-sm transition-all duration-300"
                    />
                    <span className="text-[8px] font-mono text-slate-500 mt-1 transform -rotate-45 origin-left">
                      {String(s.year).slice(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Defense Panel */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase text-white">DEFENSA E IMPACTO</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['stl', 'blk', 'reb'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDefenseTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      defenseTab === tab ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'stl' ? 'Robos' : tab === 'blk' ? 'Tapones' : 'Rebotes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Trend chart representation */}
            <div className="h-32 flex items-end justify-between gap-1 pt-4 border-b border-slate-800 pb-2">
              {current.seasons.map((s, idx) => {
                const val = defenseTab === 'stl' ? s.stl : defenseTab === 'blk' ? s.blk : s.reb;
                const max = defenseTab === 'reb' ? 10 : 3.5;
                const h = Math.min(100, Math.round((val / max) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <span className="text-[9px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition absolute -top-5">
                      {val}
                    </span>
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full bg-cyan-600/80 hover:bg-cyan-400 rounded-t-sm transition-all duration-300"
                    />
                    <span className="text-[8px] font-mono text-slate-500 mt-1">
                      {String(s.year).slice(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sub-Column: % Shots Distribution by Team (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 h-full">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 block mb-4">
              % DISTRIBUCIÓN DE TIROS
            </span>

            <div className="flex flex-col gap-5">
              {current.shotsShareByTeam.map((team, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>{team.team}</span>
                    <span className="text-amber-400 font-mono">{team.fgPct}% FG General</span>
                  </div>
                  {/* Stacked bar: 2pt vs 3pt */}
                  <div className="h-5 w-full bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800">
                    <div
                      style={{ width: `${team.twoPct}%` }}
                      className="bg-orange-600 hover:bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                      title={`Tiros de 2 Puntos: ${team.twoPct}%`}
                    >
                      {team.twoPct}% (2P)
                    </div>
                    <div
                      style={{ width: `${team.threePct}%` }}
                      className="bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                      title={`Tiros de 3 Puntos: ${team.threePct}%`}
                    >
                      {team.threePct}% (3P)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-white block mb-1">Análisis Cinemático:</strong>
              Muestra la transición táctica a lo largo de las décadas: mayor penetración en etapas tempranas frente a aumento drástico en volumen de triples hacia el final de la carrera.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
