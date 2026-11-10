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
  ArrowUpRight,
  Star
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
    <div className="w-full bg-[#07090E] text-slate-200 rounded-3xl border border-[#1F2433] p-4 sm:p-6 shadow-2xl relative overflow-hidden font-sans select-none">
      {/* TACTICAL GRID PATTERN */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.12) 0%, transparent 70%),
            linear-gradient(rgba(31, 36, 51, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31, 36, 51, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* TOP HEADER: SISTEMA BIOMECÁNICO & TELEMETRÍA (DESACOPLADA Y LIMPIA) */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1F2433] mb-5">
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

        {/* CONTROLES Y CHIP DEL ATLETA INTEGRADO EN CABECERA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-[#0B0E17]/90 px-3.5 py-1.5 rounded-xl border border-[#1F2433]">
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

          <button
            onClick={() => setShowProjectionLines(!showProjectionLines)}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-mono ${
              showProjectionLines
                ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-[#131620] text-slate-400 border-[#1F2433]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{showProjectionLines ? 'Vectores ON' : 'Vectores OFF'}</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL: LIENZO INTEGRADO EXACTO A LA IMAGEN 2 */}
      <div className="relative z-10 space-y-4">
        {/* BANNER DE ACCIÓN RÁPIDA / IMPACTO ACTIVO */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0B0E17]/80 backdrop-blur-md rounded-2xl border border-[#1F2433] text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${activeZone === 'green_mid' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : activeZone === 'blue_3pt' ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'bg-[#FF6B00] shadow-[0_0_8px_#ff6b00]'}`} />
            <span className="text-slate-400 uppercase">Punto de Impacto Seleccionado:</span>
            <strong className={activeZone === 'green_mid' ? 'text-emerald-400 font-bold' : activeZone === 'blue_3pt' ? 'text-cyan-400 font-bold' : 'text-[#FF6B00] font-bold'}>
              {activeZone === 'green_mid' 
                ? 'PUNTO VERDE: Esquina Exterior del Recuadro Chico (Media Distancia / Alas)' 
                : activeZone === 'blue_3pt' 
                ? 'PUNTO AZUL: Línea Horizontal Superior Interna (3PT Perímetro)' 
                : 'PUNTO CENTRAL: Centro de Pintura Directo al Aro'}
            </strong>
          </div>
          <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            ✓ 100% Efectivo Calibrado
          </span>
        </div>

        {/* LIENZO SVG COMPLETO: TABLERO SUPERIOR IZQUIERDO + DUELA COMPLETA SIN OBSTRUCCIONES */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[460px] max-h-[640px] bg-[#070A11] rounded-3xl border-2 border-[#1F2433] overflow-hidden shadow-inner">
          <svg viewBox="0 0 1000 600" className="w-full h-full select-none">
            <defs>
              {/* Filtro Resplandor Neón Cian */}
              <filter id="fiba-neon-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Filtro Resplandor Verde Fluorescente */}
              <filter id="glow-green-dot" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Filtro Resplandor Azul Fluorescente */}
              <filter id="glow-blue-dot" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradiente de Vidrio del Tablero */}
              <linearGradient id="backboard-glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.95" />
              </linearGradient>

              {/* Marcador de Flecha Vectorial */}
              <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#06B6D4" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF6B00" />
              </marker>
            </defs>

            {/* 1. CUADRÍCULA TÁCTICA DE FONDO (SUAVE Y PROFESIONAL) */}
            <g stroke="#161B28" strokeWidth="1" opacity="0.6">
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
                <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="600" />
              ))}
              {[80, 160, 240, 320, 400, 480, 560].map((y) => (
                <line key={`gy-${y}`} x1="0" y1={y} x2="1000" y2={y} />
              ))}
            </g>

            {/* 2. LÍNEAS TÁCTICAS NEÓN CIAN DE LA DUELA (CENTRO Y MEDIA CANCHA FIBA) */}
            <g stroke="#06B6D4" strokeWidth="2.5" fill="none" filter="url(#fiba-neon-cyan)">
              {/* Contorno perimetral de la duela */}
              <rect x="30" y="30" width="940" height="540" rx="6" strokeWidth="3" opacity="0.85" />
              {/* Línea central divisoria */}
              <line x1="280" y1="30" x2="280" y2="570" strokeWidth="3" />
              {/* Círculo central */}
              <circle cx="280" cy="300" r="70" strokeWidth="3" />
              {/* Línea de fondo derecha */}
              <line x1="880" y1="30" x2="880" y2="570" strokeWidth="3" />
            </g>

            {/* ========================================================================= */}
            {/* 3. ZONAS POLIGONALES EXACTAS DE LA DUELA (DERECHA, ORIENTADA A CANASTA)  */}
            {/* ========================================================================= */}
            
            {/* A. ZONA PINTURA / LLAVE CENTRAL (ROJO PROFUNDO #5C1417 / #7F1D1D) */}
            <g 
              className="cursor-pointer transition-opacity duration-200"
              onClick={() => setActiveZone('center_ft')}
            >
              {/* Rectángulo de pintura */}
              <rect 
                x="650" y="225" width="230" height="150" 
                fill="#7F1D1D" 
                fillOpacity={activeZone === 'center_ft' ? 0.90 : 0.65} 
                stroke="#FF6B00" 
                strokeWidth="2.5" 
              />
              {/* Círculo de tiro libre (borde izquierdo de pintura) */}
              <path 
                d="M 650 225 A 75 75 0 0 0 650 375" 
                fill="#7F1D1D" 
                fillOpacity={activeZone === 'center_ft' ? 0.90 : 0.65} 
                stroke="#06B6D4" 
                strokeWidth="2" 
              />
              <path 
                d="M 650 225 A 75 75 0 0 1 650 375" 
                fill="none" 
                stroke="#06B6D4" 
                strokeWidth="2" 
                strokeDasharray="6,6" 
              />
            </g>

            {/* B. ZONAS VERDES (MEDIA DISTANCIA / ALAS INTERIORES - SIMÉTRICAS) */}
            <g 
              className="cursor-pointer transition-all duration-200"
              onClick={() => setActiveZone('green_mid')}
            >
              {/* Ala Verde Superior (Polígono exacto a la imagen) */}
              <polygon 
                points="650,225 650,150 790,150 790,225" 
                fill="#10B981" 
                fillOpacity={activeZone === 'green_mid' ? 0.85 : 0.45} 
                stroke="#10B981" 
                strokeWidth="2.5" 
              />
              {/* Ala Verde Inferior (Polígono exacto simétrico) */}
              <polygon 
                points="650,375 790,375 790,450 650,450" 
                fill="#10B981" 
                fillOpacity={activeZone === 'green_mid' ? 0.85 : 0.45} 
                stroke="#10B981" 
                strokeWidth="2.5" 
              />
              {/* Sector Verde Frontal / Arco Central */}
              <path 
                d="M 650,150 A 210 210 0 0 0 580,300 A 210 210 0 0 0 650,450 L 650,375 A 75 75 0 0 1 650,225 Z" 
                fill="#10B981" 
                fillOpacity={activeZone === 'green_mid' ? 0.85 : 0.45} 
                stroke="#10B981" 
                strokeWidth="2" 
              />
              {/* Textos sutiles tácticos dentro de la zona verde */}
              <text x="825" y="475" fill="#34D399" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                ZONA VERDE (Impacto Interior)
              </text>
            </g>

            {/* C. ZONAS AZULES (PERÍMETRO PROFUNDO / 3 PUNTOS - BANDA EXTERIOR) */}
            <g 
              className="cursor-pointer transition-all duration-200"
              onClick={() => setActiveZone('blue_3pt')}
            >
              {/* Banda Perimetral Segmentada 3PT */}
              <path 
                d="M 790,150 L 790,100 A 260 260 0 0 0 530,300 A 260 260 0 0 0 790,500 L 790,450 A 210 210 0 0 1 580,300 A 210 210 0 0 1 790,150 Z" 
                fill="#0284C7" 
                fillOpacity={activeZone === 'blue_3pt' ? 0.85 : 0.45} 
                stroke="#06B6D4" 
                strokeWidth="2.5" 
              />
              {/* Textos sutiles tácticos dentro de la zona azul */}
              <text x="670" y="135" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                ZONA AZUL (Impacto Exterior)
              </text>
            </g>

            {/* D. SILUETAS VECTORIALES DE PIES DE ATLETA (FOOTPRINTS POSICIONADOS) */}
            <g fill="none" strokeWidth="1.8">
              {/* Footprints Naranja (Pintura Central) */}
              <g stroke="#FF6B00" fill="#FF6B00" fillOpacity="0.2">
                <ellipse cx="685" cy="292" rx="6" ry="14" />
                <ellipse cx="700" cy="292" rx="6" ry="14" />
              </g>

              {/* Footprints Verde (Ala Superior) */}
              <g stroke="#34D399" fill="#10B981" fillOpacity="0.3">
                <ellipse cx="745" cy="188" rx="6" ry="13" transform="rotate(-15 745 188)" />
                <ellipse cx="757" cy="191" rx="6" ry="13" transform="rotate(-15 757 191)" />
              </g>

              {/* Footprints Verde (Ala Inferior) */}
              <g stroke="#34D399" fill="#10B981" fillOpacity="0.3">
                <ellipse cx="745" cy="412" rx="6" ry="13" transform="rotate(15 745 412)" />
                <ellipse cx="757" cy="409" rx="6" ry="13" transform="rotate(15 757 409)" />
              </g>

              {/* Footprints Azul (Perímetro Exterior Izquierdo) */}
              <g stroke="#38BDF8" fill="#0284C7" fillOpacity="0.3">
                <ellipse cx="555" cy="300" rx="6" ry="14" />
              </g>
              {/* Footprints Azul (Perímetro Esquina Inferior) */}
              <g stroke="#38BDF8" fill="#0284C7" fillOpacity="0.3">
                <ellipse cx="670" cy="475" rx="6" ry="13" transform="rotate(25 670 475)" />
              </g>
            </g>

            {/* E. LÍNEAS VECTORIALES DE TRAYECTORIA RADIAL HACIA EL ARO DERECHO */}
            {showProjectionLines && (
              <g strokeDasharray="4,4" opacity="0.9" strokeWidth="1.8">
                {/* Desde Pintura al Aro */}
                <line x1="850" y1="300" x2="685" y2="292" stroke="#FF6B00" markerEnd="url(#arrow-orange)" />
                {/* Desde Ala Verde Superior */}
                <line x1="850" y1="300" x2="745" y2="188" stroke="#10B981" />
                <line x1="745" y1="188" x2="640" y2="120" stroke="#10B981" markerEnd="url(#arrow-green)" strokeDasharray="5,4" />
                {/* Desde Ala Verde Inferior */}
                <line x1="850" y1="300" x2="745" y2="412" stroke="#10B981" />
                <line x1="745" y1="412" x2="640" y2="480" stroke="#10B981" markerEnd="url(#arrow-green)" strokeDasharray="5,4" />
                {/* Desde Perímetro Azul */}
                <line x1="850" y1="300" x2="555" y2="300" stroke="#06B6D4" markerEnd="url(#arrow-blue)" />
                <line x1="850" y1="300" x2="670" y2="475" stroke="#06B6D4" markerEnd="url(#arrow-blue)" />
                <line x1="850" y1="300" x2="670" y2="125" stroke="#06B6D4" markerEnd="url(#arrow-blue)" />

                {/* VECTORES CONECTANDO DUELA CON PUNTOS DE IMPACTO EN TABLERO INSET */}
                <path 
                  d="M 745,188 Q 580,120 493,125" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2" 
                  strokeDasharray="6,4" 
                />
                <path 
                  d="M 555,300 Q 420,240 475,125" 
                  fill="none" 
                  stroke="#06B6D4" 
                  strokeWidth="2" 
                  strokeDasharray="6,4" 
                />
              </g>
            )}

            {/* F. CANASTA, ARO Y TABLERO DERECHO (POSTE Y SOPORTE) */}
            <g>
              {/* Estructura del soporte */}
              <line x1="880" y1="300" x2="940" y2="300" stroke="#1F2433" strokeWidth="8" />
              <rect x="880" y="240" width="8" height="120" rx="3" fill="#FF6B00" stroke="#FF8800" strokeWidth="2" />
              {/* Semicírculo de no-carga bajo el aro */}
              <path d="M 880 270 A 30 30 0 0 0 880 330" fill="none" stroke="#06B6D4" strokeWidth="2" />
              {/* Aro */}
              <circle cx="855" cy="300" r="16" fill="#FF6B00" fillOpacity="0.3" stroke="#FF6B00" strokeWidth="3" />
            </g>

            {/* ========================================================================= */}
            {/* 4. INSET SUPERIOR IZQUIERDO: DETALLE DEL TABLERO FIBA Y PUNTOS EXACTOS   */}
            {/* ========================================================================= */}
            <g>
              {/* Recuadro contenedor oscuro con marco naranja */}
              <rect 
                x="315" y="45" width="270" height="190" rx="10" 
                fill="url(#backboard-glass-gradient)" 
                stroke="#FF6B00" 
                strokeWidth="4" 
                className="filter drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]"
              />

              {/* Recuadro interior del tablero (59cm x 45cm) */}
              <rect 
                x="400" y="125" width="100" height="75" rx="3" 
                fill="none" 
                stroke="#FF6B00" 
                strokeWidth="3.5" 
              />

              {/* Aro y red bajo el tablero inset */}
              <line x1="435" y1="200" x2="465" y2="200" stroke="#FF6B00" strokeWidth="3.5" />
              <circle cx="450" cy="210" r="12" fill="#FF6B00" fillOpacity="0.2" stroke="#FF6B00" strokeWidth="3" />
              {/* Red colgante */}
              <path d="M 440 210 L 444 235 L 456 235 L 460 210" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2,2" />

              {/* LÍNEA HORIZONTAL SUPERIOR DEL RECUADRO: Y = 125 */}
              {/* ESQUINA SUPERIOR DERECHA: X = 500, Y = 125 */}
              
              {/* PUNTO VERDE: Exactamente en la esquina exterior (X = 495, Y = 125) */}
              <circle 
                cx="495" cy="125" r="8" 
                fill="#10B981" 
                stroke="#34D399" 
                strokeWidth="2.5" 
                filter="url(#glow-green-dot)"
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={() => setActiveZone('green_mid')}
              />
              <circle cx="495" cy="125" r="2.5" fill="#FFFFFF" />

              {/* PUNTO AZUL: Inmediatamente al lado, sobre la misma línea horizontal superior (X = 478, Y = 125) */}
              <circle 
                cx="478" cy="125" r="8" 
                fill="#06B6D4" 
                stroke="#22D3EE" 
                strokeWidth="2.5" 
                filter="url(#glow-blue-dot)"
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={() => setActiveZone('blue_3pt')}
              />
              <circle cx="478" cy="125" r="2.5" fill="#FFFFFF" />
            </g>

            {/* 5. TARJETA FLOTANTE SUPERIOR IZQUIERDA (PUNTO DE IMPACTO ESQUINA) */}
            <g>
              <rect x="45" y="115" width="220" height="52" rx="8" fill="#0B0E17" fillOpacity="0.9" stroke="#1F2433" strokeWidth="1.5" />
              <circle cx="62" cy="132" r="5" fill="#10B981" filter="url(#glow-green-dot)" />
              <text x="75" y="135" fill="#FFFFFF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                PUNTO DE IMPACTO ESQUINA:
              </text>
              <text x="75" y="152" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                Esquina Exterior del Recuadro
              </text>
            </g>

            {/* 6. TELEMETRY LAB PIE DE DUELA */}
            <text x="720" y="582" fill="#64748B" fontSize="10" fontFamily="monospace">
              TELEMETRY LAB // Prof. Marcos Delgado
            </text>
          </svg>
        </div>

        {/* PIE CON DOS TARJETAS INTERACTIVAS GLASS NO INTRUSIVAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => setActiveZone('green_mid')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              activeZone === 'green_mid'
                ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-[#0B0E17]/80 border-[#1F2433] text-slate-300 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
              <div>
                <strong className="text-white block text-sm font-sans font-bold">Punto Verde (Media Distancia / Alas):</strong>
                <span className="text-xs text-emerald-300 font-mono">Esquina exterior del recuadro • Impacto a 40–60 cm arriba</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          <div 
            onClick={() => setActiveZone('blue_3pt')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              activeZone === 'blue_3pt'
                ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'bg-[#0B0E17]/80 border-[#1F2433] text-slate-300 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
              <div>
                <strong className="text-white block text-sm font-sans font-bold">Punto Azul (Perímetro / 3 Puntos):</strong>
                <span className="text-xs text-cyan-300 font-mono">Línea horizontal superior interna • 5–10 cm del borde</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-400 shrink-0" />
          </div>
        </div>

      </div>
    </div>
  );
}
