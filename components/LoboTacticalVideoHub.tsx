'use client';

import React, { useState } from 'react';
import { 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  Brain, 
  Compass, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Target, 
  Zap, 
  Flame, 
  ExternalLink, 
  X, 
  Clock, 
  Award,
  Layers,
  HeartPulse,
  Eye,
  Lock,
  Crown
} from 'lucide-react';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import PaywallLockCard from '@/components/PaywallLockCard';
import UpgradeModal from '@/components/UpgradeModal';

interface TacticalConcept {
  id: string;
  category: string;
  title: string;
  emoji: string;
  fundamentoBase: {
    description: string;
    puntosClave: string[];
    errorComun: string;
  };
  variantePro: {
    title: string;
    contextoCompeticion: string;
    mecanismoBiomecanico: string;
    lecturaTactica: string;
    reglaFibaNba?: string;
  };
}

interface VideoLesson {
  id: string;
  title: string;
  category: 'tiro' | 'drible' | 'defensa' | 'tactica';
  youtubeId: string;
  duration: string;
  levelBadge: string;
  coachNotes: string;
  thumbnailUrl?: string;
}

const TACTICAL_CONCEPTS: TacticalConcept[] = [
  {
    id: 'dribling_explosivo',
    category: 'Manejo de Balón',
    title: 'Bote y Drible de Escape',
    emoji: '⚡',
    fundamentoBase: {
      description: 'Control de bote a la altura de la cadera, rodillas en semiflexión y vista al frente sin mirar el balón.',
      puntosClave: [
        'Yemas de los dedos en copa (nunca con la palma)',
        'Mano no dominante activa en postura de escudo ("arm guard")',
        'Bote enérgico contra la duela para retorno rápido'
      ],
      errorComun: 'Bote demasiado alto o mirar el balón, lo que anula la visión periférica de los cortes de compañeros.'
    },
    variantePro: {
      title: 'Desaceleración Abrupta & Ankle Breaker (Ataque al Pie Adelantado)',
      contextoCompeticion: 'Frente a defensores agresivos o más bajos que presionan la línea de pase.',
      mecanismoBiomecanico: 'Conversión instantánea de velocidad horizontal a vertical bajando el centro de gravedad en 45°, clavando el pie retrasado y ejecutando drible cruzado o tras la espalda.',
      lecturaTactica: 'Atacar directamente el hombro y pie adelantado del rival para forzarlo a girar las caderas antes de cambiar de dirección.',
      reglaFibaNba: 'FIBA Art. 25: El cambio de ritmo no debe involucrar retención de balón por debajo de su hemisferio (violación de carga o acarreo).'
    }
  },
  {
    id: 'mecanica_tiro',
    category: 'Técnica de Tiro',
    title: 'Mecánica de Tiro & Puntos de Liberación',
    emoji: '🎯',
    fundamentoBase: {
      description: 'Triple extensión sincrónica (tobillo, rodilla, cadera y codo) con trayectoria vertical y finalización en quiebre de ganso.',
      puntosClave: [
        'Alineación pie-rodilla-codo-aro en ángulo recto',
        'Liberación con índice y medio señalando el fondo de la red',
        'Parábola óptima entre 48° y 52°'
      ],
      errorComun: 'Empujar el balón desde el pecho o bajar la cabeza antes de que el balón supere el aro.'
    },
    variantePro: {
      title: 'Paso Cero (Gather Step), Step-Back & Flotadora Teardrop',
      contextoCompeticion: 'Finalizaciones contra pívots protectores de aro (+1.85m) o en tiros tras drible forzado.',
      mecanismoBiomecanico: 'Aprovechamiento del Paso 0 (gather) en el momento exacto en que cesa el drible, ejecutando desaceleración en retroceso (Step-back) para crear 1.2m de separación.',
      lecturaTactica: 'Si el pívot rival retrocede a la pintura ("drop coverage"), soltar la flotadora en ángulo de 60° con toque suave a una mano sin buscar el contacto.',
      reglaFibaNba: 'FIBA / NBA Gather Step: El pie en contacto con el suelo al levantar el balón es el Paso 0; se permiten dos apoyos posteriores legales para tirar.'
    }
  },
  {
    id: 'triple_amenaza',
    category: 'Juego de Pies',
    title: 'Triple Amenaza & Salidas',
    emoji: '🛡️',
    fundamentoBase: {
      description: 'Postura base tras recibir el pase: capacidad inmediata de tirar, pasar o botar manteniendo el pie de pivote fijo.',
      puntosClave: [
        'Balón resguardado en el "bolsillo" del lado hábil',
        'Cuerpo agazapado listo para estallar',
        'Pivote firme sin despegar la punta del tenis'
      ],
      errorComun: 'Botar de inmediato al recibir sin antes evaluar si el tiro perimetral estaba libre.'
    },
    variantePro: {
      title: 'Jab Step de Ruptura & Rip-Through por Debajo de Rodillas',
      contextoCompeticion: 'En aclarados (isolation) en las alas o esquinas de la duela.',
      mecanismoBiomecanico: 'Finta de penetración corta y violenta con el pie libre (15 cm). Si el defensor retrocede, tiro inmediato; si se mantiene pegado, barrido del balón (rip-through) por debajo de sus manos.',
      lecturaTactica: 'Observar los ojos y el esternón del defensor. Si su peso se desplaza a los talones, elevarse para el tiro en suspensión.',
      reglaFibaNba: 'El balón debe salir de las manos antes de levantar el pie de pivote para iniciar el drible.'
    }
  },
  {
    id: 'rebote_tablero',
    category: 'Física y Rebote',
    title: 'Física del Rebote & Ángulos del Tablero',
    emoji: '🏀',
    fundamentoBase: {
      description: 'Bloqueo de rebote (box-out) de espaldas al rival con brazos en "W" y centro de gravedad bajo para asegurar posesión.',
      puntosClave: [
        'Contacto con cadera y glúteos contra el torso rival',
        'Captura del balón a dos manos en el punto más alto',
        'Asegurar balón a la barbilla con codos abiertos legales'
      ],
      errorComun: 'Saltar hacia atrás en lugar de afirmar la posición primero contra el rival.'
    },
    variantePro: {
      title: 'Cálculo Angular de Tiros Perimetrales & Sellado de Tablero',
      contextoCompeticion: 'En lanzamientos de 3 puntos y transiciones de contraataque.',
      mecanismoBiomecanico: 'Ley de reflexión de rebote: tiros de larga distancia con arco alto rebotan un 70% más lejos del aro (zona de tiros libres). Anticipación del ángulo de incidencia.',
      lecturaTactica: 'En tiros de esquina contraria, el rebote cae en el 75% de los casos en el lado débil. Leer la trayectoria antes de que el balón toque el metal.',
      reglaFibaNba: 'Contacto legal de pantalla/cierre: no empujar con los codos ni meter el pie debajo del saltador.'
    }
  }
];

