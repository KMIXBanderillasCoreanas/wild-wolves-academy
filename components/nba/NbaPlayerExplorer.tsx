// components/nba/NbaPlayerExplorer.tsx
// Visualización A: NBA Player Explorer (Inspirado en Behance & DunkAPI)
'use client';

import React, { useState } from 'react';
import { Trophy, Shield, Flame, Activity, Zap, Award, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { ComprehensivePlayerIntelProfile } from '@/lib/nba-intelligence/types';

interface NbaPlayerExplorerProps {
  initialPlayer?: 'curry' | 'lebron' | 'jordan';
}

export function NbaPlayerExplorer({ initialPlayer = 'curry' }: NbaPlayerExplorerProps) {
  const [selectedKey, setSelectedKey] = useState<'curry' | 'lebron' | 'jordan'>(initialPlayer);

  // Perfiles pre-cargados optimizados para no gastar créditos repetidamente
  const playersData: Record<'curry' | 'lebron' | 'jordan', {
    name: string;
    team: string;
    position: string;
    badge: string;
    per36Efficiency: number;
    netRating: string;
    defensiveWinShares: number;
    usageRate: number;
    trueShootingPct: number;
    wins: number;
    losses: number;
    winPct: number;
    careerTripleDoubles: number;
    clutchPointsPerGame: number;
    allDefensiveTeam: string;
    avatarColor: string;
    accentColor: string;
    recentGames: Array<{ date: string; match: string; result: string; pts: number; reb: number; ast: number; fgPct: string }>;
  }> = {
    curry: {
      name: 'Stephen Curry',
      team: 'Golden State Warriors',
      position: 'Base (Point Guard) · #30',
      badge: 'Sniper Supremo · 3PT King',
      per36Efficiency: 91,
      netRating: '+11.4',
      defensiveWinShares: 3.2,
      usageRate: 30.1,
      trueShootingPct: 62.6,
      wins: 73,
      losses: 9,
      winPct: 89.0,
      careerTripleDoubles: 11,
      clutchPointsPerGame: 8.8,
      allDefensiveTeam: '1x All-NBA 1st',
      avatarColor: 'from-blue-600 to-amber-500',
      accentColor: 'text-amber-400',
      recentGames: [
        { date: '01 Nov', match: 'GSW vs SAC', result: 'W 114-108', pts: 32, reb: 5, ast: 7, fgPct: '54.5%' },
        { date: '29 Oct', match: 'GSW @ PHX', result: 'W 122-118', pts: 29, reb: 4, ast: 9, fgPct: '50.0%' },
        { date: '26 Oct', match: 'GSW vs DEN', result: 'L 105-110', pts: 26, reb: 6, ast: 4, fgPct: '42.8%' }
      ]
    },
    lebron: {
      name: 'LeBron James',
      team: 'Los Angeles Lakers',
      position: 'Alero Total (Forward) · #23',
      badge: 'Atleta Total · MVP Dominance',
      per36Efficiency: 89,
      netRating: '+9.8',
      defensiveWinShares: 5.4,
      usageRate: 31.4,
      trueShootingPct: 63.0,
      wins: 84,
      losses: 18,
      winPct: 82.3,
      careerTripleDoubles: 112,
      clutchPointsPerGame: 10.2,
      allDefensiveTeam: '6x All-Defensive',
      avatarColor: 'from-purple-700 to-yellow-500',
      accentColor: 'text-yellow-400',
      recentGames: [
        { date: '01 Nov', match: 'LAL vs LAC', result: 'W 118-112', pts: 28, reb: 8, ast: 11, fgPct: '56.0%' },
        { date: '28 Oct', match: 'LAL @ DAL', result: 'W 125-120', pts: 34, reb: 9, ast: 8, fgPct: '61.2%' },
        { date: '25 Oct', match: 'LAL vs PHX', result: 'W 108-102', pts: 24, reb: 7, ast: 7, fgPct: '52.0%' }
      ]
    },
    jordan: {
      name: 'Michael Jordan',
      team: 'Chicago Bulls (1996 Era)',
      position: 'Escolta / Maestro (Guard) · #23',
      badge: 'Competidor Supremo · GOAT',
      per36Efficiency: 96,
      netRating: '+13.4',
      defensiveWinShares: 8.2,
      usageRate: 33.3,
      trueShootingPct: 58.2,
      wins: 72,
      losses: 10,
      winPct: 87.8,
      careerTripleDoubles: 28,
      clutchPointsPerGame: 11.5,
      allDefensiveTeam: '9x 1st Team · DPOY',
      avatarColor: 'from-red-700 to-black',
      accentColor: 'text-red-400',
      recentGames: [
        { date: 'Finals G6', match: 'CHI @ UTA', result: 'W 87-86', pts: 45, reb: 4, ast: 2, fgPct: '52.0%' },
        { date: 'Finals G5', match: 'CHI vs UTA', result: 'L 81-83', pts: 28, reb: 5, ast: 4, fgPct: '44.0%' },
        { date: 'Finals G4', match: 'CHI vs UTA', result: 'W 86-82', pts: 34, reb: 8, ast: 2, fgPct: '48.0%' }
      ]
    }
  };

  const current = playersData[selectedKey];

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden relative">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Player Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Módulo A · NBA Player Explorer (Live Pro Model)
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Explorador de Atleta NBA & Leyendas
          </h2>
        </div>

        {/* Legend selector buttons */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {(['curry', 'lebron', 'jordan'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedKey === key
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {key === 'curry' ? 'Stephen Curry' : key === 'lebron' ? 'LeBron James' : 'Michael Jordan'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Body Grid (Matches Image A Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-center">
        {/* Left Column: Player Silhouette / Card (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
          <div className={`w-64 h-80 rounded-3xl bg-gradient-to-br ${current.avatarColor} p-1 shadow-2xl relative flex flex-col justify-end overflow-hidden group`}>
            {/* Jersey watermark */}
            <div className="absolute top-4 right-6 text-7xl font-black text-white/10 select-none">
              {current.position.split('·')[1]?.trim() || '#'}
            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl m-3 border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {current.badge}
              </span>
              <h3 className="text-2xl font-black text-white mt-2 leading-none">{current.name}</h3>
              <p className="text-xs text-slate-300 font-medium mt-1">{current.team}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{current.position}</p>
            </div>
          </div>
        </div>

        {/* Center Column: Season Highlights & Radar Badge (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center text-center justify-center">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            SEASON HIGHLIGHTS & TELEMETRÍA
          </span>

          {/* Central Hexagonal / Pentagon Badge */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* SVG Polygon Radar Net */}
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
              <polygon points="100,20 180,75 150,165 50,165 20,75" fill="rgba(30, 41, 59, 0.6)" stroke="#334155" strokeWidth="1.5" />
              <polygon points="100,45 155,85 135,145 65,145 45,85" fill="rgba(51, 65, 85, 0.4)" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
              {/* Dynamic Value Polygon */}
              <polygon
                points="100,32 170,80 142,158 58,155 30,82"
                fill="rgba(234, 88, 12, 0.25)"
                stroke="#f97316"
                strokeWidth="2.5"
                className="transition-all duration-700"
              />
            </svg>

            {/* Central Badge Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-2xl bg-slate-900/90 border border-orange-500/50 shadow-lg flex flex-col items-center justify-center p-2 text-center">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="text-[10px] font-black text-orange-400 uppercase leading-none mt-1">ÉLITE</span>
                <span className="text-sm font-black text-white">{current.per36Efficiency}</span>
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-left">
              <div className="text-[11px] text-slate-400 font-medium">Net Rating</div>
              <div className="text-xl font-black text-emerald-400">{current.netRating}</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-left">
              <div className="text-[11px] text-slate-400 font-medium">Defensive WS</div>
              <div className="text-xl font-black text-cyan-400">{current.defensiveWinShares}</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-left">
              <div className="text-[11px] text-slate-400 font-medium">Usage Rate</div>
              <div className="text-xl font-black text-amber-400">{current.usageRate}%</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-left">
              <div className="text-[11px] text-slate-400 font-medium">True Shooting (TS%)</div>
              <div className="text-xl font-black text-orange-400">{current.trueShootingPct}%</div>
            </div>
          </div>
        </div>

        {/* Right Column: Cards & Highlights (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* Card 1: Record Wins / Losses */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800/80 p-4 rounded-2xl border border-slate-700/60 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Balance Victorias</div>
                <div className="text-lg font-black text-white">{current.wins} Victorias · {current.losses} Derrotas</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                {current.winPct}%
              </span>
            </div>
          </div>

          {/* Card 2: Career Triple Doubles */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Triple-Dobles Carrera</div>
                <div className="text-lg font-black text-white">{current.careerTripleDoubles} Registrados</div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">Oficial NBA</span>
          </div>

          {/* Card 3: Clutch Points Per Game */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Puntos en Clutch (Q4)</div>
                <div className="text-lg font-black text-rose-400">{current.clutchPointsPerGame} PPG</div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">Decisivo</span>
          </div>

          {/* Card 4: All-Defensive */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Impacto Defensivo</div>
                <div className="text-lg font-black text-cyan-300">{current.allDefensiveTeam}</div>
              </div>
            </div>
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Bottom Games Stats Strip (Matches Image A Bottom Bar) */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Últimos Partidos Registrados</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">DunkAPI Verified</span>
          </div>
          <span className="text-xs text-orange-400 font-semibold cursor-pointer hover:underline flex items-center">
            Historial completo <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {current.recentGames.map((game, idx) => (
            <div key={idx} className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">{game.date} · {game.match}</div>
                <div className="text-sm font-black text-white mt-0.5">{game.result}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-orange-400">{game.pts} PTS</div>
                <div className="text-[11px] text-slate-400">{game.reb} REB · {game.ast} AST</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
