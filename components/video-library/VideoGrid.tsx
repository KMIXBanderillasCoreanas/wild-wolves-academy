'use client';

import React from 'react';
import { VideoLibraryItem } from '@/lib/types/video-library';
import VideoCard from './VideoCard';
import { Film, Sparkles, RefreshCw } from 'lucide-react';

interface VideoGridProps {
  videos: VideoLibraryItem[];
  favorites: string[];
  isLoading?: boolean;
  onPlay: (video: VideoLibraryItem) => void;
  onExplainAI: (video: VideoLibraryItem) => void;
  onToggleFavorite: (videoId: string) => void;
  onResetFilters?: () => void;
}

export default function VideoGrid({
  videos,
  favorites,
  isLoading = false,
  onPlay,
  onExplainAI,
  onToggleFavorite,
  onResetFilters
}: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-zinc-800 bg-[#0c101c] p-4 space-y-3 animate-pulse"
          >
            <div className="aspect-video w-full rounded-xl bg-zinc-800/60" />
            <div className="h-4 w-3/4 rounded bg-zinc-800" />
            <div className="h-3 w-1/2 rounded bg-zinc-800/60" />
            <div className="h-10 w-full rounded-xl bg-zinc-800/40" />
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-[#0c101c] p-12 text-center text-zinc-100 shadow-xl space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Film className="h-8 w-8" />
        </div>

        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-black text-white">No se encontraron lecciones para esta búsqueda</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Intenta con términos baloncestísticos generales como "tiro libre", "defensa de perímetro", "salto" o "crossover".
          </p>
        </div>

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-zinc-200 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restablecer Filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id || video.youtubeId}
          video={video}
          isFavorite={favorites.includes(video.id)}
          onPlay={onPlay}
          onExplainAI={onExplainAI}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
