'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Target, ChevronRight, CheckCircle2 } from 'lucide-react';

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
    <div className="w-full bg-[#07090E] text-slate-200 rounded-3xl border border-[#1F2433] p-3 sm:p-6 shadow-2xl relative overflow-hidden font-sans select-none">
      
      {/* CABECERA TÁCTICA MINIMALISTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2433] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#FF6B00] uppercase font-black">
              SISTEMA BIOMECÁNICO WILD WOLVES
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              GUÍA DE PUNTERÍA AL 100%
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B00]" />
            MAPA TÁCTICO DE TIRO &amp; PUNTOS DE IMPACTO
          </h2>
        </div>

        <div className="text-[11px] font-mono text-slate-400 bg-[#0B0E17] px-3 py-1.5 rounded-xl border border-[#1F2433] self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DEPORTIVO CARMEN SERDÁN · FIBA STANDARD</span>
        </div>
      </div>

      {/* VISTA PRINCIPAL DE LA DUELA (PANTALLA LIMPIA DE STITCH SIN TARJETAS SUPERPUESTAS) */}
      <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] bg-[#0A0D14] rounded-2xl border-2 border-[#06B6D4]/30 overflow-hidden shadow-2xl">
        <Image
          src="/biomechanics-tactical-board.jpg"
          alt="Sistema Biomecánico Wild Wolves: Guía de Puntería al 100%"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-contain w-full h-full"
        />

        {/* ÁREAS DE INTERACCIÓN TÁCTIL SUTILES */}
        {/* Zona Verde (Media Distancia / Alas interiores) */}
        <button
          type="button"
          aria-label="Zona Verde Media Distancia"
          onClick={() => setActiveZone('green')}
          className={`absolute top-[28%] right-[17%] w-[24%] h-[48%] rounded-full transition-all duration-300 ${
            activeZone === 'green'
              ? 'ring-2 ring-emerald-400/80 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'hover:bg-emerald-500/5'
          }`}
        />

        {/* Zona Azul (Perímetro Exterior) */}
        <button
          type="button"
          aria-label="Zona Azul Perímetro"
          onClick={() => setActiveZone('blue')}
          className={`absolute top-[18%] right-[11%] w-[32%] h-[68%] rounded-full transition-all duration-300 ${
            activeZone === 'blue'
              ? 'ring-2 ring-cyan-400/80 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              : 'hover:bg-cyan-500/5'
          }`}
        />

        {/* Detalle Tablero Superior */}
        <button
          type="button"
          aria-label="Punto Tablero"
          onClick={() => setActiveZone(activeZone === 'green' ? 'blue' : 'green')}
          className="absolute top-[8%] left-[30%] w-[28%] h-[35%] rounded-xl transition-all hover:ring-1 hover:ring-[#FF6B00]/40 cursor-pointer"
        />
      </div>

      {/* TARJETAS GLASS LIMPIAS DE DESGLOSE BIOMECÁNICO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Tarjeta Punto Verde */}
        <div 
          onClick={() => setActiveZone('green')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeZone === 'green'
              ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-[#0B0E17]/60 border-[#1F2433] text-slate-300 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-white text-xs sm:text-sm font-bold font-sans">
                  PUNTO DE IMPACTO ESQUINA (VERDE)
                </strong>
                {activeZone === 'green' && (
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    SELECCIONADO
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-300/80 font-mono block mt-0.5">
                Esquina exterior del recuadro chico • Media distancia y alas
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        {/* Tarjeta Punto Azul */}
        <div 
          onClick={() => setActiveZone('blue')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeZone === 'blue'
              ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'bg-[#0B0E17]/60 border-[#1F2433] text-slate-300 hover:border-cyan-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06B6D4] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-white text-xs sm:text-sm font-bold font-sans">
                  PUNTO DE IMPACTO 5-10 cm (AZUL)
                </strong>
                {activeZone === 'blue' && (
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                    SELECCIONADO
                  </span>
                )}
              </div>
              <span className="text-[11px] text-cyan-300/80 font-mono block mt-0.5">
                Línea horizontal superior hacia el centro • Perímetro y 3 puntos
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
        </div>
      </div>

      {/* PIE DE ESTADO */}
      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Zonas contenidas dentro de la línea de 3 puntos • Telemetría Oficial
        </span>
        <span className="text-[#06B6D4]">TELEMETRY LAB // Prof. Marcos Delgado</span>
      </div>

    </div>
  );
}
