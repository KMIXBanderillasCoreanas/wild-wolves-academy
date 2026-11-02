'use client';

import React, { useState } from 'react';
import { ingestVideoManualAction } from '@/app/actions/video-library-actions';
import { VideoLibraryItem } from '@/lib/types/video-library';
import { YouTubeAdapter } from '@/lib/services/youtube-adapter';
import { 
  PlusCircle, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Film, 
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface VideoIngestionFormProps {
  userId?: string;
  isAdmin?: boolean;
  onVideoIngested?: (video: VideoLibraryItem) => void;
}

export default function VideoIngestionForm({
  userId = 'admin',
  isAdmin = true,
  onVideoIngested
}: VideoIngestionFormProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [autoApprove, setAutoApprove] = useState(isAdmin);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    item?: VideoLibraryItem;
  } | null>(null);

  // Extracción reactiva de ID de YouTube para preview
  const previewId = YouTubeAdapter.extractVideoId(videoUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsProcessing(true);
    setFeedback(null);

    try {
      const res = await ingestVideoManualAction({
        videoUrl: videoUrl.trim(),
        coachNotes: coachNotes.trim(),
        userId,
        isAdmin,
        autoApprove: isAdmin && autoApprove
      });

      if (res.success && res.item) {
        setFeedback({
          success: true,
          message: res.message,
          item: res.item
        });
        setVideoUrl('');
        setCoachNotes('');
        if (onVideoIngested) {
          onVideoIngested(res.item);
        }
      } else {
        setFeedback({
          success: false,
          message: res.message || 'Error al procesar el video con el Bus Neural.'
        });
      }
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err?.message || 'Error de red al procesar el video.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-[#0a1120] via-[#0f172a] to-[#141226] p-6 text-zinc-100 shadow-2xl space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-2.5 py-1 text-[11px] font-black uppercase text-cyan-300 border border-cyan-500/40">
              <PlusCircle className="h-3.5 w-3.5 text-cyan-400" />
              Ingesta Asistida por IA (Sin Google Cloud API)
            </span>
            <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-300 border border-emerald-500/30">
              Bus Neural apinex.bond
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Curaduría Manual de Videos con Razonamiento IA
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            Pega el enlace de YouTube de cualquier lección técnica. La IA extraerá los metadatos, clasificará la biomecánica, verificará la seguridad para menores (14-16 años) y redactará la ficha técnica formativa.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inputs principales */}
          <div className="lg:col-span-2 space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-300 mb-1.5">
                URL o ID del Video de YouTube *
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Ej. https://www.youtube.com/watch?v=7r1BTmQuLXg o https://youtu.be/..."
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-300 mb-1.5">
                Notas del Entrenador / Contexto Táctico (Opcional)
              </label>
              <textarea
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Ej. 'Observar la absorción excéntrica de rodilla en el crossover en 45°. Importante para el turno vespertino en Carmen Serdán.'"
                rows={3}
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/90 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 leading-relaxed resize-none"
              />
            </div>

            {isAdmin && (
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="h-4 w-4 accent-amber-500 rounded"
                />
                <div>
                  <span className="font-black text-amber-300 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    Aprobar inmediatamente como Curriculum Oficial Permanente
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Si se desmarca, se guardará en la cola de moderación del búnker para revisión previa.
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* Miniatura en Vivo */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-center space-y-2">
            {previewId ? (
              <div className="w-full space-y-2">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg">
                  <img
                    src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                    ID: {previewId}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Enlace de YouTube Válido
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500 space-y-2">
                <Film className="h-10 w-10 text-zinc-600" />
                <span className="text-xs font-medium">Pega una URL para previsualizar</span>
              </div>
            )}
          </div>
        </div>

        {/* Botón de Envío */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isProcessing || !videoUrl.trim()}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-600/30 transition cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-200" />
                Razonando y Clasificando con Bus Neural...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Clasificar con Bus Neural & Guardar
              </>
            )}
          </button>
        </div>
      </form>

      {/* Feedback y Ficha Técnica de Resultado */}
      {feedback && (
        <div
          className={`rounded-2xl p-4 border animate-in fade-in duration-300 space-y-3 ${
            feedback.success
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
              : 'border-red-500/40 bg-red-950/20 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-black">
            {feedback.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>

          {feedback.item && (
            <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3.5 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between text-[11px] border-b border-zinc-800 pb-2">
                <span className="font-mono text-cyan-400 font-bold uppercase">
                  {feedback.item.category.replace(/_/g, ' ')} • Nivel {feedback.item.difficulty}
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {feedback.item.relevanceScore}% Relevancia IA
                </span>
              </div>
              <h4 className="text-sm font-black text-white">{feedback.item.title}</h4>
              <p className="text-zinc-400 text-xs">{feedback.item.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Seguro para Menores (14-16 años) • {feedback.item.aiAnalysis.referenceBookAlignment}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
