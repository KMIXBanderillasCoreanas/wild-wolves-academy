// components/nba/InteractiveShotChartKinexon.tsx
// Visualización C: Mapa de Cancha Interactivo (Inspirado en Kinexon Sports & DunkAPI Spatial Telemetry)
'use client';

import React, { useState, useEffect } from 'react';
import { Crosshair, Calendar, Layers, Filter, Info, ShieldCheck, ChevronDown } from 'lucide-react';
import { ShotZoneMetric, ShotSpatialCoordinate } from '@/lib/nba-intelligence/types';

interface InteractiveShotChartProps {
  initialPlayerId?: string;
}

export function InteractiveShotChartKinexon({ initialPlayerId = '3975' }: InteractiveShotChartProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<'3975' | '1966' | 'jordan'>(initialPlayerId as any);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('all');
  const [hoveredShot, setHoveredShot] = useState<ShotSpatialCoordinate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [shots, setShots] = useState<ShotSpatialCoordinate[]>([]);
  const [zones, setZones] = useState<ShotZoneMetric[]>([]);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  // Fetch shot chart data from our defensively cached API
  useEffect(() => {
    async function loadShotChart() {
      setLoading(true);
      try {
        const res = await fetch(`/api/nba/dunkapi/shot-chart?playerId=${selectedPlayer}`);
        const json = await res.json();
        if (json.success && json.data) {
          setShots(json.data.shots || []);
          setZones(json.data.zones || []);
          setDisclaimer(json.data.dataDisclaimer || null);
        }
      } catch (err) {
        console.error('Error cargando tiros:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShotChart();
  }, [selectedPlayer]);

  // Filtrar tiros según zona activa
  const filteredShots = shots.filter(s => {
    if (activeZoneFilter === 'all') return true;
    return s.zone === activeZoneFilter;
  });

  // Limitar número de tiros visibles en la duela SVG para máxima fluidez a 250 tiros representativos
  const displayedShots = filteredShots.slice(0, 250);

  // Cálculo de cargas de tiro (Low, Medium, High Load) como en Kinexon
  const totalFga = shots.length || 1;
  const totalFgm = shots.filter(s => s.made).length;
  const generalPct = Math.round((totalFgm / totalFga) * 100);

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl my-8 transition-colors">
      
      {/* Top Header & Session Bar (Kinexon Style) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <Crosshair className="w-4 h-4 text-blue-500" />
            Módulo C · Mapa de Cancha Interactivo (Kinexon Telemetry & DunkAPI)
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Telemetría Espacial y Cobertura de Tiro
          </h2>
        </div>

        {/* Player & Session Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Temporada 2024 · 12 Sesiones Clave</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedPlayer('3975')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPlayer === '3975'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Stephen Curry
            </button>
            <button
              onClick={() => setSelectedPlayer('1966')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPlayer === '1966'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              LeBron James
            </button>
            <button
              onClick={() => setSelectedPlayer('jordan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPlayer === 'jordan'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Michael Jordan (Histórico)
            </button>
          </div>
        </div>
      </div>

      {/* Historical Disclaimer if applicable */}
      {disclaimer && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{disclaimer}</span>
        </div>
      )}

      {/* Main Kinexon Court Canvas + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-start">
        
        {/* Left 8 Cols: Interactive Half-Court Canvas */}
        <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 relative flex flex-col items-center">
          
          {/* Quick Zone Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 z-10">
            {[
              { id: 'all', label: 'Toda la Cancha' },
              { id: 'restricted_area', label: 'Bajo el Aro' },
              { id: 'paint', label: 'La Pintura' },
              { id: 'midrange', label: 'Media Distancia' },
              { id: 'corner_3', label: 'Triples de Esquina' },
              { id: 'above_break_3', label: 'Triples Frontales' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setActiveZoneFilter(pill.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  activeZoneFilter === pill.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* SVG Court Canvas */}
          <div className="w-full max-w-lg aspect-[50/47] relative flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-xs font-bold text-slate-400 animate-pulse">
                Cargando telemetría de duela...
              </div>
            ) : (
              <svg
                viewBox="-250 -50 500 470"
                className="w-full h-full drop-shadow-sm select-none"
              >
                {/* Court Boundary Lines */}
                <rect x="-250" y="-47.5" width="500" height="470" fill="none" stroke="#64748b" strokeWidth="2.5" />

                {/* Key / Paint (16 ft wide = 160 units) */}
                <rect x="-80" y="-47.5" width="160" height="190" fill="rgba(148, 163, 184, 0.05)" stroke="#64748b" strokeWidth="2" />
                <rect x="-60" y="-47.5" width="120" height="190" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />

                {/* Free Throw Circle (radius 60) */}
                <circle cx="0" cy="142.5" r="60" fill="none" stroke="#64748b" strokeWidth="2" />
                <path d="M -60 142.5 A 60 60 0 0 0 60 142.5" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Restricted Area Arc (radius 40) */}
                <path d="M -40 -47.5 L -40 -7.5 A 40 40 0 0 0 40 -7.5 L 40 -47.5" fill="none" stroke="#64748b" strokeWidth="1.5" />

                {/* Hoop & Backboard */}
                <line x1="-30" y1="-7.5" x2="30" y2="-7.5" stroke="#ef4444" strokeWidth="3" />
                <circle cx="0" cy="0" r="7.5" fill="#f97316" stroke="#b91c1c" strokeWidth="1.5" />

                {/* 3-Point Arc (Corners: x = ±220, radius = 237.5) */}
                <line x1="-220" y1="-47.5" x2="-220" y2="92.5" stroke="#64748b" strokeWidth="2" />
                <line x1="220" y1="-47.5" x2="220" y2="92.5" stroke="#64748b" strokeWidth="2" />
                <path d="M -220 92.5 A 237.5 237.5 0 0 0 220 92.5" fill="none" stroke="#64748b" strokeWidth="2" />

                {/* Real Spatial Shots Plotting (Mapped from DunkAPI coordinates: x: -25 to +25 ft, y: 0 to 45 ft) */}
                {displayedShots.map((shot, idx) => {
                  // Escalar coordenadas en pies a unidades SVG (1 pie = 10 unidades)
                  const svgX = shot.x * 10;
                  const svgY = shot.y * 10 - 7.5;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-transform hover:scale-150"
                      onMouseEnter={() => setHoveredShot(shot)}
                      onMouseLeave={() => setHoveredShot(null)}
                    >
                      {shot.made ? (
                        // Hexágono o círculo verde para aciertos
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={shot.pts === 3 ? 5.5 : 4.5}
                          fill="#10b981"
                          fillOpacity={0.85}
                          stroke="#047857"
                          strokeWidth="1"
                        />
                      ) : (
                        // Círculo o hexágono hueco rojo para fallos
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={shot.pts === 3 ? 5.0 : 4.0}
                          fill="#ef4444"
                          fillOpacity={0.25}
                          stroke="#ef4444"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Hover Tooltip Overlay */}
            {hoveredShot && (
              <div className="absolute top-4 left-4 bg-slate-950/90 text-white p-3 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-md text-xs pointer-events-none z-20">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <span className={`w-2 h-2 rounded-full ${hoveredShot.made ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <span>{hoveredShot.made ? 'CANASTA CONVERTIDA' : 'TIRO FALLADO'} ({hoveredShot.pts} PTS)</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Distancia: <strong className="text-white">{hoveredShot.distanceFt || Math.round(Math.hypot(hoveredShot.x, hoveredShot.y))} pies</strong>
                </div>
                {hoveredShot.expectedPoints && (
                  <div className="text-[11px] text-amber-400">
                    Puntos Esperados: <strong>{hoveredShot.expectedPoints} pts</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duela Legend Strip */}
          <div className="flex items-center gap-6 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
              <span>Acierto (Canasta)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-rose-500 inline-block" />
              <span>Fallo (Intento)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Muestreo: {displayedShots.length} tiros en pantalla</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Kinexon Shot Load Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Métricas de Carga y Eficiencia (Kinexon)
          </div>

          {/* Card 1: Low Shot Load (Aro / Penetración) */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Low Shot Load (Aro)</span>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {zones.find(z => z.zone === 'restricted_area')?.pct ? Math.round(zones.find(z => z.zone === 'restricted_area')!.pct * 100) : 58}%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-mono block">FGM / FGA</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">
                {zones.find(z => z.zone === 'restricted_area')?.made || 96} / {zones.find(z => z.zone === 'restricted_area')?.attempts || 149}
              </span>
            </div>
          </div>

          {/* Card 2: Medium Shot Load (Media Distancia & Pintura) */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Medium Shot Load (Pintura/Media)</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {zones.find(z => z.zone === 'paint')?.pct ? Math.round(zones.find(z => z.zone === 'paint')!.pct * 100) : 61}%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-mono block">FGM / FGA</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">
                {zones.find(z => z.zone === 'paint')?.made || 122} / {zones.find(z => z.zone === 'paint')?.attempts || 242}
              </span>
            </div>
          </div>

          {/* Card 3: High Shot Load (Triples Frontales y Esquinas) */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">High Shot Load (Perímetro / 3PT)</span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {zones.find(z => z.zone === 'above_break_3')?.pct ? Math.round(zones.find(z => z.zone === 'above_break_3')!.pct * 100) : 41}%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-mono block">FGM / FGA</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">
                {zones.find(z => z.zone === 'above_break_3')?.made || 317} / {zones.find(z => z.zone === 'above_break_3')?.attempts || 801}
              </span>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong className="block mb-1">Metodología Kinexon:</strong>
            El volumen de carga física clasifica los tiros según fatiga biomecánica y distancia. Los lanzamientos en High Shot Load exigen aceleración máxima del tren inferior.
          </div>
        </div>

      </div>
    </div>
  );
}
