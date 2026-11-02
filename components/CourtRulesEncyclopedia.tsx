'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Ruler, 
  Compass, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CourtRulesEncyclopedia() {
  const [activeTab, setActiveTab] = useState<'measures' | 'mexicanTerms' | 'keyRules' | 'courtDrills'>('measures');

  const tabs = [
    { id: 'measures', label: '📐 Medidas Oficiales (FIBA vs NBA)', icon: Ruler },
    { id: 'mexicanTerms', label: '🇲🇽 Terminología Mexicana en Duela', icon: Compass },
    { id: 'keyRules', label: '⏱️ Reglas Clave Oficiales', icon: Clock },
    { id: 'courtDrills', label: '🐺 Protocolo Carmen Serdán', icon: Award }
  ] as const;

  return (
    <div className="bg-[#0b0e14] border border-[#1e293b] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-white">
      {/* Luz de acento sutil */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-zinc-800/80 gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-orange-400" /> GUÍA FORMATIVA OFICIAL
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              🟢 ACCESO 100% GRATUITO
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5 flex items-center gap-2">
            Anatomía de la Duela &amp; Reglamento Oficial (FIBA / NBA)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Enciclopedia técnica y terminología de cancha mexicana para atletas, tutores y formadores de Wild Wolves Academy.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
            Reglamento Vigente 2024-2026
          </span>
        </div>
      </div>

      {/* PESTAÑAS INTERACTIVAS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-[#10141d] text-zinc-400 hover:text-white hover:bg-[#161c29] border border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO 1: MEDIDAS OFICIALES FIBA VS NBA */}
      {activeTab === 'measures' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Aro Oficial */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-400 uppercase tracking-wide">
                  Altura del Aro
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Universal
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                3.05 <span className="text-sm font-normal text-zinc-400">metros (10 ft)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Estándar idéntico en FIBA, NBA y ligas mexicanas (LNBP/CIBAPAC). Aro de 45 cm de diámetro interior montado en tablero a 2.90m sobre el suelo.
              </p>
            </div>

            {/* Línea de Tiros Libres */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                  Distancia Tiro Libre
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Universal
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-300">
                4.60 <span className="text-sm font-normal text-zinc-400">m desde tablero</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                5.80 metros medidos desde la línea de fondo exterior. El tirador dispone de 5 segundos en FIBA (10s en NBA) para soltar el balón sin pisar la línea.
              </p>
            </div>

            {/* Línea de Tres Puntos */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-orange-500/30 bg-gradient-to-br from-[#121824] to-[#0f1422] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                  Línea de 3 Puntos
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Diferencia Clave
                </span>
              </div>
              <div className="text-lg font-black font-mono text-white">
                FIBA: <span className="text-emerald-400">6.75 m</span> • NBA: <span className="text-orange-400">7.23 m</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                En FIBA (canchas Carmen Serdán y México) el arco está a <strong>6.75 m</strong> (6.60 m en esquinas). En la NBA el arco se aleja a <strong>7.23 m</strong> (6.70 m en esquinas).
              </p>
            </div>
          </div>

          {/* Tabla comparativa de dimensiones de duela */}
          <div className="p-4 rounded-2xl bg-[#0f1422] border border-zinc-800 space-y-3">
            <h4 className="text-xs font-black uppercase text-zinc-300 tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" /> Comparativa de Dimensiones Oficiales de Cancha
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                    <th className="pb-2">Parámetro</th>
                    <th className="pb-2 text-emerald-400">Estándar FIBA (México / Internacional)</th>
                    <th className="pb-2 text-orange-400">Estándar NBA (Estados Unidos)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  <tr>
                    <td className="py-2.5 font-bold text-white">Largo x Ancho Cancha</td>
                    <td className="py-2.5 text-emerald-300 font-bold">28.00 m × 15.00 m</td>
                    <td className="py-2.5 text-orange-300 font-bold">28.65 m × 15.24 m (94×50 ft)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-white">Radio del Círculo Central</td>
                    <td className="py-2.5">1.80 metros</td>
                    <td className="py-2.5">1.83 metros (6 ft)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-white">Zona Restringida (Pintura)</td>
                    <td className="py-2.5">Rectangular: 4.90 m ancho</td>
                    <td className="py-2.5">Rectangular: 4.88 m ancho (16 ft)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-white">Semicírculo de No-Carga</td>
                    <td className="py-2.5">1.25 metros de radio</td>
                    <td className="py-2.5">1.22 metros de radio (4 ft)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-white">Balón Oficial Masculino</td>
                    <td className="py-2.5">No. 7 (74.9 - 78.0 cm / 567 - 650 g)</td>
                    <td className="py-2.5">Size 7 (Wilson Official NBA Leather)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 2: TERMINOLOGÍA MEXICANA EN DUELA */}
      {activeTab === 'mexicanTerms' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs text-zinc-400">
            En México y en las ligas de la CDMX, los entrenadores y árbitros utilizan conceptos propios para dirigir la duela con rapidez:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* El Callejón / La Pintura */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-orange-500/40 transition space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  El Callejón / La Pintura (Zona Restringida)
                </h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                El rectángulo debajo del aro pintado de color sólido. Un atacante no puede permanecer más de <strong>3 segundos continuos</strong> aquí sin soltar el balón o reiniciar el corte. En México se le grita al poste: <em>"¡Gana la posición en el callejón!"</em>.
              </p>
            </div>

            {/* Carril Central / Poste Alto */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-orange-500/40 transition space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  El Carril Central (Poste Alto / Elbow)
                </h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                El codo o esquina superior de la línea de tiros libres. Es la zona neurálgica donde el botador o armador lee la defensa para armar el <strong>Pick &amp; Roll</strong> o repartir a las alas.
              </p>
            </div>

            {/* Líneas Exteriores / Esquinas */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-orange-500/40 transition space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  Líneas Exteriores (Corners &amp; Wings)
                </h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Las esquinas cortas (los tiros de 3 de mayor porcentaje en transición) y las alas a 45°. El spacing ofensivo de Wild Wolves exige tener siempre un tirador listo en cada esquina exterior.
              </p>
            </div>

            {/* Triple Amenaza */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-orange-500/40 transition space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  La Postura de "Triple Amenaza"
                </h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Postura fundamental de recepción: rodillas dobladas, centro de gravedad bajo, codo activo protegiendo el balón en la cadera derecha/izquierda. Desde aquí el jugador puede ejecutar 3 opciones en menos de 0.5s: <strong>Tirar, Botar (penetrar) o Pasar</strong>.
              </p>
            </div>

            {/* Rompimiento Rápido */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-orange-500/40 transition space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  El Rompimiento Rápido (Transición)
                </h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                El contraataque inmediato tras rebote defensivo o robo. El primer pase debe salir en menos de 1.5 segundos hacia el carril exterior antes de que el rival estructure su balance defensivo.
              </p>
            </div>

            {/* Pantalla y Corte */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 hover:border-orange-500/40 transition space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="text-xs font-black text-white uppercase tracking-wide">
                  Pared y Desmarque (Pick &amp; Roll)
                </h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Bloqueo ciego o frontal plantando los dos pies fijos en el suelo sin mover hombros ni cadera (evitando falta ofensiva en movimiento), seguido del giro del bloqueador hacia la canasta.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 3: REGLAS CLAVE OFICIALES */}
      {activeTab === 'keyRules' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Regla de los 8 Segundos */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" /> Regla de los 8 Segundos
                </span>
                <span className="text-[10px] font-mono text-zinc-400">FIBA Art. 28</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                El equipo que obtiene el control del balón vivo en su campo defensivo tiene exactamente <strong>8 segundos continuos</strong> para hacer que el balón cruce completamente la línea central hacia campo de ataque.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/40 text-orange-300 border border-zinc-800">
                Sanción: Pérdida de posesión y saque lateral para el adversario.
              </div>
            </div>

            {/* Reloj de 24 Segundos */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" /> Reloj de 24 Segundos (Tiro)
                </span>
                <span className="text-[10px] font-mono text-zinc-400">FIBA Art. 29</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Tiempo límite para lanzar a canasta y que el balón toque el aro. Si el atacante captura un rebote ofensivo tras tocar el aro, el reloj no se resetea a 24, sino a <strong>14 segundos</strong>.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/40 text-amber-300 border border-zinc-800">
                Regla moderna: 14 segundos para incentivar juego rápido y dinámico.
              </div>
            </div>

            {/* El Paso Cero (Gather Step) */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-emerald-500/30 bg-gradient-to-br from-[#0c141e] to-[#0f1422] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-400" /> El "Paso Cero" (Gather Step)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Oficial FIBA &amp; NBA</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                La regla moderna que revolucionó el baloncesto: cuando un jugador en movimiento agarra el balón a dos manos (recoge el bote o recibe pase en carrera), el pie que está tocando el suelo en ese instante es el <strong>Paso 0</strong>. A partir de ahí, tiene derecho a dar <strong>dos pasos adicionales</strong> para finalizar o pasar sin cometer violación de pasos.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/40 text-emerald-300 border border-zinc-800">
                Fundamental en bandejas estilo Giannis Antetokounmpo y Luka Dončić.
              </div>
            </div>

            {/* Faltas Personales & Bonus */}
            <div className="p-4 rounded-2xl bg-[#10141d] border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" /> Faltas Personales &amp; Bonus
                </span>
                <span className="text-[10px] font-mono text-zinc-400">FIBA Art. 34-41</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                En FIBA, un jugador es descalificado al acumular <strong>5 faltas personales</strong> (en NBA son 6). Cuando un equipo comete 4 faltas en un periodo, a partir de la <strong>5ta falta colectiva</strong> el rival lanza 2 tiros libres automáticos en cualquier falta sin tiro (situación de bonus).
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/40 text-rose-300 border border-zinc-800">
                Falta Antideportiva: Contacto excesivo = 2 tiros libres + saque lateral.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO 4: PROTOCOLO DEPORTIVO CARMEN SERDÁN */}
      {activeTab === 'courtDrills' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-[#16121e] to-[#0d1017] border border-orange-500/40 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-400" />
              <h4 className="text-sm font-black uppercase text-white tracking-wide">
                Código de Duela de la Manada Wild Wolves (Carmen Serdán)
              </h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              En la cancha del Deportivo Carmen Serdán, cada atleta de la manada entrena bajo estándares formativos internacionales de disciplina, esfuerzo y respeto a la regla:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Puntualidad de Lobo</span>
                  <p className="text-[11px] text-zinc-400">Estar en duela con calzado ajustado y balón inflado 10 minutos antes del silbato inicial.</p>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Defensa Agachada (Stance)</span>
                  <p className="text-[11px] text-zinc-400">Nunca defender con piernas estiradas. Rodillas flexionadas a 90° y ojos a la cintura del atacante.</p>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Cero Discusión Arbitral</span>
                  <p className="text-[11px] text-zinc-400">La decisión del árbitro se acata al instante. La energía del lobo se canaliza en el siguiente balance defensivo.</p>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-zinc-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Respeto a la Familia y Rival</span>
                  <p className="text-[11px] text-zinc-400">Saludo cordial al término del partido. Ganar con humildad, perder con aprendizaje formativo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANNER SUTIL PRO (LLAMADA A LA ACCIÓN CON COACH RICARDO) */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#111827] via-[#0d121c] to-[#171322] border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Conoce las reglas, domínalas en la duela con telemetría Pro
            </span>
            <p className="text-[11px] text-zinc-400">
              Esta enciclopedia técnica es 100% gratuita para toda la comunidad Wild Wolves. Para auditoría biomecánica por IA y telemetría de milisegundos, activa tu suscripción Pro.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/525522427769?text=Hola%20Coach%20Ricardo,%20quiero%20conocer%20m%C3%A1s%20sobre%20el%20Modo%20Pro%20y%20el%20reglamento%20en%20Wild%20Wolves."
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 shadow-md shadow-orange-600/30"
        >
          Contactar Coach Ricardo <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
