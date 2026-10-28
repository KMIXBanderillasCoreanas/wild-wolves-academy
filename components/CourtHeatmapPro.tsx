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

function getHeatStyle(pct: number) {
  if (pct >= 70) {
    return {
      tier: 'Caliente (≥70%)',
      fill: '#c83e1b',
      hoverFill: '#dc4822',
      pillBg: 'rgba(15, 19, 29, 0.86)',
      pillBorder: '#ff7847',
      textColor: '#ffffff'
    };
  }
  if (pct >= 50) {
    return {
      tier: 'Favorable (50-69%)',
      fill: '#c46200',
      hoverFill: '#d96f05',
      pillBg: 'rgba(15, 19, 29, 0.86)',
      pillBorder: '#fbbf24',
      textColor: '#fef3c7'
    };
  }
  if (pct >= 35) {
    return {
      tier: 'Regular (35-49%)',
      fill: '#1e3a5f',
      hoverFill: '#254875',
      pillBg: 'rgba(15, 19, 29, 0.88)',
      pillBorder: '#38bdf8',
      textColor: '#bae6fd'
    };
  }
  return {
    tier: 'Fría (<35%)',
    fill: '#1b263b',
    hoverFill: '#24344d',
    pillBg: 'rgba(15, 19, 29, 0.88)',
    pillBorder: '#64748b',
    textColor: '#94a3b8'
  };
}

