"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, X, Minimize2, Maximize2, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import FenrirAvatar, { FenrirMood } from "./FenrirAvatar";

export default function FenrirVoiceAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHandsfreeActive, setIsHandsfreeActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("Listo para tus órdenes en duela, Coach Ricardo.");
  const [mood, setMood] = useState<FenrirMood>("neutral");

  const recognitionRef = useRef<any>(null);
  const isHandsfreeRef = useRef(false);

  useEffect(() => {
    isHandsfreeRef.current = isHandsfreeActive;
  }, [isHandsfreeActive]);

  // Audio Priming nativo
  const primeAudioContext = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
        const wakeLock = new SpeechSynthesisUtterance("");
        wakeLock.volume = 0;
        window.speechSynthesis.speak(wakeLock);
      } catch {}
    }
  }, []);

  // Función robusta de habla con limpieza de Markdown
  const speakAudio = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const cleanText = text.replace(/[*#_`~>\[\]\(\)]/g, "").replace(/\s+/g, " ").trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-MX";
      utterance.rate = 1.05;
      utterance.pitch = 0.90;

      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find((v) => v.lang.toLowerCase().includes("es-mx") || v.lang.toLowerCase().startsWith("es"));
      if (bestVoice) utterance.voice = bestVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  // Procesar comando de voz
  const handleCommand = useCallback(async (commandText: string) => {
    setAiReply("Fenrir ejecutando directiva...");

    try {
      const res = await fetch("/api/voice-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spokenText: commandText, command: commandText }),
      });
      const data = await res.json();

      const replyText = data.voiceReply || data.message || "Orden recibida.";
      setAiReply(replyText);

      // Estado emocional reactivo
      if (data.action?.hasPayment || data.action?.status === "presente") {
        setMood("happy");
        setTimeout(() => setMood("neutral"), 5000);
      } else if (data.action?.status === "falta") {
        setMood("angry");
      } else {
        setMood("neutral");
      }

      // Hablar de inmediato por altavoz
      speakAudio(replyText);

      // Control y navegación web si la IA devuelve ruta
      if (data.navigateTo) {
        // En navegación, pasar a modo compacto Picture-in-Picture para no cerrar el asistente
        setIsCompact(true);
        setTimeout(() => {
          router.push(data.navigateTo);
        }, 800);
      }
    } catch {
      const errorMsg = "Coach Ricardo, enlace de voz temporalmente interrumpido.";
      setAiReply(errorMsg);
      speakAudio(errorMsg);
    }
  }, [router, speakAudio]);

  // Configuración de reconocimiento de voz continuo (handsfree)
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true; // Escucha continua
      rec.interimResults = false;
      rec.lang = "es-MX";

      rec.onresult = (e: any) => {
        const lastResultIndex = e.results.length - 1;
        const text = e.results[lastResultIndex][0]?.transcript;
        if (text && text.trim()) {
          setTranscript(text);
          handleCommand(text);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("SpeechRecognition aviso:", e.error);
        }
      };

      rec.onend = () => {
        // Si el modo manos libres está activo, reiniciar automáticamente
        if (isHandsfreeRef.current) {
          try {
            rec.start();
            setIsListening(true);
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
    }
  }, [handleCommand]);

  const toggleListening = () => {
    primeAudioContext();

    if (isListening) {
      setIsHandsfreeActive(false);
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      setTranscript("");
      setIsHandsfreeActive(true);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Error al activar micrófono:", err);
        setIsListening(false);
      }
    }
  };

  return (
    <>
      {/* 1. NODO BOTÓN FLOTANTE (Visible cuando no está abierto el panel) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            primeAudioContext();
            setIsOpen(true);
            setIsCompact(false);
          }}
          aria-label="Abrir Fenrir Asistente de Voz"
          className="fixed bottom-6 left-6 z-[99999] px-4 py-2.5 rounded-full bg-[#0a0d14] border-2 border-orange-500 shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-3 text-white font-mono text-xs font-bold cursor-pointer"
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-orange-400">
            <img src="/assets/fenrir/avatar.webp" alt="Fenrir" className="w-full h-full object-cover" />
            <div
              className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black ${
                isSpeaking ? "bg-orange-500 animate-ping" : isListening ? "bg-cyan-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
          </div>
          <span>FENRIR • VOZ</span>
        </button>
      )}

      {/* 2. MODO COMPACTO PICTURE-IN-PICTURE (HUD Flotante de Cancha) */}
      {isOpen && isCompact && (
        <div className="fixed bottom-6 left-6 z-[99999] flex items-center gap-2.5 bg-[#0c0f17]/95 border-2 border-orange-500/80 backdrop-blur-xl p-2 pr-3.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-orange-400 shrink-0">
            <img src="/assets/fenrir/avatar.webp" alt="Fenrir" className="w-full h-full object-cover" />
            <div
              className={`absolute inset-0 rounded-full border-2 ${
                isSpeaking
                  ? "border-orange-500 animate-ping"
                  : isListening
                  ? "border-cyan-400 animate-pulse"
                  : "border-transparent"
              }`}
            />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-tight flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-cyan-400 animate-ping" : "bg-emerald-400"}`} />
              {isListening ? "Escuchando..." : isSpeaking ? "Hablando..." : "Fenrir Activo"}
            </span>
            <span className="text-[9px] font-sans text-zinc-300 max-w-[130px] truncate">
              {transcript || aiReply}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition cursor-pointer ${
              isListening ? "bg-cyan-500 text-black shadow-cyan-500/50 animate-pulse" : "bg-zinc-800 text-orange-400 hover:text-white"
            }`}
            title={isListening ? "Pausar Micrófono" : "Activar Micrófono"}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsCompact(false)}
            className="p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Expandir Panel"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
              setIsListening(false);
              setIsHandsfreeActive(false);
              setIsOpen(false);
            }}
            className="p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Cerrar Copiloto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. MODO EXPANDIDO (Panel Táctico Completo) */}
      {isOpen && !isCompact && (
        <div className="fixed inset-x-4 bottom-24 sm:left-6 sm:w-96 z-[99999] bg-[#0c0f17]/95 backdrop-blur-2xl border border-orange-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              Fenrir Copiloto • Global HQ
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCompact(true)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Minimizar a HUD de Cancha"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                  setIsListening(false);
                  setIsHandsfreeActive(false);
                  setIsOpen(false);
                }}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Avatar con Video y Reacción */}
          <div className="py-2">
            <FenrirAvatar mood={mood} isSpeaking={isSpeaking} isListening={isListening} size="md" />
          </div>

          {/* Transcripción y Respuesta */}
          <div className="bg-[#141824] p-3 rounded-2xl border border-zinc-800 text-xs space-y-1.5 font-sans">
            {transcript && <p className="text-orange-400 font-mono text-[11px]">Tú: "{transcript}"</p>}
            <p className="text-zinc-200">{aiReply}</p>
          </div>

          {/* Controles de Acción */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => speakAudio("Sistemas de Fenrir en línea. Copiloto activo en toda la academia, Coach Ricardo.")}
              className="p-2.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
              title="Probar Altavoz"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleListening}
              className={`p-4 rounded-full transition-all shadow-xl active:scale-95 cursor-pointer ${
                isListening
                  ? "bg-cyan-500 text-black shadow-cyan-500/50 animate-pulse"
                  : "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-600/40"
              }`}
              title={isListening ? "Desactivar Escucha Continua" : "Activar Escucha Continua"}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
