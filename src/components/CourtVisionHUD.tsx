'use client';
import React, { useState } from 'react';

export default function CourtVisionHUD() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulateVision = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        release_time_seconds: 0.78,
        leg_angle_degrees: 139,
        arc_quality: 'Óptima (47°)',
        ai_coach_verdict: 'Excelente flexión de piernas en el armado. El tiempo de suelta de balón está en rango de élite (0.78s).'
      });
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#0f131d] p-6 text-zinc-100 shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div>
          <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
            Visión Artificial Cancha • Wild Wolves HUD
          </span>
          <h3 className="mt-1 text-base font-black uppercase text-white">
            Detector Cinemático de Tiro (Shot Science)
          </h3>
        </div>
        <span className="text-xs font-mono text-emerald-400">● Cámara Activa</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-[#090c14] p-6 text-center">
          <div className="text-3xl mb-2">📹</div>
          <p className="text-xs text-zinc-400 mb-4">
            Arrastra un video de la práctica o apunta con la cámara de tu celular al aro.
          </p>
          <button
            type="button"
            onClick={handleSimulateVision}
            disabled={analyzing}
            className="rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {analyzing ? 'Analizando Fotogramas...' : '👁️ Ejecutar Análisis IA'}
          </button>
        </div>

        <div className="rounded-xl bg-[#090c14] border border-zinc-800 p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-cyan-400 mb-2">Dictamen de Visión por Computadora</h4>
            {result ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-800 pb-1">
                  <span className="text-zinc-400">Tiempo de Suelta:</span>
                  <span className="text-white font-bold">{result.release_time_seconds}s</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1">
                  <span className="text-zinc-400">Ángulo de Piernas:</span>
                  <span className="text-white font-bold">{result.leg_angle_degrees}°</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1">
                  <span className="text-zinc-400">Calidad de Parábola:</span>
                  <span className="text-emerald-400 font-bold">{result.arc_quality}</span>
                </div>
                <p className="mt-2 text-zinc-300 font-sans italic text-[11px]">"{result.ai_coach_verdict}"</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">Esperando captura de video para procesar telemetría...</p>
            )}
          </div>
          <div className="text-[10px] text-zinc-500 mt-4 border-t border-zinc-800/80 pt-2">
            Sede: Deportivo Carmen Serdán • Head Coach Ricardo
          </div>
        </div>
      </div>
    </div>
  );
}