const CURATED_VIDEOS: VideoLesson[] = [
  {
    id: 'vid_mecanica_nba',
    title: 'Mecánica de Tiro y Paso Cero (Gather Step)',
    category: 'tiro',
    youtubeId: '7r1BTmQuLXg',
    duration: '10:48 min',
    levelBadge: 'Formativo & Élite',
    coachNotes: 'Clave biomecánica: El Paso Cero sincroniza la bajada del centro de gravedad antes de la triple extensión. Sostén el quiebre de muñeca ("mano en el frasco") hasta que el balón toque la red.'
  },
  {
    id: 'vid_crossover_decel',
    title: 'Crossover, Desaceleración y Ankle Breaker',
    category: 'drible',
    youtubeId: 'dfXbQ_gN_y8',
    duration: '8:15 min',
    levelBadge: 'Avanzado & Bestia Alfa',
    coachNotes: 'No aceleres si no sabes frenar. El pie retrasado se clava en 45° absorbiendo la inercia con cuádriceps y glúteo para desplazar al defensor antes de cruzar el balón bajo sus rodillas.'
  },
  {
    id: 'vid_defensa_perimetro',
    title: 'Postura Defensiva y Negación de Perímetro',
    category: 'defensa',
    youtubeId: '5vPIPB0_iP0',
    duration: '9:30 min',
    levelBadge: 'Militar & Titán',
    coachNotes: 'Negación de mano hábil: Centro de gravedad más bajo que el del atacante. Ojos en la cadera (el torso nunca miente en fintas) y antebrazo de control en el plano vertical sin empujar.'
  },
  {
    id: 'vid_pick_roll_rebotes',
    title: 'Lectura Táctica de Pick & Roll y Física de Rebotes en Tablero',
    category: 'tactica',
    youtubeId: 'wTHKJaVgxqU',
    duration: '12:05 min',
    levelBadge: 'Titán & Ultraintinto',
    coachNotes: 'Lectura de drop coverage: Si el pívot rival da 2 pasos atrás, castiga con flotadora a 45°. En el rebote largo de triples, anticipa el 75% de rebotes cayendo hacia el lado opuesto (lado débil).'
  }
];

