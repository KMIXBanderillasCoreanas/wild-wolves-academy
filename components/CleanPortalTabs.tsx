'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  RotateCw, 
  Crosshair,
  Activity,
  Plane,
  Users,
  Lock,
  Verified,
  Fingerprint,
  Download
} from 'lucide-react';
import TacticalCourtStitch from '@/components/TacticalCourtStitch';
import BiomechanicsShotBackboardSystem from '@/components/BiomechanicsShotBackboardSystem';

export interface CleanTabMetrics {
  verticalJumpCm: number;
  sprint20mSeconds: number;
  shootingEfficiencyPct: number;
  overallOvr: number;
  freeThrowsPct: number;
  midRangePct: number;
  threePointPct: number;
  baseline: {
    verticalJumpCm: number;
    sprint20mSeconds: number;
    shootingEfficiencyPct: number;
    entryDate?: string;
  };
  monthlyProgression: Array<{
    month: string;
    verticalJumpCm: number;
    sprint20mSeconds: number;
    shootingPct: number;
    ovr: number;
  }>;
  shotHeatmapData: {
    freeThrowsMade: number;
    freeThrowsAttempts?: number;
    midRangeLeftMade: number;
    midRangeRightMade: number;
    threeCornerLeftMade: number;
    threeWingLeftMade: number;
    threeTopKeyMade: number;
    threeWingRightMade: number;
    threeCornerRightMade: number;
  };
  officialHistory: Array<{
    date: string;
    ovr: number;
    verticalJump: string;
    sprint: string;
    shooting: string;
    evaluator: string;
    status: string;
  }>;
}

interface CleanPortalTabsProps {
  athleteName: string;
  category?: string;
  jerseyNumber?: number | string;
  metrics: CleanTabMetrics;
  mode?: 'student' | 'guardian';
}

