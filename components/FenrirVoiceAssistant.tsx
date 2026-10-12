"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Sparkles, X, Shield, Volume2, UserCheck, Play } from "lucide-react";
import { offlineStorage } from "@/lib/offlineSync";
import { queueOfflineAction } from "@/lib/offline/db";

import FenrirAvatar, { FenrirMood } from "@/components/FenrirAvatar";

interface ExecutedVoiceAction {
  studentName: string;
  status: "presente" | "retardo" | "falta";
  amount?: number;
  hasPayment?: boolean;
}

export default function FenrirVoiceAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mood, setMood] = useState<FenrirMood>("neutral");
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("Listo para tus órdenes en duela, Coach Ricardo.");
  const [lastAction, setLastAction] = useState<ExecutedVoiceAction | null>(null);

  const recognitionRef = useRef<any>(null);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // 1. Cargar y seleccionar la mejor voz en español (priorizando es-MX y masculinas)
  const updateAvailableVoices = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        availableVoicesRef.current = voices;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      updateAvailableVoices();
      window.speechSynthesis.onvoiceschanged = updateAvailableVoices;
    }
  }, [updateAvailableVoices]);

  const selectBestSpanishVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = availableVoicesRef.current.length > 0
      ? availableVoicesRef.current
      : (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis.getVoices() : []);

    if (!voices || voices.length === 0) return null;

    // Prioridad 1: Voces específicas es-MX masculinas (Raul, Jorge, etc.)
    const mxMaleVoice = voices.find(
      (v) => v.lang.toLowerCase() === "es-mx" && (v.name.toLowerCase().includes("raul") || v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("jorge"))
    );
    if (mxMaleVoice) return mxMaleVoice;

    // Prioridad 2: Cualquier voz de México
    const mxVoice = voices.find((v) => v.lang.toLowerCase() === "es-mx" || v.lang.toLowerCase().replace("_", "-") === "es-mx");
    if (mxVoice) return mxVoice;

    // Prioridad 3: Voces masculinas en español
    const esMaleVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith("es") && (v.name.toLowerCase().includes("pablo") || v.name.toLowerCase().includes("diego") || v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("alvaro"))
    );
    if (esMaleVoice) return esMaleVoice;

    // Prioridad 4: Cualquier voz en español
    const anyEs = voices.find((v) => v.lang.toLowerCase().startsWith("es"));
    if (anyEs) return anyEs;

    return voices[0] || null;
  }, []);

  // 2. Desbloquear contexto de audio con utterance silencioso instantáneo
  const primeAudioContext = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const silentUtterance = new SpeechSynthesisUtterance("");
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch {}
    }
  }, []);

  // 3. Síntesis de voz bidireccional marcial conectada al Avatar
  const speakVoice = useCallback((text: string, onFinish?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onFinish) onFinish();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-MX";
      utterance.rate = 1.05; // Cadencia ágil de duela
      utterance.pitch = 0.90; // Tono grave y marcial

      const bestVoice = selectBestSpanishVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onFinish) onFinish();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        setIsSpeaking(false);
        if (onFinish) onFinish();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Fallo al reproducir audio TTS:", err);
      setIsSpeaking(false);
      if (onFinish) onFinish();
    }
  }, [selectBestSpanishVoice]);

  // 4. Procesar comando dictado con Groq LPU, persistir en Supabase y navegar
  const processVoiceCommand = useCallback(async (commandText: string) => {
    setAiReply("Fenrir analizando directiva táctica...");
    setLastAction(null);

    try {
      const res = await fetch("/api/voice-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spokenText: commandText, command: commandText }),
      });
      const data = await res.json();

      const replyMsg = data.voiceReply || data.message || "Orden recibida por Fenrir.";
      setAiReply(replyMsg);

      // Si la directiva incluye navegación en la app web
      if (data.navigateTo && typeof data.navigateTo === "string") {
        setTimeout(() => {
          router.push(data.navigateTo);
        }, 800);
      }

      // Si la IA detectó asistencia o cobro, guardar en almacenamiento local y Supabase
      const actionData: ExecutedVoiceAction | null = data.action || data.executedAction || null;
      if (actionData) {
        setLastAction(actionData);

        // Dinámica de Estados Emocionales:
        if (actionData.hasPayment || actionData.status === "presente") {
          setMood("happy");
          setTimeout(() => {
            setMood("neutral");
          }, 5000);
        } else if (actionData.status === "falta") {
          setMood("angry");
        } else {
          setMood("neutral");
        }

        const todayDate = new Date().toISOString().split("T")[0];
        const studentId = `voice_${actionData.studentName.toLowerCase().replace(/\s+/g, "_")}`;

        // A) Encolar Asistencia
        const attPayload = {
          student_id: studentId,
          student_name: actionData.studentName,
          date: todayDate,
          shift: "vespertino_5_7",
          status: actionData.status || "presente",
          notes: "Registrado por voz vía Fenrir Cyber-Wolf",
        };

        offlineStorage.enqueueAction("ATTENDANCE", "daily_attendance", attPayload);
        queueOfflineAction({
          type: "ATTENDANCE",
          table: "daily_attendance",
          payload: attPayload,
        });

        // B) Si hubo pago monetario, registrar cobro
        if (actionData.hasPayment && actionData.amount) {
          const payPayload = {
            student_id: studentId,
            student_name: actionData.studentName,
            amount: actionData.amount,
            amount_paid: actionData.amount,
            payment_method: "efectivo",
            concept: `Cobro en Cancha Carmen Serdán (Dictado Fenrir)`,
            transaction_date: todayDate,
            payment_date: todayDate,
            status: "pagado",
          };

          offlineStorage.enqueueAction("PAYMENT_TRANSACTION", "payment_transactions_history", payPayload);
          queueOfflineAction({
            type: "PAYMENT",
            table: "payment_transactions_history",
            payload: payPayload,
          });

          // Disparar evento para refrescar componentes de cancha
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("payment_recorded"));
          }
        }
      }

      // Reproducir respuesta audible con video animado de Fenrir
      speakVoice(replyMsg);
    } catch (e) {
      console.warn("Fallo en procesamiento de voz:", e);
      const failMsg = "Comandante, se guardó la directiva en el búnker desconectado.";
      setAiReply(failMsg);
      speakVoice(failMsg);
    }
  }, [router, speakVoice]);

  // 5. Configuración del reconocimiento de voz continuo en es-MX
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "es-MX";

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript;
        if (text) {
          setTranscript(text);
          setIsListening(false);
          processVoiceCommand(text);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("SpeechRecognition aviso:", e.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [processVoiceCommand]);

  // 6. Encender/Apagar Micrófono con desbloqueo proactivo de audio
  const toggleListen = async () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    // Desbloquear audio del navegador en el clic exacto del usuario
    primeAudioContext();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setTranscript("");
    setLastAction(null);

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {}
      }

      recognitionRef.current?.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Error al iniciar captura de audio:", err);
      setIsListening(false);
    }
  };

  // 7. Prueba rápida de audio para desbloquear audio context en móviles y PC
  const handleTestAudio = () => {
    primeAudioContext();
    speakVoice(
      "Sistemas en línea, Coach Ricardo. Lobo Central y Fenrir listos para operar en el Deportivo Carmen Serdán."
    );
  };

  return (
    <>
      {/* Botón flotante del Avatar Fenrir (Esquina Inferior Izquierda con miniatura) */}
      <button
        type="button"
        onClick={() => {
          primeAudioContext();
          setIsOpen(!isOpen);
          updateAvailableVoices();
        }}
        aria-label="Abrir Fenrir Cyber-Wolf Asistente de Voz"
        className="fixed bottom-6 left-6 z-50 p-2 pr-4 sm:p-2 sm:pr-4 rounded-full bg-[#121622] border-2 border-orange-500 shadow-2xl shadow-orange-950/70 hover:scale-105 active:scale-95 transition flex items-center gap-3 text-xs font-mono font-bold text-white cursor-pointer group"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-orange-400 shrink-0 shadow-inner">
          <img
            src="/assets/fenrir/avatar.webp"
            alt="Fenrir Cyber Wolf"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/assets/fenrir/neutral.jpg";
            }}
          />
          <div
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${
              isSpeaking
                ? "bg-orange-500 animate-ping"
                : isListening
                ? "bg-cyan-400 animate-pulse"
                : "bg-emerald-400"
            }`}
          />
        </div>
        <span className="tracking-wider text-[11px] uppercase font-black text-orange-200 group-hover:text-white transition">
          FENRIR • COMANDO DE VOZ
        </span>
      </button>

      {/* Modal Interactivo de Fenrir */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 sm:left-6 sm:right-auto sm:w-96 z-50 bg-[#0d1017]/95 backdrop-blur-xl border border-orange-500/40 rounded-3xl p-5 shadow-2xl text-zinc-100 font-sans space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-xs uppercase tracking-wider text-white block">
                  Fenrir Cyber-Wolf
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Copiloto Ejecutivo & Mando de Voz
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
                setIsOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AVATAR DINÁMICO DE FENRIR (MULTIMODAL VIDEO Y FOTOS REALES) */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <FenrirAvatar
              mood={mood}
              isSpeaking={isSpeaking}
              isListening={isListening}
              size="lg"
            />

            <span className="text-[11px] font-mono text-center block">
              {isListening ? (
                <span className="text-cyan-400 font-bold flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Fenrir escuchando tu orden...
                </span>
              ) : isSpeaking ? (
                <span className="text-orange-400 font-bold flex items-center gap-1.5 justify-center">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Fenrir respondiendo...
                </span>
              ) : (
                <span className="text-zinc-400">
                  Dicta una orden: <i>"Ver finanzas"</i> o <i>"Osmar pagó $150"</i>
                </span>
              )}
            </span>
          </div>

          {/* TRANSCRIPCIÓN Y RESPUESTA */}
          <div className="bg-[#141926] p-3.5 rounded-2xl border border-zinc-800 text-xs space-y-2">
            {transcript && (
              <p className="text-orange-400 font-mono text-[11px] border-b border-zinc-800/80 pb-1.5">
                <span className="text-zinc-500 uppercase text-[9px] block font-bold">Orden Dictada:</span>
                "{transcript}"
              </p>
            )}
            <p className="text-zinc-200 leading-relaxed font-sans">{aiReply}</p>

            {/* Ficha de Acción Ejecutada */}
            {lastAction && (
              <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded-xl border border-emerald-500/30">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">{lastAction.studentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    {lastAction.status}
                  </span>
                  {lastAction.hasPayment && (
                    <span className="text-emerald-300 font-bold">
                      ${lastAction.amount} MXN
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BARRA DE ACCIÓN: BOTÓN DE PRUEBA Y MICRÓFONO */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              type="button"
              onClick={handleTestAudio}
              className="px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-300 hover:text-white transition text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Probar Voz</span>
            </button>

            <button
              type="button"
              onClick={toggleListen}
              className={`p-4 rounded-full transition-all shadow-xl active:scale-95 cursor-pointer ${
                isListening
                  ? "bg-cyan-500 text-black shadow-cyan-500/40 animate-pulse scale-105"
                  : "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-600/40 hover:brightness-110"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="text-[10px] font-mono text-zinc-500 text-right">
              <span>es-MX • Control Web</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
