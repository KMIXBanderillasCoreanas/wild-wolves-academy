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

  // Función de calor térmico estilo HomeCourt
  const getZoneColor = (pct: number, attempts: number) => {
    if (attempts === 0) return { bg: "rgba(39, 39, 42, 0.7)", border: "rgba(82, 82, 91, 0.4)", text: "text-zinc-400" };
    if (pct >= 70) {
      // Hot Zone (Naranja Fuego)
      return { bg: "rgba(249, 115, 22, 0.85)", border: "rgb(234, 88, 12)", text: "text-white" };
    } else if (pct >= 50) {
      // Warm Zone (Ámbar)
      return { bg: "rgba(245, 158, 11, 0.75)", border: "rgb(217, 119, 6)", text: "text-white" };
    } else if (pct >= 30) {
      // Cool Zone (Azul Claro)
      return { bg: "rgba(56, 189, 248, 0.65)", border: "rgb(14, 165, 233)", text: "text-white" };
    } else {
      // Cold Zone (Azul Oscuro Frío)
      return { bg: "rgba(30, 58, 138, 0.75)", border: "rgb(59, 130, 246)", text: "text-blue-100" };
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

      {/* 2. MEDIA CANCHA INTERACTIVA (SVG SHOT HEATMAP) */}
      <div className="relative w-full max-w-[620px] mx-auto bg-[#07090e] rounded-3xl p-3 sm:p-4 border border-zinc-800/80 shadow-inner overflow-hidden">
        
        {/* LEYENDA TÉRMICA HOT / COLD */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2 px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Cold (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-600 via-amber-500 to-orange-500"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Hot (≥70%)</span>
          </div>
        </div>

        {/* SVG MEDIA CANCHA REGLAMENTARIA BASKETBALL */}
        <div className="relative aspect-[4/3] w-full">
          <svg
            viewBox="0 0 500 400"
            className="w-full h-full select-none"
            style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
          >
            {/* Fondo de Cancha */}
            <rect x="0" y="0" width="500" height="400" fill="#0f131d" rx="16" />

            {/* Líneas de Cancha (Blanco/Gris) */}
            <g stroke="#3f3f46" strokeWidth="2.5" fill="none">
              {/* Línea de Fondo */}
              <line x1="20" y1="20" x2="480" y2="20" />
              {/* Líneas Laterales */}
              <line x1="20" y1="20" x2="20" y2="380" />
              <line x1="480" y1="20" x2="480" y2="380" />
              {/* Media Cancha */}
              <line x1="20" y1="380" x2="480" y2="380" strokeDasharray="6 6" />

              {/* Pintura / Llave */}
              <rect x="170" y="20" width="160" height="190" />
              {/* Círculo de Tiro Libre */}
              <path d="M 170 210 A 80 80 0 0 0 330 210" />
              <path d="M 170 210 A 80 80 0 0 1 330 210" strokeDasharray="4 4" />

              {/* Arco de 3 Puntos */}
              <line x1="45" y1="20" x2="45" y2="100" />
              <line x1="455" y1="20" x2="455" y2="100" />
              <path d="M 45 100 A 215 215 0 0 0 455 100" />

              {/* Aro y Tablero */}
              <line x1="220" y1="35" x2="280" y2="35" stroke="#a1a1aa" strokeWidth="4" />
              <circle cx="250" cy="50" r="14" stroke="#f66018" strokeWidth="3" />
            </g>

            {/* ======================================================= */}
            {/* ZONAS CALIENTES Y BOTONES DE TIRO INTERACTIVOS          */}
            {/* ======================================================= */}

            {/* 1. TIROS LIBRES (Centro de la Llave) */}
            {(() => {
              const z = zones[0];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="185"
                    y="140"
                    width="130"
                    height="60"
                    rx="12"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="250" y="163" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="250" y="180" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                    Libres ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 2. MEDIA DISTANCIA IZQUIERDA */}
            {(() => {
              const z = zones[1];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="65"
                    y="130"
                    width="95"
                    height="65"
                    rx="12"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="112" y="156" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="112" y="173" textAnchor="middle" fill="#e4e4e7" fontSize="9.5" fontWeight="700">
                    Media Izq ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 3. MEDIA DISTANCIA DERECHA */}
            {(() => {
              const z = zones[2];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="340"
                    y="130"
                    width="95"
                    height="65"
                    rx="12"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="387" y="156" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="387" y="173" textAnchor="middle" fill="#e4e4e7" fontSize="9.5" fontWeight="700">
                    Media Der ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 4. TRIPLE ESQUINA IZQUIERDA */}
            {(() => {
              const z = zones[3];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="24"
                    y="35"
                    width="60"
                    height="55"
                    rx="10"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="54" y="58" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="54" y="73" textAnchor="middle" fill="#e4e4e7" fontSize="8.5" fontWeight="700">
                    3P C-Izq ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 5. TRIPLE ALA IZQUIERDA (45°) */}
            {(() => {
              const z = zones[4];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="60"
                    y="245"
                    width="95"
                    height="55"
                    rx="12"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="107" y="269" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="107" y="285" textAnchor="middle" fill="#e4e4e7" fontSize="9.5" fontWeight="700">
                    3P 45° Izq ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 6. TRIPLE CENTRO (TOP OF THE KEY) */}
            {(() => {
              const z = zones[5];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="195"
                    y="310"
                    width="110"
                    height="55"
                    rx="12"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="250" y="334" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="250" y="350" textAnchor="middle" fill="#e4e4e7" fontSize="9.5" fontWeight="700">
                    3P Centro ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 7. TRIPLE ALA DERECHA (45°) */}
            {(() => {
              const z = zones[6];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="345"
                    y="245"
                    width="95"
                    height="55"
                    rx="12"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="392" y="269" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="392" y="285" textAnchor="middle" fill="#e4e4e7" fontSize="9.5" fontWeight="700">
                    3P 45° Der ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}

            {/* 8. TRIPLE ESQUINA DERECHA */}
            {(() => {
              const z = zones[7];
              const c = getZoneColor(z.pct, z.attempts);
              return (
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedZone(z)}
                >
                  <rect
                    x="416"
                    y="35"
                    width="60"
                    height="55"
                    rx="10"
                    fill={c.bg}
                    stroke={c.border}
                    strokeWidth="2"
                  />
                  <text x="446" y="58" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="monospace">
                    {z.pct}%
                  </text>
                  <text x="446" y="73" textAnchor="middle" fill="#e4e4e7" fontSize="8.5" fontWeight="700">
                    3P C-Der ({z.made}/{z.attempts})
                  </text>
                </g>
              );
            })()}
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
