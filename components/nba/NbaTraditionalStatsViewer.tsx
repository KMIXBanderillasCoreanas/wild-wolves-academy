'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Activity, 
  Flame, 
  Zap, 
  Sparkles, 
  Filter, 
  RefreshCw,
  Trophy,
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { TraditionalPlayerStat, NbaApiSessionConfig } from '@/lib/nba-intelligence/types';
import { getNbaApiStatus } from '@/lib/nba-intelligence/nbaStatsClient';

export default function NbaTraditionalStatsViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('2023-24');
  const [selectedSeasonType, setSelectedSeasonType] = useState<'Regular Season' | 'Playoffs'>('Regular Season');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<TraditionalPlayerStat[]>([]);
  const [source, setSource] = useState<string>('verified_cache');
  const [sessionStatus, setSessionStatus] = useState<NbaApiSessionConfig>(getNbaApiStatus());

  const quickPills = [
    { label: 'Stephen Curry', query: 'curry' },
    { label: 'LeBron James', query: 'lebron' },
    { label: 'Michael Jordan', query: 'jordan' },
    { label: 'Larry Bird', query: 'bird' },
    { label: 'Ver Todos', query: '' }
  ];

  const fetchStats = async (player: string, season: string, seasonType: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/nba/traditional-stats?player=${encodeURIComponent(player)}&season=${season}&seasonType=${seasonType}`
      );
      if (res.ok) {
        const json = await res.json();
        setStatsData(json.data || []);
        setSource(json.source || 'verified_cache');
        if (json.session) setSessionStatus(json.session);
      }
    } catch (err) {
      console.warn('Aviso de carga de estadísticas NBA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(searchQuery, selectedSeason, selectedSeasonType);
  }, [selectedSeason, selectedSeasonType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(searchQuery, selectedSeason, selectedSeasonType);
  };

  const handleQuickPill = (q: string) => {
    setSearchQuery(q);
    fetchStats(q, selectedSeason, selectedSeasonType);
  };

  return (
    <div className="bg-[#0b0e14] border border-[#1e293b] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-white space-y-6">
      {/* Luz ambiental sutil */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ENCABEZADO Y BADGE DE SESIÓN DE 30 DÍAS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> NBA STATS OFFICIAL ADAPTER
            </span>
            <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              VENTANA ACTIVA: {sessionStatus.daysRemaining} DÍAS RESTANTES (HASTA 02/DIC/2026)
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-2 flex items-center gap-2">
            Explorador de Estadísticas Tradicionales de la NBA
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Conexión directa con la estructura oficial de <span className="text-blue-400 font-bold">stats.nba.com/stats/leaguedashplayerstats</span>. Máxima fidelidad histórica verificada.
          </p>
        </div>

        <a
          href="https://www.nba.com/stats/players/traditional?utm_source=chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition flex items-center gap-1.5 shrink-0"
        >
          <span>Abrir NBA.com Oficial</span>
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
        </a>
      </div>

      {/* BARRA DE FILTROS & BÚSQUEDA */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar jugador NBA (ej. Stephen Curry, Michael Jordan, LeBron James)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121624] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition font-sans"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Temporada */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#121624] border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono shrink-0 cursor-pointer"
            >
              <option value="2023-24">2023-24 (Actual)</option>
              <option value="2015-16">2015-16 (MVP Unánime Curry)</option>
              <option value="2012-13">2012-13 (LeBron Prime Miami)</option>
              <option value="1997-98">1997-98 (The Last Dance Jordan)</option>
              <option value="1991-92">1991-92 (Peak Jordan)</option>
              <option value="1985-86">1985-86 (Larry Bird)</option>
            </select>

            {/* Tipo de Temporada */}
            <select
              value={selectedSeasonType}
              onChange={(e) => setSelectedSeasonType(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-[#121624] border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono shrink-0 cursor-pointer"
            >
              <option value="Regular Season">Temporada Regular</option>
              <option value="Playoffs">Playoffs</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Consultar</span>
            </button>
          </div>
        </form>

        {/* PILLS RÁPIDAS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold shrink-0">
            Acceso Rápido:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => handleQuickPill(pill.query)}
              className="px-3 py-1 rounded-lg bg-[#141a29] hover:bg-[#1a2336] text-[11px] font-mono text-zinc-300 hover:text-white border border-zinc-800 hover:border-blue-500/40 transition shrink-0 cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ESTADO DE CARGA */}
      {loading && (
        <div className="p-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-400">
            Consultando registros tradicionales en el endpoint leaguedashplayerstats de stats.nba.com...
          </p>
        </div>
      )}

      {/* TABLA OFICIAL DE ESTADÍSTICAS TRADICIONALES */}
      {!loading && statsData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>
              Mostrando <strong className="text-white">{statsData.length}</strong> registro(s) verificado(s)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              Origen: {source === 'stats.nba.com' ? 'Enlace Directo NBA' : 'Caché Verificada de Respaldo'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#121624] text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                  <th className="py-3 px-3">Jugador / Equipo</th>
                  <th className="py-3 px-2 text-center">Temporada</th>
                  <th className="py-3 px-2 text-center">PJ</th>
                  <th className="py-3 px-2 text-center">MIN</th>
                  <th className="py-3 px-2 text-center text-amber-400 font-black">PTS (PPG)</th>
                  <th className="py-3 px-2 text-center text-emerald-400">TC%</th>
                  <th className="py-3 px-2 text-center text-sky-400">3P%</th>
                  <th className="py-3 px-2 text-center">TL%</th>
                  <th className="py-3 px-2 text-center">REB</th>
                  <th className="py-3 px-2 text-center">AST</th>
                  <th className="py-3 px-2 text-center">ROB</th>
                  <th className="py-3 px-2 text-center">TAP</th>
                  <th className="py-3 px-2 text-center">+/-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-[#0c1017] text-zinc-200">
                {statsData.map((player, idx) => (
                  <tr key={`${player.playerId}-${player.season}-${idx}`} className="hover:bg-[#121824] transition">
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black border border-blue-500/30">
                          {player.teamAbbreviation}
                        </span>
                        <div>
                          <span className="block text-xs text-white">{player.playerName}</span>
                          <span className="text-[9px] text-zinc-500 block">Edad: {player.age || 'N/D'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap text-zinc-300">
                      {player.season}
                    </td>
                    <td className="py-3 px-2 text-center">{player.gamesPlayed}</td>
                    <td className="py-3 px-2 text-center">{player.minutesPerGame.toFixed(1)}</td>
                    <td className="py-3 px-2 text-center font-black text-amber-400 text-sm">
                      {player.pointsPerGame.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-center text-emerald-300 font-bold">
                      {(player.fieldGoalPct * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-center text-sky-300 font-bold">
                      {player.threePointPct > 0 ? `${(player.threePointPct * 100).toFixed(1)}%` : 'Dato no disponible'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {(player.freeThrowPct * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-center font-bold">{player.reboundsPerGame.toFixed(1)}</td>
                    <td className="py-3 px-2 text-center font-bold text-orange-300">{player.assistsPerGame.toFixed(1)}</td>
                    <td className="py-3 px-2 text-center">{player.stealsPerGame.toFixed(1)}</td>
                    <td className="py-3 px-2 text-center">{player.blocksPerGame.toFixed(1)}</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-400">
                      +{player.plusMinus.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PIE DE SEGURIDAD & COMPLIANCE */}
      <div className="pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cumplimiento Fase 0: Datos verificados sin estimaciones inventadas.</span>
        </div>
        <span className="text-zinc-500">
          Válido: 02/Nov/2026 — 02/Dic/2026
        </span>
      </div>
    </div>
  );
}
