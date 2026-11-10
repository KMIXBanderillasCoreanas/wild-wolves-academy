'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Activity, 
  Info, 
  Flame, 
  Eye, 
  Compass, 
  ChevronRight,
  Crosshair,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface PrecisionTargetProps {
  athleteName?: string;
  jerseyNumber?: string | number;
  overallOvr?: number;
}

export default function BiomechanicsShotBackboardSystem({
  athleteName = 'Mateo Silva',
  jerseyNumber = '11',
  overallOvr = 88
}: PrecisionTargetProps) {
  // Estado para la zona seleccionada: 'green_mid' | 'blue_3pt' | 'center_ft'
  const [activeZone, setActiveZone] = useState<'green_mid' | 'blue_3pt' | 'center_ft'>('green_mid');
  const [showProjectionLines, setShowProjectionLines] = useState<boolean>(true);

  return (
    <div className="w-full bg-[#07090E] text-slate-200 rounded-3xl border border-[#1F2433] p-4 sm:p-7 shadow-2xl relative overflow-hidden font-sans select-none">
      {/* TACTICAL GRID PATTERN */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 60% 40%, rgba(6, 182, 212, 0.15) 0%, transparent 70%),
            linear-gradient(rgba(31, 36, 51, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31, 36, 51, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px'
        }}
      />

      {/* TOP HEADER: BIOMECHANICAL SYSTEM BANNER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2433] mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF6B00] uppercase font-black">
              SISTEMA BIOMECÁNICO WILD WOLVES
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              GUÍA DE PUNTERÍA AL 100%
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1">
            <Crosshair className="w-6 h-6 text-[#FF6B00]" />
            TABLERO MILIMÉTRICO &amp; DUELA TÁCTICA
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowProjectionLines(!showProjectionLines)}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
              showProjectionLines
                ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-[#131620] text-slate-400 border-[#1F2433]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{showProjectionLines ? 'Vectores Activos' : 'Ocultar Vectores'}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER: TWO INTERCONNECTED PERSPECTIVES */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* PANEL IZQUIERDO / SUPERIOR: DIAGRAMA ESQUEMÁTICO DEL TABLERO (INSET)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0B0E17]/90 backdrop-blur-xl border-2 border-[#FF6B00]/60 rounded-3xl p-5 shadow-[0_0_30px_rgba(255,107,0,0.25)] relative overflow-hidden">
            {/* Tag superior del Inset */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2433] mb-4">
              <span className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse" />
                VISTA SUPERIOR: DETALLE DEL TABLERO
              </span>
              <span className="text-[10px] font-mono text-[#06B6D4] font-bold">
                FIBA 1.80m × 1.05m
              </span>
            </div>

            {/* TABLERO VECTORIAL SVG CON PUNTOS MILIMÉTRICOS VERDE Y AZUL */}
            <div className="relative w-full aspect-[16/10] bg-[#090C14] rounded-2xl border border-[#1F2433] p-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 400 250" className="w-full h-full">
                <defs>
                  {/* Filtro Resplandor Verde Fluorescente (Media Distancia) */}
                  <filter id="glow-green-impact" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Filtro Resplandor Azul Fluorescente (3PT / Perímetro) */}
                  <filter id="glow-blue-impact" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Degradado Vidrio Templado del Tablero */}
                  <linearGradient id="backboard-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                {/* Marco Exterior de Vidrio Templado */}
                <rect 
                  x="20" y="20" width="360" height="210" rx="8" 
                  fill="url(#backboard-glass)" 
                  stroke="#FF6B00" strokeWidth="4.5" 
                  className="filter drop-shadow-[0_0_12px_rgba(255,107,0,0.4)]"
                />

                {/* Recuadro Interior del Tablero (59cm x 45cm a escala) */}
                <rect 
                  x="135" y="90" width="130" height="100" rx="4"
                  fill="none" 
                  stroke="#FF6B00" strokeWidth="4" 
                />

                {/* Aro y Soporte de Rebote */}
                <line x1="180" y1="190" x2="220" y2="190" stroke="#FF6B00" strokeWidth="4" />
                <circle cx="200" cy="205" r="15" fill="#FF6B00" fillOpacity="0.25" stroke="#FF6B00" strokeWidth="3.5" />
                {/* Red de Canasta */}
                <path d="M 188 205 L 193 235 L 207 235 L 212 205" fill="none" stroke="#FFFFFF" strokeDasharray="2,2" strokeWidth="1.5" />

                {/* PUNTOS DE IMPACTO MILIMÉTRICOS EXACTOS DE LA IMAGEN DE REFERENCIA:
                    Línea horizontal superior del recuadro interior: Y = 90
                    Esquina superior derecha del recuadro: X = 265
                    Punto Verde (Media distancia): X = 265, Y = 90 (Esquina superior)
                    Punto Azul (3 Puntos Perímetro): X = 248, Y = 90 (Justo al lado, sobre la misma línea)
                */}

                {/* 1. PUNTO VERDE: Media / Corta Distancia (Esquina superior derecha del recuadro) */}
                <circle 
                  cx="265" cy="90" r="9" 
                  fill="#10B981" 
                  stroke="#34D399" strokeWidth="2.5" 
                  filter="url(#glow-green-impact)"
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={() => setActiveZone('green_mid')}
                />
                <circle cx="265" cy="90" r="3" fill="#FFFFFF" />

                {/* 2. PUNTO AZUL: 3PT / Perímetro (Inmediatamente al lado, sobre la línea horizontal) */}
                <circle 
                  cx="248" cy="90" r="9" 
                  fill="#06B6D4" 
                  stroke="#22D3EE" strokeWidth="2.5" 
                  filter="url(#glow-blue-impact)"
                  className="cursor-pointer transition-all hover:scale-125"
                  onClick={() => setActiveZone('blue_3pt')}
                />
                <circle cx="248" cy="90" r="3" fill="#FFFFFF" />

                {/* Líneas Guía de Proyección desde el Inset hacia la Duela */}
                {showProjectionLines && (
                  <g strokeDasharray="4,4" opacity="0.8">
                    <line x1="265" y1="90" x2="330" y2="120" stroke="#10B981" strokeWidth="2" />
                    <line x1="248" y1="90" x2="230" y2="40" stroke="#06B6D4" strokeWidth="2" />
                  </g>
                )}
              </svg>
            </div>

            {/* Ficha Explicativa de Puntos de Impacto */}
            <div className="mt-4 space-y-2.5 text-xs font-mono">
              <div 
                onClick={() => setActiveZone('green_mid')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  activeZone === 'green_mid' 
                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-[#101421] border-[#1F2433] text-slate-300 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <div>
                    <strong className="text-white block font-sans">Punto Verde (Media / Corta Distancia):</strong>
                    <span className="text-[11px] text-emerald-300">Esquina exterior del recuadro chico (40–60 cm arriba, 5–10 cm lateral)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div 
                onClick={() => setActiveZone('blue_3pt')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  activeZone === 'blue_3pt' 
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'bg-[#101421] border-[#1F2433] text-slate-300 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                  <div>
                    <strong className="text-white block font-sans">Punto Azul (Perímetro / 3PT):</strong>
                    <span className="text-[11px] text-cyan-300">Línea horizontal superior (5–10 cm hacia adentro desde el borde)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* TELEMETRY LAB BADGE */}
          <div className="p-3 bg-[#0B0E17] rounded-2xl border border-[#1F2433] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TELEMETRY LAB // Prof. Marcos Delgado</span>
            <span className="text-[#06B6D4] font-bold">CARMEN SERDÁN OS</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL DERECHO: MAPA DE DUELA INTERACTIVO & WIDGET FLOTANTE DE MATEO SILVA */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative bg-[#090C14] border-2 border-[#06B6D4]/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.2)] overflow-hidden">
            
            {/* WIDGET FLOTANTE SUPERIOR DERECHO (TELEMETRÍA #11 MATEO SILVA) */}
            <div className="absolute top-4 right-4 z-30 w-52 sm:w-60 bg-[#0B0E17]/95 backdrop-blur-xl border-2 border-[#1F2433] hover:border-[#FF6B00] rounded-2xl p-3 shadow-2xl transition-all">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-[#1F2433] pb-1.5 mb-2">
                <span className="flex items-center gap-1 text-[#FF6B00] font-bold">
                  ★ DATA OF ANALYSIS QAP.
                </span>
                <span>★</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white font-mono leading-tight">
                    #{jerseyNumber} {athleteName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Base / Escolta</span>
                </div>
                <span className="text-base font-black font-mono text-[#FF6B00]">🐺</span>
              </div>

              {/* Estadísticas de Efectividad del Widget */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono my-2">
                <div className="bg-[#131620] p-1.5 rounded-lg border border-[#1F2433]">
                  <span className="text-[9px] text-slate-400 block uppercase">RAT OVR</span>
                  <span className="text-xs sm:text-sm font-black text-white">{overallOvr}</span>
                </div>
                <div className="bg-[#131620] p-1.5 rounded-lg border border-[#1F2433]">
                  <span className="text-[9px] text-slate-400 block uppercase">SHOTS</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400">19 / 10</span>
                </div>
                <div className="bg-[#131620] p-1.5 rounded-lg border border-[#1F2433]">
                  <span className="text-[9px] text-slate-400 block uppercase">POINTS</span>
                  <span className="text-xs sm:text-sm font-black text-[#FF6B00]">28 PTS</span>
                </div>
              </div>

              {/* Miniatura del Mapa de Calor */}
              <div className="w-full h-16 rounded-xl bg-[#07090E] border border-[#1F2433] flex items-center justify-center p-1 relative overflow-hidden">
                <div className="w-full h-full rounded-lg bg-gradient-to-t from-cyan-950 via-emerald-950 to-red-950 opacity-80 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-amber-300 font-bold tracking-widest">
                    HEATMAP ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* DUELA TÁCTICA ORIENTACIÓN LATERAL / CENITAL CON SILUETAS Y POLÍGONOS */}
            <div className="relative w-full aspect-[4/3] max-h-[500px] mx-auto select-none">
              <svg viewBox="0 0 600 450" className="w-full h-full">
                <defs>
                  {/* Resplandor Neón Cian para Líneas de Cancha */}
                  <filter id="court-fiba-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Fondo Base Cancha */}
                <rect x="0" y="0" width="600" height="450" rx="16" fill="#0B0E17" />

                {/* LÍNEAS TÁCTICAS NEÓN CIAN */}
                <g fill="none" stroke="#06B6D4" strokeWidth="2.5" filter="url(#court-fiba-glow)">
                  {/* Perímetro */}
                  <rect x="15" y="15" width="570" height="420" rx="10" strokeWidth="3" />
                  {/* Media Cancha Lateral */}
                  <line x1="160" y1="15" x2="160" y2="435" strokeWidth="2.5" />
                  <circle cx="160" cy="225" r="45" strokeWidth="2.5" />

                  {/* Llave / Pintura Orientada a la Canasta Lateral Derecha */}
                  <rect x="390" y="165" width="135" height="120" />
                  <circle cx="390" cy="225" r="40" strokeDasharray="5,5" />
                  
                  {/* Arco de 3 Puntos Reglamentario */}
                  <path d="M 525 60 L 450 60 A 185 185 0 0 0 450 390 L 525 390" strokeWidth="2.8" />
                </g>

                {/* POLÍGONOS LIMPIOS: ZONAS VERDES (Media Distancia) & AZULES (Perímetro 3PT) */}
                {/* 1. ZONA VERDE: Media Distancia Superior e Inferior */}
                <g 
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => setActiveZone('green_mid')}
                >
                  {/* Ala Interior Superior Verde */}
                  <path 
                    d="M 390 60 L 450 60 A 185 185 0 0 0 350 165 L 390 165 Z" 
                    fill="#10B981" 
                    fillOpacity={activeZone === 'green_mid' ? 0.75 : 0.40} 
                    stroke="#10B981" 
                    strokeWidth="2" 
                  />
                  {/* Ala Interior Inferior Verde */}
                  <path 
                    d="M 390 390 L 450 390 A 185 185 0 0 1 350 285 L 390 285 Z" 
                    fill="#10B981" 
                    fillOpacity={activeZone === 'green_mid' ? 0.75 : 0.40} 
                    stroke="#10B981" 
                    strokeWidth="2" 
                  />
                  {/* Frontal Verde */}
                  <path 
                    d="M 350 165 A 185 185 0 0 0 320 225 A 185 185 0 0 0 350 285 L 390 285 A 40 40 0 0 1 390 165 Z" 
                    fill="#10B981" 
                    fillOpacity={activeZone === 'green_mid' ? 0.75 : 0.40} 
                    stroke="#10B981" 
                    strokeWidth="2" 
                  />
                </g>

                {/* 2. ZONA AZUL: Perímetro Profundo / 3 Puntos */}
                <g 
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => setActiveZone('blue_3pt')}
                >
                  <path 
                    d="M 450 60 A 185 185 0 0 0 320 225 A 185 185 0 0 0 450 390 L 485 415 A 220 220 0 0 1 290 225 A 220 220 0 0 1 485 35 Z" 
                    fill="#06B6D4" 
                    fillOpacity={activeZone === 'blue_3pt' ? 0.75 : 0.40} 
                    stroke="#06B6D4" 
                    strokeWidth="2.5" 
                  />
                </g>

                {/* 3. ZONA ROJO FUEGO / PINTURA: Tiros en Salto Cercanos */}
                <rect 
                  x="390" y="165" width="135" height="120" 
                  fill="#EA580C" 
                  fillOpacity={activeZone === 'center_ft' ? 0.80 : 0.55} 
                  stroke="#FF6B00" 
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => setActiveZone('center_ft')}
                />

                {/* SILUETAS TÁCTICAS DE POSICIÓN DE PIES DE ATLETA (FOOTPRINTS) */}
                <g fill="none" stroke="#FFFFFF" opacity="0.85" strokeWidth="1.5">
                  {/* Silueta Verde Ala Superior */}
                  <ellipse cx="445" cy="115" rx="5" ry="10" transform="rotate(-25 445 115)" />
                  <ellipse cx="455" cy="118" rx="5" ry="10" transform="rotate(-25 455 118)" />

                  {/* Silueta Verde Ala Inferior */}
                  <ellipse cx="445" cy="335" rx="5" ry="10" transform="rotate(25 445 335)" />
                  <ellipse cx="455" cy="332" rx="5" ry="10" transform="rotate(25 455 332)" />

                  {/* Silueta Frontal Pintura */}
                  <ellipse cx="410" cy="220" rx="5" ry="11" stroke="#FFA500" />
                  <ellipse cx="422" cy="220" rx="5" ry="11" stroke="#FFA500" />

                  {/* Silueta Perímetro Azul */}
                  <ellipse cx="335" cy="225" rx="5" ry="11" stroke="#22D3EE" />
                </g>

                {/* FLECHAS VECTORIALES DE TRAYECTORIA HACIA EL ARO DERECHO */}
                {showProjectionLines && (
                  <g strokeDasharray="5,4" strokeWidth="2">
                    {/* Desde Zona Verde hacia el Aro */}
                    <line x1="445" y1="115" x2="520" y2="225" stroke="#10B981" />
                    <line x1="445" y1="335" x2="520" y2="225" stroke="#10B981" />
                    {/* Desde Zona Azul hacia el Aro */}
                    <line x1="335" y1="225" x2="520" y2="225" stroke="#06B6D4" />
                    {/* Desde Pintura Central */}
                    <line x1="410" y1="220" x2="520" y2="225" stroke="#FF6B00" />
                  </g>
                )}

                {/* CANASTA Y TABLERO DERECHO */}
                <rect x="525" y="175" width="8" height="100" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2" />
                <circle cx="515" cy="225" r="14" fill="#FF6B00" fillOpacity="0.3" stroke="#FF6B00" strokeWidth="3" />
              </svg>
            </div>

            {/* BARRA INFERIOR DE ESTADO TÁCTICO */}
            <div className="mt-4 p-3 bg-[#0B0E17]/90 rounded-2xl border border-[#1F2433] flex flex-wrap items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-400">PUNTO DE IMPACTO ACTIVO:</span>
                <strong className={activeZone === 'green_mid' ? 'text-emerald-400 font-bold' : activeZone === 'blue_3pt' ? 'text-cyan-400 font-bold' : 'text-orange-400 font-bold'}>
                  {activeZone === 'green_mid' ? 'ESQUINA EXTERIOR DEL RECUADRO (VERDE)' : activeZone === 'blue_3pt' ? 'LÍNEA HORIZONTAL INTERNA (AZUL)' : 'CENTRO DE PINTURA (DIRECTO AL ARO)'}
                </strong>
              </div>
              <span className="text-slate-500 hidden sm:inline">100% Efectivo Calibrado</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
