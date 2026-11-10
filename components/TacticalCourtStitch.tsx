'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Filter, 
  Download, 
  Zap, 
  Activity, 
  Info, 
  ShieldCheck, 
  Flame,
  ChevronRight
} from 'lucide-react';

export interface TacticalZoneData {
  title: string;
  cluster: string;
  tier: string;
  tierColor: string;
  percentage: string;
  ratio: string;
  points: string;
  shotType: string;
  percentile: string;
  releaseTime: string;
  notes: string;
}

export interface TacticalShotMapProps {
  athleteName?: string;
  jerseyNumber?: string | number;
  category?: string;
  overallOvr?: number;
  initialZone?: string;
}

const DEFAULT_ZONE_DATA: Record<string, TacticalZoneData> = {
  'paint': {
    title: 'Línea Libre / Pintura',
    cluster: 'Clúster Central - Penetración & Tiro en Salto',
    tier: 'MÁXIMA EFICACIA',
    tierColor: 'bg-red-950/80 text-red-400 border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    percentage: '100%',
    ratio: '10 / 10',
    points: '20 PTS',
    shotType: 'Tiro en Suspensión / Flotadora',
    percentile: 'ÉLITE (Percentil 96)',
    releaseTime: '0.72 seg (Óptimo)',
    notes: 'Máxima agresividad atacando el aro; soltura de muñeca impecable y lectura de defensa cerrada con cambio de ritmo en el Deportivo Carmen Serdán.'
  },
  'mid-left': {
    title: 'Media Distancia Codo Izquierdo',
    cluster: 'Zona Media / Salida Pick & Roll',
    tier: 'IMPECABLE',
    tierColor: 'bg-red-950/80 text-red-400 border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    percentage: '100%',
    ratio: '10 / 10',
    points: '20 PTS',
    shotType: 'Pull-up Jumper tras drible lateral',
    percentile: 'ÉLITE (Percentil 94)',
    releaseTime: '0.69 seg (Rápido)',
    notes: 'Mecánica de codo a 90 grados muy estable. Desaceleración en un tiempo sin perder el eje vertical.'
  },
  'mid-right': {
    title: 'Media Distancia Codo Derecho',
    cluster: 'Zona Media / Aislamiento Directo',
    tier: 'IMPECABLE',
    tierColor: 'bg-red-950/80 text-red-400 border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    percentage: '100%',
    ratio: '10 / 10',
    points: '20 PTS',
    shotType: 'Fadeaway corto / Step-back',
    percentile: 'ÉLITE (Percentil 95)',
    releaseTime: '0.71 seg (Equilibrado)',
    notes: 'Excelente elevación superando defensores altos de la Liga CDMX. La rotación hacia atrás de balón genera rebotes dóciles.'
  },
  'top-key': {
    title: 'Triple 3P Top Key',
    cluster: 'Perímetro Frontal',
    tier: 'ALTO RENDIMIENTO',
    tierColor: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    percentage: '80%',
    ratio: '4 / 5',
    points: '12 PTS',
    shotType: 'Catch & Shoot con pies asentados',
    percentile: 'AVANZADO (Percentil 88)',
    releaseTime: '0.74 seg',
    notes: 'Arco alto con más de 48 grados de entrada al aro. Es su tiro de confianza para romper defensas de zona 2-3.'
  },
  'wing-left': {
    title: 'Triple 3P Ala Izquierda',
    cluster: 'Perímetro 45 Grados Flanco Izquierdo',
    tier: 'CONSISTENTE',
    tierColor: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    percentage: '60%',
    ratio: '3 / 5',
    points: '9 PTS',
    shotType: 'Recepción en transición abierta',
    percentile: 'SOBRESALIENTE (Percentil 79)',
    releaseTime: '0.76 seg',
    notes: 'Trabajar en mantener los hombros alineados hacia la canasta cuando llega en carrera diagonal por la banda.'
  },
  'wing-right': {
    title: 'Triple 3P Ala Derecha',
    cluster: 'Perímetro 45 Grados Flanco Derecho',
    tier: 'CONSISTENTE',
    tierColor: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    percentage: '60%',
    ratio: '3 / 5',
    points: '9 PTS',
    shotType: 'Pick & Pop Perimetral',
    percentile: 'SOBRESALIENTE (Percentil 81)',
    releaseTime: '0.75 seg',
    notes: 'Gran lectura cuando la defensa colapsa hacia la pintura. Excelente timing con el base creador.'
  },
  'corner-left': {
    title: 'Triple 3P Esquina Izquierda',
    cluster: 'Esquina Corta / Baseline',
    tier: 'CALIBRACIÓN CONTINUA',
    tierColor: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    percentage: '60%',
    ratio: '3 / 5',
    points: '9 PTS',
    shotType: 'Corner Spot-up sin bote',
    percentile: 'COMPETITIVO (Percentil 74)',
    releaseTime: '0.68 seg',
    notes: 'Cuidado con pisar la línea lateral al recibir balones rápidos en la esquina. Buena parábola y foco.'
  },
  'corner-right': {
    title: 'Triple 3P Esquina Derecha',
    cluster: 'Esquina Corta / Baseline Débil',
    tier: 'EN AJUSTE TÁCTICO',
    tierColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    percentage: '40%',
    ratio: '2 / 5',
    points: '6 PTS',
    shotType: 'Corner Jumper bajo presión',
    percentile: 'REGULAR (Percentil 58)',
    releaseTime: '0.82 seg',
    notes: 'Tendencia a empujar con el pulgar de apoyo en esta esquina. Se programaron 50 repeticiones extra para corregir balance.'
  }
};

