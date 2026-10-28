"use client";

import React, { useState } from "react";
import { MessageSquare, Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { consultarApinexAI, APINEX_MODELS } from "@/lib/apinex-gateway";

interface WhatsAppClickToChatProps {
  studentName: string;
  tier?: string;
  balanceDue?: number;
  parentPhone?: string; // Teléfono opcional del tutor (ej: 5522427769)
  variant?: "button" | "card" | "inline";
}

export default function WhatsAppClickToChat({
  studentName,
  tier = "Formativo",
  balanceDue = 50,
  parentPhone = "5522427769",
  variant = "button"
}: WhatsAppClickToChatProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Limpiar número a formato internacional mexicano (52 + 10 dígitos)
  const cleanPhone = parentPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;

  const defaultTemplate = `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\nEstimada familia de *${studentName}*:\nEsperamos que se encuentren excelente. Les compartimos que ${studentName} se encuentra en nivel *${tier}*, demostrando un gran avance táctico y disciplina en la duela.\n\nLe recordamos amablemente que cuenta con un saldo pendiente de *$${balanceDue} MXN* correspondientes a sus entrenamientos. ¡Agradecemos enormemente su apoyo a la manada!\n\nAtentamente,\n*Cuerpo Técnico Wild Wolves*`;

  const handleOpenChat = async () => {
    setGenerating(true);
    let finalMessage = defaultTemplate;

    try {
      const res = await consultarApinexAI({
        model: APINEX_MODELS.KIMI_K3,
        systemPrompt: "Eres el asistente administrativo de Wild Wolves Basketball Academy CDMX (Deportivo Carmen Serdán).",
        userPrompt: `Redacta un aviso de WhatsApp motivacional y profesional para el padre de ${studentName}. Nivel: ${tier}, saldo pendiente: $${balanceDue} MXN. Mantén un tono respetuoso y motivador.`,
        temperature: 0.5
      });

      if (res.success && res.text) {
        finalMessage = res.text;
      }
    } catch (err) {
      console.warn("Usando plantilla fallback de WhatsApp:", err);
    } finally {
      setGeneratedMessage(finalMessage);
      setGenerating(false);
      setIsModalOpen(true);
    }
  };

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const waLink = `https://wa.me/${cleanPhone ? formattedPhone : ""}?text=${encodeURIComponent(
    generatedMessage || defaultTemplate
  )}`;

  return (
    <>
      <button
        onClick={handleOpenChat}
        disabled={generating}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
      >
        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
        <span>{generating ? "Redactando con Kimi IA..." : "WhatsApp Tutor ($0 Costo)"}</span>
      </button>

      {/* MODAL PREVIEW CON CLICK-TO-CHAT NATIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#0f131d] border border-zinc-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-white tracking-wide">
                    Mensaje Click-to-Chat Gratuito
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Destinatario: {cleanPhone ? `+${formattedPhone}` : "Cualquier tutor"} • Sin costos de API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-emerald-500/30">
              {generatedMessage}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "¡Copiado!" : "Copiar"}</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir WhatsApp Web / App</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
