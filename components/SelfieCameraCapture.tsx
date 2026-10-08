"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check, X, AlertCircle, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SelfieCameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured?: (dataUrl: string) => void;
  studentId?: string;
  studentName?: string;
}

export default function SelfieCameraCapture({
  isOpen,
  onClose,
  onPhotoCaptured,
  studentId,
  studentName = "Atleta",
}: SelfieCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Iniciar la cámara cuando el modal se abre
  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsInitializing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta captura directa de cámara. Utiliza el botón de captura móvil abajo.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Acceso a cámara no disponible:", err);
      let msg = "No se pudo acceder a la cámara frontal. Asegúrate de dar permisos de cámara.";
      if (err.name === "NotAllowedError") {
        msg = "Permiso de cámara denegado. Permite el acceso a tu cámara o toma la selfie desde tu teléfono.";
      } else if (err.name === "NotFoundError") {
        msg = "No se detectó cámara en tu dispositivo. Puedes subir tu foto oficial con el botón inferior.";
      }
      setCameraError(msg);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capturar fotograma actual del video
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    const canvas = canvasRef.current || document.createElement("canvas");
    // Foto cuadrada para credencial oficial
    const size = Math.min(width, height);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Centrar y recortar cuadrado
    const startX = (width - size) / 2;
    const startY = (height - size) / 2;

    // Si es cámara frontal, aplicar efecto espejo natural
    if (facingMode === "user") {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Manejo de archivo seleccionado o cámara nativa de teléfono
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const saveOfficialSelfie = async () => {
    if (!capturedPhoto) return;
    setIsSaving(true);

    try {
      // 1. Guardar en Supabase profiles si hay studentId
      if (studentId) {
        try {
          await supabase
            .from("profiles")
            .update({ avatar_url: capturedPhoto })
            .eq("id", studentId);
        } catch (dbErr) {
          console.warn("Guardado en Supabase falló, usando local:", dbErr);
        }

        // Cache local seguro
        if (typeof window !== "undefined") {
          localStorage.setItem(`ww_student_selfie_${studentId}`, capturedPhoto);
        }
      }

      // 2. Disparar evento para actualizar interfaces en tiempo real
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("profile_avatar_updated", {
            detail: { avatar_url: capturedPhoto, studentId },
          })
        );
      }

      if (onPhotoCaptured) {
        onPhotoCaptured(capturedPhoto);
      }

      stopCamera();
      onClose();
    } catch (e: any) {
      alert("Error al guardar fotografía: " + (e.message || "Intenta nuevamente"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d1017] border border-orange-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#121622]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                Selfie Oficial del Atleta
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {studentName} • Deportivo Carmen Serdán
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Visor de Cámara */}
        <div className="p-5 flex flex-col items-center">
          {/* Instrucción Estricta */}
          <div className="mb-3 text-center">
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Foto Real Obligatoria
            </span>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Debe ser una <strong>fotografía real y nítida de tu rostro</strong> (sin gorras ni lentes oscuros) para validar tu credencial y ficha en cancha.
            </p>
          </div>

          {/* Marco de Captura */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden bg-black border-2 border-dashed border-orange-500/50 shadow-inner flex items-center justify-center">
            {capturedPhoto ? (
              // Vista Previa de la Foto Tomada
              <div className="relative w-full h-full">
                <img
                  src={capturedPhoto}
                  alt="Selfie Oficial Capturada"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[10px] font-black font-mono px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                  <Check className="w-3 h-3" /> Foto Capturada
                </div>
              </div>
            ) : cameraError ? (
              // Mensaje de Fallback si la cámara no inicia
              <div className="p-4 text-center text-zinc-400 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs text-zinc-300">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <Upload className="w-3.5 h-3.5" /> Abrir Cámara del Teléfono
                </button>
              </div>
            ) : (
              // Flujo de Video en Vivo
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
                />

                {/* Guía Facial Ovalada */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 rounded-[50%] border-2 border-orange-400/70 shadow-[0_0_20px_rgba(234,88,12,0.4)] flex items-center justify-center">
                    <span className="text-[10px] font-mono text-orange-200/90 bg-black/60 px-2 py-0.5 rounded-full font-bold">
                      Ubica tu Rostro Aquí
                    </span>
                  </div>
                </div>

                {isInitializing && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-xs font-mono text-zinc-400 gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                    Iniciando lente...
                  </div>
                )}
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Input oculto para captura nativa móvil */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Controles de Acción */}
          <div className="w-full mt-5 space-y-2.5">
            {!capturedPhoto ? (
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={Boolean(cameraError || isInitializing)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  Tomar Selfie Oficial
                </button>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  title="Girar Cámara"
                  className="px-3.5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl border border-zinc-700 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tomar desde teléfono"
                  className="px-3.5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-orange-400 rounded-2xl border border-zinc-700 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={retakePhoto}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-2xl border border-zinc-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Repetir Foto
                </button>

                <button
                  type="button"
                  onClick={saveOfficialSelfie}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? "Guardando..." : "Confirmar Foto Oficial"}
                </button>
              </div>
            )}

            <p className="text-[10px] text-zinc-500 font-mono text-center">
              Tu foto será asignada inmediatamente a tu Cyber Wolf Card oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
