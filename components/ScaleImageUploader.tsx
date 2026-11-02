"use client";

import React, { useState, useRef } from "react";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  X, 
  Scale, 
  Flame, 
  Droplets, 
  Dumbbell, 
  ShieldAlert, 
  Activity, 
  Clock,
  RotateCcw,
  Check,
  Eye
} from "lucide-react";
import { SmartScaleReading } from "@/lib/types/smart-scale";
import { extractScaleDataFromImageAction, syncSmartScaleRecordAction } from "@/app/actions/scale-actions";
import { useSubscriptionTier } from "@/hooks/useSubscriptionTier";
import UpgradeModal from "@/components/UpgradeModal";

interface ScaleImageUploaderProps {
  studentId?: string;
  athleteName?: string;
  onUploadSuccess?: (reading: SmartScaleReading) => void;
  className?: string;
}

export default function ScaleImageUploader({
  studentId = "demo-student",
  athleteName = "Atleta Lobo",
  onUploadSuccess,
  className = ""
}: ScaleImageUploaderProps) {
  const { isPro } = useSubscriptionTier();
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Modal y carga
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rawOcr, setRawOcr] = useState<string>("");
  const [showRawText, setShowRawText] = useState<boolean>(false);

  // Valores extraídos (7 métricas de bioimpedancia)
  const [extractedData, setExtractedData] = useState<{
    weightKg: number;
    fatPercentage: number;
    muscleMassKg: number;
    waterPercentage: number;
    visceralFat: number;
    bmi: number;
    metabolicAge: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Procesar archivo seleccionado
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Por favor selecciona una imagen válida (JPEG o PNG).");
      return;
    }

    setFileName(file.name);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await processImageWithVision(base64);
    };
    reader.readAsDataURL(file);
  };

  // Enviar a Visión Artificial
  const processImageWithVision = async (base64Image: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setExtractedData(null);

    try {
      const res = await extractScaleDataFromImageAction(base64Image);

      if (res.success && res.reading) {
        setExtractedData({
          weightKg: res.reading.weightKg,
          fatPercentage: res.reading.fatPercentage,
          muscleMassKg: res.reading.muscleMassKg,
          waterPercentage: res.reading.waterPercentage,
          visceralFat: res.reading.visceralFat ?? 4,
          bmi: res.reading.bmi ?? 21.0,
          metabolicAge: res.reading.metabolicAge
        });
        setRawOcr(res.rawText || "");
      } else {
        setErrorMsg(res.error || "No se detectaron métricas legibles en la captura. Intenta con una imagen más clara.");
      }
    } catch (err: any) {
      console.error("Error en processImageWithVision:", err);
      setErrorMsg("Falla de conexión al procesar la captura con Visión Artificial.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Guardar datos en Supabase y actualizar perfil
  const handleSaveToProfile = async () => {
    if (!extractedData) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const readingPayload: SmartScaleReading = {
      weightKg: Number(extractedData.weightKg),
      fatPercentage: Number(extractedData.fatPercentage),
      muscleMassKg: Number(extractedData.muscleMassKg),
      waterPercentage: Number(extractedData.waterPercentage),
      visceralFat: Number(extractedData.visceralFat),
      bmi: Number(extractedData.bmi),
      metabolicAge: Number(extractedData.metabolicAge),
      source: "vision_ocr",
      rawOcrText: rawOcr
    };

    try {
      const syncRes = await syncSmartScaleRecordAction(studentId, readingPayload);

      if (syncRes.success) {
        setSuccessMsg("¡Composición corporal guardada con éxito en tu perfil y ficha de duela!");
        
        // Notificar al componente padre para actualizar inmediatamente las tarjetas
        if (onUploadSuccess) {
          onUploadSuccess(readingPayload);
        }

        setTimeout(() => {
          setIsOpen(false);
          setImagePreview(null);
          setExtractedData(null);
          setSuccessMsg(null);
        }, 2200);
      } else {
        setErrorMsg(syncRes.error || "No se pudo sincronizar con la base de datos.");
      }
    } catch {
      setErrorMsg("Error de red al guardar la ficha biométrica.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setExtractedData(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName("");
    setRawOcr("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleOpenModal = () => {
    if (isPro) {
      setIsOpen(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      {/* Botón Principal Solicitado: 📸 Subir Captura de Báscula */}
      <button
        onClick={handleOpenModal}
        className={`px-4 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-900/60 via-purple-900/40 to-orange-950/60 border border-fuchsia-500/50 hover:border-fuchsia-400 text-fuchsia-200 hover:text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-950/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer ${className}`}
        title="Subir captura de pantalla de báscula OKOK o bioimpedancia"
      >
        <Camera className="w-4 h-4 text-fuchsia-400" />
        <span>📸 Subir Captura de Báscula</span>
        {!isPro && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">
            PRO $99
          </span>
        )}
      </button>

      {/* Paywall Ventana de Venta si es Modo Gratuito */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureTitle="Visión IA de Báscula y Bioimpedancia"
          featureDescription="La extracción automática de peso, grasa visceral, masa muscular, BMI y edad metabólica mediante visión multimodal requiere una membresía Lobo Pro activa de 30 días ($99 MXN)."
          studentName={athleteName}
          onActivated={() => {
            setShowUpgradeModal(false);
            setIsOpen(true);
          }}
        />
      )}

      {/* Modal Interactivo de Visión Artificial */}
      {isOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0b0e17] border border-fuchsia-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-white space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-amber-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 text-white font-black">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-400 font-bold block">
                      Visión Artificial Multimodal
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 uppercase font-black">
                      OKOK & Bioimpedancia
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 mt-0.5">
                    <span>Lectura de Báscula por Imagen</span>
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtítulo / Instrucción */}
            <p className="text-xs text-zinc-300 leading-relaxed">
              Sube una captura de pantalla de tu app de bioimpedancia (ej. <strong>OKOK International</strong>, Renpho, Xiaomi o InBody) o toma una foto directa a la pantalla. El motor de Visión OCR extraerá tu composición corporal en segundos.
            </p>

            {/* Inputs Ocultos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* ZONA DE CARGA / DROPZONE */}
            {!imagePreview && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Opción 1: Galería / Archivo */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl bg-[#10141f] border-2 border-dashed border-zinc-700 hover:border-fuchsia-500/80 hover:bg-fuchsia-950/20 text-center transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-mono uppercase text-white block">
                      Seleccionar Imagen
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 mt-0.5 block">
                      PNG o JPEG (Captura OKOK)
                    </span>
                  </div>
                </button>

                {/* Opción 2: Cámara en Vivo */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-6 rounded-2xl bg-[#10141f] border-2 border-dashed border-zinc-700 hover:border-amber-500/80 hover:bg-amber-950/20 text-center transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-mono uppercase text-white block">
                      Tomar Foto con Cámara
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 mt-0.5 block">
                      Foto a la pantalla de báscula
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* ESTADO DE PROCESAMIENTO / ESCANEO */}
            {isProcessing && (
              <div className="p-6 rounded-2xl bg-[#0f1422] border border-fuchsia-500/40 text-center space-y-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 mx-auto animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin text-fuchsia-400" />
                </div>
                <div>
                  <span className="text-xs font-mono font-black text-fuchsia-300 uppercase tracking-wider block">
                    Escaneando Métricas con Visión Artificial...
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                    Extrayendo Peso, Grasa, Músculo, Agua, Visceral, BMI y Edad Metabólica...
                  </span>
                </div>
                {/* Barra láser de escaneo animada */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-fuchsia-500 via-amber-400 to-orange-500 w-1/2 animate-[pulse_1.2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {/* VISTA PREVIA Y RESULTADOS EXTRAÍDOS */}
            {imagePreview && !isProcessing && (
              <div className="space-y-4">
                
                {/* Miniatura y Botón de Reintentar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#10141f] border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img 
                      src={imagePreview} 
                      alt="Captura báscula" 
                      className="w-14 h-14 object-cover rounded-xl border border-zinc-700 shadow"
                    />
                    <div>
                      <span className="text-xs font-mono text-white font-bold block truncate max-w-[200px] sm:max-w-xs">
                        {fileName || "Captura_Báscula.png"}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Escaneo completado</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Otra Imagen</span>
                    </button>
                  </div>
                </div>

                {/* 7 PARÁMETROS BIOMÉTRICOS EXTRAÍDOS */}
                {extractedData && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-orange-400" />
                        Valores Extraídos por Visión (Editables)
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Verifica o ajusta si es necesario
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      
                      {/* 1. Peso */}
                      <div className="p-3 rounded-2xl bg-[#0f1422] border border-orange-500/40 space-y-1">
                        <span className="text-[10px] font-mono text-orange-300 font-bold uppercase flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-orange-400" /> Peso
                        </span>
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={extractedData.weightKg}
                            onChange={(e) => setExtractedData({ ...extractedData, weightKg: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent font-black font-mono text-lg text-white focus:outline-none focus:text-orange-400"
                          />
                          <span className="text-[10px] font-mono text-zinc-400">kg</span>
                        </div>
                      </div>

                      {/* 2. % Grasa */}
                      <div className="p-3 rounded-2xl bg-[#0f1422] border border-amber-500/40 space-y-1">
                        <span className="text-[10px] font-mono text-amber-300 font-bold uppercase flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400" /> % Grasa
                        </span>
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={extractedData.fatPercentage}
                            onChange={(e) => setExtractedData({ ...extractedData, fatPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent font-black font-mono text-lg text-white focus:outline-none focus:text-amber-400"
                          />
                          <span className="text-[10px] font-mono text-zinc-400">%</span>
                        </div>
                      </div>

                      {/* 3. Masa Muscular */}
                      <div className="p-3 rounded-2xl bg-[#0f1422] border border-emerald-500/40 space-y-1">
                        <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase flex items-center gap-1">
                          <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Músculo
                        </span>
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={extractedData.muscleMassKg}
                            onChange={(e) => setExtractedData({ ...extractedData, muscleMassKg: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent font-black font-mono text-lg text-white focus:outline-none focus:text-emerald-400"
                          />
                          <span className="text-[10px] font-mono text-zinc-400">kg</span>
                        </div>
                      </div>

                      {/* 4. Agua Corporal */}
                      <div className="p-3 rounded-2xl bg-[#0f1422] border border-cyan-500/40 space-y-1">
                        <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Agua
                        </span>
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={extractedData.waterPercentage}
                            onChange={(e) => setExtractedData({ ...extractedData, waterPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent font-black font-mono text-lg text-white focus:outline-none focus:text-cyan-400"
                          />
                          <span className="text-[10px] font-mono text-zinc-400">%</span>
                        </div>
                      </div>

                      {/* 5. Grasa Visceral */}
                      <div className="p-3 rounded-2xl bg-[#0f1422] border border-purple-500/40 space-y-1">
                        <span className="text-[10px] font-mono text-purple-300 font-bold uppercase flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Visceral
                        </span>
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            step="1"
                            value={extractedData.visceralFat}
                            onChange={(e) => setExtractedData({ ...extractedData, visceralFat: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-transparent font-black font-mono text-lg text-white focus:outline-none focus:text-purple-400"
                          />
                          <span className="text-[10px] font-mono text-zinc-400">nivel</span>
                        </div>
                      </div>

                      {/* 6. BMI / IMC */}
                      <div className="p-3 rounded-2xl bg-[#0f1422] border border-indigo-500/40 space-y-1">
                        <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-indigo-400" /> BMI / IMC
                        </span>
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={extractedData.bmi}
                            onChange={(e) => setExtractedData({ ...extractedData, bmi: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-transparent font-black font-mono text-lg text-white focus:outline-none focus:text-indigo-400"
                          />
                          <span className="text-[10px] font-mono text-zinc-400">índice</span>
                        </div>
                      </div>

                      {/* 7. Edad Metabólica */}
                      <div className="p-3 rounded-2xl bg-[#0f1422] border border-fuchsia-500/40 space-y-1 col-span-2 sm:col-span-2">
                        <span className="text-[10px] font-mono text-fuchsia-300 font-bold uppercase flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-fuchsia-400" /> Edad Metabólica
                        </span>
                        <div className="flex items-baseline gap-1">
                          <input
                            type="number"
                            step="1"
                            value={extractedData.metabolicAge}
                            onChange={(e) => setExtractedData({ ...extractedData, metabolicAge: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-transparent font-black font-mono text-lg text-white focus:outline-none focus:text-fuchsia-400"
                          />
                          <span className="text-[10px] font-mono text-zinc-400">años</span>
                        </div>
                      </div>

                    </div>

                    {/* Botón de Confirmación y Guardado */}
                    <button
                      onClick={handleSaveToProfile}
                      disabled={isSaving}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando en Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Guardar en Perfil y Ficha Técnica</span>
                        </>
                      )}
                    </button>

                    {/* Ver OCR crudo (opcional para depuración) */}
                    {rawOcr && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowRawText(!showRawText)}
                          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{showRawText ? "Ocultar texto OCR extraído" : "Ver texto OCR crudo"}</span>
                        </button>
                        {showRawText && (
                          <pre className="mt-2 p-3 rounded-xl bg-black/60 border border-zinc-800 text-[10px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-36">
                            {rawOcr}
                          </pre>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* ALERTA DE ÉXITO */}
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ALERTA DE ERROR */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
