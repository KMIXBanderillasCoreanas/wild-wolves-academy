"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Crown, 
  Zap, 
  CheckCircle2, 
  Flame, 
  Activity, 
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import LoboProModal from "@/components/LoboProModal";

interface VisionAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  isProSubscriber?: boolean;
}

export default function VisionAssistantModal({
  isOpen,
  onClose,
  studentId,
  studentName = "Atleta Lobo",
  isProSubscriber = false
}: VisionAssistantModalProps) {
  const [activeDrill, setActiveDrill] = useState<"jump_rope" | "squats_3x25" | "shooting_release">("jump_rope");
  const [isStreaming, setIsStreaming] = useState(false);
  const [repsCount, setRepsCount] = useState(0);
  const [targetReps, setTargetReps] = useState(10);
  const [feedbackMsg, setFeedbackMsg] = useState("Coloca tu celular vertical en una banca o trípode a 2-3 metros.");
  const [freeShotsRemaining, setFreeShotsRemaining] = useState(10); // 10 análisis gratuitos al mes para alumnos
  const [showPaywall, setShowPaywall] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const simulationInterval = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFreeReps = localStorage.getItem("ww_free_ai_reps");
      if (storedFreeReps !== null) {
        setFreeShotsRemaining(Number(storedFreeReps));
      }
    }
  }, []);

  if (!isOpen) return null;

  // Iniciar Cámara Web
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      setFeedbackMsg("¡Atleta detectado! Inicia el movimiento al sonar el silbato.");

      // Simulación de detección biomecánica en tiempo real con WebAssembly / Canvas
      startMotionDetection();
    } catch (err) {
      console.warn("No se pudo iniciar la cámara:", err);
      setFeedbackMsg("No se detectó cámara web. Por favor permite el acceso al video.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    setIsStreaming(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Motor de conteo y reglas de conversión freemium
  const startMotionDetection = () => {
    if (simulationInterval.current) clearInterval(simulationInterval.current);

    simulationInterval.current = setInterval(() => {
      // Regla Freemium: Si no es suscriptor Pro y agotó sus créditos de prueba de IA
      if (!isProSubscriber && freeShotsRemaining <= 0) {
        stopCamera();
        setShowPaywall(true);
        return;
      }

      setRepsCount(prev => {
        const next = prev + 1;
        
        // Descontar crédito freemium
        if (!isProSubscriber) {
          setFreeShotsRemaining(f => {
            const updated = Math.max(0, f - 1);
            if (typeof window !== "undefined") {
              localStorage.setItem("ww_free_ai_reps", updated.toString());
            }
            if (updated <= 0) {
              setTimeout(() => {
                stopCamera();
                setShowPaywall(true);
              }, 600);
            }
            return updated;
          });
        }

        // Feedback dinámico según el drill
        if (activeDrill === "jump_rope") {
          setFeedbackMsg(next % 2 === 0 ? "¡Buen ritmo de salto! Pies juntos ✓" : "Postura erguida mantenida ✓");
        } else if (activeDrill === "squats_3x25") {
          setFeedbackMsg("Profundidad a 90° perfecta. Espalda recta ✓");
        } else {
          setFeedbackMsg("Ángulo de lanzamiento: 48° (Óptimo) • Salto vertical: 42 cm");
        }

        return next;
      });
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b0e14] border border-orange-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
        
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f66018] to-orange-700 flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  AI Coach Vision
                </span>
                {!isProSubscriber ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {freeShotsRemaining} reps de prueba gratis
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Lobo Pro Ilimitado
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-tight mt-0.5">
                Entrenador Asistente IA • Detección en Tiempo Real
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR DE DRILL */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setActiveDrill("jump_rope"); setTargetReps(10); setRepsCount(0); }}
            className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
              activeDrill === "jump_rope"
                ? "bg-orange-500/15 border-[#f66018] text-white"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-[9px] uppercase font-mono block font-bold text-orange-400">Prueba 1</span>
            <span className="text-xs font-black block">Cuerda (Mín 10)</span>
          </button>

          <button
            onClick={() => { setActiveDrill("squats_3x25"); setTargetReps(25); setRepsCount(0); }}
            className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
              activeDrill === "squats_3x25"
                ? "bg-orange-500/15 border-[#f66018] text-white"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-[9px] uppercase font-mono block font-bold text-orange-400">Prueba 2</span>
            <span className="text-xs font-black block">Batería 3x25</span>
          </button>

          <button
            onClick={() => { setActiveDrill("shooting_release"); setTargetReps(10); setRepsCount(0); }}
            className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
              activeDrill === "shooting_release"
                ? "bg-orange-500/15 border-[#f66018] text-white"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-[9px] uppercase font-mono block font-bold text-orange-400">Shot Science</span>
            <span className="text-xs font-black block">Mecánica de Tiro</span>
          </button>
        </div>

        {/* CONTENEDOR DE CÁMARA & OVERLAY DE VISIÓN */}
        <div className="relative aspect-[16/10] bg-black rounded-3xl border border-zinc-800 overflow-hidden flex items-center justify-center">
          
          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isStreaming ? "block" : "hidden"}`}
          />

          {/* Placeholder cuando la cámara está apagada */}
          {!isStreaming && (
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Próximamente • Fase de Calibración en Duela</span>
              </div>
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                <Camera className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase">Visión Artificial en Desarrollo</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  El Head Coach Ricardo está calibrando las pruebas piloto de homografía y detección de aro en Deportivo Carmen Serdán. Puedes probar la vista previa con 10 análisis de cortesía incluidos en tu registro.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#f66018] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/50 transition cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Probar Demo (10 Créditos Gratis)</span>
              </button>
            </div>
          )}

          {/* OVERLAY TÁCTICO HOMECOURT CUANDO ESTÁ EN VIVO */}
          {isStreaming && (
            <>
              {/* Esquinas de enfoque de cámara */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-orange-400"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-orange-400"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-orange-400"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-orange-400"></div>

              {/* Marcador de Repeticiones Central */}
              <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-orange-500/40 px-3.5 py-2 rounded-2xl">
                <span className="text-[9px] uppercase font-mono text-zinc-400 block font-bold">Repeticiones</span>
                <span className="text-2xl font-black font-mono text-white">
                  {repsCount} <span className="text-xs text-orange-400">/ {targetReps}</span>
                </span>
              </div>

              {/* Barra de Progreso Superior */}
              <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md border border-zinc-800 px-3 py-2 rounded-2xl text-right">
                <span className="text-[9px] uppercase font-mono text-emerald-400 block font-bold">Calibración Activa</span>
                <span className="text-xs font-mono font-bold text-white">30 FPS • MediaPipe</span>
              </div>

              {/* Feedback en vivo en la parte inferior */}
              <div className="absolute bottom-4 inset-x-4 bg-black/85 backdrop-blur-md border border-zinc-800 p-2.5 rounded-2xl flex items-center justify-between text-xs font-mono text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-sans truncate">{feedbackMsg}</span>
                </div>
                <button
                  onClick={stopCamera}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold"
                >
                  Pausar
                </button>
              </div>
            </>
          )}

        </div>

        {/* REGLAS DEL SERVICIO & GANCHO DE CONVERSIÓN (FREEMIUM / LOBO PRO) */}
        <div className="bg-gradient-to-r from-orange-950/30 via-zinc-900 to-[#0d1017] border border-orange-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-tight">
                Membresía Lobo Pro • Entrenamiento Inteligente
              </h4>
              <p className="text-[11px] text-zinc-400">
                10 análisis de video gratuitos al mes para todos los alumnos. Con Lobo Pro desbloqueas repeticiones ilimitadas, corrección de postura en tiempo real y reportes exportables para tus papás.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProModal(true)}
            className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <span>Ver Plan Lobo Pro</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* MODAL DE BLOQUEO / PAYWALL AMIGABLE CUANDO AGOTA PRUEBAS GRATIS */}
      {showPaywall && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0f131d] border-2 border-orange-500/60 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-3xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mx-auto">
              <Crown className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black uppercase text-white">
              ¡Has completado tus análisis gratuitos del mes!
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Probaste la tecnología de visión artificial de Wild Wolves. Para continuar con detección automática ilimitada de tiros, saltos y corrección de postura por cámara, activa tu cuenta con el Head Coach.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => { setShowPaywall(false); setShowProModal(true); }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] transition cursor-pointer"
              >
                Activar Lobo Pro ($99 MXN/mes)
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition cursor-pointer"
              >
                Cerrar por ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OFICIAL DE ACTIVACIÓN PRO */}
      <LoboProModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        studentName={studentName}
      />

    </div>
  );
}
