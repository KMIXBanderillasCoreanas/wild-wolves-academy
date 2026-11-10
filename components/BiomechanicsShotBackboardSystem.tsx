'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Target, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';

interface BiomechanicsShotBackboardSystemProps {
  athleteName?: string;
  jerseyNumber?: string | number;
  overallOvr?: number;
}

export default function BiomechanicsShotBackboardSystem({
  athleteName = 'Mateo Silva',
  jerseyNumber = '11',
  overallOvr = 88
}: BiomechanicsShotBackboardSystemProps) {
  const [activeZone, setActiveZone] = useState<'green' | 'blue' | 'paint'>('green');

  return (
    <div className="w-full bg-[#07090E] text-slate-200 rounded-3xl border border-[#1F2433] p-4 sm:p-6 shadow-2xl relative overflow-hidden font-sans select-none">
      
      {/* TÍTULO Y CABECERA DEL SISTEMA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2433] mb-4">
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
            <Target className="w-6 h-6 text-[#FF6B00]" />
            MAPA TÁCTICO DE TIRO &amp; PUNTOS DE IMPACTO
          </h2>
        </div>

        <div className="flex items-center gap-3 bg-[#0B0E17] px-3.5 py-1.5 rounded-xl border border-[#1F2433]">
          <div className="w-7 h-7 rounded-lg bg-[#131620] border border-[#FF6B00]/40 flex items-center justify-center font-mono font-black text-xs text-[#FF6B00]">
            #{jerseyNumber}
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-none">{athleteName}</div>
            <div className="text-[10px] text-slate-400 font-mono">Base / Escolta • U-17 Élite</div>
          </div>
          <div className="h-5 w-px bg-[#1F2433] mx-1" />
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-slate-400 block leading-none">OVR</span>
            <span className="text-xs font-mono font-black text-[#FF6B00] leading-none">{overallOvr}</span>
          </div>
        </div>
      </div>

      {/* RENDERIZADO DIRECTO, 100% FIEL Y EXACTO DE LA DUELA TÁCTICA */}
      <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] bg-[#0A0D14] rounded-2xl border-2 border-[#06B6D4]/40 overflow-hidden shadow-2xl group">
        <Image
          src="/biomechanics-tactical-board.jpg"
          alt="Sistema Biomecánico Wild Wolves: Guía de Puntería al 100%"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-contain w-full h-full"
        />

        {/* OVERLAYS INTERACTIVOS SUTILES AL HACER CLIC EN LAS ZONAS DE LA IMAGEN */}
        {/* 1. Zona Verde (Media Distancia / Alas interiores) */}
        <button
          type="button"
          aria-label="Zona Verde Media Distancia"
          onClick={() => setActiveZone('green')}
          className={`absolute top-[28%] right-[17%] w-[24%] h-[48%] rounded-full transition-all duration-300 ${
            activeZone === 'green'
              ? 'ring-2 ring-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
              : 'hover:bg-emerald-500/5'
          }`}
        />

        {/* 2. Zona Azul (Perímetro Exterior) */}
        <button
          type="button"
          aria-label="Zona Azul Perímetro"
          onClick={() => setActiveZone('blue')}
          className={`absolute top-[18%] right-[11%] w-[32%] h-[68%] rounded-full transition-all duration-300 pointer-events-none ${
            activeZone === 'blue'
              ? 'ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              : ''
          }`}
        />

        {/* 3. Punto de Impacto en Tablero */}
        <button
          type="button"
          aria-label="Punto Tablero"
          onClick={() => setActiveZone(activeZone === 'green' ? 'blue' : 'green')}
          className="absolute top-[8%] left-[30%] w-[28%] h-[35%] rounded-xl transition-all hover:ring-2 hover:ring-[#FF6B00]/60 cursor-pointer"
        />
      </div>

      {/* TARJETAS GLASS DE ANÁLISIS BIOMECÁNICO DE IMPACTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
        {/* Tarjeta Punto Verde */}
        <div 
          onClick={() => setActiveZone('green')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeZone === 'green'
              ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : 'bg-[#0B0E17]/80 border-[#1F2433] text-slate-300 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_12px_#10B981] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-white text-xs sm:text-sm font-bold font-sans">
                  PUNTO DE IMPACTO ESQUINA (VERDE)
                </strong>
                {activeZone === 'green' && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    ACTIVO
                  </span>
                )}
              </div>
              <span className="text-xs text-emerald-300/90 font-mono block mt-0.5">
                Esquina Exterior del Recuadro Chico • Media Distancia y Alas
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>

        {/* Tarjeta Punto Azul */}
        <div 
          onClick={() => setActiveZone('blue')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeZone === 'blue'
              ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)]'
              : 'bg-[#0B0E17]/80 border-[#1F2433] text-slate-300 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#06B6D4] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-white text-xs sm:text-sm font-bold font-sans">
                  PUNTO DE IMPACTO 5-10 cm (AZUL)
                </strong>
                {activeZone === 'blue' && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                    ACTIVO
                  </span>
                )}
              </div>
              <span className="text-xs text-cyan-300/90 font-mono block mt-0.5">
                Mismo nivel horizontal hacia el centro • Perímetro y 3 Puntos
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-cyan-400 shrink-0" />
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Ningún color o zona fuera de la línea de 3 puntos • Geometría FIBA Calibrada
        </span>
        <span className="text-[#06B6D4]">TELEMETRY LAB // Prof. Marcos Delgado</span>
      </div>

    </div>
  );
}