export default function CourtHeatmapPro({
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

  // Exact Trigonometric Coordinates on 500x450 Half-Court
  // Hoop Center: (250, 52.5), 3PT Radius R = 215
  // Corner break points: Left (44, 140), Right (456, 140)
  // Wing-to-TopKey ray intersections on 3PT arc:
  // Left Ray: (170, 252) -> Outer Court (130, 440)
  // Right Ray: (330, 252) -> Outer Court (370, 440)
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
  const overallPct = Math.round((totalMade / Math.max(1, totalAttempted)) * 100);

  const bestZone = [...zones].sort(
    (a, b) => b.made / Math.max(1, b.attempted) - a.made / Math.max(1, a.attempted)
  )[0];

  return (
    <div className="w-full rounded-3xl border border-zinc-800 bg-[#07090e] p-4 sm:p-6 text-zinc-100 shadow-2xl font-sans">
      {/* TOP LEGEND BAR */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/90 bg-[#0c101a] px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold tracking-wide">
          <span className="flex items-center gap-2 text-slate-400">
            <span className="h-3 w-3 rounded-full border border-slate-500 bg-[#1b263b]" />
            Fría (&lt;35%)
          </span>
          <span className="flex items-center gap-2 text-sky-400">
            <span className="h-3 w-3 rounded-full border border-sky-400 bg-[#1e3a5f]" />
            Regular (35-49%)
          </span>
          <span className="flex items-center gap-2 text-amber-400">
            <span className="h-3 w-3 rounded-full border border-amber-400 bg-[#c46200]" />
            Favorable (50-69%)
          </span>
          <span className="flex items-center gap-2 text-orange-400">
            <span className="h-3 w-3 rounded-full border border-orange-400 bg-[#c83e1b] shadow-[0_0_8px_#f66018]" />
            Caliente (≥70%)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="rounded-lg border border-zinc-800 bg-[#151926] px-2.5 py-1 text-zinc-300">
            Total: <strong className="text-white">{totalMade}/{totalAttempted}</strong> ({overallPct}%)
          </span>
          <span className="hidden sm:inline-block rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-bold">
            ★ Mejor Zona: {bestZone.shortLabel}
          </span>
        </div>
      </div>

      {/* PRECISION SVG BASKETBALL HALF-COURT */}
      <div className="relative mx-auto max-w-[780px] overflow-hidden rounded-2xl border border-zinc-800 bg-[#090d16] p-2 sm:p-4 shadow-inner">
        <svg
          viewBox="0 0 500 450"
          className="w-full h-auto select-none drop-shadow-xl"
          role="img"
          aria-label="Mapa de Calor Oficial de Tiro Wild Wolves"
        >
          <defs>
            <filter id="courtGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* 1. COLORED HEATMAP ZONES LAYER */}
          {zones.map((zone) => {
            const pct = Math.round((zone.made / Math.max(1, zone.attempted)) * 100);
            const style = getHeatStyle(pct);
            const isHovered = activeZoneId === zone.id;

            return (
              <g
                key={zone.id}
                onMouseEnter={() => setActiveZoneId(zone.id)}
                onMouseLeave={() => setActiveZoneId(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <path
                  d={zone.pathD}
                  fill={isHovered ? style.hoverFill : style.fill}
                  stroke="#090d16"
                  strokeWidth="2"
                  className="transition-colors duration-200"
                />
              </g>
            );
          })}

          {/* 2. OFFICIAL FIBA / NBA WHITE COURT MARKINGS OVERLAY (100% ALIGNED) */}
          <g
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none opacity-95"
          >
            {/* Outer Half-Court Boundary */}
            <rect x="10" y="10" width="480" height="430" />

            {/* Zone Ray Dividers (Subtle Tactical Lines) */}
            <line x1="170" y1="252" x2="130" y2="440" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <line x1="330" y1="252" x2="370" y2="440" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <line x1="10" y1="140" x2="44" y2="140" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            <line x1="456" y1="140" x2="490" y2="140" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />

            {/* The Paint / Key (170 to 330, Y=10 to 200) */}
            <rect x="170" y="10" width="160" height="190" fill="rgba(0,0,0,0.08)" />

            {/* Paint Lane Hash Marks */}
            <line x1="162" y1="80" x2="170" y2="80" />
            <line x1="162" y1="110" x2="170" y2="110" />
            <line x1="162" y1="140" x2="170" y2="140" />
            <line x1="162" y1="170" x2="170" y2="170" />
            <line x1="330" y1="80" x2="338" y2="80" />
            <line x1="330" y1="110" x2="338" y2="110" />
            <line x1="330" y1="140" x2="338" y2="140" />
            <line x1="330" y1="170" x2="338" y2="170" />

            {/* Free Throw Circle: Top Half Dashed (Inside Paint), Bottom Half Solid (Towards Top Key) */}
            <path d="M 190 200 A 60 60 0 0 1 310 200" strokeDasharray="6 6" stroke="rgba(255,255,255,0.8)" />
            <path d="M 190 200 A 60 60 0 0 0 310 200" />

            {/* Three-Point Line: Straight Corners + Exact R=215 Arc Clearing the Key */}
            <path d="M 44 10 L 44 140 A 215 215 0 0 0 456 140 L 456 10" strokeWidth="3" />

            {/* Restricted Area Arc (No-Charge Semi-Circle under Basket) */}
            <path d="M 210 40 L 210 52.5 A 40 40 0 0 0 290 52.5 L 290 40" stroke="rgba(255,255,255,0.85)" />

            {/* Backboard & Orange Rim */}
            <line x1="220" y1="40" x2="280" y2="40" strokeWidth="4" />
            <line x1="250" y1="40" x2="250" y2="44" strokeWidth="3" />
            <circle cx="250" cy="52.5" r="9" stroke="#ff6b2b" strokeWidth="3" fill="rgba(246,96,24,0.25)" />

            {/* Half-Court Center Circle Arc at Bottom */}
            <path d="M 190 440 A 60 60 0 0 1 310 440" stroke="rgba(255,255,255,0.6)" />
            <line x1="10" y1="438" x2="490" y2="438" strokeDasharray="8 6" stroke="rgba(255,255,255,0.5)" />
          </g>

          {/* 3. GLASSMORPHIC DATA PILLS LAYER (ZERO OVERLAP WITH COURT LINES) */}
          {zones.map((zone) => {
            const pct = Math.round((zone.made / Math.max(1, zone.attempted)) * 100);
            const style = getHeatStyle(pct);

            if (zone.compact) {
              return (
                <g
                  key={`label_${zone.id}`}
                  transform={`translate(${zone.labelX}, ${zone.labelY})`}
                  filter="url(#courtGlow)"
                  className="pointer-events-none"
                >
                  <rect
                    x="-16"
                    y="-24"
                    width="32"
                    height="48"
                    rx="7"
                    fill={style.pillBg}
                    stroke={style.pillBorder}
                    strokeWidth="1.2"
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
                    ({zone.made}-{zone.attempted})
                  </text>
                </g>
              );
            }

            return (
              <g
                key={`label_${zone.id}`}
                transform={`translate(${zone.labelX}, ${zone.labelY})`}
                filter="url(#courtGlow)"
                className="pointer-events-none"
              >
                <rect
                  x="-58"
                  y="-24"
                  width="116"
                  height="48"
                  rx="10"
                  fill={style.pillBg}
                  stroke={style.pillBorder}
                  strokeWidth="1.5"
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
        </svg>
      </div>
    </div>
  );
}