export default function LoboTacticalVideoHub() {
  const { isPro } = useSubscriptionTier();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expandedConceptId, setExpandedConceptId] = useState<string>('dribling_explosivo');
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<'todos' | 'tiro' | 'drible' | 'defensa' | 'tactica'>('todos');
  const [activeVideoModal, setActiveVideoModal] = useState<VideoLesson | null>(null);

  const filteredVideos = selectedVideoCategory === 'todos' 
    ? CURATED_VIDEOS 
    : CURATED_VIDEOS.filter(v => v.category === selectedVideoCategory);

  return (
    <div className="w-full space-y-6">
      {/* Cabecera Táctica Neón */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/40 bg-gradient-to-r from-[#0d121f] via-[#12182b] to-[#1c120c] p-6 text-zinc-100 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-lg bg-orange-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-orange-400 border border-orange-500/30">
                <Brain className="h-3.5 w-3.5 text-orange-400" />
                Cerebro Táctico Wild Wolves
              </span>
              <span className="rounded-lg bg-cyan-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-cyan-300 border border-cyan-500/30">
                Videoteca & Biomecánica IA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Lobo Táctico: Fundamento vs. Variante Pro & Videoteca
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              La diferencia entre un jugador promedio y un Lobo Alfa radica en la comprensión biomecánica y la velocidad de toma de decisiones bajo fatiga en el Deportivo Carmen Serdán.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 text-center">
              <span className="block text-[10px] font-mono uppercase text-zinc-400">Escuela Táctica</span>
              <span className="text-xs font-black text-[#d1fe17]">FIBA / NBA Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: FUNDAMENTO VS VARIANTE PRO (ACORDEÓN COMPARATIVO)              */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-orange-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              1. Fundamento Base vs. Variante de Alta Competición
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Haz clic para desplegar análisis</span>
        </div>

        <div className="space-y-3">
          {TACTICAL_CONCEPTS.map((concept) => {
            const isExpanded = expandedConceptId === concept.id;

            return (
              <div
                key={concept.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-orange-500/60 bg-[#0d1322] shadow-xl shadow-orange-500/10'
                    : 'border-zinc-800 bg-[#0a0e17] hover:border-zinc-700'
                }`}
              >
                {/* Barra de título del concepto */}
                <button
                  type="button"
                  onClick={() => setExpandedConceptId(isExpanded ? '' : concept.id)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-lg border border-orange-500/25">
                      {concept.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 font-mono">
                          {concept.category}
                        </span>
                        <span className="text-[10px] text-zinc-500">•</span>
                        <span className="text-xs text-zinc-400">Análisis Comparativo</span>
                      </div>
                      <h4 className="text-sm font-black text-white">{concept.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[11px] font-bold text-zinc-400">
                      {isExpanded ? 'Contraer' : 'Ver Variante Pro'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-orange-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                </button>

                {/* Contenido desplegable (Fundamento vs Variante) */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-zinc-800/80 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tarjeta Fundamento Base */}
                    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-blue-300 border border-blue-500/30">
                          Fundamento Base
                        </span>
                        <span className="text-xs font-bold text-zinc-200">Enseñanza Formativa</span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {concept.fundamentoBase.description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Puntos Clave de Ejecución:
                        </span>
                        <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                          {concept.fundamentoBase.puntosClave.map((pt, i) => (
                            <li key={i} className="leading-snug">{pt}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-red-950/30 border border-red-500/20 p-2.5 text-[11px] text-red-300">
                        <strong>⚠️ Error Crítico en Duela:</strong> {concept.fundamentoBase.errorComun}
                      </div>
                    </div>

                    {/* Tarjeta Variante Pro de Alta Competición (Gated for Free Mode) */}
                    <PaywallLockCard
                      isLocked={!isPro}
                      title="Variante Pro Élite (FIBA/NBA)"
                      description="Lecturas tácticas avanzadas, desaceleración abrupta y biomecánica competitiva reservadas para Atleta Lobo Pro."
                      badgeText="Lobo Pro $99"
                      planName="Atleta Lobo Pro"
                      planPrice="$99 MXN"
                      className="h-full"
                    >
                      <div className="rounded-xl border border-orange-500/40 bg-gradient-to-br from-[#12182b] to-[#1c1109] p-4 space-y-3 shadow-lg h-full">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-orange-300 border border-orange-500/40">
                            Variante Pro Élite
                          </span>
                          <span className="text-xs font-black text-[#d1fe17]">Nivel Competitivo</span>
                        </div>

                        <h5 className="text-xs font-black text-white">
                          {concept.variantePro.title}
                        </h5>

                        <div className="text-xs text-zinc-300 space-y-2">
                          <p>
                            <strong className="text-orange-400">Contexto Táctico:</strong>{' '}
                            {concept.variantePro.contextoCompeticion}
                          </p>
                          <p>
                            <strong className="text-cyan-400">Mecanismo Biomecánico:</strong>{' '}
                            {concept.variantePro.mecanismoBiomecanico}
                          </p>
                          <p>
                            <strong className="text-amber-300">Lectura de Juego:</strong>{' '}
                            {concept.variantePro.lecturaTactica}
                          </p>
                        </div>

                        {concept.variantePro.reglaFibaNba && (
                          <div className="rounded-lg bg-zinc-950/70 border border-zinc-800 p-2.5 text-[10px] font-mono text-zinc-400">
                            <strong className="text-white block mb-0.5">⚖️ Regla Oficial:</strong>
                            {concept.variantePro.reglaFibaNba}
                          </div>
                        )}
                      </div>
                    </PaywallLockCard>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: VIDEOTECA TÁCTICA & ANÁLISIS EN VIDEO                          */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              2. Videoteca Táctica: Análisis Audiovisual de Jugadas
            </h3>
          </div>

          {/* Filtros de Video */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['todos', 'tiro', 'drible', 'defensa', 'tactica'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedVideoCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition ${
                  selectedVideoCategory === cat
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Videos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video) => {
            const isVideoFree = video.id === 'vid_mecanica_nba';
            const isVideoLocked = !isPro && !isVideoFree;

            return (
              <div
                key={video.id}
                className="group rounded-2xl border border-zinc-800 bg-[#0c101a] hover:border-cyan-500/50 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Thumbnail / Contenedor Video */}
                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    className={`h-full w-full object-cover transition-transform duration-300 ${
                      isVideoLocked ? 'opacity-70 filter blur-[1px]' : 'group-hover:scale-105 opacity-80 group-hover:opacity-100'
                    }`}
                  />
                  
                  {/* Candado / Badge Lobo Pro */}
                  {isVideoLocked && (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-mono font-black uppercase text-black shadow-lg">
                      <Lock className="w-3 h-3" />
                      Lobo Pro
                    </div>
                  )}

                  {/* Botón flotante Play */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isVideoLocked) {
                        setShowUpgradeModal(true);
                      } else {
                        setActiveVideoModal(video);
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition cursor-pointer"
                    title={isVideoLocked ? "Desbloquear con Lobo Pro" : "Reproducir Análisis Táctico"}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition ${
                      isVideoLocked 
                        ? 'bg-amber-500 text-black shadow-amber-500/40' 
                        : 'bg-cyan-500 text-black shadow-cyan-500/40 group-hover:scale-110'
                    }`}>
                      {isVideoLocked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 fill-black ml-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Badge Duración */}
                  <div className="absolute bottom-2 right-2 rounded-md bg-black/85 px-1.5 py-0.5 text-[10px] font-mono text-white">
                    {video.duration}
                  </div>
                </div>

                {/* Información del Video */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-cyan-300 border border-cyan-500/20 font-mono">
                        {video.category}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {video.levelBadge}
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-black text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {video.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                      "{video.coachNotes}"
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (isVideoLocked) {
                          setShowUpgradeModal(true);
                        } else {
                          setActiveVideoModal(video);
                        }
                      }}
                      className={`mt-2 text-[10px] font-black uppercase flex items-center gap-1 transition cursor-pointer ${
                        isVideoLocked
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-cyan-400 hover:text-cyan-300'
                      }`}
                    >
                      {isVideoLocked ? "Desbloquear Video (Lobo Pro) 🔒" : "Estudiar Ejecución →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: ENFOQUE PSICOLÓGICO Y DE LECTURA DE JUEGO (ULTRA INSTINTO)     */}
      {/* ========================================================================= */}
      <PaywallLockCard
        isLocked={!isPro}
        title="Enfoque Psicológico & Toma de Decisiones Bajo Fatiga Extrema"
        description="Protocolos de resiliencia mental, respiración 4-4-4 en línea de tiro libre y fluidez en momentos críticos bajo fatiga extrema en duela reservados para Atleta Lobo Pro."
        badgeText="Lobo Pro $99"
        planName="Atleta Lobo Pro"
        planPrice="$99 MXN"
      >
        <section className="rounded-3xl border border-fuchsia-500/40 bg-gradient-to-r from-[#170a24] via-[#100d1e] to-[#0a1220] p-6 text-zinc-100 shadow-2xl relative overflow-hidden">
          {/* Glow de fondo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-400 font-bold block">
                    Mentalidad Wild Wolves • Resiliencia de Acero
                  </span>
                  <h3 className="text-lg font-black text-white">
                    3. Enfoque Psicológico & Toma de Decisiones Bajo Fatiga Extrema
                  </h3>
                </div>
              </div>

              <span className="rounded-full bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-fuchsia-200 border border-fuchsia-400/40 shadow">
                Cúspide: Modo Ultra Instinto
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed max-w-4xl">
              Cuando el ácido láctico quema las piernas y el pulso cardíaco supera los <strong>175 BPM</strong> en el último cuarto, el atleta promedio pierde la visión periférica y comete pérdidas de balón. El atleta de Wild Wolves entrena la calma mental para tomar la decisión correcta sin pensar:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Tarjeta 1: Respiración de Línea */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-black uppercase tracking-wider">
                  <Clock className="h-4 w-4" />
                  Respiración Táctica 4-4-4
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  En la línea de tiro libre o tiempo muerto: inhalar 4 segundos por la nariz, retener 4 segundos en diafragma y exhalar en 4 segundos para descender de golpe 15 pulsaciones por minuto antes de lanzar.
                </p>
              </div>

              {/* Tarjeta 2: Regla de los 3 Segundos Mentales */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  Regla de los 3 Segundos
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Cero frustración ante tiros errados o decisiones arbitrales. El cerebro tiene estrictamente 3 segundos para digerir la jugada; de inmediato se adopta la postura defensiva con ojos en la cadera del rival.
                </p>
              </div>

              {/* Tarjeta 3: Estado de Flujo / Ultra Instinto */}
              <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-4 space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-[#d1fe17] text-xs font-black uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Ultra Instinto (Flow State)
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  En los niveles avanzados (Tier 8 y 9), el atleta no "calcula" la finta: la memoria neuromuscular de miles de repeticiones en Carmen Serdán ejecuta el pase o tiro de manera subconsciente.
                </p>
              </div>
            </div>
          </div>
        </section>
      </PaywallLockCard>

      {/* ========================================================================= */}
      {/* MODAL CINEMÁTICO: REPRODUCTOR DE VIDEO EDUCATIVO                          */}
      {/* ========================================================================= */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-3xl border border-cyan-500/40 bg-[#090d16] text-zinc-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Barra Superior Modal */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-[#0e1320]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Play className="h-4 w-4 fill-cyan-400 ml-0.5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{activeVideoModal.title}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Videoteca Táctica Wild Wolves • {activeVideoModal.duration}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Reproductor Embebido Iframe Responsivo */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>

            {/* Notas del Coach & Enlace Externo */}
            <div className="p-4 bg-[#0a0e18] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">
                  Instrucción del Head Coach Ricardo:
                </span>
                <p className="text-xs text-zinc-300 italic">
                  "{activeVideoModal.coachNotes}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideoModal.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 hover:text-white hover:bg-zinc-700 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir en YouTube
                </a>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-orange-500 transition cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Venta / Paywall para Contenido Pro */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureTitle="Videoteca Táctica Avanzada & Variante Pro"
        featureDescription="Acceso a biomecánica de competición, desaceleración, y enfoque psicológico bajo fatiga en duela."
      />
    </div>
  );
}
