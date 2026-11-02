'use client';

import React, { useState, useEffect } from 'react';
import { VideoLibraryItem } from '@/lib/types/video-library';
import { 
  getPendingApprovalsAction, 
  approveVideoAction, 
  rejectVideoAction 
} from '@/app/actions/video-library-actions';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Brain, 
  Sparkles, 
  Clock, 
  RefreshCw,
  Award,
  AlertTriangle,
  Info
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import AIExplanation from './AIExplanation';
import VideoIngestionForm from './VideoIngestionForm';

interface VideoApprovalPanelProps {
  adminId?: string;
  adminName?: string;
}

export default function VideoApprovalPanel({
  adminId = 'admin-ricardo',
  adminName = 'Head Coach Ricardo'
}: VideoApprovalPanelProps) {
  const [pendingVideos, setPendingVideos] = useState<VideoLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoLibraryItem | null>(null);
  const [activeExplainModal, setActiveExplainModal] = useState<VideoLibraryItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    const res = await getPendingApprovalsAction();
    if (res.success && res.items) {
      setPendingVideos(res.items);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (video: VideoLibraryItem) => {
    setProcessingId(video.id);
    const res = await approveVideoAction(adminId, video.id, `Aprobado por ${adminName}`);
    if (res.success) {
      setActionFeedback(`✓ Video "${video.title}" incorporado al curriculum oficial.`);
      setPendingVideos((prev) => prev.filter((v) => v.id !== video.id));
    } else {
      setActionFeedback(`Error: ${res.message}`);
    }
    setProcessingId(null);
  };

  const handleReject = async (video: VideoLibraryItem) => {
    const reason = rejectionNotes[video.id] || 'Contenido no alineado con la metodología de Wild Wolves CDMX.';
    setProcessingId(video.id);
    const res = await rejectVideoAction(adminId, video.id, reason);
    if (res.success) {
      setActionFeedback(`✕ Video "${video.title}" rechazado de la biblioteca.`);
      setPendingVideos((prev) => prev.filter((v) => v.id !== video.id));
    } else {
      setActionFeedback(`Error: ${res.message}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header del Panel de Aprobación */}
      <div className="relative overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-r from-[#17090b] via-[#150e18] to-[#0d121f] p-6 text-zinc-100 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-black uppercase text-red-400 border border-red-500/40">
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                Control de Calidad & RBAC Exclusivo ADMIN
              </span>
              <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-black uppercase text-amber-300 border border-amber-500/30">
                Filtro Menores 14-16 Años
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Búnker de Aprobación: AI Smart Video Library
            </h3>

            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Exclusivo para el cuerpo técnico administrativo. Audita videos indexados temporalmente por el motor de búsqueda IA antes de otorgar el sello de <strong>Curriculum Permanente Oficial</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPending}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-200 transition shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
            Actualizar Cola ({pendingVideos.length})
          </button>
        </div>

        {/* Feedback pill */}
        {actionFeedback && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-950/60 border border-zinc-800 p-2.5 text-xs text-zinc-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-zinc-500 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Formulario de Ingesta Directa Asistida por IA */}
        <div className="mt-5">
          <VideoIngestionForm
            userId={adminId}
            isAdmin={true}
            onVideoIngested={() => {
              fetchPending();
            }}
          />
        </div>

        {/* Lista de Videos Pendientes de Moderación */}
        <div className="mt-6 space-y-3.5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full rounded-2xl bg-zinc-900/40 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : pendingVideos.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-8 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
              <h4 className="text-sm font-black text-white">Cola de Moderación al Corriente</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No hay videos pendientes de revisión. Todos los contenidos activos han sido clasificados o verificados por la academia.
              </p>
            </div>
          ) : (
            pendingVideos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-[#0e1422] p-4 text-zinc-100 hover:border-zinc-700 transition"
              >
                {/* Miniatura y Detalles */}
                <div className="flex items-start gap-3.5">
                  <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(video)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 text-white transition cursor-pointer"
                      title="Reproducir previsualización"
                    >
                      <Play className="h-6 w-6 fill-white" />
                    </button>
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] font-mono text-zinc-300">
                      {video.duration}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                        {video.channelTitle}
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] uppercase font-bold text-zinc-400">
                        {video.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-black">
                        IA: {video.relevanceScore}% Relevancia
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white leading-snug line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">{video.description}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                      <button
                        type="button"
                        onClick={() => setActiveExplainModal(video)}
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold transition cursor-pointer"
                      >
                        <Brain className="h-3.5 w-3.5" />
                        Ver Diagnóstico Biomecánico
                      </button>
                    </div>
                  </div>
                </div>

                {/* Acciones de Moderación */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 border-t lg:border-t-0 border-zinc-800 pt-3 lg:pt-0">
                  <input
                    type="text"
                    placeholder="Motivo de rechazo (opcional)"
                    value={rejectionNotes[video.id] || ''}
                    onChange={(e) =>
                      setRejectionNotes({ ...rejectionNotes, [video.id]: e.target.value })
                    }
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:border-red-500 focus:outline-none w-full sm:w-48"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(video)}
                      disabled={processingId === video.id}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 text-xs font-black uppercase text-red-300 transition cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(video)}
                      disabled={processingId === video.id}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
                    >
                      <Award className="h-4 w-4" />
                      Aprobar Oficial
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modales */}
      {activeVideoModal && (
        <VideoPlayer video={activeVideoModal} onClose={() => setActiveVideoModal(null)} />
      )}
      {activeExplainModal && (
        <AIExplanation video={activeExplainModal} onClose={() => setActiveExplainModal(null)} />
      )}
    </div>
  );
}
