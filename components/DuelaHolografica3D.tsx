'use client';

import React, { useState } from 'react';

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
 * Escala de calor dinámica exacta para la cobertura de zona completa:
 * - >= 70%: Tonos rojos/naranjas intensos (#ef4444 / #f97316)
 * - 50% a 69%: Amarillos/ámbar (#eab308 / #f59e0b)
 * - 35% a 49%: Cian/azul (#06b6d4 / #0284c7)
 * - < 35%: Fría / pizarra (#475569)
 */
function getHeatStyle(pct: number) {
  if (pct >= 70) {
    return {
      tier: 'Caliente (≥70%)',
      fillBase: 'rgba(239, 68, 68, 0.40)',
      fillHover: 'rgba(239, 68, 68, 0.75)',
      strokeBase: '#f97316',
      strokeHover: '#ff5722',
      glow: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))',
      pillBg: 'rgba(15, 19, 29, 0.88)',
      pillBorder: '#ff5722',
      textColor: '#fed7aa',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40'
    };
  }
  if (pct >= 50) {
    return {
      tier: 'Favorable (50-69%)',
      fillBase: 'rgba(234, 179, 8, 0.35)',
      fillHover: 'rgba(245, 158, 11, 0.70)',
      strokeBase: '#eab308',
      strokeHover: '#fbbf24',
      glow: 'drop-shadow(0 0 16px rgba(234, 179, 8, 0.85))',
      pillBg: 'rgba(15, 19, 29, 0.88)',
      pillBorder: '#fbbf24',
      textColor: '#fef08a',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    };
  }
  if (pct >= 35) {
    return {
      tier: 'Regular (35-49%)',
      fillBase: 'rgba(6, 182, 212, 0.30)',
      fillHover: 'rgba(14, 165, 233, 0.65)',
      strokeBase: '#06b6d4',
      strokeHover: '#38bdf8',
      glow: 'drop-shadow(0 0 16px rgba(6, 182, 212, 0.85))',
      pillBg: 'rgba(15, 19, 29, 0.88)',
      pillBorder: '#38bdf8',
      textColor: '#bae6fd',
      badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
    };
  }
  return {
    tier: 'Fría (<35%)',
    fillBase: 'rgba(71, 85, 105, 0.28)',
    fillHover: 'rgba(100, 116, 139, 0.60)',
    strokeBase: '#64748b',
    strokeHover: '#94a3b8',
    glow: 'drop-shadow(0 0 12px rgba(100, 116, 139, 0.6))',
    pillBg: 'rgba(15, 19, 29, 0.88)',
    pillBorder: '#64748b',
    textColor: '#94a3b8',
    badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700'
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

  // Exact Trigonometric Coordinates on 500x450 Half-Court (2D Zenital View Original)
  // Hoop Center: (250, 52.5), 3PT Radius R = 215
  // Corner break points: Left (44, 140), Right (456, 140)
  // Wing-to-TopKey rays on 3PT arc:
  // Left: (170, 252) -> Outer Court (130, 440)
  // Right: (330, 252) -> Outer Court (370, 440)
  const zones: ZoneConfig[] = [
    {
      id: 'corner_left',
      name: '3P Esquina Izquierda',
      shortLabel: 'Esq Izq',
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
      shortLabel: 'Esq Der',
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
      name: 'Triple Centro (Top of the Key)',
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
    <div className="relative w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#07090e] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl font-sans select-none">
      {/* 1. CABECERA ORIGINAL LIMPIA CON EFECTIVIDAD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
            Shot Science 2D // Mapa Oficial
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
            Duela de Tiro & Cobertura Térmica
          </h3>
          <p className="text-xs text-zinc-400">
            Pasa el cursor sobre cualquier sector para iluminar el área poligonal completa según su efectividad.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#10141d] px-4 py-2 rounded-2xl border border-zinc-800">
          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Eficacia Global</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">{overallPct}%</span>
              <span className="text-[11px] font-mono text-zinc-500">({totalMade}/{totalAttempted})</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/50 font-bold">
            🎯
          </div>
        </div>
      </div>

      {/* 2. LEYENDA TÉRMICA ESTÁNDAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs font-mono">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#10141d] border border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-zinc-300">Caliente (≥70%)</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#10141d] border border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="text-zinc-300">Favorable (50-69%)</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#10141d] border border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-zinc-300">Regular (35-49%)</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#10141d] border border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-600 to-zinc-700 shadow-[0_0_6px_rgba(100,116,139,0.5)]" />
          <span className="text-zinc-300">Fría (&lt;35%)</span>
        </div>
      </div>

      {/* 3. DUELA 2D CENITAL ORIGINAL CON POLÍGONOS DE COBERTURA COMPLETA */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#0a0d14] border border-zinc-800/80 p-2 sm:p-4">
        <svg
          viewBox="0 0 500 450"
          className="w-full h-auto select-none"
          style={{ maxHeight: '560px' }}
        >
          <defs>
            {/* Filtro de resplandor para las tarjetas flotantes */}
            <filter id="courtGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            {/* Filtro de resplandor Neón Cian para las líneas de la duela */}
            <filter id="courtLinesNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* FONDO BASE DE DUELA DE MADERA OSCURA */}
          <rect x="0" y="0" width="500" height="450" rx="14" fill="#0d1117" />

          {/* CAPA 1: POLÍGONOS DE COBERTURA DE ZONA COMPLETA (SE ILUMINAN AL 100% EN HOVER) */}
          <g id="heatmap-polygons">
            {zones.map((zone) => {
              const pct = Math.round((zone.made / Math.max(1, zone.attempted)) * 100);
              const style = getHeatStyle(pct);
              const isHovered = activeZoneId === zone.id;

              return (
                <path
                  key={`poly_${zone.id}`}
                  d={zone.pathD}
                  fill={isHovered ? style.fillHover : style.fillBase}
                  stroke={isHovered ? style.strokeHover : style.strokeBase}
                  strokeWidth={isHovered ? '2.5' : '1'}
                  strokeOpacity={isHovered ? '1' : '0.35'}
                  style={{
                    filter: isHovered ? style.glow : 'none',
                    transition: 'all 250ms ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setActiveZoneId(zone.id)}
                  onMouseLeave={() => setActiveZoneId(null)}
                />
              );
            })}
          </g>

          {/* CAPA 2: LÍNEAS REGLAMENTARIAS AZUL / CIAN NEÓN QUE CRUZAN POR ENCIMA DE LOS RELLENOS */}
          <g
            stroke="#06b6d4"
            strokeWidth="2.2"
            fill="none"
            filter="url(#courtLinesNeonGlow)"
            className="pointer-events-none"
            opacity="0.95"
          >
            {/* Perímetro de la media cancha */}
            <rect x="10" y="10" width="480" height="430" rx="4" stroke="#06b6d4" strokeWidth="2.5" />

            {/* Líneas de esquina recta de triple */}
            <line x1="44" y1="10" x2="44" y2="140" stroke="#06b6d4" strokeWidth="2.5" />
            <line x1="456" y1="10" x2="456" y2="140" stroke="#06b6d4" strokeWidth="2.5" />

            {/* Llave / Pintura Reglamentaria (170 a 330, Y=10 a 200) */}
            <rect x="170" y="10" width="160" height="190" fill="rgba(6, 182, 212, 0.05)" stroke="#06b6d4" strokeWidth="2.2" />

            {/* Marcas de rebote en los postes de la llave */}
            <line x1="162" y1="80" x2="170" y2="80" stroke="#22d3ee" strokeWidth="2" />
            <line x1="162" y1="110" x2="170" y2="110" stroke="#22d3ee" strokeWidth="2" />
            <line x1="162" y1="140" x2="170" y2="140" stroke="#22d3ee" strokeWidth="2" />
            <line x1="162" y1="170" x2="170" y2="170" stroke="#22d3ee" strokeWidth="2" />
            <line x1="330" y1="80" x2="338" y2="80" stroke="#22d3ee" strokeWidth="2" />
            <line x1="330" y1="110" x2="338" y2="110" stroke="#22d3ee" strokeWidth="2" />
            <line x1="330" y1="140" x2="338" y2="140" stroke="#22d3ee" strokeWidth="2" />
            <line x1="330" y1="170" x2="338" y2="170" stroke="#22d3ee" strokeWidth="2" />

            {/* Círculo de Tiro Libre */}
            <path d="M 190 200 A 60 60 0 0 1 310 200" strokeDasharray="6 6" stroke="#22d3ee" strokeWidth="2" />
            <path d="M 190 200 A 60 60 0 0 0 310 200" stroke="#06b6d4" strokeWidth="2.2" />

            {/* Arco de 3 Puntos Reglamentario FIBA (R=215 con vértice exacto) */}
            <path d="M 44 140 A 215 215 0 0 0 456 140" stroke="#06b6d4" strokeWidth="2.8" />

            {/* Semicírculo de no-carga bajo el aro */}
            <path d="M 210 40 L 210 52.5 A 40 40 0 0 0 290 52.5 L 290 40" stroke="#38bdf8" strokeWidth="2" />

            {/* Tablero y Aro Naranja Neón */}
            <line x1="220" y1="40" x2="280" y2="40" strokeWidth="4" stroke="#ffffff" />
            <line x1="250" y1="40" x2="250" y2="44" strokeWidth="3" stroke="#f97316" />
            <circle cx="250" cy="52.5" r="9" stroke="#f97316" strokeWidth="3" fill="rgba(249,115,22,0.35)" />

            {/* Círculo Central de media cancha */}
            <path d="M 190 440 A 60 60 0 0 1 310 440" stroke="#06b6d4" strokeWidth="2.2" />
            <line x1="10" y1="438" x2="490" y2="438" strokeDasharray="8 6" stroke="#06b6d4" strokeWidth="2" />
          </g>

          {/* CAPA 3: TARJETAS DE PORCENTAJE FLOTANTES ORIGINALES (GLASSMORPHISM CON ZERO OVERLAP) */}
          <g id="heatmap-pills">
            {zones.map((zone) => {
              const pct = Math.round((zone.made / Math.max(1, zone.attempted)) * 100);
              const style = getHeatStyle(pct);
              const isHovered = activeZoneId === zone.id;

              if (zone.compact) {
                return (
                  <g
                    key={`label_${zone.id}`}
                    transform={`translate(${zone.labelX}, ${zone.labelY})`}
                    filter="url(#courtGlow)"
                    className="cursor-pointer transition-transform duration-200"
                    style={{
                      transformOrigin: `${zone.labelX}px ${zone.labelY}px`,
                      transform: isHovered ? `translate(${zone.labelX}px, ${zone.labelY}px) scale(1.08)` : `translate(${zone.labelX}px, ${zone.labelY}px)`
                    }}
                    onMouseEnter={() => setActiveZoneId(zone.id)}
                    onMouseLeave={() => setActiveZoneId(null)}
                  >
                    <rect
                      x="-16"
                      y="-24"
                      width="32"
                      height="48"
                      rx="7"
                      fill={isHovered ? 'rgba(15, 23, 42, 0.96)' : style.pillBg}
                      stroke={isHovered ? style.strokeHover : style.pillBorder}
                      strokeWidth={isHovered ? '2' : '1.2'}
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="900"
                      fontFamily="system-ui, sans-serif"
                    >
                      {pct}%
                    </text>
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fill={style.textColor}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {zone.made}-{zone.attempted}
                    </text>
                  </g>
                );
              }

              return (
                <g
                  key={`label_${zone.id}`}
                  transform={`translate(${zone.labelX}, ${zone.labelY})`}
                  filter="url(#courtGlow)"
                  className="cursor-pointer transition-transform duration-200"
                  style={{
                    transformOrigin: `${zone.labelX}px ${zone.labelY}px`,
                    transform: isHovered ? `translate(${zone.labelX}px, ${zone.labelY}px) scale(1.06)` : `translate(${zone.labelX}px, ${zone.labelY}px)`
                  }}
                  onMouseEnter={() => setActiveZoneId(zone.id)}
                  onMouseLeave={() => setActiveZoneId(null)}
                >
                  <rect
                    x="-58"
                    y="-24"
                    width="116"
                    height="48"
                    rx="10"
                    fill={isHovered ? 'rgba(15, 23, 42, 0.96)' : style.pillBg}
                    stroke={isHovered ? style.strokeHover : style.pillBorder}
                    strokeWidth={isHovered ? '2.2' : '1.5'}
                  />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="16"
                    fontWeight="900"
                    fontFamily="system-ui, sans-serif"
                  >
                    {pct}%
                  </text>
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    fill={style.textColor}
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                  >
                    {zone.shortLabel} ({zone.made}-{zone.attempted})
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 4. BARRA INFERIOR DE DETALLE TÁCTICO POR ZONA */}
      <div className="mt-4 p-3.5 rounded-2xl bg-[#10141d] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
          <span className="text-zinc-400 font-mono">SECTOR ACTIVO:</span>
          <strong className="text-white font-bold">
            {activeZone ? activeZone.name : 'Pasa el cursor sobre la duela para auditar cada zona'}
          </strong>
          {activeZone && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ml-1 ${getHeatStyle(Math.round((activeZone.made / Math.max(1, activeZone.attempted)) * 100)).badgeClass}`}>
              {getHeatStyle(Math.round((activeZone.made / Math.max(1, activeZone.attempted)) * 100)).tier}
            </span>
          )}
        </div>

        {activeZone && (
          <div className="flex items-center gap-3 font-mono text-zinc-300">
            <span>
              Aciertos: <strong className="text-emerald-400">{activeZone.made}</strong>
            </span>
            <span className="text-zinc-600">|</span>
            <span>
              Intentos: <strong className="text-orange-400">{activeZone.attempted}</strong>
            </span>
            <span className="text-zinc-600">|</span>
            <span>
              Efectividad: <strong className="text-white">{Math.round((activeZone.made / Math.max(1, activeZone.attempted)) * 100)}%</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
