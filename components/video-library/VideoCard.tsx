'use client';

import React from 'react';
import { VideoLibraryItem } from '@/lib/types/video-library';
import { 
  Play, 
  Bookmark, 
  Brain, 
  Award, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { YouTubeAdapter } from '@/lib/services/youtube-adapter';

interface VideoCardProps {
  video: VideoLibraryItem;
  isFavorite?: boolean;
  onPlay: (video: VideoLibraryItem) => void;
  onExplainAI: (video: VideoLibraryItem) => void;
  onToggleFavorite: (videoId: string) => void;
}

export default function VideoCard({
  video,
  isFavorite = false,
  onPlay,
  onExplainAI,
  onToggleFavorite
}: VideoCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c101c] text-zinc-100 shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
      {/* Miniatura y Overlays */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradiente oscuro sobre imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c101c] via-black/30 to-transparent" />

        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {video.isOfficial ? (
            <span className="flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-950 shadow-md">
              <Award className="h-3 w-3" />
              Curriculum Oficial
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-md bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono uppercase text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Búsqueda IA
            </span>
          )}

          <span className="rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-md flex items-center gap-1">
            <Clock className="h-3 w-3 text-zinc-400" />
            {video.duration}
          </span>
        </div>

        {/* Botón de Play Central en Hover */}
        <button
          type="button"
          onClick={() => onPlay(video)}
          className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/80 text-zinc-950 shadow-lg shadow-cyan-500/40 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 cursor-pointer"
          title="Reproducir lección"
        >
          <Play className="h-6 w-6 fill-zinc-950 ml-0.5" />
        </button>

        {/* Botón Favorito flotante */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(video.id);
          }}
          className={`absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md transition ${
            isFavorite
              ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30'
              : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
          }`}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-mono text-cyan-400 font-bold tracking-wide">
              {video.channelTitle}
            </span>
            <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[9px] uppercase font-bold text-zinc-300">
              {video.difficulty}
            </span>
          </div>

          <h4 className="text-sm font-black text-white leading-snug line-clamp-2 group-hover:text-cyan-300 transition">
            {video.title}
          </h4>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Métricas de Relevancia y Protección de Menores */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Relevancia</span>
              <span className="font-mono font-black text-emerald-400">{video.relevanceScore}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Educativo</span>
              <span className="font-mono font-black text-sky-400">{video.educationalScore}%</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium">
            <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>Seguro para Menores (14-16 años) • Sin sobrecargas</span>
          </div>

          {/* Botones de Acción */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onPlay(video)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-cyan-300" />
              Ver Lección
            </button>

            <button
              type="button"
              onClick={() => onExplainAI(video)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 text-xs font-bold transition cursor-pointer"
            >
              <Brain className="h-3.5 w-3.5 text-purple-400" />
              Análisis IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
