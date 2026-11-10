"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Play, 
  MessageCircle, 
  Zap, 
  Target, 
  Activity, 
  Award, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export interface SuccessStory {
  id: string;
  atleta_nombre: string;
  logro_descripcion: string;
  youtube_video_id: string;
  metricas_ia: string;
  category?: string;
  days_to_transform?: number;
}

const CANONICAL_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "trans-01",
    atleta_nombre: "Kevin G.",
    logro_descripcion: "Pasó de no tocar el aro a colgarse de él en 60 días",
    youtube_video_id: "dQw4w9WgXcQ",
    metricas_ia: "Salto vertical: +18cm | Release time: 0.62s",
    category: "U-17 Competitivo",
    days_to_transform: 60
  },
  {
    id: "trans-02",
    atleta_nombre: "Isaac",
    logro_descripcion: "Perfeccionamiento de tiro tras drible y paso cero con 72% de efectividad",
    youtube_video_id: "5f9VdG7mY3I",
    metricas_ia: "Ángulo de tiro: 47° | Release: 0.58s | +12% triples",
    category: "U-17 Competitivo",
    days_to_transform: 45
  },
  {
    id: "trans-03",
    atleta_nombre: "Mateo R.",
    logro_descripcion: "Desaceleración brusca en 45° y control del bote bajo ante presión perimetral",
    youtube_video_id: "8Jz_5_o8h7w",
    metricas_ia: "Circuito agilidad: 2.1s | Salto cuerda: 650 continuos | Salto vertical: +12cm",
    category: "U-15 Formativo",
    days_to_transform: 60
  },
  {
    id: "trans-04",
    atleta_nombre: "Isaac M.",
    logro_descripcion: "Dominio de flotadoras bombeadas con arco alto de 55° superando defensas altos",
    youtube_video_id: "bTqVqk7FSmY",
    metricas_ia: "Arco de tiro: 55° | Envergadura: 100% | Tiro libre: 8/10",
    category: "U-15 Formativo",
    days_to_transform: 30
  }
];

