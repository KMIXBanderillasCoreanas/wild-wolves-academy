'use client';

import React, { useState } from 'react';
import { Sparkles, Target, Zap, Activity, Info, Flame, Eye } from 'lucide-react';

export interface DuelaHolograficaProps {
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
  dataTiros?: any;
}

export default function DuelaHolografica3D({
  freeThrowsMade = 7,
  freeThrowsAttempted = 10,
  midLeftMade = 6,
  midLeftAttempted = 10,
  midRightMade = 6,
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
  cornerRightAttempted = 5,
  dataTiros
}: DuelaHolograficaProps) {
  const [zonaSeleccionada, setZonaSeleccionada] = useState<any | null>(null);
  const [viewAngle, setViewAngle] = useState<'3d' | 'top'>('3d');

  // Cálculos de porcentajes reales o simulados
  const calcPct = (m: number, a: number) => Math.round((m / (a || 1)) * 100);

  const ftPct = dataTiros?.ftPct ?? calcPct(freeThrowsMade, freeThrowsAttempted);
  const midLeftPct = dataTiros?.midLeftPct ?? calcPct(midLeftMade, midLeftAttempted);
  const midRightPct = dataTiros?.midRightPct ?? calcPct(midRightMade, midRightAttempted);
  const cLeftPct = dataTiros?.cLeftPct ?? calcPct(cornerLeftMade, cornerLeftAttempted);
  const wLeftPct = dataTiros?.wLeftPct ?? calcPct(wingLeftMade, wingLeftAttempted);
  const topPct = dataTiros?.topPct ?? calcPct(topKeyMade, topKeyAttempted);
  const wRightPct = dataTiros?.wRightPct ?? calcPct(wingRightMade, wingRightAttempted);
  const cRightPct = dataTiros?.cRightPct ?? calcPct(cornerRightMade, cornerRightAttempted);

  // Métrica global
  const totalMade = freeThrowsMade + midLeftMade + midRightMade + cornerLeftMade + wingLeftMade + topKeyMade + wingRightMade + cornerRightMade;
  const totalAtt = freeThrowsAttempted + midLeftAttempted + midRightAttempted + cornerLeftAttempted + wingLeftAttempted + topKeyAttempted + wingRightAttempted + cornerRightAttempted;
  const globalEfficiency = Math.round((totalMade / (totalAtt || 1)) * 100);

  // Helper de estilos por rango de efectividad
  const getZoneStyle = (pct: number) => {
    if (pct >= 70) {
      return {
        status: 'Zona Caliente (Óptima)',
        gradient: 'from-orange-500 to-amber-600',
        badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        shadow: 'shadow-[0_0_25px_rgba(249,115,22,0.6)]',
        border: 'border-orange-500/60'
      };
    }
    if (pct >= 50) {
      return {
        status: 'Favorable (Controlada)',
        gradient: 'from-amber-500 to-yellow-600',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
        border: 'border-amber-500/50'
      };
    }
    if (pct >= 35) {
      return {
        status: 'Regular (En Proceso)',
        gradient: 'from-cyan-500 to-blue-600',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
        border: 'border-cyan-500/50'
      };
    }
    return {
      status: 'Zona Fría (Requiere Ajuste)',
      gradient: 'from-slate-600 to-zinc-800',
      badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      shadow: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]',
      border: 'border-zinc-700'
    };
  };

  const zonas = [
    {
      id: 'media-izq',
      nombre: 'Media Izq (45°)',
      made: midLeftMade,
      attempted: midLeftAttempted,
      porcentaje: midLeftPct,
      pos: 'col-span-1',
      tactics: 'Parada en 2 tiempos y suspensión. Ataque sobre defensores altos.'
    },
    {
      id: 'pintura',
      nombre: 'Línea Libre / Pintura',
      made: freeThrowsMade,
      attempted: freeThrowsAttempted,
      porcentaje: ftPct,
      pos: 'col-span-1',
      tactics: 'Rutina fija de 3 botes, quiebre de muñeca y follow-through de 1 segundo.'
    },
    {
      id: 'media-der',
      nombre: 'Media Der (45°)',
      made: midRightMade,
      attempted: midRightAttempted,
      porcentaje: midRightPct,
      pos: 'col-span-1',
      tactics: 'Salida rápida de drible hacia el codo derecho con finta de pase.'
    },
    {
      id: 'ala-izq',
      nombre: '3P Ala Izquierda',
      made: wingLeftMade,
      attempted: wingLeftAttempted,
      porcentaje: wLeftPct,
      pos: 'col-span-1',
      tactics: 'Recepción en catch & shoot con pies orientados al aro de Carmen Serdán.'
    },
    {
      id: 'top-key',
      nombre: '3P Top Key (Cabecera)',
      made: topKeyMade,
      attempted: topKeyAttempted,
      porcentaje: topPct,
      pos: 'col-span-1',
      tactics: 'Lanzamiento frontal tras pick & pop. Excelente parábola de tiro.'
    },
    {
      id: 'ala-der',
      nombre: '3P Ala Derecha',
      made: wingRightMade,
      attempted: wingRightAttempted,
      porcentaje: wRightPct,
      pos: 'col-span-1',
      tactics: 'Transición ofensiva rápida aprovechando desbalance defensivo.'
    },
    {
      id: 'esquina-izq',
      nombre: '3P Córner Izquierdo',
      made: cornerLeftMade,
      attempted: cornerLeftAttempted,
      porcentaje: cLeftPct,
      pos: 'col-span-1 sm:col-span-1.5',
      tactics: 'Tiro de menor distancia FIBA (6.60m). Cuidado con pisar la línea lateral.'
    },
    {
      id: 'esquina-der',
      nombre: '3P Córner Derecho',
      made: cornerRightMade,
      attempted: cornerRightAttempted,
      porcentaje: cRightPct,
      pos: 'col-span-2 sm:col-span-1.5',
      tactics: 'Espacio clave para abrir la cancha en situaciones de penetración.'
    }
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4 sm:p-7 bg-[#07090e] border border-cyan-900/40 rounded-3xl overflow-hidden shadow-2xl font-sans selection:bg-cyan-500/30">
      
      {/* Resplandor ambiental holográfico de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-72 bg-gradient-to-b from-cyan-500/10 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* CABECERA DEL HUD CIBERNÉTICO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 z-10 relative pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/40 flex items-center gap-1.5 shadow-sm shadow-cyan-950">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              Holographic HUD v3.2 // Shot Science
            </span>
            <span className="text-[10px] font-mono uppercase text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded border border-orange-500/30">
              FIBA Precision
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
            <span>MAPA TÁCTICO 3D (DUELA VIVA)</span>
            <Activity className="w-5 h-5 text-cyan-400 hidden sm:inline" />
          </h2>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Sede Deportivo Carmen Serdán • Calibración en tiempo real de 8 sectores de tiro
          </p>
        </div>

        {/* Acciones y Métricas Globales */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            onClick={() => setViewAngle(viewAngle === '3d' ? 'top' : '3d')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-zinc-800 transition cursor-pointer"
            title="Alternar ángulo de perspectiva"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Perspectiva: {viewAngle.toUpperCase()}</span>
          </button>

          <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-mono font-black flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Eficiencia: {globalEfficiency}% ({totalMade}/{totalAtt})</span>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE LA DUELA CON PERSPECTIVA HOLOGRÁFICA 3D */}
      <div 
        className={`relative w-full bg-[#0b101d]/90 border-2 border-cyan-500/30 rounded-3xl p-4 sm:p-6 flex flex-col justify-between backdrop-blur-2xl shadow-[inset_0_0_60px_rgba(6,182,212,0.12)] transition-transform duration-700 ease-out ${
          viewAngle === '3d' ? 'transform perspective-[1100px] rotate-x-6' : ''
        }`}
      >
        {/* Trazado holográfico de líneas de la duela (Neón) */}
        <div className="absolute inset-3 sm:inset-5 border-2 border-cyan-500/20 rounded-2xl pointer-events-none overflow-hidden">
          {/* Zona Restringida / Pintura */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 sm:w-56 h-32 sm:h-44 border-b-2 border-x-2 border-orange-500/30 bg-orange-500/[0.02]" />
          
          {/* Círculo de Tiro Libre */}
          <div className="absolute top-24 sm:top-36 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-28 sm:h-36 border-2 border-cyan-400/25 rounded-full" />
          
          {/* Arco de 3 Puntos (Neón Naranja FIBA) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] sm:w-[75%] h-64 sm:h-80 border-b-2 border-x-2 border-orange-500/40 rounded-b-[180px] shadow-[0_4px_25px_rgba(249,115,22,0.15)]" />
          
          {/* Canasta / Tablero */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/60 shadow-[0_0_12px_#fff]" />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-orange-400 bg-orange-500/30" />
        </div>

        {/* TARJETAS HOLOGRÁFICAS FLOTANTES (GLASSMORPHISM CON NEÓN) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 z-20 relative my-2">
          {zonas.map((zona) => {
            const style = getZoneStyle(zona.porcentaje);
            const isSelected = zonaSeleccionada?.id === zona.id;

            return (
              <div
                key={zona.id}
                onClick={() => setZonaSeleccionada(zona)}
                className={`group cursor-pointer p-3 sm:p-4 rounded-2xl bg-[#0d1322]/85 border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-300 bg-cyan-950/40 ring-2 ring-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                    : `${style.border} hover:border-cyan-400/80 ${style.shadow}`
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-[10px] sm:text-[11px] font-mono text-zinc-300 uppercase tracking-tight font-bold truncate">
                    {zona.nombre}
                  </span>
                  <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${style.badge}`}>
                    {zona.made}/{zona.attempted}
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    {zona.porcentaje}%
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                    Efectividad
                  </span>
                </div>

                {/* Barra de progreso holográfica viva */}
                <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden p-0.5 border border-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.gradient} transition-all duration-700 ${
                      zona.porcentaje >= 70 ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${Math.max(12, zona.porcentaje)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL INFERIOR DE ANÁLISIS HOLOGRÁFICO (TACTICAL HUD INSPECTOR) */}
      {zonaSeleccionada ? (
        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-cyan-950/60 via-[#0d1527] to-[#07090e] border border-cyan-500/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in shadow-xl shadow-cyan-950/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-mono uppercase font-black tracking-widest flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> SECTOR ANALIZADO:
              </span>
              <span className="text-xs font-mono font-bold text-white bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-700/50">
                {zonaSeleccionada.nombre}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-200">
              {zonaSeleccionada.made} encestes de {zonaSeleccionada.attempted} intentos ({zonaSeleccionada.porcentaje}% de acierto).
            </p>
            <p className="text-[11px] text-cyan-300/80 font-mono italic">
              💡 Recomendación Coach: {zonaSeleccionada.tactics}
            </p>
          </div>

          <button
            onClick={() => setZonaSeleccionada(null)}
            className="text-xs font-mono font-bold text-zinc-300 hover:text-white px-3.5 py-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition cursor-pointer self-end sm:self-auto"
          >
            Cerrar Inspector
          </button>
        </div>
      ) : (
        <div className="mt-3 text-center text-[11px] font-mono text-zinc-500">
          Toca cualquier tarjeta holográfica para inspeccionar táctica de tiro, aciertos y biomecánica en duela.
        </div>
      )}
    </div>
  );
}
