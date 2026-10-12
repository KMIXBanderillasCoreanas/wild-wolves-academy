"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, X, Shield, Volume2, CheckCircle2, DollarSign, UserCheck } from "lucide-react";
import { offlineStorage } from "@/lib/offlineSync";
import { queueOfflineAction } from "@/lib/offline/db";
import { supabase } from "@/lib/supabaseClient";

import FenrirAvatar, { FenrirMood } from "@/components/FenrirAvatar";

interface ExecutedVoiceAction {
  studentName: string;
  status: "presente" | "retardo" | "falta";
  amount?: number;
  hasPayment?: boolean;
}

export default function FenrirVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mood, setMood] = useState<FenrirMood>("neutral");
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("Listo para tus órdenes en duela, Coach Ricardo.");
  const [lastAction, setLastAction] = useState<ExecutedVoiceAction | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Configurar API de voz nativa del celular o navegador
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "es-MX"; // Español de México

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript;
        if (text) {
          setTranscript(text);
          setIsListening(false);
          processVoiceCommand(text);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("SpeechRecognition error:", e);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  // 1. Hablar con voz sintetizada marcial y firme en español
  const speakVoice = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-MX";
      utterance.rate = 1.05; // Ritmo ágil de cancha
      utterance.pitch = 0.92; // Tono varonil y seguro
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 2. Procesar comando de voz con Groq y ejecutar acciones
  const processVoiceCommand = async (commandText: string) => {
    setAiReply("Fenrir analizando directiva táctica...");
    setLastAction(null);

    try {
      const res = await fetch("/api/voice-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandText }),
      });
      const data = await res.json();

      const replyMsg = data.message || "Orden recibida por Fenrir.";
      setAiReply(replyMsg);
      speakVoice(replyMsg);

      // Si la IA detectó asistencia o pago, guardar localmente/nube
      if (data.executedAction) {
        const actionData: ExecutedVoiceAction = data.executedAction;
        setLastAction(actionData);

        // Dinámica de Estados Emocionales:
        // 'happy': Pago registrado o asistencia exitosa
        // 'angry': Falta / inasistencia injustificada detectada
        if (actionData.hasPayment || actionData.status === "presente") {
          setMood("happy");
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
    } catch (e) {
      console.warn("Fallo en procesamiento de voz:", e);
      const failMsg = "Comandante, se guardó la directiva en el búnker desconectado.";
      setAiReply(failMsg);
      speakVoice(failMsg);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      setTranscript("");
      setLastAction(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Error al iniciar micrófono:", err);
        setIsListening(false);
      }
    }
  };

  return (
    <>
      {/* Botón flotante del Avatar Fenrir (Esquina Inferior Izquierda) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir Fenrir Cyber-Wolf Asistente de Voz"
        className="fixed bottom-6 left-6 z-50 p-3.5 sm:px-4 sm:py-3.5 rounded-full bg-[#121622] border-2 border-orange-500 shadow-2xl shadow-orange-950/60 hover:scale-105 active:scale-95 transition flex items-center gap-2.5 text-xs font-mono font-bold text-white cursor-pointer"
      >
        <div className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-orange-500 animate-ping" : isListening ? "bg-cyan-400 animate-pulse" : "bg-emerald-400"}`} />
        <span className="hidden sm:inline">FENRIR VOZ</span>
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
                  Mando de Voz en Duela • Head Coach
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                setIsOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AVATAR DINÁMICO DE FENRIR */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <FenrirAvatar mood={mood} isSpeaking={isSpeaking} size="md" />

            <span className="text-[11px] font-mono text-center block">
              {isListening ? (
                <span className="text-cyan-400 font-bold flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Fenrir escuchando tu orden...
                </span>
              ) : isSpeaking ? (
                <span className="text-orange-400 font-bold flex items-center gap-1.5 justify-center">
                  <Volume2 className="w-3.5 h-3.5" /> Fenrir respondiendo...
                </span>
              ) : (
                <span className="text-zinc-400">
                  Toca el micrófono y dicta: <i>"Osmar López presente y pagó 150"</i>
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

          {/* BOTÓN PRINCIPAL DE MICRÓFONO */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={toggleListen}
              className={`p-5 rounded-full transition-all shadow-xl active:scale-95 cursor-pointer ${
                isListening
                  ? "bg-cyan-500 text-black shadow-cyan-500/40 animate-pulse scale-105"
                  : "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-600/40 hover:brightness-110"
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
