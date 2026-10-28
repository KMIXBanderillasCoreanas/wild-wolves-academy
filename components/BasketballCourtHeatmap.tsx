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

  // Normalizar datos con defaults oficiales
  const ftAttempts = data.freeThrowsAttempts ?? 10;
  const ftMade = Math.min(ftAttempts, Math.max(0, data.freeThrowsMade ?? 0));

  const midLeftAttempts = data.midRangeLeftAttempts ?? 10;
  const midLeftMade = Math.min(midLeftAttempts, Math.max(0, data.midRangeLeftMade ?? 0));

  const midRightAttempts = data.midRangeRightAttempts ?? 10;
  const midRightMade = Math.min(midRightAttempts, Math.max(0, data.midRangeRightMade ?? 0));

  const threeAttempts = data.threeAttemptsPerSpot ?? 5;
  const threeCornerLeftMade = Math.min(threeAttempts, Math.max(0, data.threeCornerLeftMade ?? 0));
  const threeWingLeftMade = Math.min(threeAttempts, Math.max(0, data.threeWingLeftMade ?? 0));
  const threeTopKeyMade = Math.min(threeAttempts, Math.max(0, data.threeTopKeyMade ?? 0));
  const threeWingRightMade = Math.min(threeAttempts, Math.max(0, data.threeWingRightMade ?? 0));
  const threeCornerRightMade = Math.min(threeAttempts, Math.max(0, data.threeCornerRightMade ?? 0));

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

  // Paleta oficial HomeCourt / NBA Court Heatmap:
  // - Azul oscuro táctico (#253b6d / #1e3a8a) para zonas frías / bajo volumen
  // - Naranja intenso (#e65100 / #f97316) para zonas calientes
  // - Ámbar / Salmón / Azul intermedio para zonas medias
  const getZoneColor = (pct: number, attempts: number) => {
    if (attempts === 0) return { bg: "#1f293d", border: "#374151", text: "#9ca3af", fillOpacity: 0.85, label: "Sin tiros" };
    if (pct >= 70) {
      // Zona Súper Caliente (Orange Flame HomeCourt)
      return { bg: "#e64a19", border: "#ff7043", text: "#ffffff", fillOpacity: 0.95, label: "Élite (≥70%)" };
    } else if (pct >= 50) {
      // Zona Media-Alta (Warm Orange-Amber)
      return { bg: "#f57c00", border: "#ffb74d", text: "#ffffff", fillOpacity: 0.90, label: "Favorable (50-69%)" };
    } else if (pct >= 35) {
      // Zona Táctica Intermedia (Blue/Indigo HomeCourt)
      return { bg: "#2a4365", border: "#4299e1", text: "#ffffff", fillOpacity: 0.90, label: "Regular (35-49%)" };
    } else {
      // Zona Fría (Deep Dark Blue HomeCourt)
      return { bg: "#1a2a47", border: "#2b4c7e", text: "#93c5fd", fillOpacity: 0.90, label: "Fría (<35%)" };
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
        
        {/* LEYENDA TÉRMICA BIOMECÁNICA: AZUL PROFUNDO (FRÍO) A NARANJA FLAMA (CALIENTE) */}
        <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-300 mb-3 px-3 py-2 bg-zinc-900/80 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#1a2a47] border border-[#2b4c7e]"></span>
            <span className="text-blue-300 font-bold">Fría (&lt;35%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#2a4365] border border-[#4299e1]"></span>
            <span className="text-sky-300 font-bold">Regular (35-49%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#f57c00] border border-[#ffb74d]"></span>
            <span className="text-amber-300 font-bold">Favorable (50-69%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#e64a19] border border-[#ff7043] shadow-[0_0_8px_rgba(230,74,25,0.7)]"></span>
            <span className="text-orange-400 font-bold">Caliente (≥70%)</span>
          </div>
        </div>

        {/* SVG MEDIA CANCHA CON ZONAS TÉRMICAS QUE CUBREN TODO EL POLÍGONO DE TIRO */}
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-zinc-800/60 bg-[#0a0d14]">
          <svg
            viewBox="0 0 500 380"
            className="w-full h-full select-none"
            style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6))" }}
          >
            {/* DEFINICIONES DE MÁSCARAS / RECORTE DE CANCHA */}
            <defs>
              <clipPath id="court-boundary">
                <rect x="15" y="15" width="470" height="350" rx="12" />
              </clipPath>
              {/* Recorte del Arco de 3 Puntos: Todo lo exterior al semicírculo */}
              <clipPath id="beyond-three-arc">
                <path d="M 15 15 L 485 15 L 485 365 L 15 365 Z" />
              </clipPath>
            </defs>

            {/* BASE / DUELA OSCURA ESTILO HOMECORT */}
            <rect x="0" y="0" width="500" height="380" fill="#0d111a" />

            {/* ======================================================= */}
            {/* CAPA 1: POLÍGONOS DE CALOR QUE CUBREN LA DUELA COMPLETA */}
            {/* ======================================================= */}

            {/* 1. TRIPLE ESQUINA IZQUIERDA (Corner 3 Left) */}
            {(() => {
              const z = zones[3];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  <polygon
                    points="20,20 48,20 48,115 20,115"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.5"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="34" y="60" textAnchor="middle" fill={c.text} fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="34" y="74" textAnchor="middle" fill="#d1d5db" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                    ({z.made}-{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 2. TRIPLE ESQUINA DERECHA (Corner 3 Right) */}
            {(() => {
              const z = zones[7];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  <polygon
                    points="452,20 480,20 480,115 452,115"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.5"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="466" y="60" textAnchor="middle" fill={c.text} fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="466" y="74" textAnchor="middle" fill="#d1d5db" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                    ({z.made}-{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 3. TRIPLE ALA IZQUIERDA 45° (Wing 3 Left) */}
            {(() => {
              const z = zones[4];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  {/* Polígono que cubre desde la esquina izquierda hasta el cono de 45° */}
                  <path
                    d="M 20 115 L 48 115 A 215 215 0 0 0 160 236 L 120 365 L 20 365 Z"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.5"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="75" y="235" textAnchor="middle" fill={c.text} fontSize="14" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="75" y="250" textAnchor="middle" fill="#e5e7eb" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">
                    3P Ala Izq ({z.made}-{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 4. TRIPLE CENTRO / TOP OF THE KEY */}
            {(() => {
              const z = zones[5];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  {/* Polígono de la cúspide del triple */}
                  <path
                    d="M 160 236 A 215 215 0 0 0 340 236 L 380 365 L 120 365 Z"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.5"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="250" y="300" textAnchor="middle" fill={c.text} fontSize="16" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="250" y="318" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">
                    3P Top Key ({z.made}-{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 5. TRIPLE ALA DERECHA 45° (Wing 3 Right) */}
            {(() => {
              const z = zones[6];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  <path
                    d="M 452 115 L 480 115 L 480 365 L 380 365 L 340 236 A 215 215 0 0 0 452 115 Z"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.5"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="425" y="235" textAnchor="middle" fill={c.text} fontSize="14" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="425" y="250" textAnchor="middle" fill="#e5e7eb" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">
                    3P Ala Der ({z.made}-{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 6. MEDIA DISTANCIA IZQUIERDA (Mid-Range Left) */}
            {(() => {
              const z = zones[1];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  {/* Área entre la pintura y el arco de triple, lado izquierdo */}
                  <path
                    d="M 48 20 L 170 20 L 170 190 L 170 210 A 80 80 0 0 0 250 240 L 250 265 A 215 215 0 0 1 48 100 Z"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.5"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="110" y="110" textAnchor="middle" fill={c.text} fontSize="14" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="110" y="125" textAnchor="middle" fill="#f3f4f6" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">
                    Media Izq ({z.made}-{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 7. MEDIA DISTANCIA DERECHA (Mid-Range Right) */}
            {(() => {
              const z = zones[2];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  {/* Área entre la pintura y el arco de triple, lado derecho */}
                  <path
                    d="M 452 20 L 330 20 L 330 190 L 330 210 A 80 80 0 0 1 250 240 L 250 265 A 215 215 0 0 0 452 100 Z"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.5"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="390" y="110" textAnchor="middle" fill={c.text} fontSize="14" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="390" y="125" textAnchor="middle" fill="#f3f4f6" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">
                    Media Der ({z.made}-{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 8. PINTURA / TIROS LIBRES (In the Paint / Free Throws) */}
            {(() => {
              const z = zones[0];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g className="cursor-pointer transition-opacity hover:opacity-90" onClick={() => setSelectedZone(z)}>
                  {/* Llave / Pintura completa con círculo superior */}
                  <path
                    d="M 170 20 L 330 20 L 330 210 A 80 80 0 0 1 170 210 Z"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="1.8"
                    fillOpacity={c.fillOpacity}
                  />
                  <text x="250" y="125" textAnchor="middle" fill={c.text} fontSize="17" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="250" y="142" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="800" fontFamily="sans-serif">
                    Línea Libre ({z.made}-{z.attempts})
                  </text>
                  <text x="250" y="156" textAnchor="middle" fill="#d1d5db" fontSize="8.5" fontWeight="600" fontFamily="sans-serif">
                    En la Pintura
                  </text>
                </g>
              );
            })()}

            {/* ======================================================= */}
            {/* CAPA 2: LÍNEAS DE CANCHA OFICIALES (BLANCO SUTIL / GRIS) */}
            {/* ======================================================= */}
            <g stroke="#ffffff" strokeWidth="2" strokeOpacity="0.85" fill="none" pointerEvents="none">
              {/* Línea de Fondo */}
              <line x1="20" y1="20" x2="480" y2="20" strokeWidth="2.5" />
              {/* Líneas Laterales */}
              <line x1="20" y1="20" x2="20" y2="365" strokeWidth="2.5" />
              <line x1="480" y1="20" x2="480" y2="365" strokeWidth="2.5" />
              {/* Media Cancha */}
              <line x1="20" y1="365" x2="480" y2="365" strokeDasharray="6 6" />

              {/* Pintura / Llave */}
              <rect x="170" y="20" width="160" height="190" strokeWidth="2" />
              {/* Círculo de Tiro Libre */}
              <path d="M 170 210 A 80 80 0 0 0 330 210" strokeWidth="2" />
              <path d="M 170 210 A 80 80 0 0 1 330 210" strokeDasharray="5 5" strokeWidth="1.5" />

              {/* Arco de 3 Puntos */}
              <line x1="48" y1="20" x2="48" y2="100" strokeWidth="2.2" />
              <line x1="452" y1="20" x2="452" y2="100" strokeWidth="2.2" />
              <path d="M 48 100 A 215 215 0 0 0 452 100" strokeWidth="2.2" />

              {/* Tablero y Canasta */}
              <line x1="220" y1="35" x2="280" y2="35" stroke="#ffffff" strokeWidth="3.5" />
              <circle cx="250" cy="50" r="14" stroke="#f66018" strokeWidth="3" fill="#f66018" fillOpacity="0.3" />
              {/* Semicírculo de no carga */}
              <path d="M 225 35 A 25 25 0 0 0 275 35" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7" />
            </g>
          </svg>
        </div>

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
