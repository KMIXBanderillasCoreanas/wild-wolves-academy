"use client";

import React, { useState } from "react";
import { Bot, Sparkles, Calendar, MessageSquare, Send, ShieldCheck, Copy, Check, Flame } from "lucide-react";

export default function MasterAICockpit() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const executeCommand = async (commandText: string) => {
    if (!commandText.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: commandText }],
          customContext: {
            source: "MasterAICockpit",
            view: "master-bunker-hq",
            court: "Deportivo Carmen Serdán",
          },
        }),
      });
      const data = await res.json();
      setResponse(data.reply || data.error || "Sin respuesta recibida.");
    } catch {
      setResponse("Error al contactar con el núcleo de Inteligencia Artificial.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-[#101420] border border-orange-500/30 rounded-3xl p-5 sm:p-6 text-zinc-100 space-y-4 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-600/20 text-[#f66018] border border-orange-500/30 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 flex-wrap">
              Lobo Central • Centro de Mando IA
              <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Coach Ricardo Full Access
              </span>
            </h3>
            <span className="text-xs text-zinc-400">
              Planeación deportiva de duela, comunicados para tutores por WhatsApp y control operativo
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-xl self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso Nivel 0 Activo</span>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS DE 1 TOQUE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() =>
            executeCommand(
              "Diseña la planeación de entrenamiento de básquetbol para hoy. Turno de 17:00 a 19:00 hrs. Enfoque: Mecánica de tiro libre, velocidad de reacción con balón y defensa individual. Divide los 120 minutos paso a paso."
            )
          }
          className="p-3.5 rounded-2xl bg-[#161c2b] border border-zinc-800 hover:border-orange-500/50 text-left transition group cursor-pointer active:scale-98 shadow-sm"
        >
          <div className="flex items-center gap-2 text-[#f66018] mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Planear Clase de Hoy</span>
          </div>
          <span className="text-[11px] text-zinc-400 block group-hover:text-zinc-200">
            Rutina completa de 2 hrs desglosada por minutos
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            executeCommand(
              "Redacta un mensaje de WhatsApp para el grupo de padres recordando que el entrenamiento de hoy domingo es a las 16:00 hrs puntuales en el Deportivo Carmen Serdán. Pide llevar hidratación y calzado amarrado."
            )
          }
          className="p-3.5 rounded-2xl bg-[#161c2b] border border-zinc-800 hover:border-emerald-500/50 text-left transition group cursor-pointer active:scale-98 shadow-sm"
        >
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Aviso de WhatsApp: Hoy</span>
          </div>
          <span className="text-[11px] text-zinc-400 block group-hover:text-zinc-200">
            Recordatorio de asistencia y turno dominical
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            executeCommand(
              "Redacta una convocatoria formal para WhatsApp sobre el próximo Test Day Biomecánico. Explica que evaluaremos velocidad, cuerda, lagartijas y tiros para actualizar sus Cyber Wolf Cards."
            )
          }
          className="p-3.5 rounded-2xl bg-[#161c2b] border border-zinc-800 hover:border-purple-500/50 text-left transition group cursor-pointer active:scale-98 shadow-sm"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Convocatoria Test Day</span>
          </div>
          <span className="text-[11px] text-zinc-400 block group-hover:text-zinc-200">
            Mensaje motivacional y reglas de evaluación
          </span>
        </button>
      </div>

      {/* RESULTADO DE LA IA */}
      {loading && (
        <div className="p-4 rounded-2xl bg-[#141926] border border-orange-500/30 text-orange-400 text-xs font-mono animate-pulse flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Lobo Central procesando directiva táctica para el Head Coach...
        </div>
      )}

      {response && !loading && (
        <div className="p-4 rounded-2xl bg-[#141926] border border-zinc-800 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
            <span className="font-mono text-orange-400 font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Directiva Generada:
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition font-mono text-[11px] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado al portapapeles ✓" : "Copiar texto"}</span>
            </button>
          </div>
          <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans">{response}</p>
        </div>
      )}

      {/* INPUT PERSONALIZADO */}
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe una orden (ej: 'Planea rutina de fuerza en casa para principiantes' o 'Aviso de lluvia')..."
          className="flex-1 bg-[#0b0e14] border border-zinc-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
          onKeyDown={(e) => e.key === "Enter" && executeCommand(prompt)}
        />
        <button
          type="button"
          onClick={() => executeCommand(prompt)}
          disabled={loading || !prompt.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
          <span>Ejecutar</span>
        </button>
      </div>
    </div>
  );
}