export default function DuelaTransformacion() {
  const [stories, setStories] = useState<SuccessStory[]>(CANONICAL_SUCCESS_STORIES);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStories() {
      try {
        const { data, error } = await supabase
          .from("success_stories")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          setStories(data);
        }
      } catch {
        // Fallback garantizado a historias canónicas predefinidas
      }
    }
    loadStories();
  }, []);

  // Helper para desglosar métricas IA en badges individuales
  const renderMetricBadges = (metricsStr: string) => {
    const parts = metricsStr.split("|").map((p) => p.trim());
    return parts.map((part, idx) => {
      let icon = <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      if (part.toLowerCase().includes("salto")) {
        icon = <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
      } else if (part.toLowerCase().includes("release") || part.toLowerCase().includes("tiempo")) {
        icon = <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      } else if (part.toLowerCase().includes("tiro") || part.toLowerCase().includes("arco")) {
        icon = <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      }

      return (
        <span 
          key={idx}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-zinc-700/80 text-[11px] font-mono text-zinc-200 shadow-sm"
        >
          {icon}
          <span>{part}</span>
        </span>
      );
    });
  };

  return (
    <section className="relative z-10 py-12 px-4 max-w-6xl mx-auto w-full">
      {/* Encabezado Táctico de Sección */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#f66018] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30 font-black flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Duela de Transformación
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">
              Evidencia Real en Video
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
            Casos de Éxito &amp; Evolución Biomecánica
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Metodología científica probada en el Deportivo Carmen Serdán. Mira la progresión real de nuestros atletas combinando calistenia, series 3x25 y análisis de tiro con IA.
          </p>
        </div>

        <div className="text-xs text-zinc-300 font-mono flex items-center gap-1.5 bg-[#121724] px-3.5 py-2 rounded-xl border border-zinc-800 shrink-0">
          <MapPin className="w-4 h-4 text-[#f66018]" />
          <span>Sede Carmen Serdán (CDMX)</span>
        </div>
      </div>

      {/* Grilla de Tarjetas de Casos de Éxito */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stories.map((story) => {
          const isPlaying = activeVideoId === story.id;
          const coachWhatsAppUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
            `Hola Coach Ricardo, vi el caso de éxito de ${story.atleta_nombre} ("${story.logro_descripcion}") en la plataforma de Wild Wolves CDMX. Me interesa agendar mi sesión de prueba en Deportivo Carmen Serdán.`
          )}`;

          return (
            <div
              key={story.id}
              className="bg-gradient-to-b from-[#121624] via-[#0f121d] to-[#090c14] border border-orange-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 hover:border-orange-500/60 transition-all duration-300 hover:shadow-[0_0_35px_rgba(246,96,24,0.18)] group"
            >
              {/* Parte Superior: Encabezado del Atleta */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f66018] to-orange-700 flex items-center justify-center font-black text-sm text-white shadow-md shadow-orange-950/50">
                    🐺
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
                      <span>{story.atleta_nombre}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30 uppercase">
                        {story.category || "Atleta Oficial"}
                      </span>
                    </h3>
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#f66018]" />
                      <span>Evolución en {story.days_to_transform || 60} días</span>
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verificado en Duela</span>
                </div>
              </div>

              {/* Logro Destacado */}
              <div className="bg-black/40 border border-zinc-800/80 rounded-2xl p-3.5">
                <span className="text-[10px] font-mono uppercase text-orange-400 font-bold block mb-1">
                  Logro Conquistado:
                </span>
                <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                  "{story.logro_descripcion}"
                </p>
              </div>

              {/* Reproductor de Video con Facade Optimizado */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-inner group/video">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${story.youtube_video_id}?autoplay=1&rel=0&modestbranding=1`}
                    title={`Caso de éxito de ${story.atleta_nombre}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 animate-in fade-in duration-300"
                  />
                ) : (
                  <div
                    onClick={() => setActiveVideoId(story.id)}
                    className="relative w-full h-full cursor-pointer flex items-center justify-center"
                  >
                    <Image
                      src={`https://img.youtube.com/vi/${story.youtube_video_id}/hqdefault.jpg`}
                      alt={`Miniatura del video de ${story.atleta_nombre}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover/video:scale-105 transition-transform duration-500 opacity-80 group-hover/video:opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Botón Central de Play Neón */}
                    <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f66018] group-hover/video:bg-orange-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(246,96,24,0.7)] group-hover/video:scale-110 transition-all duration-300">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-1" />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300 z-10">
                      <span className="bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-zinc-700/60 flex items-center gap-1.5 text-white">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver Análisis en Video</span>
                      </span>
                      <span className="bg-orange-500/90 text-black px-2 py-0.5 rounded font-black text-[10px] uppercase">
                        HD
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Insignias de Telemetría y Métricas IA */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Telemetría &amp; Biomecánica Registrada:
                </span>
                <div className="flex flex-wrap gap-2">
                  {renderMetricBadges(story.metricas_ia)}
                </div>
              </div>

              {/* Botón de Conversión Comercial ("Click-to-Chat WhatsApp") */}
              <div className="pt-2">
                <a
                  href={coachWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/40 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-emerald-600 shrink-0" />
                  <span>Quiero Entrenar como {story.atleta_nombre.split(" ")[0]} • Agendar con Coach Ricardo</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

      {/* Banner Inferior de Llamado a la Acción para Prospectos */}
      <div className="mt-8 bg-gradient-to-r from-orange-950/40 via-[#131722] to-[#0c0f17] border border-orange-500/30 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[#f66018] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
              ¿Quieres que tu hijo sea el próximo caso de éxito?
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ven a tu clase muestra gratuita en Carmen Serdán. Evaluamos su línea base el primer día sin costo.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/525522427769?text=Hola%20Coach%20Ricardo,%20quiero%20agendar%20una%20clase%20muestra%20gratuita%20en%20Deportivo%20Carmen%20Serd%C3%A1n%20para%20evaluar%20a%20mi%20hijo."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-orange-950/50 shrink-0 flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Agendar Clase Muestra Gratis</span>
        </a>
      </div>
    </section>
  );
}
