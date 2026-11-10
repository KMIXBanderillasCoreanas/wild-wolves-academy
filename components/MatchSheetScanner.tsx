'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  RefreshCw, 
  Flame, 
  Target, 
  Trophy, 
  ShieldCheck, 
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { 
  extractMatchSheetDataAction, 
  syncMatchSheetRecordAction, 
  MatchSheetStats 
} from '@/app/actions/match-sheet-ocr-actions';

interface MatchSheetScannerProps {
  studentId: string;
  studentName?: string;
  onSyncSuccess?: () => void;
}

export default function MatchSheetScanner({
  studentId,
  studentName = 'Atleta Seleccionado',
  onSyncSuccess
}: MatchSheetScannerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rawOcr, setRawOcr] = useState<string>('');
  const [showRawText, setShowRawText] = useState<boolean>(false);

  // Estadísticas extraídas editables por el Coach antes de confirmar
  const [extractedStats, setExtractedStats] = useState<MatchSheetStats | null>(null);
  const [coachNotes, setCoachNotes] = useState<string>('Validado en Duela Deportivo Carmen Serdán');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona una imagen válida (JPG o PNG de la hoja física).');
      return;
    }

    setFileName(file.name);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await extractMatchSheetDataAction(base64);
      if (res.success && res.stats) {
        setExtractedStats(res.stats);
        setRawOcr(res.rawText || '');
        setSuccessMsg('¡Hoja física digitalizada! Revisa los números y aprueba la sincronización.');
      } else {
        setErrorMsg(res.message || 'No se pudieron extraer los datos con claridad.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error procesando la imagen con OCR.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToRecord = async () => {
    if (!extractedStats) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await syncMatchSheetRecordAction({
        studentId,
        stats: extractedStats,
        rawText: rawOcr,
        coachNotes
      });

      if (res.success) {
        setSuccessMsg('¡Sincronización Completada! Las estadísticas oficiales se añadieron al historial del atleta.');
        if (onSyncSuccess) onSyncSuccess();
      } else {
        setErrorMsg(res.message || 'Error al guardar el partido.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al conectar con la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetScanner = () => {
    setImagePreview(null);
    setFileName('');
    setExtractedStats(null);
    setRawOcr('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="bg-[#0b0e17] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Glow táctico */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-mono font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Visión Artificial OCR • Duela Carmen Serdán
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-orange-500" />
            Escáner de Hoja de Partido
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Fotografía la cédula o acta física del encuentro. La IA extraerá los puntos, triples y tiros libres del atleta <strong className="text-white">{studentName}</strong>.
          </p>
        </div>

        {imagePreview && (
          <button
            onClick={resetScanner}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Nueva Hoja
          </button>
        )}
      </div>

      {/* Área de Notificaciones */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ZONA 1: CARGA DE FOTOGRAFÍA / ARCHIVO */}
      {!imagePreview ? (
        <div className="border-2 border-dashed border-zinc-800 hover:border-orange-500/50 rounded-2xl p-8 sm:p-12 text-center transition-all bg-zinc-950/40 hover:bg-zinc-900/30">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 text-orange-400">
            <Camera className="w-8 h-8" />
          </div>

          <h3 className="text-white font-bold text-base mb-1">
            Subir o Fotografiar Cédula Oficial
          </h3>
          <p className="text-zinc-400 text-xs max-w-md mx-auto mb-6">
            Asegura buena iluminación sobre la mesa de control del Deportivo Carmen Serdán para máxima precisión de lectura.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Tomar Foto en Duela
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-zinc-700 transition active:scale-95"
            >
              <Upload className="w-4 h-4" />
              Elegir desde Galería / PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vista previa de la imagen escaneada */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black/60 aspect-[3/4] max-h-[420px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Hoja de Partido Escaneada"
                className="w-full h-full object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  </div>
                  <div className="w-3/4 max-w-[200px] h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 animate-pulse" />
                  </div>
                  <p className="text-orange-300 font-mono text-xs uppercase tracking-widest font-black animate-pulse text-center px-4">
                    Extrayendo Cédula con Visión Artificial OCR...
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
              <span className="truncate max-w-[200px]">{fileName}</span>
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="text-orange-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                {showRawText ? 'Ocultar OCR' : 'Ver Texto OCR'}
              </button>
            </div>

            {showRawText && rawOcr && (
              <div className="p-3 bg-black/80 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-400 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {rawOcr}
              </div>
            )}
          </div>

          {/* PANEL DE PRE-VISUALIZACIÓN Y CALIBRACIÓN DE DATOS EXTRAÍDOS */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Pre-visualización de Datos Extraídos
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Listo para Aprobar
                </span>
              </div>

              {extractedStats && (
                <div className="space-y-4">
                  {/* Tarjetas Clave: Puntos, Triples, Tiros Libres */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Puntos Totales</span>
                      <input
                        type="number"
                        value={extractedStats.points}
                        onChange={(e) => setExtractedStats({ ...extractedStats, points: Number(e.target.value) })}
                        className="text-2xl font-black text-orange-400 bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-orange-500 rounded"
                      />
                      <span className="text-[9px] text-zinc-400">PTS</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Triples (3PT)</span>
                      <input
                        type="number"
                        value={extractedStats.threePointersMade}
                        onChange={(e) => setExtractedStats({ ...extractedStats, threePointersMade: Number(e.target.value) })}
                        className="text-2xl font-black text-amber-400 bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
                      />
                      <span className="text-[9px] text-zinc-400">Aciertos</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Tiros Libres</span>
                      <input
                        type="number"
                        value={extractedStats.freeThrowsMade}
                        onChange={(e) => setExtractedStats({ ...extractedStats, freeThrowsMade: Number(e.target.value) })}
                        className="text-2xl font-black text-emerald-400 bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                      />
                      <span className="text-[9px] text-zinc-400">Aciertos</span>
                    </div>
                  </div>

                  {/* Fila secundaria: Rebotes, Asistencias, Faltas y Efectividades */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-mono">Rebotes</span>
                      <input
                        type="number"
                        value={extractedStats.rebounds}
                        onChange={(e) => setExtractedStats({ ...extractedStats, rebounds: Number(e.target.value) })}
                        className="font-bold text-zinc-200 bg-transparent w-full focus:outline-none"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-mono">Asistencias</span>
                      <input
                        type="number"
                        value={extractedStats.assists}
                        onChange={(e) => setExtractedStats({ ...extractedStats, assists: Number(e.target.value) })}
                        className="font-bold text-zinc-200 bg-transparent w-full focus:outline-none"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-mono">% Campo (FG%)</span>
                      <input
                        type="number"
                        value={extractedStats.fieldGoalPercentage}
                        onChange={(e) => setExtractedStats({ ...extractedStats, fieldGoalPercentage: Number(e.target.value) })}
                        className="font-bold text-zinc-200 bg-transparent w-full focus:outline-none"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-mono">Faltas Personales</span>
                      <input
                        type="number"
                        value={extractedStats.fouls}
                        onChange={(e) => setExtractedStats({ ...extractedStats, fouls: Number(e.target.value) })}
                        className="font-bold text-zinc-200 bg-transparent w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Metadatos del encuentro */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Rival / Encuentro</label>
                      <input
                        type="text"
                        value={extractedStats.opponent}
                        onChange={(e) => setExtractedStats({ ...extractedStats, opponent: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1">Fecha de Juego</label>
                      <input
                        type="date"
                        value={extractedStats.matchDate}
                        onChange={(e) => setExtractedStats({ ...extractedStats, matchDate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Notas del Coach */}
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1">Firma / Observaciones del Head Coach</label>
                    <input
                      type="text"
                      value={coachNotes}
                      onChange={(e) => setCoachNotes(e.target.value)}
                      placeholder="Ej. Excelente defensa individual en el 4to cuarto..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botón de Sincronización en 1 Clic */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetScanner}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveToRecord}
                disabled={isSaving || isProcessing || !extractedStats}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/30 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Aprobar & Sincronizar en 1 Clic
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
