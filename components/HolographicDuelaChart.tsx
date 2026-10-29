'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sparkles, 
  Target, 
  Flame, 
  Eye, 
  Cpu, 
  TrendingUp, 
  Layers,
  Zap,
  Crosshair
} from 'lucide-react';

export interface HolographicZoneData {
  id: string;
  zona: string;
  porcentaje: number;
  encestados?: number;
  intentos?: number;
  categoria?: 'Tiro Libre' | 'Pintura' | 'Media Distancia' | 'Triple';
  colorTop?: string;
  coordenadaCourt?: { x: number; y: number }; // Posición relativa en % de la duela
}

interface HolographicDuelaChartProps {
  data?: HolographicZoneData[];
  athleteName?: string;
  courtLocation?: string;
}

const DEFAULT_ZONAS: HolographicZoneData[] = [
  { id: '1', zona: 'Esq Izq (3P)', porcentaje: 60, encestados: 3, intentos: 5, categoria: 'Triple', coordenadaCourt: { x: 12, y: 30 } },
  { id: '2', zona: 'Media Izq', porcentaje: 80, encestados: 8, intentos: 10, categoria: 'Media Distancia', coordenadaCourt: { x: 26, y: 45 } },
  { id: '3', zona: 'Pintura / FT', porcentaje: 100, encestados: 10, intentos: 10, categoria: 'Pintura', coordenadaCourt: { x: 50, y: 55 } },
  { id: '4', zona: '3P Ala Izq', porcentaje: 65, encestados: 4, intentos: 6, categoria: 'Triple', coordenadaCourt: { x: 28, y: 75 } },
  { id: '5', zona: '3P Top Key', porcentaje: 75, encestados: 6, intentos: 8, categoria: 'Triple', coordenadaCourt: { x: 50, y: 88 } },
  { id: '6', zona: '3P Ala Der', porcentaje: 60, encestados: 3, intentos: 5, categoria: 'Triple', coordenadaCourt: { x: 72, y: 75 } },
  { id: '7', zona: 'Media Der', porcentaje: 90, encestados: 9, intentos: 10, categoria: 'Media Distancia', coordenadaCourt: { x: 74, y: 45 } },
  { id: '8', zona: 'Esq Der (3P)', porcentaje: 40, encestados: 2, intentos: 5, categoria: 'Triple', coordenadaCourt: { x: 88, y: 30 } },
];