export default function CleanPortalTabs({
  athleteName = 'Mateo Silva',
  category = 'U-17 Competitivo (Élite)',
  jerseyNumber = '10',
  metrics,
  mode = 'student'
}: CleanPortalTabsProps) {
  // Pestañas alineadas con el HUD de Stitch
  const [activeSection, setActiveSection] = useState<'all' | 'desglose_tiros' | 'biometria' | 'insignias'>('all');

  return (
    <div className="w-full flex flex-col gap-8 pb-12 font-sans select-none text-[#e2e2ea]">
      
      {/* 1. TOP HUD / CYBER WOLF CARD LAYER (STITCH MATCH EXACTO) */}
      <section className="relative z-10 w-full flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* ATHLETE IDENTITY CARD (CYBER WOLF DIGITAL PASSPORT) */}
        <div className="flex-1 bg-[#191c21] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-[#282a30]">
          {/* Accent top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff6b00] via-[#7bd0ff] to-[#4edea3]"></div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#ff6b00]/10 blur-3xl pointer-events-none"></div>

          {/* Upper Row: Roster tag & Biological Rank */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-[#1d2025] text-[#ffb693] font-mono text-xs uppercase tracking-wider rounded border border-[#5a4136]/50">
                MOD // ATHLETE_HUD_v4.2
              </span>
              <span className="px-2.5 py-1 bg-[#1d2025] text-[#7bd0ff] font-mono text-[11px] uppercase tracking-widest rounded flex items-center gap-1.5 border border-[#004c69]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7bd0ff] animate-ping"></span>
                TIER 3: INTERMEDIO AVANZADO
              </span>
            </div>
            <div className="font-mono text-xs text-[#e2bfb0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
              <span>SISTEMA BIOMÉTRICO AUDITADO</span>
            </div>
          </div>

          {/* Main ID Info Block */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6">
            
            {/* Holographic Avatar Container */}
            <div className="md:col-span-4 relative flex items-center justify-center">
              <div className="relative w-36 h-44 rounded-xl overflow-hidden bg-[#33353b] shadow-2xl flex items-center justify-center border border-[#5a4136]/40">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO0LHr3QeISP6lrtwGfxPmqB_xkuRyPP61OFvk0mIr5kDzgubQw3kBwHv4wgv4pMER03mVO0T8rXTVlFSc-ynqN1V-rG187IdHwPs3pv9GnXcHV-1szFlDkUe-k2imE2leJB8rTfJKMJMJ0G_RbjuVNXntMTnEi_Ibye60OXWn3KvIDZL8e0p7sW1OFOFP7qPWwPU04LfA4uJ4b3zMfntxKVuWnAptEeaHB--zsCk"
                  alt={`Atleta ${athleteName}`}
                  fill
                  sizes="180px"
                  className="object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e13] via-transparent to-transparent opacity-85"></div>
                <div className="absolute bottom-2 left-2.5 right-2.5 flex justify-between items-center text-white">
                  <span className="font-mono text-[11px] tracking-widest uppercase text-[#7bd0ff]">
                    #WOLF-8902
                  </span>
                  <Fingerprint className="w-4 h-4 text-[#ffb693]" />
                </div>
              </div>
              {/* Decorative corner targeting crosshairs */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#7bd0ff]"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ff6b00]"></div>
            </div>

            {/* Bio & Category Details */}
            <div className="md:col-span-8 flex flex-col justify-center gap-1.5">
              <div className="flex items-baseline gap-4 flex-wrap">
                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                  {athleteName}
                </h1>
                <span className="text-3xl sm:text-4xl font-mono text-[#ff6b00] font-black leading-none">
                  #{jerseyNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-zinc-400 font-mono text-xs">
                <span className="text-[#ffb693] font-bold">{category}</span>
                <span>//</span>
                <span>BASE &amp; ESCOLTA DUAL</span>
                <span>//</span>
                <span className="text-[#7bd0ff]">CLUB WILD WOLVES CDMX</span>
              </div>

              {/* Callout Status Pill */}
              <div className="mt-3 p-3 bg-[#1d2025] rounded-xl flex items-center justify-between gap-3 border border-[#282a30]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b00] animate-pulse" />
                  <span className="font-mono text-xs uppercase text-zinc-200 tracking-wide">
                    CONVOCADO TITULAR // PRÓX. PARTIDO EN CARMEN SERDÁN
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-[#ff6b00] text-black font-black px-2.5 py-0.5 rounded uppercase">
                  CONFIRMADO
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Bottom Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 bg-[#0c0e13]/80 rounded-xl p-3 border border-[#282a30]/60">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">ALTURA</span>
              <span className="font-mono text-base font-bold text-white">1.84 <span className="text-xs text-zinc-500 font-normal">m</span></span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">ENVERGADURA</span>
              <span className="font-mono text-base font-bold text-[#7bd0ff]">1.92 <span className="text-xs text-zinc-500 font-normal">m</span></span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">PESO CORP</span>
              <span className="font-mono text-base font-bold text-white">74.2 <span className="text-xs text-zinc-500 font-normal">kg</span></span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">GRASA CORP</span>
              <span className="font-mono text-base font-bold text-[#4edea3]">9.4 <span className="text-xs text-zinc-500 font-normal">%</span></span>
            </div>
            <div className="flex flex-col col-span-2 sm:col-span-1">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">REACCIÓN</span>
              <span className="font-mono text-base font-bold text-[#ffb693]">0.22 <span className="text-xs text-zinc-500 font-normal">s</span></span>
            </div>
          </div>
        </div>

        {/* OVERALL RATING HUD HERO CARD (88 OVR NEON) */}
        <div className="w-full lg:w-80 bg-[#191c21] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-[#282a30]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest font-bold">CALIBRE TOTAL</span>
            <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-mono text-[10px] font-bold uppercase border border-[#4edea3]/40">
              +3 MES EN CURSO
            </span>
          </div>

          {/* Giant Neon OVR Badge */}
          <div className="flex flex-col items-center justify-center my-6 relative">
            <div className="absolute w-40 h-40 rounded-full bg-[#ff6b00]/25 blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="font-mono text-8xl leading-none font-black text-[#ff6b00] drop-shadow-[0_0_30px_rgba(255,107,0,0.55)]">
                {metrics.overallOvr || 88}
              </span>
              <span className="font-mono text-xs text-white uppercase tracking-widest mt-2 font-black">
                VALORACIÓN GENERAL OVR
              </span>
            </div>
          </div>

          {/* Quick Sub-Indices */}
          <div className="flex flex-col gap-2 bg-[#0c0e13]/90 p-3 rounded-xl border border-[#282a30]">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>DISPARO TOTAL</span>
              <span className="text-[#4edea3] font-bold">91 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#282a30] rounded-full overflow-hidden">
              <div className="bg-[#4edea3] h-full w-[91%] rounded-full shadow-[0_0_8px_#4edea3]"></div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mt-1">
              <span>AGILIDAD Y VERTICAL</span>
              <span className="text-[#7bd0ff] font-bold">86 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#282a30] rounded-full overflow-hidden">
              <div className="bg-[#7bd0ff] h-full w-[86%] rounded-full shadow-[0_0_8px_#7bd0ff]"></div>
            </div>
          </div>

          <div className="mt-4 pt-2 flex items-center justify-between text-zinc-400 font-mono text-[10px] border-t border-[#282a30]">
            <span>SEDE: DEP. CARMEN SERDÁN</span>
            <span className="text-[#ffb693] font-bold">LOCK_ALFA #{jerseyNumber}</span>
          </div>
        </div>
      </section>

      {/* 2. SECTION 1: DESGLOSE TÉCNICO DE 35 TIROS & GUÍA BIOMECÁNICA AL 100% */}
      <section className="w-full bg-[#191c21] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative border border-[#282a30]">
        
        {/* Section Title & Telemetry Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ff6b00] rounded-sm"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#ffb693]">
                SEC_01 // VECTOR DUELA FIBA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              DESGLOSE TÉCNICO DE 35 TIROS
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Mapeo cinemático de alta precisión capturado por sensores ópticos en duela interior Carmen Serdán. Calibración en 4 zonas tácticas exclusivas con el tablero biomecánico al 100%.
            </p>
          </div>

          {/* Telemetry Pill Summaries */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-[#1d2025] px-4 py-2 rounded-xl flex flex-col border border-[#282a30]">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">TOTAL CALIBRADO</span>
              <span className="font-mono text-base font-bold text-[#4edea3]">
                30/35 <span className="text-xs text-zinc-400 font-normal">(85.7% FG)</span>
              </span>
            </div>
            <div className="bg-[#1d2025] px-4 py-2 rounded-xl flex flex-col border border-[#282a30]">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">PARÁBOLA PROMEDIO</span>
              <span className="font-mono text-base font-bold text-[#7bd0ff]">
                48.2° <span className="text-xs text-zinc-400 font-normal">OPTIMAL</span>
              </span>
            </div>
            <div className="bg-[#1d2025] px-4 py-2 rounded-xl flex flex-col border border-[#282a30]">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">RELEASE TIME</span>
              <span className="font-mono text-base font-bold text-[#ffb693]">
                0.68s <span className="text-xs text-zinc-400 font-normal">ÉLITE</span>
              </span>
            </div>
          </div>
        </div>

        {/* GUÍA BIOMECÁNICA AL 100% (TABLERO MILIMÉTRICO Y PUNTOS DE IMPACTO) */}
        <div className="w-full">
          <BiomechanicsShotBackboardSystem
            athleteName={athleteName}
            jerseyNumber={jerseyNumber}
            overallOvr={metrics.overallOvr}
          />
        </div>

        {/* CANCHA TÁCTICA INTERACTIVA DE BALONCESTO */}
        <div className="w-full">
          <TacticalCourtStitch
            athleteName={athleteName}
            jerseyNumber={jerseyNumber}
            category={category}
            overallOvr={metrics.overallOvr}
            initialZone="paint"
          />
        </div>
      </section>

      {/* 3. SECTION 2: BIOMETRÍA FÍSICA & ATLÉTICA (HISTORIC PROGRESSION BASELINE VS CURRENT) */}
      <section className="w-full bg-[#191c21] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative border border-[#282a30]">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#7bd0ff] rounded-sm"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#7bd0ff]">
                SEC_02 // KINEMATIC READOUT
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              BIOMETRÍA FÍSICA &amp; ATLÉTICA // HISTORIAL PROGRESIVO
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Comparativa directa de evolución motriz: Día 1 de reclutamiento (Línea Base) contra estado actual auditado en laboratorio deportivo Carmen Serdán.
            </p>
          </div>

          <div className="px-4 py-2 bg-[#1d2025] rounded-xl flex items-center gap-3 border border-[#282a30]">
            <TrendingUp className="w-5 h-5 text-[#7bd0ff]" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">BENCHMARK LOCAL</span>
              <span className="font-mono text-sm font-bold text-white">PERCENTIL 94% CDMX</span>
            </div>
          </div>
        </div>

        {/* Progression Cards Grid (Salto de Cuerda, Sprint, Salto Vertical) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* MÉTRICA 1: SALTO DE CUERDA (1,000 SALTOS) */}
          <div className="bg-[#1d2025] rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[#282a30] hover:border-[#4edea3]/50 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#4edea3] uppercase font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
                RESISTENCIA ANAERÓBICA
              </span>
              <span className="px-2 py-0.5 bg-[#4edea3]/20 text-[#4edea3] font-mono text-[10px] uppercase font-bold rounded border border-[#4edea3]/30">
                +122% INCREMENTO
              </span>
            </div>

            <div>
              <span className="font-mono text-xs text-zinc-400 uppercase">SALTO DE CUERDA CONTINUO</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-4xl sm:text-5xl text-white font-black">1,000</span>
                <span className="font-mono text-xs text-[#4edea3] font-bold">SALTOS SIN CORTE</span>
              </div>
              <span className="text-xs text-zinc-400 mt-1 block">Cadencia constante sostenida: 142 RPM</span>
            </div>

            {/* Historic Progression Dual Bar */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#282a30]">
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-zinc-400">DÍA 1 (LÍNEA BASE): 450</span>
                <span className="text-[#4edea3] font-bold">ACTUAL: 1,000 REPS</span>
              </div>
              <div className="w-full h-3 bg-[#282a30] rounded-full overflow-hidden flex">
                <div className="bg-zinc-600 h-full w-[45%]" title="Día 1: 450"></div>
                <div className="bg-[#4edea3] h-full w-[55%]" title="Incremento actual"></div>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                <span>0</span>
                <span>META INTERMEDIA SUPERADA</span>
                <span>1,000</span>
              </div>
            </div>
          </div>

          {/* MÉTRICA 2: SPRINT 20M FOTOCELDAS LÁSER (11.03s) */}
          <div className="bg-[#1d2025] rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[#282a30] hover:border-[#ff6b00]/50 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#ffb693] uppercase font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#ff6b00]" />
                ACELERACIÓN EXPLOSIVA
              </span>
              <span className="px-2 py-0.5 bg-[#ff6b00]/20 text-[#ffb693] font-mono text-[10px] uppercase font-bold rounded border border-[#ff6b00]/30">
                -2.37s REDUCCIÓN
              </span>
            </div>

            <div>
              <span className="font-mono text-xs text-zinc-400 uppercase">SPRINT 20M LÁSER CDMX</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-4xl sm:text-5xl text-white font-black">
                  {metrics.sprint20mSeconds ? `${metrics.sprint20mSeconds}s` : "11.03s"}
                </span>
                <span className="font-mono text-xs text-[#ffb693] font-bold">AGILIDAD COMPLETA</span>
              </div>
              <span className="text-xs text-zinc-400 mt-1 block">Sprint recto puro: 3.18s (Línea base: 3.80s)</span>
            </div>

            {/* Historic Progression Dual Bar */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#282a30]">
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-zinc-400">DÍA 1: 13.40s TOTAL</span>
                <span className="text-[#ff6b00] font-bold">ACTUAL: 11.03s</span>
              </div>
              <div className="w-full h-3 bg-[#282a30] rounded-full overflow-hidden flex">
                <div className="bg-[#ff6b00] h-full w-[82%]" title="Eficiencia actual"></div>
                <div className="bg-zinc-600 h-full w-[18%]" title="Margen recortado"></div>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                <span>TIEMPO OPTIMIZADO</span>
                <span>FOTOCELDA LÁSER</span>
              </div>
            </div>
          </div>

          {/* MÉTRICA 3: SALTO VERTICAL BIOMECÁNICO (65 cm / 40 cm) */}
          <div className="bg-[#1d2025] rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[#282a30] hover:border-[#7bd0ff]/50 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#7bd0ff] uppercase font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7bd0ff]" />
                POTENCIA VERTICAL
              </span>
              <span className="px-2 py-0.5 bg-[#7bd0ff]/20 text-[#7bd0ff] font-mono text-[10px] uppercase font-bold rounded border border-[#7bd0ff]/30">
                +15 CM GANANCIA NETA
              </span>
            </div>

            <div>
              <span className="font-mono text-xs text-zinc-400 uppercase">SALTO MÁXIMO CON CARRERA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-4xl sm:text-5xl text-white font-black">
                  {metrics.verticalJumpCm || 65} cm
                </span>
                <span className="font-mono text-xs text-[#7bd0ff] font-bold">(40 cm ESTÁTICO)</span>
              </div>
              <span className="text-xs text-zinc-400 mt-1 block">Línea Base: 28 cm estático / 50 cm carrera</span>
            </div>

            {/* Historic Progression Dual Bar */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#282a30]">
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="text-zinc-400">DÍA 1: 50 cm</span>
                <span className="text-[#7bd0ff] font-bold">ACTUAL: {metrics.verticalJumpCm || 65} cm</span>
              </div>
              <div className="w-full h-3 bg-[#282a30] rounded-full overflow-hidden flex">
                <div className="bg-zinc-600 h-full w-[76%]"></div>
                <div className="bg-[#7bd0ff] h-full w-[24%]"></div>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                <span>PLATAFORMA BOSCO</span>
                <span>CONTACT TIME 0.19s</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. SECTION 3: VITRINA DE INSIGNIAS WOLF & SALA DE TROFEOS */}
      <section className="w-full bg-[#191c21] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative border border-[#282a30]">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ffb693] rounded-sm"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#ffb693]">
                SEC_03 // REPUTACIÓN ALFA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              VITRINA DE INSIGNIAS WOLF &amp; SALA DE TROFEOS
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Insignias biomecánicas y de ejecución táctica auditadas en duela. Desbloqueadas mediante calibraciones verificadas por la dirección técnica de Wild Wolves.
            </p>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
            <span>4 INSIGNIAS DESBLOQUEADAS // 0 PENDIENTES</span>
          </div>
        </div>

        {/* Badge Showcase Grid (Oro, Plata, Bronce, Racha Activa) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* BADGE 1: FRANCOTIRADOR ALFA (ORO) */}
          <div className="bg-[#1d2025] rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[#ff6b00]/40 shadow-lg relative overflow-hidden group hover:border-[#ff6b00] transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff6b00]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded bg-[#ff6b00]/20 text-[#ff6b00] font-mono text-[10px] uppercase font-bold border border-[#ff6b00]/40">
                MEDALLA DE ORO
              </span>
              <span className="font-mono text-[10px] text-zinc-500">NOV 2026</span>
            </div>

            <div className="flex flex-col items-center justify-center my-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#33353b] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative border border-[#ff6b00]/30">
                <Crosshair className="w-8 h-8 text-[#ff6b00]" />
              </div>
              <h3 className="text-base font-black uppercase text-white mt-3">
                FRANCOTIRADOR ALFA
              </h3>
              <span className="font-mono text-xs text-[#ff6b00] font-bold mt-0.5">
                10/10 PINTURA &amp; TIRO LIBRE
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-[#282a30]">
              <p className="text-xs text-zinc-400 leading-relaxed">
                10 tiros libres consecutivos embocados bajo presión simulada con ruido de duela a 85dB.
              </p>
              <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500 mt-1">
                <span>VALIDACIÓN: COACH CARMEN SERDÁN</span>
                <span className="text-[#4edea3] font-bold">CONFIRMADO</span>
              </div>
            </div>
          </div>

          {/* BADGE 2: CROSSOVER MORTAL (PLATA) */}
          <div className="bg-[#1d2025] rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[#7bd0ff]/40 shadow-lg relative overflow-hidden group hover:border-[#7bd0ff] transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7bd0ff]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded bg-[#7bd0ff]/20 text-[#7bd0ff] font-mono text-[10px] uppercase font-bold border border-[#7bd0ff]/40">
                MEDALLA DE PLATA
              </span>
              <span className="font-mono text-[10px] text-zinc-500">OCT 2026</span>
            </div>

            <div className="flex flex-col items-center justify-center my-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#33353b] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative border border-[#7bd0ff]/30">
                <Zap className="w-8 h-8 text-[#7bd0ff]" />
              </div>
              <h3 className="text-base font-black uppercase text-white mt-3">
                CROSSOVER MORTAL
              </h3>
              <span className="font-mono text-xs text-[#7bd0ff] font-bold mt-0.5">
                CAMBIO DIRECCIÓN 22 KM/H
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-[#282a30]">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reacción motriz registrada en 0.22s en zig-zag cerrado con pérdida cero de balance articular.
              </p>
              <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500 mt-1">
                <span>SENSOR: FOTOCELDA LÁSER</span>
                <span className="text-[#4edea3] font-bold">CONFIRMADO</span>
              </div>
            </div>
          </div>

          {/* BADGE 3: GRAVEDAD CERO (BRONCE) */}
          <div className="bg-[#1d2025] rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[#ffb693]/40 shadow-lg relative overflow-hidden group hover:border-[#ffb693] transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffb693]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded bg-[#ffb693]/20 text-[#ffb693] font-mono text-[10px] uppercase font-bold border border-[#ffb693]/40">
                MEDALLA DE BRONCE
              </span>
              <span className="font-mono text-[10px] text-zinc-500">NOV 2026</span>
            </div>

            <div className="flex flex-col items-center justify-center my-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#33353b] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative border border-[#ffb693]/30">
                <Plane className="w-8 h-8 text-[#ffb693]" />
              </div>
              <h3 className="text-base font-black uppercase text-white mt-3">
                GRAVEDAD CERO
              </h3>
              <span className="font-mono text-xs text-[#ffb693] font-bold mt-0.5">
                VERTICAL &gt; 60 CM
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-[#282a30]">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Salto vertical con carrera de 65 cm auditado sobre la duela del Deportivo Carmen Serdán.
              </p>
              <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500 mt-1">
                <span>TEST: PLATAFORMA BOSCO</span>
                <span className="text-[#4edea3] font-bold">CONFIRMADO</span>
              </div>
            </div>
          </div>

          {/* BADGE 4: LOBO DE HIERRO (RACHA ACTIVA) */}
          <div className="bg-[#1d2025] rounded-2xl p-6 flex flex-col justify-between gap-4 border border-[#4edea3]/40 shadow-lg relative overflow-hidden group hover:border-[#4edea3] transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#4edea3]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-mono text-[10px] uppercase font-bold border border-[#4edea3]/40">
                RACHA ACTIVA
              </span>
              <span className="font-mono text-[10px] text-zinc-500">EN CURSO</span>
            </div>

            <div className="flex flex-col items-center justify-center my-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#33353b] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative border border-[#4edea3]/30">
                <Users className="w-8 h-8 text-[#4edea3]" />
              </div>
              <h3 className="text-base font-black uppercase text-white mt-3">
                LOBO DE HIERRO
              </h3>
              <span className="font-mono text-xs text-[#4edea3] font-bold mt-0.5">
                16 ASISTENCIAS SIN PERDER BALÓN
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-[#282a30]">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Racha consecutiva de pases para anotación durante el último microciclo competitivo de la liga.
              </p>
              <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500 mt-1">
                <span>RATIO AST/TO: 4.8</span>
                <span className="text-[#4edea3] font-bold">ACTIVO</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Tactical Quote / Protocol Signature */}
        <div className="bg-[#1d2025] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#282a30]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#ff6b00]" />
            <div className="flex flex-col">
              <span className="font-mono text-xs sm:text-sm text-white font-bold">
                EXPEDIENTE ATLETA #{jerseyNumber} // DEPORTIVO CARMEN SERDÁN
              </span>
              <span className="text-xs text-zinc-400">
                Toda la telemetría biomecánica está sincronizada en tiempo real con el servidor de desarrollo deportivo.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="px-5 py-2.5 bg-[#ff6b00] hover:bg-[#ff8533] text-black rounded-xl font-mono text-xs uppercase font-black transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>EXPORTAR INFORME PDF</span>
          </button>
        </div>

      </section>

    </div>
  );
}
