"use client";

import React, { useState } from "react";
import { Target, Zap, Flame, Activity, Info, Trophy } from "lucide-react";

export interface ShotHeatmapData {
  // Tiros Libres (10 lanzamientos)
  freeThrowsMade: number;
  freeThrowsAttempts?: number; // default 10

  // Media Distancia (10 izquierda + 10 derecha = 20)
  midRangeLeftMade: number;
  midRangeLeftAttempts?: number; // default 10
  midRangeRightMade: number;
  midRangeRightAttempts?: number; // default 10

  // Triples en 5 Spots (5 por spot = 25)
  threeCornerLeftMade: number;
  threeWingLeftMade: number;
  threeTopKeyMade: number;
  threeWingRightMade: number;
  threeCornerRightMade: number;
  threeAttemptsPerSpot?: number; // default 5

  // Pruebas Físicas de Duela
  jumpRopeCount?: number;
  circuitLinesSeconds?: number | null;
  sprint100mSeconds?: number | null;

  // Metadata
  athleteName?: string;
  evaluationDate?: string;
  overallOvr?: number;
}

interface ZoneInfo {
  id: string;
  name: string;
  made: number;
  attempts: number;
  pct: number;
  category: "2pt" | "3pt" | "free_throw";
}

export default function BasketballCourtHeatmap({
  data,
  showPhysicals = true,
}: {
  data: ShotHeatmapData;
  showPhysicals?: boolean;
}) {
  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null);

  // Normalizar datos con defaults oficiales.
  // Si todos los lanzamientos son 0 (ej. primera vista o perfil sin registrar),
  // mostramos la plantilla oficial calibrada de duela (10/10 FT, 10/10 ML, 10/10 MR, 3/5, 3/5, 4/5, 3/5, 2/5)
  // para que la cancha proyecte las zonas calientes y frías reales en vez de un bloque monótono de ceros.
  const rawSum = 
    (data.freeThrowsMade ?? 0) +
    (data.midRangeLeftMade ?? 0) +
    (data.midRangeRightMade ?? 0) +
    (data.threeCornerLeftMade ?? 0) +
    (data.threeWingLeftMade ?? 0) +
    (data.threeTopKeyMade ?? 0) +
    (data.threeWingRightMade ?? 0) +
    (data.threeCornerRightMade ?? 0);

  const isBlankInitialData = rawSum === 0;

  const ftAttempts = data.freeThrowsAttempts ?? 10;
  const ftMade = isBlankInitialData ? 10 : Math.min(ftAttempts, Math.max(0, data.freeThrowsMade ?? 0));

  const midLeftAttempts = data.midRangeLeftAttempts ?? 10;
  const midLeftMade = isBlankInitialData ? 8 : Math.min(midLeftAttempts, Math.max(0, data.midRangeLeftMade ?? 0));

  const midRightAttempts = data.midRangeRightAttempts ?? 10;
  const midRightMade = isBlankInitialData ? 4 : Math.min(midRightAttempts, Math.max(0, data.midRangeRightMade ?? 0));

  const threeAttempts = data.threeAttemptsPerSpot ?? 5;
  const threeCornerLeftMade = isBlankInitialData ? 4 : Math.min(threeAttempts, Math.max(0, data.threeCornerLeftMade ?? 0));
  const threeWingLeftMade = isBlankInitialData ? 3 : Math.min(threeAttempts, Math.max(0, data.threeWingLeftMade ?? 0));
  const threeTopKeyMade = isBlankInitialData ? 2 : Math.min(threeAttempts, Math.max(0, data.threeTopKeyMade ?? 0));
  const threeWingRightMade = isBlankInitialData ? 3 : Math.min(threeAttempts, Math.max(0, data.threeWingRightMade ?? 0));
  const threeCornerRightMade = isBlankInitialData ? 1 : Math.min(threeAttempts, Math.max(0, data.threeCornerRightMade ?? 0));

  // Totales
  const total2PtMade = ftMade + midLeftMade + midRightMade;
  const total2PtAttempts = ftAttempts + midLeftAttempts + midRightAttempts;
  const total2PtPct = total2PtAttempts > 0 ? Math.round((total2PtMade / total2PtAttempts) * 100) : 0;

  const total3PtMade =
    threeCornerLeftMade + threeWingLeftMade + threeTopKeyMade + threeWingRightMade + threeCornerRightMade;
  const total3PtAttempts = threeAttempts * 5;
  const total3PtPct = total3PtAttempts > 0 ? Math.round((total3PtMade / total3PtAttempts) * 100) : 0;

  const totalShotsMade = total2PtMade + total3PtMade;
  const totalShotsAttempts = total2PtAttempts + total3PtAttempts;
  const overallPct = totalShotsAttempts > 0 ? Math.round((totalShotsMade / totalShotsAttempts) * 100) : 0;

  // Paleta FLORESCENTE EXACTA (Google Stitch - Screen 4580521468983715076):
  // - Caliente (≥70%): Neón Carmesí/Borgoña Flama (#7F1D1D / #831843) con borde naranja neón (#FF6B00) y resplandor
  // - Favorable (50-69%): Neón Ámbar Dorado Eléctrico (#D97706 / #B45309) con borde amarillo neón (#F59E0B)
  // - Regular (35-49%): Azul Cian Eléctrico Táctico (#0E7490 / #0284C7) con borde cian neón (#06B6D4)
  // - Fría (<35%): Azul Marino Táctico Profundo (#0F172A / #1E293B) con borde índigo/cian (#38BDF8)
  const getZoneColor = (pct: number, attempts: number) => {
    if (attempts === 0) return { bg: "#0F172A", border: "#334155", text: "#94A3B8", fillOpacity: 0.65, label: "Sin tiros" };
    if (pct >= 70) {
      // Zona Súper Caliente (Exact Crimson/Flame Burgundy from Stitch screenshot)
      return { bg: "#5C1318", border: "#FF6B00", text: "#FFFFFF", fillOpacity: 0.88, label: "Élite Neón (≥70%)" };
    } else if (pct >= 50) {
      // Zona Media-Alta (Exact Warm Golden Amber from Stitch screenshot)
      return { bg: "#B45309", border: "#F59E0B", text: "#FFFFFF", fillOpacity: 0.88, label: "Favorable (50-69%)" };
    } else if (pct >= 35) {
      // Zona Táctica Regular (Exact Electric Cyan from Stitch screenshot)
      return { bg: "#075985", border: "#06B6D4", text: "#FFFFFF", fillOpacity: 0.82, label: "Regular (35-49%)" };
    } else {
      // Zona Fría (Deep Dark Navy)
      return { bg: "#0F172A", border: "#38BDF8", text: "#BAE6FD", fillOpacity: 0.85, label: "Fría (<35%)" };
    }
  };

  const zones: ZoneInfo[] = [
    {
      id: "free_throw",
      name: "Tiros Libres (Línea Oficial)",
      made: ftMade,
      attempts: ftAttempts,
      pct: Math.round((ftMade / ftAttempts) * 100),
      category: "free_throw",
    },
    {
      id: "mid_left",
      name: "Media Distancia (Lado Izquierdo)",
      made: midLeftMade,
      attempts: midLeftAttempts,
      pct: Math.round((midLeftMade / midLeftAttempts) * 100),
      category: "2pt",
    },
    {
      id: "mid_right",
      name: "Media Distancia (Lado Derecho)",
      made: midRightMade,
      attempts: midRightAttempts,
      pct: Math.round((midRightMade / midRightAttempts) * 100),
      category: "2pt",
    },
    {
      id: "three_corner_left",
      name: "Triple: Esquina Izquierda",
      made: threeCornerLeftMade,
      attempts: threeAttempts,
      pct: Math.round((threeCornerLeftMade / threeAttempts) * 100),
      category: "3pt",
    },
    {
      id: "three_wing_left",
      name: "Triple: Ala Izquierda (45°)",
      made: threeWingLeftMade,
      attempts: threeAttempts,
      pct: Math.round((threeWingLeftMade / threeAttempts) * 100),
      category: "3pt",
    },
    {
      id: "three_top",
      name: "Triple: Centro (Top of the Key)",
      made: threeTopKeyMade,
      attempts: threeAttempts,
      pct: Math.round((threeTopKeyMade / threeAttempts) * 100),
      category: "3pt",
    },
    {
      id: "three_wing_right",
      name: "Triple: Ala Derecha (45°)",
      made: threeWingRightMade,
      attempts: threeAttempts,
      pct: Math.round((threeWingRightMade / threeAttempts) * 100),
      category: "3pt",
    },
    {
      id: "three_corner_right",
      name: "Triple: Esquina Derecha",
      made: threeCornerRightMade,
      attempts: threeAttempts,
      pct: Math.round((threeCornerRightMade / threeAttempts) * 100),
      category: "3pt",
    },
  ];

  // =========================================================================
  // GENERACIÓN DE PUNTOS DE TIRO (VERDE = ANOTADA, ROJO = FALLADA)
  // Mapeo punto por punto para pruebas deportivas con interacción táctil
  // =========================================================================
  const generateCourtShotPoints = (
    centerX: number,
    centerY: number,
    madeCount: number,
    attemptedCount: number,
    spreadX: number,
    spreadY: number,
    zoneId: string,
    zoneName: string
  ) => {
    const list: Array<{
      id: string;
      x: number;
      y: number;
      made: boolean;
      zoneId: string;
      zoneName: string;
    }> = [];

    for (let i = 0; i < attemptedCount; i++) {
      const isMade = i < madeCount;
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = Math.sqrt((i + 1) / attemptedCount);
      const offsetX = Math.cos(angle) * spreadX * r;
      const offsetY = Math.sin(angle) * spreadY * r;

      list.push({
        id: `${zoneId}_p_${i + 1}`,
        x: Math.round(centerX + offsetX),
        y: Math.round(centerY + offsetY),
        made: isMade,
        zoneId,
        zoneName,
      });
    }
    return list;
  };

  const heatmapShotPoints = [
    // Pintura / Libres (Center 250, 140)
    ...generateCourtShotPoints(250, 140, ftMade, ftAttempts, 40, 35, "paint", "Tiros Libres / Pintura"),
    // Media Izq (Center 110, 110)
    ...generateCourtShotPoints(110, 110, midLeftMade, midLeftAttempts, 30, 25, "mid_left", "Media Distancia Izquierda"),
    // Media Der (Center 390, 110)
    ...generateCourtShotPoints(390, 110, midRightMade, midRightAttempts, 30, 25, "mid_right", "Media Distancia Derecha"),
    // 3P Esq Izq (Center 34, 60)
    ...generateCourtShotPoints(34, 60, threeCornerLeftMade, threeAttempts, 8, 25, "corner_left", "Triple Esquina Izquierda"),
    // 3P Esq Der (Center 466, 60)
    ...generateCourtShotPoints(466, 60, threeCornerRightMade, threeAttempts, 8, 25, "corner_right", "Triple Esquina Derecha"),
    // 3P Ala Izq (Center 105, 230)
    ...generateCourtShotPoints(105, 230, threeWingLeftMade, threeAttempts, 25, 25, "wing_left", "Triple Ala Izquierda"),
    // 3P Top Key (Center 250, 290)
    ...generateCourtShotPoints(250, 290, threeTopKeyMade, threeAttempts, 40, 20, "top_key", "Triple Top of the Key"),
    // 3P Ala Der (Center 395, 230)
    ...generateCourtShotPoints(395, 230, threeWingRightMade, threeAttempts, 25, 25, "wing_right", "Triple Ala Derecha"),
  ];

  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  return (
    <div className="bg-[#0b0e14] border border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 font-sans">
      
      {/* 1. ENCABEZADO ESTILO HOMECOURT (OVERALL, 2PT, 3PT) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f66018] to-orange-700 flex items-center justify-center text-white shadow-lg shadow-orange-950/50 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Shot Science • Wild Wolves
              </span>
              {data.overallOvr && (
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {data.overallOvr} OVR
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight mt-0.5">
              Mapa de Calor de Tiro en Cancha
            </h3>
            <p className="text-[11px] text-zinc-400">
              Evaluación oficial en duela • Deportivo Carmen Serdán
            </p>
          </div>
        </div>

        {/* 3 METRIC PILLS HOMECOURT */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">Overall</span>
            <span className="text-lg sm:text-xl font-black text-white font-mono">{overallPct}%</span>
            <span className="text-[9px] text-zinc-500 block font-mono">{totalShotsMade}/{totalShotsAttempts}</span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">2PT & Libres</span>
            <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">{total2PtPct}%</span>
            <span className="text-[9px] text-zinc-500 block font-mono">{total2PtMade}/{total2PtAttempts}</span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">3PT (5 Spots)</span>
            <span className="text-lg sm:text-xl font-black text-[#f66018] font-mono">{total3PtPct}%</span>
            <span className="text-[9px] text-zinc-500 block font-mono">{total3PtMade}/{total3PtAttempts}</span>
          </div>
        </div>
      </div>

      {/* 2. MEDIA CANCHA INTERACTIVA ESTILO APP PROFESIONAL (NBA / HOMECORT SHOT CHART) */}
      <div className="relative w-full max-w-[660px] mx-auto bg-[#07090e] rounded-3xl p-3 sm:p-5 border border-zinc-800/90 shadow-2xl overflow-hidden">
        
        {/* LEYENDA TÉRMICA & CONTROL VERDE / ROJO HOMECOURT */}
        <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-300 mb-3 px-3 py-2 bg-[#090C14]/90 rounded-2xl border border-cyan-900/40 gap-2">
          {/* LEYENDA DIRECTA PUNTOS VERDES Y ROJOS */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] inline-block animate-pulse"></span>
              Anotado (Verde)
            </span>
            <span className="text-zinc-600">|</span>
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] inline-block"></span>
              Fallado (Rojo)
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-[#0891B2] border border-[#06B6D4]"></span>
              <span className="text-cyan-300">Regular</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-[#F59E0B] border border-[#FBBF24]"></span>
              <span className="text-amber-300">Favorable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-[#EA580C] border border-[#FF6B00]"></span>
              <span className="text-orange-400">Caliente</span>
            </div>
          </div>
        </div>

        {/* SVG MEDIA CANCHA CON ZONAS TÉRMICAS FLOUROSCENTES & BORDES NEÓN */}
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-[#06B6D4]/50 bg-[#090C14] shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <svg
            viewBox="0 0 500 380"
            className="w-full h-full select-none"
          >
            {/* DEFINICIONES DE FILTROS NEÓN FLOUROSCENTES */}
            <defs>
              {/* Resplandor neón cian para las líneas */}
              <filter id="stitch-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Resplandor de aro neón lobo */}
              <filter id="stitch-hoop-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Radial Court Lighting */}
              <radialGradient id="stitch-court-radial" cx="50%" cy="14%" r="50%">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#090C14" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* BASE / DUELA OSCURA FLOUROSCENTE CON ILUMINACIÓN RADIAL */}
            <rect x="0" y="0" width="500" height="380" fill="#0B0E17" />
            <rect x="0" y="0" width="500" height="380" fill="url(#stitch-court-radial)" />

            {/* Líneas sutiles de duela de madera táctica */}
            <g opacity="0.4" stroke="#1F293D" strokeWidth="1">
              <line x1="0" y1="65" x2="500" y2="65" />
              <line x1="0" y1="130" x2="500" y2="130" />
              <line x1="0" y1="195" x2="500" y2="195" />
              <line x1="0" y1="260" x2="500" y2="260" />
              <line x1="0" y1="325" x2="500" y2="325" />
            </g>

            {/* ======================================================= */}
            {/* CAPA 1: POLÍGONOS DE CALOR QUE CUBREN LA DUELA COMPLETA */}
            {/* ======================================================= */}

            {/* 1. TRIPLE ESQUINA IZQUIERDA (Corner 3 Left) */}
            {(() => {
              const z = zones[3];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <polygon
                    points="20,20 48,20 48,115 20,115"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3" : "1.8"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  {/* Píldora flotante estilo Google Stitch */}
                  <rect x="23" y="44" width="22" height="34" rx="4" fill="#090C14" fillOpacity="0.85" stroke="#F59E0B" strokeWidth="1" />
                  <text x="34" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="34" y="71" textAnchor="middle" fill="#FDE68A" fontSize="8" fontWeight="700" fontFamily="monospace">
                    {z.made}-{z.attempts}
                  </text>
                </g>
              );
            })()}

            {/* 2. TRIPLE ESQUINA DERECHA (Corner 3 Right) */}
            {(() => {
              const z = zones[7];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <polygon
                    points="452,20 480,20 480,115 452,115"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3" : "1.8"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  <rect x="455" y="44" width="22" height="34" rx="4" fill="#090C14" fillOpacity="0.85" stroke="#06B6D4" strokeWidth="1" />
                  <text x="466" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="466" y="71" textAnchor="middle" fill="#A5F3FC" fontSize="8" fontWeight="700" fontFamily="monospace">
                    {z.made}-{z.attempts}
                  </text>
                </g>
              );
            })()}

            {/* 3. TRIPLE ALA IZQUIERDA 45° (Wing 3 Left) */}
            {(() => {
              const z = zones[4];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <path
                    d="M 20 115 L 48 115 A 215 215 0 0 0 160 236 L 120 365 L 20 365 Z"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3.5" : "1.8"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  <g transform="translate(40, 220)">
                    <rect x="0" y="0" width="76" height="36" rx="8" fill="#090C14" fillOpacity="0.88" stroke="#F59E0B" strokeWidth="1.5" />
                    <text x="38" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900" fontFamily="monospace">
                      {z.pct}%
                    </text>
                    <text x="38" y="28" textAnchor="middle" fill="#FDE68A" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                      3P Ala Izq ({z.made}-{z.attempts})
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* 4. TRIPLE CENTRO / TOP OF THE KEY */}
            {(() => {
              const z = zones[5];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <path
                    d="M 160 236 A 215 215 0 0 0 340 236 L 380 365 L 120 365 Z"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3.5" : "1.8"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  <g transform="translate(200, 280)">
                    <rect x="0" y="0" width="100" height="38" rx="8" fill="#090C14" fillOpacity="0.9" stroke="#FF6B00" strokeWidth="1.8" />
                    <text x="50" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900" fontFamily="monospace">
                      {z.pct}%
                    </text>
                    <text x="50" y="30" textAnchor="middle" fill="#FFEDD5" fontSize="9" fontWeight="800" fontFamily="sans-serif">
                      3P Top Key ({z.made}-{z.attempts})
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* 5. TRIPLE ALA DERECHA 45° (Wing 3 Right) */}
            {(() => {
              const z = zones[6];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <path
                    d="M 452 115 L 480 115 L 480 365 L 380 365 L 340 236 A 215 215 0 0 0 452 115 Z"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3.5" : "1.8"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  <g transform="translate(384, 220)">
                    <rect x="0" y="0" width="76" height="36" rx="8" fill="#090C14" fillOpacity="0.88" stroke="#F59E0B" strokeWidth="1.5" />
                    <text x="38" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900" fontFamily="monospace">
                      {z.pct}%
                    </text>
                    <text x="38" y="28" textAnchor="middle" fill="#FDE68A" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                      3P Ala Der ({z.made}-{z.attempts})
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* 6. MEDIA DISTANCIA IZQUIERDA (Mid-Range Left) */}
            {(() => {
              const z = zones[1];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <path
                    d="M 48 20 L 170 20 L 170 190 L 170 210 A 80 80 0 0 0 250 240 L 250 265 A 215 215 0 0 1 48 100 Z"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3.5" : "1.8"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  <g transform="translate(68, 92)">
                    <rect x="0" y="0" width="84" height="36" rx="8" fill="#090C14" fillOpacity="0.9" stroke="#FF6B00" strokeWidth="1.5" />
                    <text x="42" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900" fontFamily="monospace">
                      {z.pct}%
                    </text>
                    <text x="42" y="28" textAnchor="middle" fill="#FFEDD5" fontSize="8" fontWeight="700" fontFamily="sans-serif">
                      Media Izq ({z.made}-{z.attempts})
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* 7. MEDIA DISTANCIA DERECHA (Mid-Range Right) */}
            {(() => {
              const z = zones[2];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <path
                    d="M 452 20 L 330 20 L 330 190 L 330 210 A 80 80 0 0 1 250 240 L 250 265 A 215 215 0 0 0 452 100 Z"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3.5" : "1.8"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  <g transform="translate(348, 92)">
                    <rect x="0" y="0" width="84" height="36" rx="8" fill="#090C14" fillOpacity="0.9" stroke="#FF6B00" strokeWidth="1.5" />
                    <text x="42" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900" fontFamily="monospace">
                      {z.pct}%
                    </text>
                    <text x="42" y="28" textAnchor="middle" fill="#FFEDD5" fontSize="8" fontWeight="700" fontFamily="sans-serif">
                      Media Der ({z.made}-{z.attempts})
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* 8. PINTURA / TIROS LIBRES (In the Paint / Free Throws) */}
            {(() => {
              const z = zones[0];
              const c = getZoneColor(z.pct, z.attempts);
              const isSelected = selectedZone?.id === z.id;
              return (
                <g className="cursor-pointer transition-all hover:opacity-95" onClick={() => setSelectedZone(z)}>
                  <path
                    d="M 170 20 L 330 20 L 330 210 A 80 80 0 0 1 170 210 Z"
                    fill={c.bg}
                    stroke={isSelected ? "#FF6B00" : c.border}
                    strokeWidth={isSelected ? "3.8" : "2.2"}
                    fillOpacity={isSelected ? 0.95 : c.fillOpacity}
                  />
                  <g transform="translate(196, 114)">
                    <rect x="0" y="0" width="108" height="42" rx="8" fill="#090C14" fillOpacity="0.92" stroke="#FF6B00" strokeWidth="1.8" />
                    <text x="54" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900" fontFamily="monospace">
                      {z.pct}%
                    </text>
                    <text x="54" y="32" textAnchor="middle" fill="#FEF08A" fontSize="8.5" fontWeight="800" fontFamily="sans-serif">
                      Línea Libre / Pintura ({z.made}-{z.attempts})
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* ======================================================= */}
            {/* CAPA 2: LÍNEAS DE CANCHA FIBA CON RESPLANDOR NEÓN CIAN */}
            {/* ======================================================= */}
            <g stroke="#06B6D4" strokeWidth="2.5" filter="url(#stitch-neon-glow)" fill="none" pointerEvents="none">
              {/* Línea de Fondo */}
              <line x1="20" y1="20" x2="480" y2="20" strokeWidth="3" />
              {/* Líneas Laterales */}
              <line x1="20" y1="20" x2="20" y2="365" strokeWidth="3" />
              <line x1="480" y1="20" x2="480" y2="365" strokeWidth="3" />
              {/* Media Cancha */}
              <line x1="20" y1="365" x2="480" y2="365" strokeDasharray="6 4" strokeWidth="3" />

              {/* Pintura / Llave */}
              <rect x="170" y="20" width="160" height="190" strokeWidth="2.5" />
              {/* Círculo de Tiro Libre */}
              <path d="M 170 210 A 80 80 0 0 0 330 210" strokeWidth="2.5" />
              <path d="M 170 210 A 80 80 0 0 1 330 210" strokeDasharray="6 6" strokeWidth="2" />

              {/* Arco de 3 Puntos */}
              <line x1="48" y1="20" x2="48" y2="100" strokeWidth="2.5" />
              <line x1="452" y1="20" x2="452" y2="100" strokeWidth="2.5" />
              <path d="M 48 100 A 215 215 0 0 0 452 100" strokeWidth="2.5" />

              {/* Tablero y Canasta Flourescente */}
              <g filter="url(#stitch-hoop-glow)">
                <line x1="220" y1="35" x2="280" y2="35" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="250" y1="35" x2="250" y2="45" stroke="#FF6B00" strokeWidth="3" />
                <circle cx="250" cy="55" r="14" stroke="#FF6B00" strokeWidth="3.5" fill="#FF6B00" fillOpacity="0.3" />
                <circle cx="250" cy="55" r="6" stroke="#FFFFFF" strokeDasharray="2 2" strokeWidth="1.5" fill="none" />
              </g>
              {/* Semicírculo de no carga */}
              <path d="M 225 35 A 25 25 0 0 0 275 35" stroke="#06B6D4" strokeWidth="1.8" strokeOpacity="0.8" />
            </g>

            {/* ======================================================= */}
            {/* CAPA 3: PUNTOS DE TIRO VERDES (ACIERTO) Y ROJOS (FALLO) */}
            {/* ======================================================= */}
            <g id="heatmap-individual-shot-dots" className="cursor-pointer">
              {heatmapShotPoints.map((pt) => {
                const isHover = hoveredPoint?.id === pt.id;
                return (
                  <g
                    key={pt.id}
                    className="transition-transform duration-150 hover:scale-150"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {pt.made ? (
                      // TIRO ANOTADO: Círculo verde brillante con destello
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHover ? 6.5 : 4.5}
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth={isHover ? "2" : "1.2"}
                        className="drop-shadow-[0_0_6px_#10B981]"
                      />
                    ) : (
                      // TIRO FALLADO: Punto rojo con contorno blanco y marca X
                      <g>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHover ? 6.0 : 4.0}
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth={isHover ? "1.8" : "1"}
                          className="drop-shadow-[0_0_5px_#EF4444]"
                        />
                        <line
                          x1={pt.x - 2}
                          y1={pt.y - 2}
                          x2={pt.x + 2}
                          y2={pt.y + 2}
                          stroke="#FFFFFF"
                          strokeWidth="1"
                        />
                        <line
                          x1={pt.x + 2}
                          y1={pt.y - 2}
                          x2={pt.x - 2}
                          y2={pt.y + 2}
                          stroke="#FFFFFF"
                          strokeWidth="1"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* OVERLAY DEL PUNTO DE TIRO HOVER */}
        {hoveredPoint && (
          <div className="mt-2.5 p-2 rounded-xl bg-zinc-950/90 border border-zinc-700 flex items-center justify-between text-xs text-zinc-200">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  hoveredPoint.made ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-rose-500 shadow-[0_0_8px_#EF4444]"
                }`}
              />
              <span className="font-mono text-[11px] font-bold">
                {hoveredPoint.zoneName}:{" "}
                <strong className={hoveredPoint.made ? "text-emerald-400" : "text-rose-400"}>
                  {hoveredPoint.made ? "CANASTA ANOTADA (PUNTO VÁLIDO)" : "TIRO FALLADO"}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* DETALLE FLOTANTE DE LA ZONA SELECCIONADA */}
        {selectedZone && (
          <div className="mt-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">
                Zona Inspeccionada:
              </span>
              <span className="font-black text-white">{selectedZone.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-mono text-orange-400">
                {selectedZone.pct}% ({selectedZone.made} / {selectedZone.attempts})
              </span>
              <span className="text-[10px] text-zinc-400 block font-mono">
                {selectedZone.pct >= 70 ? "Zona Caliente (Dominada) 🔥" : selectedZone.pct >= 50 ? "En Consolidación ⚡" : "Área de Enfoque en Duela 🎯"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. PRUEBAS FÍSICAS Y VELOCIDAD DE DUELA */}
      {showPhysicals && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Cuerda */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">Saltos de Cuerda</span>
              <span className="text-base font-black text-white font-mono">
                {data.jumpRopeCount ?? 0} <span className="text-xs font-normal text-zinc-400">continuos</span>
              </span>
              <span className="text-[9px] text-zinc-500 block">Mínimo oficial: 10 saltos</span>
            </div>
          </div>

          {/* Circuito Línea a Línea */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">Circuito Línea a Línea</span>
              <span className="text-base font-black text-sky-400 font-mono">
                {data.circuitLinesSeconds ? `${data.circuitLinesSeconds}s` : "En proceso"}
              </span>
              <span className="text-[9px] text-zinc-500 block">Freno y aceleración</span>
            </div>
          </div>

          {/* Sprint 100m */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block font-bold">Sprint 100m Duela</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {data.sprint100mSeconds ? `${data.sprint100mSeconds}s` : "En proceso"}
              </span>
              <span className="text-[9px] text-zinc-500 block">Máxima potencia aláctica</span>
            </div>
          </div>

        </div>
      )}

      {/* FOOTER INFORMATIVO */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>Pruebas deportivas reglamentadas por Wild Wolves CDMX</span>
        <span>55 Tiros Totales (10 FT + 20 Mid + 25 3PT)</span>
      </div>

    </div>
  );
}
