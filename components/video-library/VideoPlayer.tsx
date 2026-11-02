'use client';

import React, { useState } from 'react';
import { VideoLibraryItem } from '@/lib/types/video-library';
import { YouTubeAdapter } from '@/lib/services/youtube-adapter';
import { 
  X, 
  ExternalLink, 
  Play, 
  ShieldCheck, 
  Award, 
  Brain, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface VideoPlayerProps {
  video: VideoLibraryItem;
  onClose?: () => void;
  onOpenAIExplain?: (video: VideoLibraryItem) => void;
}

export default function VideoPlayer({
  video,
  onClose,
  onOpenAIExplain
}: VideoPlayerProps) {
  const [embedError, setEmbedError] = useState(false);
  const embedUrl = YouTubeAdapter.getPrivacyEnhancedEmbedUrl(video.youtubeId, true);
  const directWatchUrl = YouTubeAdapter.getDirectWatchUrl(video.youtubeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#090d16] text-zinc-100 shadow-2xl">
        {/* Barra Superior */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#0d121f] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Play className="h-4 w-4 fill-cyan-400 ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white line-clamp-1">{video.title}</h3>
                {video.isOfficial && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-300 border border-amber-500/30">
                    <Award className="h-2.5 w-2.5" /> Oficial
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {video.channelTitle} • {video.duration}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white transition"
              title="Abrir directamente en YouTube"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>YouTube</span>
            </a>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Reproductor con Aspect Ratio 16:9 y Fallback Seguro */}
        <div className="relative aspect-video w-full bg-black">
          {!embedError ? (
            <iframe
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full border-0"
              onError={() => setEmbedError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center space-y-3 bg-[#0a0f1d]">
              <AlertCircle className="h-10 w-10 text-amber-400" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">Reproducción externa requerida</h4>
                <p className="text-xs text-zinc-400 max-w-md">
                  El creador del contenido ha restringido la reproducción integrada en iframes. Puedes estudiarlo de forma segura directamente en YouTube:
                </p>
              </div>
              <a
                href={directWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-black uppercase text-white shadow-lg transition"
              >
                <ExternalLink className="h-4 w-4" />
                Ver en YouTube Oficial
              </a>
            </div>
          )}
        </div>

        {/* Barra Inferior: Metadatos y Llamado a Análisis Biomecánico IA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d121f] p-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">
              Reproductor Privado (youtube-nocookie). Apto para atletas juveniles de Wild Wolves CDMX.
            </span>
          </div>

          {onOpenAIExplain && (
            <button
              type="button"
              onClick={() => onOpenAIExplain(video)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Brain className="h-4 w-4" />
              Ver Desglose Táctico IA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
