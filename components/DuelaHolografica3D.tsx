'use client';

import React, { useState } from 'react';
import { 
  Crosshair, 
  Sparkles, 
  Activity, 
  Flame, 
  Eye, 
  Target, 
  Zap, 
  Compass, 
  CheckCircle2, 
  Cpu, 
  Layers
} from 'lucide-react';

export interface CourtStatsProps {
  freeThrowsMade?: number;
  freeThrowsAttempted?: number;
  midLeftMade?: number;
  midLeftAttempted?: number;
  midRightMade?: number;
  midRightAttempted?: number;
  cornerLeftMade?: number;
  cornerLeftAttempted?: number;
  wingLeftMade?: number;
  wingLeftAttempted?: number;
  topKeyMade?: number;
  topKeyAttempted?: number;
  wingRightMade?: number;
  wingRightAttempted?: number;
  cornerRightMade?: number;
  cornerRightAttempted?: number;
}

interface ZoneConfig {
  id: string;
  name: string;
  shortLabel: string;
  made: number;
  attempted: number;
  pathD: string;
  labelX: number;
  labelY: number;
  compact?: boolean;
}

/**
 * Escala de calor cibernética con colores neón de alta luminiscencia y HUD status
 */
function getCyberHeatStyle(pct: number) {
  if (pct >= 70) {
    return {
      tier: 'CALIENTE (≥70%)',
      code: 'HOT_FIRING',
      fill: 'rgba(239, 68, 68, 0.40)',
      hoverFill: 'rgba(249, 115, 22, 0.65)',
      stroke: '#f97316',
      neonBorder: '#ff5722',
      glow: 'shadow-[0_0_25px_rgba(249,115,22,0.6)]',
      textColor: '#ffedd5',
      badgeClass: 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-orange-400'
    };
  }
  if (pct >= 50) {
    return {
      tier: 'FAVORABLE (50-69%)',
      code: 'OPTIMAL_ARC',
      fill: 'rgba(234, 179, 8, 0.35)',
      hoverFill: 'rgba(245, 158, 11, 0.60)',
      stroke: '#eab308',
      neonBorder: '#fbbf24',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
      textColor: '#fef08a',
      badgeClass: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-yellow-300'
    };
  }
  if (pct >= 35) {
    return {
      tier: 'REGULAR (35-49%)',
      code: 'MID_RANGE_LOCK',
      fill: 'rgba(6, 182, 212, 0.30)',
      hoverFill: 'rgba(14, 165, 233, 0.55)',
      stroke: '#06b6d4',
      neonBorder: '#38bdf8',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
      textColor: '#cffafe',
      badgeClass: 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white border-cyan-400'
    };
  }
  return {
    tier: 'FRÍA (<35%)',
    code: 'COLD_DRIFT',
    fill: 'rgba(71, 85, 105, 0.30)',
    hoverFill: 'rgba(100, 116, 139, 0.55)',
    stroke: '#64748b',
    neonBorder: '#94a3b8',
    glow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]',
    textColor: '#cbd5e1',
    badgeClass: 'bg-gradient-to-r from-slate-700 to-zinc-800 text-zinc-300 border-zinc-600'
  };
}

