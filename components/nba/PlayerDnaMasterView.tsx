'use client';

import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Search, 
  Flame, 
  Trophy, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Award, 
  TrendingUp, 
  Clock, 
  Crosshair, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { NBA_LEGENDS_BENCHMARKS, LegendBenchmark } from '@/lib/legendsBenchmark';

export interface PlayerDnaProps {
  initialAthleteName?: string;
}

export function PlayerDnaMasterView({ initialAthleteName = 'Mateo Sánchez' }: PlayerDnaProps) {
  // 1. Datos del Alumno y su Contexto de Juego Real
  const [athleteName, setAthleteName] = useState(initialAthleteName);
  const [gameContext, setGameContext] = useState<'entrenamiento' | 'partido_oficial'>('partido_oficial');
  const [competitionTier, setCompetitionTier] = useState<string>('local_colonia');
  const [leagueName, setLeagueName] = useState<string>('Liga de Básquetbol Gustavo A. Madero');
  const [leagueLocation, setLeagueLocation] = useState<string>('Deportivo Carmen Serdán / Canchas Colonia');
  const [studentJersey, setStudentJersey] = useState<string>('#11');

  // 2. Métricas del Alumno (Entrenamiento vs Partido Real)
  const studentMetrics = useMemo(() => {
    if (gameContext === 'entrenamiento') {
      return {
        contextLabel: 'Entrenamiento en Duela (Sin Presión de Reloj)',
        pointsPerGame: 18.5,
        freeThrowPct: 82,
        threePointPct: 40,
        releaseSpeedMs: 340,
        reactionTimeMs: 270,
        jumpApexCm: 56,
        turnovers: 1.2,
        fatigueBpm: 145
      };
    } else {
      return {
        contextLabel: 'Partido Oficial de Liga (Defensa Agresiva & Fatiga 4° Cuarto)',
        pointsPerGame: 13.8,
        freeThrowPct: 70,
        threePointPct: 31,
        releaseSpeedMs: 385,
        reactionTimeMs: 310,
        jumpApexCm: 51,
        turnovers: 3.4,
        fatigueBpm: 178
      };
    }
  }, [gameContext]);

  // 3. Búsqueda y Selección del Jugador Favorito de la NBA
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLegendId, setSelectedLegendId] = useState<string>('kobe_bryant');

  const filteredLegends = useMemo(() => {
    if (!searchQuery.trim()) return NBA_LEGENDS_BENCHMARKS;
    const q = searchQuery.toLowerCase().trim();
    return NBA_LEGENDS_BENCHMARKS.filter(
      (l) =>
        l.legend_name.toLowerCase().includes(q) ||
        l.team.toLowerCase().includes(q) ||
        l.archetype.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeLegend: LegendBenchmark =
    NBA_LEGENDS_BENCHMARKS.find((l) => l.id === selectedLegendId) || NBA_LEGENDS_BENCHMARKS[0];

  // Cálculo de Diferenciales (Deltas de Brecha)
  const deltaPoints = (studentMetrics.pointsPerGame - activeLegend.pointsPerGame).toFixed(1);
  const deltaRelease = studentMetrics.releaseSpeedMs - activeLegend.releaseTimeMs;
  const deltaReaction = studentMetrics.reactionTimeMs - activeLegend.reactionTimeMs;
  const deltaApex = (studentMetrics.jumpApexCm - activeLegend.jumpApexHeightCm).toFixed(0);

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. CABECERA: PLAYER DNA (PROPÓSITO REAL: MOTIVACIÓN Y COMPARATIVA EXACTA)   */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#121622] via-[#0e121a] to-[#161c28] border border-orange-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-400" />
                PLAYER DNA • SISTEMA DE MOTIVACIÓN & BRECHA
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Wild Wolves Basketball OS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1.5">
              Tú vs. Tu Ídolo NBA: ¿Dónde Estás y a Dónde Vas?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-3xl leading-relaxed">
              Compara tu rendimiento real en cancha contra la estrella que admiras. Aquí no medimos números abstractos: medimos tu rapidez de tiro, tu salto, tu frialdad bajo presión y el nivel de liga en el que compites semana a semana.
            </p>
          </div>

          <div className="p-3 bg-black/50 border border-zinc-800 rounded-2xl shrink-0 text-right">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Atleta Activo:</span>
            <span className="text-sm font-black text-white">{athleteName} {studentJersey}</span>
            <span className="text-[10px] font-mono text-orange-400 block mt-0.5">Sede: Carmen Serdán</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CONTEXTO REAL: ¿DÓNDE JUEGA EL ATLETA? (LIGA, COLONIA & NIVEL)         */}
        {/* ========================================================================= */}
        <div className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-orange-400 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-orange-400" />
              1. Datos de tu Liga y Competición Real (Donde juegas tus partidos):
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Datos verificables para seguimiento del Coach
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Nivel de Liga */}
            <div className="bg-[#0b0e15] p-3 rounded-2xl border border-zinc-800">
              <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                Nivel de Competencia:
              </label>
              <select
                value={competitionTier}
                onChange={(e) => setCompetitionTier(e.target.value)}
                className="w-full bg-[#121622] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white outline-none cursor-pointer focus:border-orange-500"
              >
                <option value="local_colonia">🏙️ Liga de Colonia / Barrio / Parque</option>
                <option value="distrital_alcaldia">🏛️ Liga Distrital / Torneo Alcaldía CDMX</option>
                <option value="estatal_cdmx">🏆 Selectivo Estatal CDMX / Escolar</option>
                <option value="nacional">🇲🇽 Nacional Oficial (ADEMEBA / CONADE / FMB)</option>
                <option value="internacional">🌎 Internacional / Binacional / Pre-NCAA</option>
              </select>
            </div>

            {/* Nombre de la Liga */}
            <div className="bg-[#0b0e15] p-3 rounded-2xl border border-zinc-800">
              <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                Nombre de la Liga / Torneo:
              </label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="Ej. Liga Hermanos Galeana, Copa Serdán..."
                className="w-full bg-[#121622] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
              />
            </div>

            {/* Sede / Canchas */}
            <div className="bg-[#0b0e15] p-3 rounded-2xl border border-zinc-800">
              <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                Ubicación / Canchas de Juego:
              </label>
              <input
                type="text"
                value={leagueLocation}
                onChange={(e) => setLeagueLocation(e.target.value)}
                placeholder="Ej. Deportivo Carmen Serdán, Canchas GAM..."
                className="w-full bg-[#121622] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
              />
            </div>

            {/* Selector de Contexto: Entrenamiento vs Partido Oficial */}
            <div className="bg-[#0b0e15] p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between">
              <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                Modo de Rendimiento Evaluado:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGameContext('entrenamiento')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
                    gameContext === 'entrenamiento'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  🏀 En Práctica
                </button>
                <button
                  type="button"
                  onClick={() => setGameContext('partido_oficial')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
                    gameContext === 'partido_oficial'
                      ? 'bg-orange-600 text-white shadow'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚡ En Partido
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              <strong>Diferencia clave en Wild Wolves:</strong> Entrenar tiro sin oposición produce hasta un 40% más de efectividad que tirar en el último minuto de un partido oficial. Tu comparativa activa abajo evalúa tu perfil en: <b className="text-white">{studentMetrics.contextLabel}</b>.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BUSCADOR INTERACTIVO DE TU JUGADOR FAVORITO NBA                        */}
      {/* ========================================================================= */}
      <div className="bg-[#0c0f17] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-400" />
              2. Elige a tu Jugador Favorito de la NBA
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Escribe el nombre de tu ídolo para activar la comparativa biomecánica inmediata.
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800">
            {filteredLegends.length} leyendas disponibles
          </span>
        </div>

        {/* Input con Icono de Búsqueda */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe a tu ídolo (ej. Kobe Bryant, Stephen Curry, Kyrie Irving, LeBron, Luka Dončić, Jordan, Durant, Giannis)..."
            className="w-full pl-10 pr-10 py-3 bg-[#121622] border border-zinc-700 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition shadow-inner font-sans"
          />
          <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tarjetas Seleccionables de Jugadores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {filteredLegends.map((legend) => {
            const isSelected = legend.id === selectedLegendId;
            return (
              <button
                key={legend.id}
                type="button"
                onClick={() => setSelectedLegendId(legend.id)}
                className={`p-3 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1b2333] to-[#121724] border-orange-500 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/10'
                    : 'bg-[#0f131d] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#141b2a]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{legend.iconTag}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-orange-400 border border-zinc-700">
                      {legend.jerseyNumber}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-white truncate">
                    {legend.legend_name}
                  </h3>
                  <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                    {legend.team}
                  </span>
                </div>

                <div className="pt-2 mt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-500">Tiro:</span>
                  <span className="font-bold text-emerald-400">{legend.releaseTimeMs}ms</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DUELO CARA A CARA: ALUMNO VS. ÍDOLO (TABLERO DE COMPARACIÓN EXACTA)    */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e15] border-2 border-orange-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-xl shrink-0">
              ⚔️
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
                Cara a Cara • Duelo Biomecánico
              </span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                {athleteName} <span className="text-zinc-500">vs</span> {activeLegend.legend_name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
              Modo: <b>{gameContext === 'partido_oficial' ? 'En Partido Oficial' : 'En Práctica'}</b>
            </span>
          </div>
        </div>

        {/* Grid de 4 Indicadores Clave de Brecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Indicador 1: Rapidez de Liberación de Tiro */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Rapidez de Tiro
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                +{deltaRelease} ms brecha
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-mono text-white">{studentMetrics.releaseSpeedMs} ms</span>
                <span className="text-xs font-mono text-zinc-400">Ídolo: <b className="text-emerald-400">{activeLegend.releaseTimeMs} ms</b></span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                Tiempo desde la carga hasta el quiebre de muñeca. Para acortar la brecha, entrena la recepción en paso cero ya listo para elevar el tiro.
              </p>
            </div>
          </div>

          {/* Indicador 2: Puntos Por Partido (PPP) */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" /> Puntos Por Partido
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/30 font-bold">
                {deltaPoints} PPP vs NBA
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-mono text-orange-400">{studentMetrics.pointsPerGame} PPP</span>
                <span className="text-xs font-mono text-zinc-400">Ídolo: <b className="text-white">{activeLegend.pointsPerGame} PPP</b></span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                En tu liga ({leagueName}), promedias {studentMetrics.pointsPerGame} pts. El ídolo promedió {activeLegend.pointsPerGame} pts al más alto nivel mundial.
              </p>
            </div>
          </div>

          {/* Indicador 3: Salto y Elevación Vertical */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-400" /> Salto Vertical (Apex)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold">
                {deltaApex} cm
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-mono text-sky-400">{studentMetrics.jumpApexCm} cm</span>
                <span className="text-xs font-mono text-zinc-400">Ídolo: <b className="text-white">{activeLegend.jumpApexHeightCm} cm</b></span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                Elevación máxima sobre la duela. Se entrena con los 500 saltos de cuerda diarios y sentadilla isométrica en pared del Deportivo Carmen Serdán.
              </p>
            </div>
          </div>

          {/* Indicador 4: Reacción y Alerta Defensiva */}
          <div className="bg-[#121624] border border-zinc-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-300 flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-emerald-400" /> Reacción Defensiva
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                +{deltaReaction} ms
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-mono text-emerald-400">{studentMetrics.reactionTimeMs} ms</span>
                <span className="text-xs font-mono text-zinc-400">Ídolo: <b className="text-white">{activeLegend.reactionTimeMs} ms</b></span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                Tiempo de respuesta ante fintas o cambios de dirección del rival. Ojos en la cadera del atacante, nunca en el balón.
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 5. MENSAJE MOTIVACIONAL Y TAREA TÁCTICA DEL COACH RICARDO                 */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-[#18121f] to-[#0e121a] border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> PLAN DE VUELO: PARA ALCANZAR EL NIVEL DE {activeLegend.legend_name.toUpperCase()}
            </span>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
              {activeLegend.legend_name} construyó su grandeza no por casualidad, sino repitiendo los fundamentos cientos de veces cada semana. Tu misión en el Deportivo Carmen Serdán para esta semana:
            </p>
            <p className="text-xs text-orange-300 font-bold mt-1">
              🎯 Especialidad Clave a Impar: {activeLegend.specialtyMetricName} • Marca a Buscar: {activeLegend.specialtyMetricValue}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="px-4 py-2 rounded-xl bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30">
              ¡A Entrenar Duro! 🐺
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
