'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  Sparkles,
  Lock,
  Crown,
  MessageCircle,
  KeyRound
} from 'lucide-react';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import UpgradeModal from '@/components/UpgradeModal';

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
  const { isPro, setMode } = useSubscriptionTier();
  const [embedError, setEmbedError] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const embedUrl = YouTubeAdapter.getPrivacyEnhancedEmbedUrl(video.youtubeId, true);
  const directWatchUrl = YouTubeAdapter.getDirectWatchUrl(video.youtubeId);

  const waMessage = encodeURIComponent(
    `¡Hola Coach Ricardo! 🐺🏀 Quiero adquirir mi Folio Lobo Pro de 30 días ($99 MXN) para ver la clase táctica: "${video.title}". ¿Me comparte la cuenta para pago por favor?`
  );
  const waUrl = `https://wa.me/525522427769?text=${waMessage}`;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={`Reproductor: ${video.title}`}
      >
        <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#090d16] text-zinc-100 shadow-2xl">
          {/* Barra Superior */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-[#0d121f] p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isPro ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isPro ? (
                  <Play className="h-4 w-4 fill-cyan-400 ml-0.5" />
                ) : (
                  <Lock className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white line-clamp-1">{video.title}</h3>
                  {video.isOfficial && (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-300 border border-amber-500/30">
                      <Award className="h-2.5 w-2.5" /> Oficial
                    </span>
                  )}
                  {!isPro && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-300 border border-amber-500/40">
                      <Lock className="h-2.5 w-2.5" /> Lobo Pro $99
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {video.channelTitle} • {video.duration}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPro && (
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
              )}

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

          {/* Reproductor con Aspect Ratio 16:9 O Pantalla de Paywall Lobo Pro */}
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            {isPro ? (
              // MODO PRO: Reproduce el Video en iframe seguro
              !embedError ? (
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
              )
            ) : (
              // MODO GRATUITO: Paywall Interactivo con Miniatura Difuminada
              <div className="relative h-full w-full flex items-center justify-center p-6 text-center overflow-hidden bg-[#07090e]">
                {/* Miniatura de fondo con desenfoque cinematográfico */}
                {video.thumbnailUrl && (
                  <div className="absolute inset-0 z-0 opacity-25 filter blur-lg scale-105">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/80 to-[#090d16]/90" />

                {/* Tarjeta Central del Paywall */}
                <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
                    <Crown className="w-7 h-7 animate-bounce" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                      Contenido Exclusivo • Videoteca Carmen Serdán
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                      Acceso Exclusivo Atleta Lobo Pro / Pack Familiar Élite
                    </h4>
                    <p className="text-xs text-zinc-300 max-w-md leading-relaxed">
                      Esta lección técnica y su desglose biomecánico están disponibles con tu <strong>Folio de Activación Lobo Pro de 30 días ($99 MXN)</strong>.
                    </p>
                  </div>

                  {/* Botones de Conversión */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Pedir Folio por WhatsApp ($99)</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 hover:border-amber-500/50 text-xs font-bold transition flex items-center gap-2"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Canjear Folio</span>
                    </button>

                    {/* Atajo de Simulación Demo */}
                    <button
                      type="button"
                      onClick={() => setMode('pro')}
                      className="px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold transition flex items-center gap-1.5"
                      title="Alternar temporalmente a Pro en modo demo para probar el reproductor"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Probar en Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra Inferior: Metadatos y Llamado a Análisis Biomecánico IA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d121f] p-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">
                {isPro 
                  ? 'Reproductor Privado (youtube-nocookie). Apto para atletas juveniles de Wild Wolves CDMX.'
                  : 'Modo Gratuito activo. Adquiere tu folio de 30 días con el Coach Ricardo.'}
              </span>
            </div>

            {onOpenAIExplain && (
              <button
                type="button"
                onClick={() => {
                  if (isPro) {
                    onOpenAIExplain(video);
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  isPro
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-zinc-800 border border-purple-500/30 text-purple-300 hover:border-purple-400'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Ver Desglose Táctico IA</span>
                {!isPro && <Lock className="h-3 w-3 text-amber-400 ml-1" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Paywall Flotante para Canje de Códigos */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureTitle={`Desglose Táctico IA: ${video.title}`}
          featureDescription="El asistente táctico analiza la biomecánica, puntos clave y errores comunes de este video mediante IA avanzada."
          onActivated={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
}
