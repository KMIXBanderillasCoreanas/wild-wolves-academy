"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import FenrirAvatar, { FenrirMood } from "./FenrirAvatar";

export default function FenrirVoiceAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("Listo para tus órdenes en duela, Coach Ricardo.");
  const [mood, setMood] = useState<FenrirMood>("neutral");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "es-MX";

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (text) {
          setTranscript(text);
          setIsListening(false);
          handleCommand(text);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const speakAudio = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // Limpieza de markdown para que el lector no pronuncie asteriscos o signos
    const cleanText = text.replace(/[*#_`~]/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "es-MX";
    utterance.rate = 1.05;
    utterance.pitch = 0.9;

    // Buscar la mejor voz en español si está disponible
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find((v) => v.lang.toLowerCase().includes("es-mx") || v.lang.toLowerCase().startsWith("es"));
    if (esVoice) utterance.voice = esVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);

    // Respaldo por si el motor entra en pausa en móviles/escritorio
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  const handleCommand = async (commandText: string) => {
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

      // Control de estados emocionales
      if (data.action?.hasPayment || data.action?.status === "presente") {
        setMood("happy");
        setTimeout(() => setMood("neutral"), 5000);
      } else if (data.action?.status === "falta") {
        setMood("angry");
      } else {
        setMood("neutral");
      }

      // Reproducción inmediata de voz
      speakAudio(replyText);

      // Control y navegación web si la IA devuelve ruta
      if (data.navigateTo) {
        setTimeout(() => {
          router.push(data.navigateTo);
        }, 800);
      }
    } catch {
      const errorMsg = "Coach Ricardo, se perdió el enlace de voz. Repite la orden.";
      setAiReply(errorMsg);
      speakAudio(errorMsg);
    }
  };

  const startListening = () => {
    // Desbloqueo nativo obligatorio de Audio Context
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      const wakeLock = new SpeechSynthesisUtterance("");
      wakeLock.volume = 0;
      window.speechSynthesis.speak(wakeLock);
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Aviso al iniciar reconocimiento:", err);
        setIsListening(false);
      }
    }
  };

  return (
    <>
      {/* Botón Flotante Oficial de Fenrir */}
      <button
        onClick={() => {
          // Desbloquear audio context en el clic
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.resume();
            const warmUp = new SpeechSynthesisUtterance("");
            warmUp.volume = 0;
            window.speechSynthesis.speak(warmUp);
          }
          setIsOpen(!isOpen);
        }}
        className="fixed bottom-6 left-6 z-[9999] px-4 py-2.5 rounded-full bg-[#0a0d14] border-2 border-orange-500 shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-3 text-white font-mono text-xs font-bold cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden border border-orange-400">
          <img src="/assets/fenrir/avatar.webp" alt="Fenrir" className="w-full h-full object-cover" />
        </div>
        <span>FENRIR • VOZ</span>
      </button>

      {/* Modal Interactivo de Control */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 sm:left-6 sm:w-96 z-[9999] bg-[#0c0f17] border border-orange-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono font-black text-orange-400 uppercase tracking-wider">
              Fenrir Copiloto • Head Coach
            </span>
            <button
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
                setIsOpen(false);
              }}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
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

          {/* Controles: Micrófono y Desbloqueo */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => speakAudio("Sistemas de Fenrir en línea. Listo para tus órdenes en duela, Coach Ricardo.")}
              className="p-2.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
              title="Probar Altavoz"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={startListening}
              className={`p-4 rounded-full transition-all shadow-xl active:scale-95 cursor-pointer ${
                isListening
                  ? "bg-cyan-500 text-black shadow-cyan-500/50 animate-pulse"
                  : "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-600/40"
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