export default function TacticalCourtStitch({
  athleteName = 'Mateo Silva',
  jerseyNumber = '11',
  category = 'Base / Escolta · U-17 Élite',
  overallOvr = 88,
  initialZone = 'paint'
}: TacticalShotMapProps) {
  const [selectedZone, setSelectedZone] = useState<string>(initialZone);
  const [courtMode, setCourtMode] = useState<'half' | 'full'>('half');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'last_match' | 'practice'>('all');

  const currentData = DEFAULT_ZONE_DATA[selectedZone] || DEFAULT_ZONE_DATA['paint'];

  const getDynamicNotes = () => {
    if (sessionFilter === 'last_match') {
      return '"Excelente toma de decisiones contra el doble cerco de Halcones Dorados. Aprovechó el tiro tras cortina en el codo izquierdo."';
    }
    if (sessionFilter === 'practice') {
      return '"Sesión técnica matutina enfocada en soltar el balón antes de alcanzar el vértice máximo del salto en Carmen Serdán."';
    }
    return `"${currentData.notes}"`;
  };

  return (
    <div className="w-full bg-[#07090E] text-slate-200 rounded-3xl border border-[#1F2433] p-4 sm:p-6 shadow-2xl relative overflow-hidden font-sans">
      {/* Background Radial & Tactical Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 15%, rgba(6, 182, 212, 0.12) 0%, transparent 65%),
            linear-gradient(rgba(31, 36, 51, 0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31, 36, 51, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* TOP BAR / HEADER (Stitch Reference) */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#1F2433] mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#131620] to-[#0B0E17] border border-[#FF6B00]/60 flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.35)] shrink-0">
            <span className="text-[#FF6B00] text-lg font-black font-mono">🐺</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest text-[#FF6B00] uppercase font-bold">
                WILD WOLVES ACADEMY OS
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] rounded font-bold">
                CARMEN SERDÁN · CDMX
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              MAPA TÁCTICO DE TIRO
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-400 font-normal hidden sm:inline">TELEMETRÍA EN VIVO</span>
            </h2>
          </div>
        </div>

        {/* Mini Perfil del Atleta y Selector de Modo de Cancha */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-3 bg-[#101421] px-3.5 py-1.5 rounded-xl border border-[#1F2433]">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#1F2433] border-2 border-[#FF6B00] flex items-center justify-center font-mono font-black text-xs text-white">
                #{jerseyNumber}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B0E17]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-none">{athleteName}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{category}</div>
            </div>
            <div className="h-6 w-px bg-[#1F2433] mx-1" />
            <div className="text-right">
              <div className="text-[9px] uppercase font-mono text-slate-400">Rating OVR</div>
              <div className="text-xs font-mono font-black text-[#FF6B00] leading-none">
                {overallOvr} <span className="text-[9px] text-emerald-400 font-normal">+3 mes</span>
              </div>
            </div>
          </div>

          {/* Selector de Cancha (Media Cancha / Completa) */}
          <div className="bg-[#101421] p-1 rounded-xl border border-[#1F2433] flex items-center text-xs font-mono">
            <button
              onClick={() => setCourtMode('half')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                courtMode === 'half'
                  ? 'bg-[#FF6B00] text-black shadow-[0_0_12px_rgba(255,107,0,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📐 Media Cancha
            </button>
            <button
              onClick={() => setCourtMode('full')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                courtMode === 'full'
                  ? 'bg-[#06B6D4] text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏟️ Cancha Completa
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS SECUNDARIOS & LEYENDA (Stitch Reference) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0E17]/80 p-3 rounded-2xl border border-[#1F2433] mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Sesión:</span>
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value as any)}
            className="bg-[#131620] text-xs font-mono text-white rounded-lg border border-[#1F2433] focus:border-[#FF6B00] focus:outline-none py-1 px-2.5"
          >
            <option value="all">Todos los Partidos (150 Tiros Totales)</option>
            <option value="last_match">Último Encuentro vs Halcones Dorados CDMX</option>
            <option value="practice">Práctica de Tiro Libre y Perímetro Especial</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-600/90 border border-red-500 shadow-[0_0_6px_#ef4444]" />
            <span className="text-slate-300">100% Efectividad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/90 border border-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-slate-300">60% - 80% Frecuente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-700/80 border border-cyan-400" />
            <span className="text-slate-300">≤ 40% En Ajuste</span>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL: DUELA VECTORIAL + PANEL TELEMÉTRICO LATERAL */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA 1: DUELA VECTORIAL FIBA FLORESCENTE */}
        <section className="lg:col-span-8 bg-[#0B0E17] border border-[#1F2433] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
                {courtMode === 'half' ? 'VISTA: MEDIA CANCHA OFENSIVA (DUELA CARMEN SERDÁN)' : 'VISTA: CANCHA COMPLETA REGULACIÓN FIBA'}
              </span>
            </div>
            <span className="text-xs font-mono text-[#06B6D4] font-bold">DISTRIBUCIÓN POLIGONAL</span>
          </div>

          {/* Marco con borde neón cian exacto a la imagen de Google Stitch */}
          <div className="relative w-full max-w-[560px] mx-auto rounded-2xl border-2 border-[#06B6D4]/60 p-1.5 bg-[#090C14] shadow-[0_0_35px_rgba(6,182,212,0.25)] select-none">
            <svg
              id="basketball-court"
              viewBox={courtMode === 'half' ? "0 0 500 520" : "0 0 500 940"}
              className="w-full h-auto block rounded-xl overflow-hidden transition-all duration-500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Cyan Line Glow */}
                <filter id="stitch-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Wolf Orange Hoop Glow */}
                <filter id="stitch-hoop-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Radial Court Lighting */}
                <radialGradient id="stitch-hoop-radial" cx="50%" cy="14%" r="45%">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#FF6B00" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#090C14" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Fondo base de duela oscura */}
              <rect width="500" height={courtMode === 'half' ? "520" : "940"} fill="#0B0E17" />
              <rect width="500" height={courtMode === 'half' ? "520" : "940"} fill="url(#stitch-hoop-radial)" />

              {/* Líneas tenues de duela de madera */}
              <g opacity="0.6" stroke="#131826" strokeWidth="1">
                <line x1="0" y1="65" x2="500" y2="65" />
                <line x1="0" y1="130" x2="500" y2="130" />
                <line x1="0" y1="195" x2="500" y2="195" />
                <line x1="0" y1="260" x2="500" y2="260" />
                <line x1="0" y1="325" x2="500" y2="325" />
                <line x1="0" y1="390" x2="500" y2="390" />
                <line x1="0" y1="455" x2="500" y2="455" />
              </g>

              {/* ZONAS POLIGONALES CON COLORES FLORESCENTES EXACTOS DE STITCH */}
              {/* Esquina Izquierda 60% */}
              <polygon
                points="0,0 45,0 45,170 0,170"
                fill="#F59E0B"
                fillOpacity={selectedZone === 'corner-left' ? 0.6 : 0.28}
                stroke="#F59E0B"
                strokeWidth={selectedZone === 'corner-left' ? "2.5" : "1.5"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('corner-left')}
              />

              {/* Esquina Derecha 40% */}
              <polygon
                points="455,0 500,0 500,170 455,170"
                fill="#06B6D4"
                fillOpacity={selectedZone === 'corner-right' ? 0.6 : 0.25}
                stroke="#06B6D4"
                strokeWidth={selectedZone === 'corner-right' ? "2.5" : "1.5"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('corner-right')}
              />

              {/* Media Distancia Izquierda 100% */}
              <path
                d="M 45,0 L 175,0 L 175,230 L 45,170 Z"
                fill="#7F1D1D"
                fillOpacity={selectedZone === 'mid-left' ? 0.95 : 0.78}
                stroke="#EF4444"
                strokeWidth={selectedZone === 'mid-left' ? "2.5" : "1.8"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('mid-left')}
              />

              {/* Media Distancia Derecha 100% */}
              <path
                d="M 325,0 L 455,0 L 455,170 L 325,230 Z"
                fill="#7F1D1D"
                fillOpacity={selectedZone === 'mid-right' ? 0.95 : 0.78}
                stroke="#EF4444"
                strokeWidth={selectedZone === 'mid-right' ? "2.5" : "1.8"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('mid-right')}
              />

              {/* Pintura / Tiro Libre 100% */}
              <polygon
                points="175,0 325,0 325,230 175,230"
                fill="#5C1417"
                fillOpacity={selectedZone === 'paint' ? 0.98 : 0.88}
                stroke="#FF6B00"
                strokeWidth={selectedZone === 'paint' ? "3" : "2"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('paint')}
              />

              {/* Triple Ala Izquierda 60% */}
              <path
                d="M 0,170 L 45,170 A 215,215 0 0,0 175,295 L 140,510 L 0,510 Z"
                fill="#D97706"
                fillOpacity={selectedZone === 'wing-left' ? 0.65 : 0.35}
                stroke="#F59E0B"
                strokeWidth={selectedZone === 'wing-left' ? "2.5" : "1.5"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('wing-left')}
              />

              {/* Triple Ala Derecha 60% */}
              <path
                d="M 500,170 L 455,170 A 215,215 0 0,1 325,295 L 360,510 L 500,510 Z"
                fill="#F59E0B"
                fillOpacity={selectedZone === 'wing-right' ? 0.92 : 0.75}
                stroke="#F59E0B"
                strokeWidth={selectedZone === 'wing-right' ? "3" : "2"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('wing-right')}
              />

              {/* Triple Top Key 80% */}
              <path
                d="M 175,295 A 215,215 0 0,0 325,295 L 360,510 L 140,510 Z"
                fill="#7F1D1D"
                fillOpacity={selectedZone === 'top-key' ? 0.95 : 0.82}
                stroke="#EF4444"
                strokeWidth={selectedZone === 'top-key' ? "3" : "2"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedZone('top-key')}
              />

              {/* LÍNEAS REGLAMENTARIAS FIBA CON RESPLANDOR NEÓN CIAN */}
              <g fill="none" stroke="#06B6D4" strokeWidth="2.5" filter="url(#stitch-neon-glow)">
                <rect x="2" y="2" width="496" height={courtMode === 'half' ? "508" : "936"} strokeWidth="3" />
                <line x1="0" y1="510" x2="500" y2="510" strokeDasharray="6,4" strokeWidth="3" />
                <rect x="175" y="2" width="150" height="225" />
                <line x1="175" y1="80" x2="167" y2="80" strokeWidth="3" />
                <line x1="325" y1="80" x2="333" y2="80" strokeWidth="3" />
                <line x1="175" y1="180" x2="167" y2="180" strokeWidth="3" />
                <line x1="325" y1="180" x2="333" y2="180" strokeWidth="3" />
                <path d="M 175,227 A 75,75 0 0,0 325,227" />
                <path d="M 175,227 A 75,75 0 0,1 325,227" strokeDasharray="6,6" />
                <path d="M 215,70 A 38,38 0 0,0 285,70" />
                <line x1="45" y1="2" x2="45" y2="170" />
                <line x1="455" y1="2" x2="455" y2="170" />
                <path d="M 45,170 A 215,215 0 0,0 455,170" />
                <path d="M 195,510 A 55,55 0 0,1 305,510" />
              </g>

              {/* ARO Y TABLERO NARANJA NEÓN */}
              <g filter="url(#stitch-hoop-glow)">
                <line x1="220" y1="50" x2="280" y2="50" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="250" y1="50" x2="250" y2="60" stroke="#FF6B00" strokeWidth="3" />
                <circle cx="250" cy="72" r="14" fill="#FF6B00" fillOpacity="0.3" stroke="#FF6B00" strokeWidth="3.5" />
                <circle cx="250" cy="72" r="6" fill="none" stroke="#FFFFFF" strokeDasharray="2,2" strokeWidth="1.5" />
              </g>
            </svg>

            {/* PÍLDORAS FLOTANTES INTERACTIVAS (EXACTAS AL RENDER DE STITCH) */}
            {/* Esquina Izquierda 60% */}
            <div
              onClick={() => setSelectedZone('corner-left')}
              className={`absolute top-[12%] left-[2%] cursor-pointer bg-[#0B0E17]/95 border-2 rounded-lg px-2 py-1 text-center transition-all ${
                selectedZone === 'corner-left'
                  ? 'border-[#FF6B00] shadow-[0_0_18px_rgba(255,107,0,0.8)] scale-105'
                  : 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] hover:scale-105'
              }`}
            >
              <div className="text-xs sm:text-sm font-mono font-black text-white">60%</div>
              <div className="text-[10px] font-mono text-slate-300">3-5</div>
            </div>

            {/* Esquina Derecha 40% */}
            <div
              onClick={() => setSelectedZone('corner-right')}
              className={`absolute top-[12%] right-[2%] cursor-pointer bg-[#0B0E17]/95 border-2 rounded-lg px-2 py-1 text-center transition-all ${
                selectedZone === 'corner-right'
                  ? 'border-[#FF6B00] shadow-[0_0_18px_rgba(255,107,0,0.8)] scale-105'
                  : 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:scale-105'
              }`}
            >
              <div className="text-xs sm:text-sm font-mono font-black text-white">40%</div>
              <div className="text-[10px] font-mono text-slate-300">2-5</div>
            </div>

            {/* Media Izq 100% */}
            <div
              onClick={() => setSelectedZone('mid-left')}
              className={`absolute top-[21%] left-[10%] sm:left-[13%] cursor-pointer bg-[#0B0E17]/95 border-2 rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 text-center transition-all ${
                selectedZone === 'mid-left'
                  ? 'border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.8)] scale-105'
                  : 'border-[#FF6B00] shadow-[0_0_16px_rgba(255,107,0,0.6)] hover:scale-105'
              }`}
            >
              <div className="text-sm sm:text-lg font-mono font-black text-white leading-tight">100%</div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-200 font-semibold whitespace-nowrap">Media Izq (10-10)</div>
            </div>

            {/* Línea Libre / Pintura 100% (Central Activa) */}
            <div
              onClick={() => setSelectedZone('paint')}
              className={`absolute top-[26%] left-1/2 -translate-x-1/2 cursor-pointer bg-[#0B0E17]/95 border-2 rounded-xl px-3 sm:px-5 py-2 text-center transition-all ${
                selectedZone === 'paint'
                  ? 'border-[#FF6B00] shadow-[0_0_22px_rgba(255,107,0,0.85)] scale-105'
                  : 'border-[#FF6B00] shadow-[0_0_16px_rgba(255,107,0,0.6)] hover:scale-105'
              }`}
            >
              <div className="text-base sm:text-xl font-mono font-black text-white leading-tight">100%</div>
              <div className="text-[10px] sm:text-xs font-mono text-amber-300 font-bold whitespace-nowrap">Línea Libre / Pintura (10-10)</div>
            </div>

            {/* Media Der 100% */}
            <div
              onClick={() => setSelectedZone('mid-right')}
              className={`absolute top-[21%] right-[10%] sm:right-[13%] cursor-pointer bg-[#0B0E17]/95 border-2 rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 text-center transition-all ${
                selectedZone === 'mid-right'
                  ? 'border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.8)] scale-105'
                  : 'border-[#FF6B00] shadow-[0_0_16px_rgba(255,107,0,0.6)] hover:scale-105'
              }`}
            >
              <div className="text-sm sm:text-lg font-mono font-black text-white leading-tight">100%</div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-200 font-semibold whitespace-nowrap">Media Der (10-10)</div>
            </div>

            {/* 3P Ala Izq 60% */}
            <div
              onClick={() => setSelectedZone('wing-left')}
              className={`absolute bottom-[26%] left-[6%] sm:left-[9%] cursor-pointer bg-[#0B0E17]/95 border-2 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-center transition-all ${
                selectedZone === 'wing-left'
                  ? 'border-[#FF6B00] shadow-[0_0_18px_rgba(255,107,0,0.8)] scale-105'
                  : 'border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.5)] hover:scale-105'
              }`}
            >
              <div className="text-sm sm:text-lg font-mono font-black text-white leading-tight">60%</div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-200 whitespace-nowrap">3P Ala Izq (3-5)</div>
            </div>

            {/* 3P Ala Der 60% */}
            <div
              onClick={() => setSelectedZone('wing-right')}
              className={`absolute bottom-[30%] right-[7%] sm:right-[10%] cursor-pointer bg-[#0B0E17]/95 border-2 rounded-xl px-3 sm:px-5 py-2 text-center transition-all ${
                selectedZone === 'wing-right'
                  ? 'border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.8)] scale-105'
                  : 'border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.6)] hover:scale-105'
              }`}
            >
              <div className="text-base sm:text-xl font-mono font-black text-white leading-tight">60%</div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-200 whitespace-nowrap">3P Ala Der (3-5)</div>
            </div>

            {/* 3P Top Key 80% */}
            <div
              onClick={() => setSelectedZone('top-key')}
              className={`absolute bottom-[10%] left-1/2 -translate-x-1/2 cursor-pointer bg-[#0B0E17]/95 border-2 rounded-xl px-4 sm:px-6 py-2 text-center transition-all ${
                selectedZone === 'top-key'
                  ? 'border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.8)] scale-105'
                  : 'border-[#FF6B00] shadow-[0_0_18px_rgba(255,107,0,0.6)] hover:scale-105'
              }`}
            >
              <div className="text-base sm:text-xl font-mono font-black text-white leading-tight">80%</div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-200 whitespace-nowrap">3P Top Key (4-5)</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 border-t border-[#1F2433] pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[#FF6B00] font-bold">INFO:</span>
              <span>Haz clic en cualquier área coloreada o tarjeta para ver el desglose biomecánico.</span>
            </div>
            <div className="text-[#06B6D4]">Duela Central Carmen Serdán · FIBA Standard 28x15m</div>
          </div>
        </section>

        {/* COLUMNA 2: PANEL TELEMÉTRICO LATERAL DE ANÁLISIS EN VIVO */}
        <section className="lg:col-span-4 space-y-5">
          {/* Tarjeta de Telemetría de Zona Activa */}
          <div className="bg-[#0B0E17] border border-[#1F2433] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2433]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF6B00] font-bold">ZONA EN ANÁLISIS</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${currentData.tierColor}`}>
                {currentData.tier}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-white font-mono tracking-tight">{currentData.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{currentData.cluster}</p>
            </div>

            {/* Grid Cuantitativo */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-[#101421] p-2.5 rounded-xl border border-[#1F2433] text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Acierto</span>
                <span className="text-xl font-black font-mono text-emerald-400">{currentData.percentage}</span>
              </div>
              <div className="bg-[#101421] p-2.5 rounded-xl border border-[#1F2433] text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Tiros</span>
                <span className="text-xl font-black font-mono text-white">{currentData.ratio}</span>
              </div>
              <div className="bg-[#101421] p-2.5 rounded-xl border border-[#1F2433] text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Puntos</span>
                <span className="text-xl font-black font-mono text-[#FF6B00]">{currentData.points}</span>
              </div>
            </div>

            {/* Indicadores Técnicos */}
            <div className="space-y-2.5 text-xs font-mono border-t border-[#131620] pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Tiro Predominante:</span>
                <span className="text-slate-200 font-semibold">{currentData.shotType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Eficiencia CDMX U-17:</span>
                <span className="text-[#06B6D4] font-bold">{currentData.percentile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tiempo de Lanzamiento:</span>
                <span className="text-slate-200">{currentData.releaseTime}</span>
              </div>
            </div>

            {/* Dictamen del Head Coach */}
            <div className="mt-4 p-3 bg-[#101421] rounded-xl border-l-4 border-[#FF6B00] text-xs">
              <div className="flex items-center gap-1.5 text-[#FF6B00] font-mono font-bold mb-1">
                <span>🐺</span>
                <span>DICTAMEN HEAD COACH RICARDO:</span>
              </div>
              <p className="text-slate-300 italic leading-relaxed">
                {getDynamicNotes()}
              </p>
            </div>
          </div>

          {/* Resumen Global de Puntería y Barras de Progreso */}
          <div className="bg-[#0B0E17] border border-[#1F2433] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#06B6D4]" />
                RESUMEN GLOBAL DE PUNTERÍA
              </h4>
              <span className="text-xs font-mono text-emerald-400 font-bold">78% GLOBAL (117/150)</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Triples (3PT):</span>
                  <span className="font-bold text-amber-400">68% <span className="text-slate-400 font-normal">(34/50)</span></span>
                </div>
                <div className="w-full bg-[#131620] rounded-full h-2 overflow-hidden border border-[#1F2433]">
                  <div className="bg-amber-400 h-2 rounded-full shadow-[0_0_8px_#f59e0b]" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Dobles Media/Pintura (2PT):</span>
                  <span className="font-bold text-emerald-400">84% <span className="text-slate-400 font-normal">(63/75)</span></span>
                </div>
                <div className="w-full bg-[#131620] rounded-full h-2 overflow-hidden border border-[#1F2433]">
                  <div className="bg-emerald-400 h-2 rounded-full shadow-[0_0_8px_#10b981]" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Tiros Libres (FT):</span>
                  <span className="font-bold text-[#06B6D4]">80% <span className="text-slate-400 font-normal">(20/25)</span></span>
                </div>
                <div className="w-full bg-[#131620] rounded-full h-2 overflow-hidden border border-[#1F2433]">
                  <div className="bg-[#06B6D4] h-2 rounded-full shadow-[0_0_8px_#06b6d4]" style={{ width: '80%' }} />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-3 border-t border-[#1F2433] space-y-2">
              <button 
                onClick={() => alert(`Generando expediente de tiro de ${athleteName} (#${jerseyNumber}) en PDF táctico.`)}
                className="w-full py-2.5 px-4 bg-[#131620] hover:bg-[#1A1F2E] border border-[#1F2433] hover:border-[#FF6B00] text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200"
              >
                <Download className="w-4 h-4 text-[#FF6B00]" />
                EXPORTAR FICHA PARA TUTOR / COACH
              </button>
              <button 
                onClick={() => alert("Sensor óptico activado para nueva tanda de 50 lanzamientos en la duela del Deportivo Carmen Serdán.")}
                className="w-full py-2.5 px-4 bg-[#FF6B00] hover:bg-[#FF8800] text-black text-xs font-mono font-black rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-[0_0_15px_rgba(255,107,0,0.4)]"
              >
                <Zap className="w-4 h-4" />
                INICIAR NUEVA CALIBRACIÓN EN DUELA
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
