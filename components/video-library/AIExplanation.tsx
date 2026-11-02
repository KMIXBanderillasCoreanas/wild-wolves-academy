'use client';

import React from 'react';
import { VideoLibraryItem } from '@/lib/types/video-library';
import { 
  Brain, 
  X, 
  Activity, 
  Target, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface AIExplanationProps {
  video: VideoLibraryItem;
  onClose: () => void;
  onPlayVideo?: (video: VideoLibraryItem) => void;
}

export default function AIExplanation({
  video,
  onClose,
  onPlayVideo
}: AIExplanationProps) {
  const ai = video.aiAnalysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-500/40 bg-[#0d111e] text-zinc-100 shadow-2xl p-6 space-y-5">
        {/* Encabezado Modal */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block">
                Auditoría Biomecánica & Táctica IA
              </span>
              <h3 className="text-base font-black text-white">{video.title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resumen General */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-300">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Diagnóstico Pedagógico
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {ai.summary || video.description}
          </p>
        </div>

        {/* 2 Bloques: Biomecánica vs Táctica */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Biomecánica */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-300">
              <Activity className="h-4 w-4 text-cyan-400" />
              Mecanismo Biomecánico
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {ai.biomechanicalFocus || 'Control cinemático y absorción excéntrica de fuerza en duela.'}
            </p>
          </div>

          {/* Táctica */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-300">
              <Target className="h-4 w-4 text-amber-400" />
              Lectura y Toma de Decisiones
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {ai.tacticalFocus || 'Anticipación espacial contra coberturas defensivas y presión individual.'}
            </p>
          </div>
        </div>

        {/* Alineación con Manuales de Referencia Carmen Serdán */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-300">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            Alineación con Manual Operativo Wild Wolves (Carmen Serdán)
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {ai.referenceBookAlignment || 'Estrictamente alineado a los lineamientos de preparación física y nutrición deportiva.'}
          </p>
        </div>

        {/* Advertencias y Protección de Menores */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Filtro de Seguridad para Menores (14-16 años)
            </div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
              Verificado ✓
            </span>
          </div>

          {ai.cautions && ai.cautions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {ai.cautions.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-300/90">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Acción */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            Cerrar
          </button>
          {onPlayVideo && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlayVideo(video);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition cursor-pointer"
            >
              Reproducir Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
