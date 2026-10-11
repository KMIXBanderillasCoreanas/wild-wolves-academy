"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, MessageSquare, Dumbbell, ShieldCheck, Flame, RefreshCw } from "lucide-react";

export default function TacticalAIAssistant({ athleteContext }: { athleteContext?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "¡Saludos, Coach Ricardo! 🐺 Soy el **Lobo Táctico IA**, tu asistente oficial en el Deportivo Carmen Serdán.\n\n¿Qué deseas dosificar, redactar para tutores o calibrar hoy en la duela?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          contextData: athleteContext || {
            academy: "Wild Wolves CDMX",
            court: "Deportivo Carmen Serdán",
            head_coach: "Ricardo",
          },
        }),
      });

      const data = await res.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "⚠️ Error al comunicar con el motor IA. Verifica tu conexión a internet o la variable GEMINI_API_KEY.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(undefined, prompt);
  };

  return (
    <>
      {/* Botón Flotante Táctico */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir Asistente Lobo Táctico IA"
        className="fixed bottom-6 right-6 z-50 p-3.5 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-[#f66018] via-orange-500 to-amber-500 text-white shadow-2xl shadow-orange-600/40 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2.5 font-mono text-xs font-black uppercase tracking-wider cursor-pointer border border-orange-400/40"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0d14] animate-pulse" />
        </div>
        <span className="hidden sm:inline">Lobo Táctico IA</span>
      </button>

      {/* Ventana Modal de Chat Táctico */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[80vh] bg-[#0f131d] border border-orange-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-[#141926] p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-xs uppercase tracking-wider text-white block">
                  Lobo Táctico • IA Carmen Serdán
                </span>
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Gemini 1.5 Flash • Coach Assist
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-[#121622] border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono scrollbar-none">
            <button
              type="button"
              onClick={() => handleQuickPrompt("Sugiéreme una rutina de tiro en 5 spots para un atleta con debilidad en triples.")}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer shrink-0"
            >
              🎯 Rutina 5 Spots
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("Redacta un mensaje amable por WhatsApp para recordar la cuota de $150 MXN a un tutor.")}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer shrink-0"
            >
              📲 Mensaje Cuota
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("¿Cómo calibro la Batería 3x25 para un alumno que no llega a 25 lagartijas continuas?")}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white whitespace-nowrap transition cursor-pointer shrink-0"
            >
              🐺 Batería 3x25
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-orange-600/30 to-amber-600/20 border border-orange-500/40 text-white ml-8 rounded-tr-none shadow-sm"
                    : "bg-[#181e2b] border border-zinc-800/80 text-zinc-200 mr-8 rounded-tl-none shadow-sm leading-relaxed"
                }`}
              >
                <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                  {m.role === "user" ? (
                    <span>Coach Ricardo</span>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      <span className="text-orange-400 font-bold">Lobo Táctico IA</span>
                    </>
                  )}
                </div>
                <p className="whitespace-pre-line">{m.content}</p>
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-2xl bg-[#181e2b] border border-zinc-800 text-orange-400 mr-8 rounded-tl-none flex items-center gap-2 text-[11px] font-mono animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                <span>Analizando biomecánica y táctica...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => sendMessage(e)} className="p-3 bg-[#141926] border-t border-zinc-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre rutinas, padres o táctica..."
              disabled={loading}
              className="flex-1 bg-[#0b0e14] border border-zinc-700/80 rounded-xl px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition disabled:opacity-50 cursor-pointer active:scale-95 shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
