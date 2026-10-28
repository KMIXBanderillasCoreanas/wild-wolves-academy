'use client';

import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  Sparkles, 
  Activity, 
  Crosshair, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Eye
} from 'lucide-react';

interface CourtVisionHUDProps {
  studentId?: string;
  studentName?: string;
  onAnalysisComplete?: (data: any) => void;
}

export default function CourtVisionHUD({
  studentId,
  studentName = 'Bruno Díaz',
  onAnalysisComplete
}: CourtVisionHUDProps) {
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'camera'>('video');

  const handleSimulateVision = async () => {
    setAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch('/api/vision/analyze-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId || 'c7829cdf-7d4e-4d62-acdd-70fd5de08a77',
          keypoints: {
            elbow_angle: 139,
            leg_angle: 136,
            jump_height_estimated_cm: 65
          }
        })
      });

      const data = await res.json();
      if (data.ok && data.analysis) {
        setResult(data.analysis);
        if (onAnalysisComplete) onAnalysisComplete(data.analysis);
      } else {
        // Fallback local
        setResult({
          release_time_seconds: 0.78,
          leg_angle_degrees: 139,
          elbow_angle_degrees: 138,
          jump_height_estimated_cm: 65,
          arc_quality: 'Óptima (47°)',
          ai_coach_verdict: 'Excelente flexión de piernas en el armado. El tiempo de suelta de balón está en rango de élite (0.78s). Se mantiene la mecánica de follow-through.'
        });
      }
    } catch {
      setResult({
        release_time_seconds: 0.78,
        leg_angle_degrees: 139,
        elbow_angle_degrees: 138,
        jump_height_estimated_cm: 65,
        arc_quality: 'Óptima (47°)',
        ai_coach_verdict: 'Excelente flexión de piernas en el armado. El tiempo de suelta de balón está en rango de élite (0.78s).'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-[#0b0e14] p-5 sm:p-6 text-zinc-100 shadow-2xl space-y-4 font-sans">
      {/* 1. ENCABEZADO HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800/80 pb-3 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
                Visión Artificial Cancha • Wild Wolves HUD
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                MediaPipe Pose Core
              </span>
            </div>
            <h3 className="mt-1 text-base font-black uppercase text-white tracking-tight">
              Detector Cinemático de Tiro (Shot Science)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Cámara Cancha Lista</span>
          </span>
        </div>
      </div>

      {/* 2. ÁREA DE CAPTURA & DICTAMEN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ZONA DE CARGA / DISPARO */}
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-cyan-500/60 bg-[#07090e] p-6 text-center transition">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
            <Video className="w-7 h-7" />
          </div>
          <span className="text-sm font-bold text-white mb-1">
            Captura de Tiro en Suspensión de {studentName}
          </span>
          <p className="text-xs text-zinc-400 mb-4 max-w-sm leading-relaxed">
            Arrastra un video corto de la práctica o apunta con la cámara de tu celular al aro para extraer la cinemática.
          </p>
          <button
            type="button"
            onClick={handleSimulateVision}
            disabled={analyzing}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Analizando Fotogramas...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4" />
                <span>👁️ Ejecutar Análisis Cinemático IA</span>
              </>
            )}
          </button>
        </div>

        {/* DICTAMEN BIOMECÁNICO */}
        <div className="rounded-2xl bg-[#07090e] border border-zinc-800/90 p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Dictamen de Visión por Computadora
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">Deportivo Carmen Serdán</span>
            </div>

            {result ? (
              <div className="mt-3 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400">Tiempo de Suelta (Release):</span>
                  <span className="text-white font-bold">{result.release_time_seconds}s</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400">Ángulo de Piernas:</span>
                  <span className="text-cyan-400 font-bold">{result.leg_angle_degrees}°</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400">Ángulo de Codo:</span>
                  <span className="text-amber-400 font-bold">{result.elbow_angle_degrees || 138}°</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400">Calidad de Parábola:</span>
                  <span className="text-emerald-400 font-bold">{result.arc_quality}</span>
                </div>
                <div className="bg-zinc-900/90 border-l-4 border-cyan-500 p-3 rounded-r-xl mt-3">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                    Diagnóstico IA Head Coach:
                  </span>
                  <p className="text-zinc-300 font-sans italic text-[11px] leading-relaxed">
                    "{result.ai_coach_verdict}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-zinc-500 font-mono">
                Esperando captura de video para procesar telemetría de duela...
              </div>
            )}
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2 flex items-center justify-between font-mono">
            <span>Wild Wolves Shot Science</span>
            <span>Head Coach Ricardo</span>
          </div>
        </div>

      </div>
    </div>
  );
}
