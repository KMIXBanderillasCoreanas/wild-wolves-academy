'use client';

import React, { useState } from 'react';

interface BiomechanicsProps {
  athleteName?: string;
  jerseyNumber?: string | number;
  overallOvr?: number;
}

export default function BiomechanicsShotBackboardSystem({
  athleteName = 'Mateo Silva',
  jerseyNumber = '11',
  overallOvr = 88
}: BiomechanicsProps) {
  const [activeZone, setActiveZone] = useState<'green' | 'blue' | 'paint'>('green');

  return (
    <div className="w-full bg-[#0a0f18] text-slate-200 rounded-3xl border border-[#1b263b] shadow-2xl overflow-hidden font-sans select-none p-3 sm:p-5">
      
      {/* HEADER BAR CON TEXTO TÁCTICO */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-3 border-b border-[#1b263b] mb-3">
        <span className="tracking-widest uppercase font-bold text-slate-300">
          SISTEMA BIOMECÁNICO WILD WOLVES: GUÍA DE PUNTERÍA AL 100%
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#00e5ff] font-bold">CALIBRACIÓN ACTIVA</span>
        </div>
      </div>

      {/* LIENZO COMPLETO IDÉNTICO A LA IMAGEN DE REFERENCIA */}
      <div className="relative w-full aspect-[16/10] bg-[#0c1322] rounded-2xl border border-[#1b263b] overflow-hidden">
        <svg 
          viewBox="0 0 1000 600" 
          className="w-full h-full"
          style={{ backgroundColor: '#0b121e' }}
        >
          <defs>
            {/* Resplandor neón cian intenso para líneas de cancha */}
            <filter id="court-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00e5ff" floodOpacity="0.8" />
            </filter>

            {/* Resplandor verde para punto y zonas */}
            <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00ff66" floodOpacity="0.9" />
            </filter>

            {/* Resplandor azul para punto y zonas */}
            <filter id="glow-blue" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00b0ff" floodOpacity="0.9" />
            </filter>

            {/* Marcadores de flecha de proyección */}
            <marker id="arr-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ff6b00" />
            </marker>
            <marker id="arr-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00e5ff" />
            </marker>
            <marker id="arr-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00ff66" />
            </marker>
          </defs>

          {/* ========================================================= */}
          {/* 1. MALLA / GRID TÁCTICA DEL SUELO                         */}
          {/* ========================================================= */}
          <g stroke="#141f33" strokeWidth="1" opacity="0.6">
            {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950].map((x) => (
              <line key={`x-${x}`} x1={x} y1="0" x2={x} y2="600" />
            ))}
            {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550].map((y) => (
              <line key={`y-${y}`} x1="0" y1={y} x2="1000" y2={y} />
            ))}
          </g>

          {/* ========================================================= */}
          {/* 2. LÍNEAS NEÓN CIAN DE LA CANCHA                          */}
          {/* ========================================================= */}
          <g stroke="#00e5ff" strokeWidth="3" fill="none" filter="url(#court-glow-cyan)">
            {/* Perímetro exterior */}
            <rect x="25" y="85" width="850" height="490" />
            {/* Línea central */}
            <line x1="250" y1="85" x2="250" y2="575" strokeWidth="3.5" />
            {/* Círculo central */}
            <circle cx="250" cy="330" r="75" strokeWidth="3.5" />

            {/* Línea de fondo derecha */}
            <line x1="875" y1="85" x2="875" y2="575" strokeWidth="3.5" />
            {/* Contorno rectangular de la zona de pintura */}
            <rect x="650" y="230" width="225" height="200" strokeWidth="3" />
            {/* Semicírculo de tiro libre (hacia la izquierda) */}
            <path d="M 650 230 A 100 100 0 0 0 650 430" strokeWidth="3" />

            {/* Arco perimetral de 3 puntos */}
            <path d="M 875 115 L 750 115 A 255 255 0 0 0 550 330 A 255 255 0 0 0 750 545 L 875 545" strokeWidth="3.5" />

            {/* Semicírculo de no-carga bajo el aro */}
            <path d="M 875 285 A 45 45 0 0 0 875 375" strokeWidth="2.5" />
          </g>

          {/* ========================================================= */}
          {/* 3. ZONAS POLIGONALES COLOREADAS EXACTAS A LA REFERENCIA   */}
          {/* ========================================================= */}

          {/* A. ZONA PINTURA / RECTÁNGULO CENTRAL (ROJO PROFUNDO / BORGOÑA #5a1419) */}
          <rect 
            x="650" y="230" width="225" height="200" 
            fill="#5a1419" 
            fillOpacity={activeZone === 'paint' ? 0.95 : 0.75}
            stroke="#ff3b30"
            strokeWidth="1.5"
            className="cursor-pointer"
            onClick={() => setActiveZone('paint')}
          />
          {/* Semicírculo de tiro libre coloreado */}
          <path 
            d="M 650 230 A 100 100 0 0 0 650 430 Z" 
            fill="#5a1419" 
            fillOpacity={activeZone === 'paint' ? 0.95 : 0.75}
            className="cursor-pointer"
            onClick={() => setActiveZone('paint')}
          />

          {/* B. ZONAS VERDES (MEDIA DISTANCIA / ALAS INTERIORES) */}
          <g 
            className="cursor-pointer" 
            onClick={() => setActiveZone('green')}
          >
            {/* 1. Ala Verde Superior (Trapecio / Polígono exacto) */}
            <polygon 
              points="650,150 780,150 780,230 650,230" 
              fill="#00c853" 
              fillOpacity={activeZone === 'green' ? 0.9 : 0.65} 
              stroke="#00e676" 
              strokeWidth="2" 
            />

            {/* 2. Ala Verde Inferior (Simétrica exacta) */}
            <polygon 
              points="650,430 780,430 780,510 650,510" 
              fill="#00c853" 
              fillOpacity={activeZone === 'green' ? 0.9 : 0.65} 
              stroke="#00e676" 
              strokeWidth="2" 
            />

            {/* 3. Frontal Verde de Tiro Libre (Entre arco de tiro libre y arco de 3PT) */}
            <path 
              d="M 650,170 A 240 240 0 0 0 575,330 A 240 240 0 0 0 650,490 L 650,430 A 100 100 0 0 1 650,230 Z" 
              fill="#00c853" 
              fillOpacity={activeZone === 'green' ? 0.9 : 0.65} 
              stroke="#00e676" 
              strokeWidth="2" 
            />
          </g>

          {/* C. ZONAS AZULES (PERÍMETRO EXTERIOR / 3 PUNTOS) */}
          <g 
            className="cursor-pointer" 
            onClick={() => setActiveZone('blue')}
          >
            {/* Cuña Azul Superior (Cerca de la esquina superior izquierda del arco) */}
            <polygon 
              points="650,150 780,150 740,85 650,85" 
              fill="#0288d1" 
              fillOpacity={activeZone === 'blue' ? 0.9 : 0.65} 
              stroke="#00b0ff" 
              strokeWidth="2" 
            />

            {/* Banda Azul Perimetral Diagonal Superior */}
            <polygon 
              points="605,175 660,140 710,195 655,230" 
              fill="#0288d1" 
              fillOpacity={activeZone === 'blue' ? 0.9 : 0.65} 
              stroke="#00b0ff" 
              strokeWidth="2" 
            />

            {/* Banda Azul Perimetral Diagonal Inferior */}
            <polygon 
              points="605,485 660,520 710,465 655,430" 
              fill="#0288d1" 
              fillOpacity={activeZone === 'blue' ? 0.9 : 0.65} 
              stroke="#00b0ff" 
              strokeWidth="2" 
            />

            {/* Arco Exterior Azul Frontal */}
            <path 
              d="M 605,175 A 285 285 0 0 0 540,330 A 285 285 0 0 0 605,485 L 575,485 A 240 240 0 0 1 575,175 Z" 
              fill="#0288d1" 
              fillOpacity={activeZone === 'blue' ? 0.9 : 0.65} 
              stroke="#00b0ff" 
              strokeWidth="2" 
            />
          </g>

          {/* ========================================================= */}
          {/* 4. SILUETAS DE HUELLAS DE PIES (FOOTPRINTS TÁCTICOS)      */}
          {/* ========================================================= */}

          {/* Huellas Naranja en la Pintura (Doble pie) */}
          <g stroke="#ff6b00" fill="#ff6b00" fillOpacity="0.4" strokeWidth="2">
            <ellipse cx="690" cy="320" rx="7" ry="16" />
            <ellipse cx="708" cy="320" rx="7" ry="16" />
          </g>

          {/* Huella Verde en Ala Superior (Pie individual) */}
          <g stroke="#a7f3d0" fill="#00ff66" fillOpacity="0.3" strokeWidth="2">
            <ellipse cx="740" cy="185" rx="7" ry="15" transform="rotate(-15 740 185)" />
            <circle cx="738" cy="180" r="2.5" fill="#ffb703" />
          </g>

          {/* Huellas Verdes en Ala Inferior (Doble pie) */}
          <g stroke="#a7f3d0" fill="#00ff66" fillOpacity="0.3" strokeWidth="2">
            <ellipse cx="735" cy="470" rx="7" ry="15" transform="rotate(15 735 470)" />
            <ellipse cx="752" cy="465" rx="7" ry="15" transform="rotate(15 752 465)" />
          </g>

          {/* Huella Verde Frontal (Tiro Libre) */}
          <g stroke="#a7f3d0" fill="#00ff66" fillOpacity="0.3" strokeWidth="2">
            <ellipse cx="615" cy="330" rx="7" ry="16" />
          </g>

          {/* Huella Azul Diagonal Inferior */}
          <g stroke="#7dd3fc" fill="#00b0ff" fillOpacity="0.3" strokeWidth="2">
            <ellipse cx="660" cy="475" rx="6.5" ry="15" transform="rotate(25 660 475)" />
          </g>

          {/* ========================================================= */}
          {/* 5. FLECHAS Y VECTORES DE TRAYECTORIA RADIAL               */}
          {/* ========================================================= */}
          <g strokeDasharray="5,4" strokeWidth="2" opacity="0.9">
            {/* Desde la canasta hacia la pintura */}
            <line x1="845" y1="330" x2="690" y2="320" stroke="#ff6b00" markerEnd="url(#arr-orange)" />
            
            {/* Vectores rojos/naranja directos del aro a los bordes de la pintura */}
            <line x1="845" y1="330" x2="650" y2="230" stroke="#ff3b30" strokeWidth="1.5" />
            <line x1="845" y1="330" x2="650" y2="430" stroke="#ff3b30" strokeWidth="1.5" />
            <line x1="845" y1="330" x2="650" y2="280" stroke="#ff3b30" strokeWidth="1.5" />
            <line x1="845" y1="330" x2="650" y2="380" stroke="#ff3b30" strokeWidth="1.5" />

            {/* Vector verde desde ala superior proyectado hacia afuera */}
            <line x1="740" y1="185" x2="640" y2="135" stroke="#ff6b00" markerEnd="url(#arr-orange)" />
            <line x1="845" y1="330" x2="740" y2="185" stroke="#00e5ff" />

            {/* Vector verde desde ala inferior */}
            <line x1="845" y1="330" x2="735" y2="470" stroke="#00e5ff" />
            <line x1="735" y1="470" x2="650" y2="520" stroke="#00e5ff" markerEnd="url(#arr-cyan)" />

            {/* Vector hacia la huella frontal */}
            <line x1="845" y1="330" x2="615" y2="330" stroke="#ff6b00" markerEnd="url(#arr-orange)" />

            {/* Proyección diagonal azul exterior */}
            <line x1="845" y1="330" x2="660" y2="475" stroke="#00e5ff" />
            <line x1="660" y1="475" x2="550" y2="540" stroke="#00e5ff" markerEnd="url(#arr-cyan)" />

            {/* Proyección punteada que sube desde el ala verde hacia el tablero de arriba */}
            <line x1="740" y1="185" x2="505" y2="115" stroke="#ff6b00" strokeWidth="2" strokeDasharray="6,4" />
          </g>

          {/* ========================================================= */}
          {/* 6. CANASTA DERECHA EN PERSPECTIVA TÁCTICA ISOMÉTRICA      */}
          {/* ========================================================= */}
          <g>
            {/* Soporte hacia la pared */}
            <rect x="885" y="322" width="55" height="16" fill="#1b263b" stroke="#0f172a" />
            <polygon points="915,310 940,310 940,350 915,350" fill="#111827" />

            {/* Tablero lateral en perspectiva (inclinado) */}
            <polygon 
              points="875,235 905,250 905,410 875,425" 
              fill="#1e293b" 
              fillOpacity="0.8"
              stroke="#ff6b00" 
              strokeWidth="4" 
            />
            {/* Recuadro interno en perspectiva */}
            <polygon 
              points="883,300 897,307 897,353 883,360" 
              fill="none" 
              stroke="#ff6b00" 
              strokeWidth="2.5" 
            />
            {/* Aro de baloncesto y soporte horizontal */}
            <line x1="875" y1="330" x2="845" y2="330" stroke="#ff6b00" strokeWidth="4" />
            <circle cx="845" cy="330" r="16" fill="#ff6b00" fillOpacity="0.3" stroke="#ff6b00" strokeWidth="3" />
          </g>

          {/* ========================================================= */}
          {/* 7. TABLERO INSET SUPERIOR EXACTO (FIBA)                   */}
          {/* ========================================================= */}
          <g>
            {/* Marco exterior negro con borde naranja brillante */}
            <rect 
              x="310" y="35" width="280" height="175" rx="8" 
              fill="#0f172a" 
              stroke="#ff6b00" 
              strokeWidth="4.5" 
            />

            {/* Líneas en 'X' transparentes de vidrio templado */}
            <line x1="310" y1="35" x2="590" y2="210" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="310" y1="210" x2="590" y2="35" stroke="#1e293b" strokeWidth="1.5" />

            {/* Recuadro interior (59cm x 45cm) */}
            <rect 
              x="395" y="115" width="105" height="75" rx="2" 
              fill="none" 
              stroke="#ff6b00" 
              strokeWidth="3.5" 
            />

            {/* Aro bajo el recuadro */}
            <line x1="432" y1="190" x2="468" y2="190" stroke="#ff6b00" strokeWidth="3.5" />
            <ellipse cx="450" cy="194" rx="14" ry="5" fill="#ff6b00" fillOpacity="0.4" stroke="#ff6b00" strokeWidth="2.5" />
            {/* Red blanca */}
            <path d="M 436 194 L 442 225 L 458 225 L 464 194" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* PUNTOS DE IMPACTO MILIMÉTRICOS EXACTOS DE LA IMAGEN:
                1. Punto Verde: En la esquina superior derecha del recuadro
                2. Punto Azul: Inmediatamente a la izquierda, sobre la misma línea horizontal superior
            */}
            {/* PUNTO VERDE */}
            <circle 
              cx="495" cy="115" r="9" 
              fill="#00ff66" 
              stroke="#bbf7d0" 
              strokeWidth="2" 
              filter="url(#glow-green)"
              className="cursor-pointer"
              onClick={() => setActiveZone('green')}
            />

            {/* PUNTO AZUL */}
            <circle 
              cx="476" cy="115" r="9" 
              fill="#00b0ff" 
              stroke="#bae6fd" 
              strokeWidth="2" 
              filter="url(#glow-blue)"
              className="cursor-pointer"
              onClick={() => setActiveZone('blue')}
            />
          </g>

          {/* ========================================================= */}
          {/* 8. TARJETA SUPERIOR IZQUIERDA: "PUNTO DE IMPACTO ESQUINA" */}
          {/* ========================================================= */}
          <g>
            <rect x="25" y="95" width="215" height="52" rx="8" fill="#0b121e" fillOpacity="0.9" stroke="#1b263b" strokeWidth="1.5" />
            <circle cx="42" cy="113" r="5" fill="#00ff66" filter="url(#glow-green)" />
            <text x="54" y="116" fill="#ffffff" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              PUNTO DE IMPACTO ESQUINA:
            </text>
            <text x="54" y="134" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
              Esquina Exterior del Recuadro
            </text>
          </g>

          {/* ========================================================= */}
          {/* 9. TEXTOS DE ROTULACIÓN EN LA DUELA (COMO EN LA IMAGEN)   */}
          {/* ========================================================= */}
          <g fontSize="8.5" fontFamily="monospace" fontWeight="bold">
            <text x="670" y="135" fill="#38bdf8">ZONA</text>
            <text x="662" y="146" fill="#38bdf8">(Impacto</text>
            <text x="664" y="157" fill="#38bdf8">Exterior)</text>

            <text x="820" y="475" fill="#4ade80">ZONA</text>
            <text x="820" y="486" fill="#4ade80">AZUL</text>
            <text x="815" y="497" fill="#4ade80">(Impacto</text>
            <text x="817" y="508" fill="#4ade80">Interior)</text>
          </g>

          {/* FIRMA DE TELEMETRÍA EN PIE DE PÁGINA */}
          <text x="720" y="588" fill="#475569" fontSize="10" fontFamily="monospace">
            TELEMETRY LAB // Prof. Marcos Delgado
          </text>
        </svg>
      </div>

      {/* TARJETAS GLASS INFERIORES: EXPLICACIÓN DE IMPACTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <div 
          onClick={() => setActiveZone('green')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            activeZone === 'green'
              ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-[#0c1322] border-[#1b263b] text-slate-300 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-[#00ff66] shadow-[0_0_10px_#00ff66]" />
            <div>
              <strong className="text-white block text-xs font-bold font-sans">
                Punto Verde (Media Distancia / Alas):
              </strong>
              <span className="text-[11px] text-emerald-300 font-mono">
                Esquina exterior superior del recuadro chico
              </span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveZone('blue')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            activeZone === 'blue'
              ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'bg-[#0c1322] border-[#1b263b] text-slate-300 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-[#00b0ff] shadow-[0_0_10px_#00b0ff]" />
            <div>
              <strong className="text-white block text-xs font-bold font-sans">
                Punto Azul (Triples / Perímetro):
              </strong>
              <span className="text-[11px] text-cyan-300 font-mono">
                Línea horizontal superior (5–10 cm hacia adentro)
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