export default function DuelaHolografica3D({
  freeThrowsMade = 10,
  freeThrowsAttempted = 10,
  midLeftMade = 10,
  midLeftAttempted = 10,
  midRightMade = 10,
  midRightAttempted = 10,
  cornerLeftMade = 3,
  cornerLeftAttempted = 5,
  wingLeftMade = 3,
  wingLeftAttempted = 5,
  topKeyMade = 4,
  topKeyAttempted = 5,
  wingRightMade = 3,
  wingRightAttempted = 5,
  cornerRightMade = 2,
  cornerRightAttempted = 5
}: CourtStatsProps) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  // Exact Trigonometric Coordinates on 500x450 Half-Court (2D Zenital View)
  // Hoop Center: (250, 52.5), 3PT Radius R = 215
  // Corner break points: Left (44, 140), Right (456, 140)
  // Wing-to-TopKey rays on 3PT arc:
  // Left: (170, 252) -> Outer Court (130, 440)
  // Right: (330, 252) -> Outer Court (370, 440)
  const zones: ZoneConfig[] = [
    {
      id: 'corner_left',
      name: '3P Esquina Izquierda',
      shortLabel: '3P Esq Izq',
      made: cornerLeftMade,
      attempted: cornerLeftAttempted,
      pathD: 'M 10 10 L 44 10 L 44 140 L 10 140 Z',
      labelX: 27,
      labelY: 75,
      compact: true
    },
    {
      id: 'corner_right',
      name: '3P Esquina Derecha',
      shortLabel: '3P Esq Der',
      made: cornerRightMade,
      attempted: cornerRightAttempted,
      pathD: 'M 456 10 L 490 10 L 490 140 L 456 140 Z',
      labelX: 473,
      labelY: 75,
      compact: true
    },
    {
      id: 'mid_left',
      name: 'Media Distancia Izquierda',
      shortLabel: 'Media Izq',
      made: midLeftMade,
      attempted: midLeftAttempted,
      pathD: 'M 44 10 L 170 10 L 170 252 A 215 215 0 0 1 44 140 Z',
      labelX: 112,
      labelY: 122
    },
    {
      id: 'mid_right',
      name: 'Media Distancia Derecha',
      shortLabel: 'Media Der',
      made: midRightMade,
      attempted: midRightAttempted,
      pathD: 'M 330 10 L 456 10 L 456 140 A 215 215 0 0 1 330 252 Z',
      labelX: 388,
      labelY: 122
    },
    {
      id: 'paint_ft',
      name: 'Línea Libre y Pintura',
      shortLabel: 'Línea Libre / Pintura',
      made: freeThrowsMade,
      attempted: freeThrowsAttempted,
      pathD: 'M 170 10 L 330 10 L 330 252 A 215 215 0 0 1 170 252 Z',
      labelX: 250,
      labelY: 145
    },
    {
      id: 'wing_left',
      name: 'Triple Ala Izquierda (45°)',
      shortLabel: '3P Ala Izq',
      made: wingLeftMade,
      attempted: wingLeftAttempted,
      pathD: 'M 10 140 L 44 140 A 215 215 0 0 0 170 252 L 130 440 L 10 440 Z',
      labelX: 78,
      labelY: 315
    },
    {
      id: 'top_key',
      name: 'Triple Centro (Top of Key)',
      shortLabel: '3P Top Key',
      made: topKeyMade,
      attempted: topKeyAttempted,
      pathD: 'M 170 252 A 215 215 0 0 0 330 252 L 370 440 L 130 440 Z',
      labelX: 250,
      labelY: 358
    },
    {
      id: 'wing_right',
      name: 'Triple Ala Derecha (45°)',
      shortLabel: '3P Ala Der',
      made: wingRightMade,
      attempted: wingRightAttempted,
      pathD: 'M 330 252 A 215 215 0 0 0 456 140 L 490 140 L 490 440 L 370 440 Z',
      labelX: 422,
      labelY: 315
    }
  ];

  const totalMade = zones.reduce((acc, z) => acc + z.made, 0);
  const totalAttempted = zones.reduce((acc, z) => acc + z.attempted, 0);
  const overallPct = totalAttempted > 0 ? Math.round((totalMade / totalAttempted) * 100) : 0;
  const activeZone = zones.find((z) => z.id === activeZoneId) || null;

  return (
    <div className="relative w-full max-w-4xl mx-auto p-5 sm:p-7 bg-gradient-to-b from-[#0b0f19] via-[#0d1424] to-[#1e293b] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] font-sans">
      {/* 1. CAPAS HUD FLOTANTES: Rejilla holográfica y luz ambiental de fondo */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '28px 28px'
        }}
      />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 2. CABECERA HUD CON TIPOGRAFÍA MONOESPACIADA & NEÓN */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-cyan-500/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-400/40 text-[10px] font-mono font-black tracking-widest flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              CYBER_HUD // SHOT SCIENCE 2D CENITAL
            </span>
            <span className="text-[10px] font-mono text-zinc-400">FIBA PRO REGLAMENTARIA</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
            Duela Holográfica 2D
          </h3>
          <p className="text-xs font-mono text-cyan-200/70 mt-0.5">
            // TELEMETRÍA CINEMÁTICA Y EFECTIVIDAD POR SECTOR TÁCTICO
          </p>
        </div>

        {/* MÉTRICA GLOBAL ENCABEZADO */}
        <div className="flex items-center gap-4 bg-[#0a101d]/80 backdrop-blur-md border border-cyan-500/40 px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <div className="text-right">
            <span className="text-[10px] font-mono text-cyan-400 block tracking-wider uppercase font-bold">
              EFECTIVIDAD GLOBAL
            </span>
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="text-2xl font-black font-mono text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                {overallPct}%
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                ({totalMade}/{totalAttempted})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. LEYENDA CYBERPUNK MONOESPACIADA CON GLOW */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5 font-mono text-[11px]">
        {[
          { label: 'Caliente (≥70%)', color: 'from-orange-500 to-red-500', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.6)]', border: 'border-orange-400' },
          { label: 'Favorable (50-69%)', color: 'from-amber-400 to-yellow-500', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]', border: 'border-yellow-300' },
          { label: 'Regular (35-49%)', color: 'from-cyan-500 to-sky-600', glow: 'shadow-[0_0_12px_rgba(6,182,212,0.5)]', border: 'border-cyan-300' },
          { label: 'Fría (<35%)', color: 'from-slate-600 to-zinc-700', glow: 'shadow-[0_0_10px_rgba(100,116,139,0.3)]', border: 'border-zinc-500' }
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#090d18]/90 backdrop-blur-md border border-zinc-800/80"
          >
            <span className={`w-3 h-3 rounded-full bg-gradient-to-tr ${item.color} ${item.glow} border ${item.border} shrink-0`} />
            <span className="text-zinc-300 truncate font-semibold">{item.label}</span>
          </div>
        ))}
      </div>

      {/* 4. CANVAS SVG 2D CENITAL CON LÍNEAS DE DUELA DE NEÓN Y VIDRIO ESMERILADO */}
      <div className="relative z-10 w-full overflow-hidden rounded-2xl bg-[#060a14]/90 border border-cyan-500/30 p-2 sm:p-4 shadow-[inset_0_0_40px_rgba(6,182,212,0.1)]">
        <svg
          viewBox="0 0 500 450"
          className="w-full h-auto select-none"
          style={{ maxHeight: '580px' }}
        >
          <defs>
            {/* Filtro de resplandor Neón Cian */}
            <filter id="neonCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Filtro de resplandor Neón Naranja para el aro */}
            <filter id="neonOrangeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Patrón de partículas sutil para el fondo de la duela */}
            <pattern id="hologramGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="rgba(6,182,212,0.18)" />
            </pattern>
          </defs>

          {/* Duela Cenital: Base oscura con textura de partículas */}
          <rect x="0" y="0" width="500" height="450" rx="16" fill="#070c17" />
          <rect x="0" y="0" width="500" height="450" rx="16" fill="url(#hologramGrid)" />

          {/* A. POLÍGONOS DE DISPARO CON EFECTO DE CALOR HOLOGRÁFICO */}
          {zones.map((zone) => {
            const pct = Math.round((zone.made / Math.max(1, zone.attempted)) * 100);
            const style = getCyberHeatStyle(pct);
            const isHovered = activeZoneId === zone.id;

            return (
              <path
                key={zone.id}
                d={zone.pathD}
                fill={isHovered ? style.hoverFill : style.fill}
                stroke={isHovered ? '#22d3ee' : style.stroke}
                strokeWidth={isHovered ? '2.5' : '1'}
                strokeOpacity={isHovered ? '1' : '0.4'}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveZoneId(zone.id)}
                onMouseLeave={() => setActiveZoneId(null)}
              />
            );
          })}

          {/* B. LÍNEAS REGLAMENTARIAS DE DUELA CON GLOW NEÓN CIAN */}
          <g
            stroke="#38bdf8"
            strokeWidth="2"
            fill="none"
            filter="url(#neonCyanGlow)"
            className="pointer-events-none"
            opacity="0.85"
          >
            {/* Perímetro de la media cancha */}
            <rect x="10" y="10" width="480" height="430" rx="6" />

            {/* Líneas laterales del triple de esquina */}
            <line x1="44" y1="10" x2="44" y2="140" />
            <line x1="456" y1="10" x2="456" y2="140" />

            {/* Llave / Pintura Reglamentaria (170 a 330) */}
            <rect x="170" y="10" width="160" height="190" fill="rgba(6,182,212,0.04)" />

            {/* Marcas de rebote en los postes de la llave */}
            <line x1="162" y1="80" x2="170" y2="80" />
            <line x1="162" y1="110" x2="170" y2="110" />
            <line x1="162" y1="140" x2="170" y2="140" />
            <line x1="162" y1="170" x2="170" y2="170" />
            <line x1="330" y1="80" x2="338" y2="80" />
            <line x1="330" y1="110" x2="338" y2="110" />
            <line x1="330" y1="140" x2="338" y2="140" />
            <line x1="330" y1="170" x2="338" y2="170" />

            {/* Círculo de Tiro Libre: Mitad superior segmentada, inferior sólida */}
            <path d="M 190 200 A 60 60 0 0 1 310 200" strokeDasharray="5 5" />
            <path d="M 190 200 A 60 60 0 0 0 310 200" />

            {/* Arco de 3 Puntos FIBA (R=215 con vértice en 250, 52.5) */}
            <path d="M 44 140 A 215 215 0 0 0 456 140" strokeWidth="2.5" />

            {/* Área restringida sin carga debajo del aro */}
            <path d="M 210 40 L 210 52.5 A 40 40 0 0 0 290 52.5 L 290 40" />

            {/* Círculo Central de media cancha */}
            <path d="M 190 440 A 60 60 0 0 1 310 440" />
            <line x1="10" y1="440" x2="490" y2="440" strokeDasharray="6 6" />
          </g>

          {/* C. TABLERO Y ARO EN NEÓN NARANJA */}
          <g filter="url(#neonOrangeGlow)" className="pointer-events-none">
            {/* Tablero */}
            <line x1="220" y1="40" x2="280" y2="40" stroke="#f8fafc" strokeWidth="4" />
            {/* Conector al aro */}
            <line x1="250" y1="40" x2="250" y2="44" stroke="#ff7847" strokeWidth="3" />
            {/* Aro de baloncesto */}
            <circle cx="250" cy="52.5" r="9.5" stroke="#ff5722" strokeWidth="3" fill="rgba(255,87,34,0.35)" />
          </g>

          {/* D. TARJETAS DE ZONA EN GLASSMORPHISM (CRISTAL ESMERILADO TRANSLÚCIDO) */}
          {zones.map((zone) => {
            const pct = Math.round((zone.made / Math.max(1, zone.attempted)) * 100);
            const style = getCyberHeatStyle(pct);
            const isHovered = activeZoneId === zone.id;

            if (zone.compact) {
              return (
                <g
                  key={`label_${zone.id}`}
                  transform={`translate(${zone.labelX}, ${zone.labelY})`}
                  className="transition-transform duration-300 cursor-pointer"
                  style={{ transformOrigin: `${zone.labelX}px ${zone.labelY}px` }}
                  onMouseEnter={() => setActiveZoneId(zone.id)}
                  onMouseLeave={() => setActiveZoneId(null)}
                >
                  {/* Tarjeta esmerilada con borde neón */}
                  <rect
                    x="-18"
                    y="-25"
                    width="36"
                    height="50"
                    rx="8"
                    fill="rgba(10, 16, 28, 0.82)"
                    stroke={isHovered ? '#22d3ee' : style.neonBorder}
                    strokeWidth={isHovered ? '2' : '1.2'}
                    className={isHovered ? 'filter drop-shadow-[0_0_10px_#22d3ee]' : ''}
                  />
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    {pct}%
                  </text>
                  <text
                    x="0"
                    y="13"
                    textAnchor="middle"
                    fill={style.textColor}
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {zone.made}/{zone.attempted}
                  </text>
                </g>
              );
            }

            return (
              <g
                key={`label_${zone.id}`}
                transform={`translate(${zone.labelX}, ${zone.labelY})`}
                className="transition-transform duration-300 cursor-pointer"
                style={{ transformOrigin: `${zone.labelX}px ${zone.labelY}px` }}
                onMouseEnter={() => setActiveZoneId(zone.id)}
                onMouseLeave={() => setActiveZoneId(null)}
              >
                {/* Tarjeta Glassmorphic con desenfoque simulado y borde neón brillante */}
                <rect
                  x="-60"
                  y="-26"
                  width="120"
                  height="52"
                  rx="12"
                  fill="rgba(10, 16, 28, 0.85)"
                  stroke={isHovered ? '#22d3ee' : style.neonBorder}
                  strokeWidth={isHovered ? '2.2' : '1.3'}
                  className={isHovered ? 'filter drop-shadow-[0_0_12px_#22d3ee]' : ''}
                />
                {/* Indicador de estado neón miniatura en esquina */}
                <circle
                  cx="48"
                  cy="-14"
                  r="3.5"
                  fill={isHovered ? '#22d3ee' : style.stroke}
                  className={isHovered ? 'animate-pulse' : ''}
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="17"
                  fontWeight="900"
                  fontFamily="monospace"
                  letterSpacing="-0.5"
                >
                  {pct}%
                </text>
                <text
                  x="0"
                  y="15"
                  textAnchor="middle"
                  fill={style.textColor}
                  fontSize="9.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {zone.shortLabel} ({zone.made}/{zone.attempted})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 5. PANEL INFERIOR DE INSPECCIÓN TÁCTICA HUD CUANDO SE SELECCIONA O PASA EL CURSOR */}
      <div className="relative z-10 mt-5 p-4 rounded-2xl bg-[#090d18]/90 backdrop-blur-md border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Crosshair className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
              // SECTOR TÁCTICO SELECCIONADO
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-black text-white">
                {activeZone ? activeZone.name : 'Pasa el cursor sobre cualquier zona para auditar'}
              </span>
              {activeZone && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCyberHeatStyle(Math.round((activeZone.made / Math.max(1, activeZone.attempted)) * 100)).badgeClass}`}>
                  {getCyberHeatStyle(Math.round((activeZone.made / Math.max(1, activeZone.attempted)) * 100)).tier}
                </span>
              )}
            </div>
          </div>
        </div>

        {activeZone && (
          <div className="flex items-center gap-4 bg-[#060a14] px-4 py-2 rounded-xl border border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] block">ENCStates</span>
              <strong className="text-emerald-400">{activeZone.made} Encestados</strong>
            </div>
            <div className="w-[1px] h-6 bg-zinc-800" />
            <div>
              <span className="text-zinc-500 text-[10px] block">Lanzamientos</span>
              <strong className="text-orange-400">{activeZone.attempted} Intentos</strong>
            </div>
            <div className="w-[1px] h-6 bg-zinc-800" />
            <div>
              <span className="text-zinc-500 text-[10px] block">Efectividad</span>
              <strong className="text-white">
                {Math.round((activeZone.made / Math.max(1, activeZone.attempted)) * 100)}%
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