export default function HolographicDuelaChart({
  data = DEFAULT_ZONAS,
  athleteName = 'Bruno Sánchez #37',
  courtLocation = 'Cancha Deportivo Carmen Serdán'
}: HolographicDuelaChartProps) {
  const [selectedZone, setSelectedZone] = useState<HolographicZoneData | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [animatedIn, setAnimatedIn] = useState<boolean>(false);

  useEffect(() => {
    // Disparar animación de altura 0% a final en 1 segundo
    const timer = setTimeout(() => setAnimatedIn(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const activeItem = selectedZone || (hoveredZone ? data.find(d => d.id === hoveredZone) : null) || data[2];

  // Cálculo de promedio global
  const totalEncestados = data.reduce((acc, curr) => acc + (curr.encestados || 0), 0);
  const totalIntentos = data.reduce((acc, curr) => acc + (curr.intentos || 0), 0);
  const promedioGeneral = totalIntentos > 0 
    ? Math.round((totalEncestados / totalIntentos) * 100) 
    : Math.round(data.reduce((acc, curr) => acc + curr.porcentaje, 0) / data.length);

  return (
    <div className="relative w-full max-w-5xl mx-auto p-6 sm:p-8 bg-gradient-to-b from-[#060911] via-[#09101d] to-[#0e172a] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.18)] font-sans select-none">
      {/* 1. EFECTO DE LUZ Y PARTÍCULAS HOLOGRÁFICAS DE FONDO */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25) 1px, transparent 1px),
            linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px'
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-72 bg-gradient-to-r from-cyan-500/20 via-orange-500/15 to-red-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* 2. ENCABEZADO HUD BIOMÉTRICO */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-cyan-500/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-black tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              CYBER_HUD 3D // BIOMETRIC SHOT MATRIX
            </span>
            <span className="text-[10px] font-mono text-zinc-400">FIBA SHOT SCIENCE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1.5 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            Holographic Duela Chart
          </h2>
          <p className="text-xs font-mono text-cyan-200/80 mt-0.5">
            // TELEMETRÍA 3D FLOTANTE SOBRE <span className="text-orange-400 font-bold">{courtLocation.toUpperCase()}</span>
          </p>
        </div>

        {/* MÉTRICA ATLETA EN VIVO */}
        <div className="flex items-center gap-3 bg-[#0a1222]/90 backdrop-blur-md border border-cyan-500/40 px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.25)]">
          <div className="text-right font-mono">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">
              {athleteName}
            </span>
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-orange-400 to-red-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]">
                {promedioGeneral}%
              </span>
              <span className="text-[10px] text-cyan-300">OVR EFICACIA</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            <Crosshair className="w-5 h-5 animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* 3. ESCENARIO 3D ISOMÉTRICO (PERSPECTIVE + ROTATE-X + COLUMNAS FLOTANTES) */}
      <div 
        className="relative z-10 w-full mt-8 pt-8 pb-14 px-2 sm:px-6 overflow-hidden rounded-2xl bg-gradient-to-b from-[#070d18]/90 to-[#04070d]/95 border border-cyan-500/30 shadow-[inset_0_0_50px_rgba(6,182,212,0.12)]"
        style={{ perspective: '1100px' }}
      >
        {/* DUELA BASE PROYECTADA EN PERSPECTIVA 3D */}
        <div 
          className="relative w-full max-w-4xl mx-auto h-[340px] sm:h-[380px] transition-transform duration-700"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'rotateX(48deg) rotateZ(0deg) scale(0.92)' 
          }}
        >
          {/* LÍNEAS DE LA DUELA PROYECTADAS EN EL PLANO DE LA BASE */}
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.35)] bg-[#07101f]/60 backdrop-blur-sm pointer-events-none">
            {/* Pintura de media cancha en el piso 3D */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-48 border-x-2 border-b-2 border-cyan-400/40 bg-cyan-950/20" />
            {/* Círculo de tiro libre */}
            <div className="absolute top-36 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-2 border-dashed border-cyan-400/40" />
            {/* Arco de 3 Puntos */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] h-72 rounded-b-full border-2 border-cyan-400/35" />
            {/* Centro de la duela */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 rounded-t-full border-t-2 border-x-2 border-cyan-400/40" />
          </div>

          {/* MATRIZ DE COLUMNAS 3D FLOTANTES (DEGRADADO CIAN -> NARANJA -> ROJO) */}
          <div className="absolute inset-x-4 bottom-4 top-10 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {data.map((item, index) => {
              const isHovered = hoveredZone === item.id;
              const isSelected = selectedZone?.id === item.id;
              const targetHeightPct = item.porcentaje;
              const currentHeightPct = animatedIn ? targetHeightPct : 0;

              // Factor de color de la cúspide según efectividad
              const isHot = item.porcentaje >= 75;
              const isOptimal = item.porcentaje >= 60 && item.porcentaje < 75;

              return (
                <div
                  key={item.id}
                  className="relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                  onMouseEnter={() => setHoveredZone(item.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => setSelectedZone(item)}
                >
                  {/* Etiqueta flotante superior de porcentaje (HUD Marker) */}
                  <div 
                    className={`absolute -top-7 transition-all duration-300 font-mono text-[11px] font-black px-2 py-0.5 rounded-md border whitespace-nowrap z-20 ${
                      isHovered || isSelected
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_15px_#06b6d4] scale-110 -translate-y-1'
                        : 'bg-black/70 text-zinc-300 border-zinc-700/80 opacity-90'
                    }`}
                    style={{
                      bottom: `${currentHeightPct}%`,
                      top: 'auto'
                    }}
                  >
                    {item.porcentaje}%
                  </div>

                  {/* ESTRUCTURA 3D DE LA COLUMNA DE ENERGÍA NEÓN */}
                  <div 
                    className="relative w-full max-w-[54px] transition-all duration-1000 ease-out"
                    style={{
                      height: `${currentHeightPct}%`,
                      minHeight: animatedIn ? '28px' : '0px',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* CARA FRONTAL: Degradado Cian (#06b6d4) en la base -> Naranja (#f97316) -> Rojo (#ef4444) en la cúspide */}
                    <div 
                      className={`w-full h-full rounded-t-lg transition-all duration-300 relative overflow-hidden border-t-2 border-x border-cyan-300/60 ${
                        isHovered || isSelected
                          ? 'shadow-[0_0_30px_rgba(6,182,212,0.9),0_0_50px_rgba(249,115,22,0.8)] brightness-125 scale-x-105'
                          : 'shadow-[0_0_20px_rgba(6,182,212,0.45),0_0_30px_rgba(249,115,22,0.35)]'
                      }`}
                      style={{
                        background: 'linear-gradient(to top, #06b6d4 0%, #0284c7 25%, #f97316 70%, #ef4444 100%)'
                      }}
                    >
                      {/* Efecto de escáner de energía vertical dentro de la columna */}
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-60 animate-pulse" />
                      
                      {/* Líneas horizontales de telemetría HUD sobre la barra */}
                      <div 
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 6px)'
                        }}
                      />
                    </div>

                    {/* CÚSPIDE 3D (TAPA SUPERIOR DE LA BARRA): Proyección isométrica */}
                    <div 
                      className={`absolute -top-3 left-0 w-full h-3 rounded-t-md border border-white/60 transition-all duration-300 ${
                        isHot 
                          ? 'bg-red-400 shadow-[0_0_15px_#ef4444]' 
                          : isOptimal 
                          ? 'bg-orange-400 shadow-[0_0_15px_#f97316]' 
                          : 'bg-cyan-300 shadow-[0_0_15px_#06b6d4]'
                      }`}
                      style={{
                        transform: 'rotateX(55deg) translateZ(2px)'
                      }}
                    />

                    {/* BASE EN DUELA (PROYECCIÓN DE SOMBRA DE NEÓN) */}
                    <div 
                      className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-6 rounded-full blur-md transition-all duration-300 pointer-events-none ${
                        isHovered || isSelected 
                          ? 'bg-cyan-400/80 scale-125' 
                          : 'bg-cyan-500/40'
                      }`}
                    />
                  </div>

                  {/* ETIQUETA EN LA DUELA (NOMBRE DE ZONA) */}
                  <div className="mt-4 text-center font-mono text-[10px] sm:text-[11px] font-black text-zinc-300 group-hover:text-cyan-300 transition-colors uppercase tracking-tight line-clamp-1">
                    {item.zona}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. PANEL DE TELEMETRÍA TÁCTICA HUD EN TIEMPO REAL */}
      <div className="relative z-10 mt-6 p-5 rounded-2xl bg-[#080d19]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.12)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold">
              // TELEMETRÍA CINEMÁTICA SELECCIONADA
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-base sm:text-lg font-black text-white uppercase">
                {activeItem.zona}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                activeItem.porcentaje >= 75
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                  : activeItem.porcentaje >= 60
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              }`}>
                {activeItem.porcentaje >= 75 ? '🔥 ZONA CALIENTE' : activeItem.porcentaje >= 60 ? '⚡ ZONA FAVORABLE' : '🎯 REGULAR / FRÍA'}
              </span>
            </div>
          </div>
        </div>

        {/* MÉTRICAS NUMÉRICAS EN CÁPSULAS HUD */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          <div className="px-3.5 py-2 rounded-xl bg-[#0d1627] border border-cyan-500/30">
            <span className="text-zinc-400 text-[10px] block">EFICACIA</span>
            <span className="text-lg font-black text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
              {activeItem.porcentaje}%
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#0d1627] border border-cyan-500/30">
            <span className="text-zinc-400 text-[10px] block">TIROS ENC./INT.</span>
            <span className="text-lg font-black text-emerald-400">
              {activeItem.encestados ?? Math.round(activeItem.porcentaje / 10)}/{activeItem.intentos ?? 10}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#0d1627] border border-orange-500/30">
            <span className="text-zinc-400 text-[10px] block">CANCHA OFICIAL</span>
            <span className="text-xs font-black text-orange-400">
              CARMEN SERDÁN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
