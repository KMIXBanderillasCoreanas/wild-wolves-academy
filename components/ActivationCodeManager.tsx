"use client";

import React, { useState, useEffect } from "react";
import { 
  KeyRound, 
  Plus, 
  Copy, 
  Check, 
  MessageCircle, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
  ArrowRight,
  Trash2
} from "lucide-react";
import { 
  generarNuevoCodigoFolioAction, 
  listarCodigosActivacionAction,
  vaciarTodosLosCodigosAction
} from "@/app/actions/subscription-actions";

export default function ActivationCodeManager() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<{
    code: string;
    plan: "PRO_99" | "ELITE_149" | "FREE_15";
    message: string;
  } | null>(null);
  const [customCode, setCustomCode] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<"PRO_99" | "ELITE_149" | "FREE_15">("PRO_99");
  const [notes, setNotes] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmWipe, setConfirmWipe] = useState<boolean>(false);
  const [wiping, setWiping] = useState<boolean>(false);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const res = await listarCodigosActivacionAction();
      if (res.success && res.codes) {
        setCodes(res.codes);
      }
    } catch (err) {
      console.warn("Error cargando folios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (plan: "PRO_99" | "ELITE_149" | "FREE_15", customName?: string) => {
    setGenerating(true);
    setFeedback(null);
    try {
      const cleanNotes = notes?.trim() ? notes.trim() : undefined;
      const res = await generarNuevoCodigoFolioAction({
        planType: plan,
        notes: cleanNotes,
        customCode: customName?.trim() ? customName.trim() : undefined
      });

      if (res.success && res.code) {
        const planText = plan === "ELITE_149" 
          ? "Pack Familiar Élite ($149 MXN - 100 consultas IA)" 
          : plan === "FREE_15"
          ? "Bono de Bienvenida Wild Wolves (15 consultas cortesía Kimi IA)"
          : "Atleta Lobo Pro ($99 MXN - 50 consultas IA)";

        const whatsAppMsg = plan === "FREE_15"
          ? `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\n¡Bienvenido a la Manada Wild Wolves!\nEl Coach Ricardo te ha otorgado un folio de cortesía para *${planText}*:\n\n🔑 *FOLIO:* \`${res.code.code}\`\n\nCanjéalo directamente desde la app en https://wildwolves.mx para desbloquear tus 15 consultas de IA táctica. ¡Nos vemos en la duela!`
          : `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\nEstimada familia / atleta:\nEl Coach Ricardo te ha asignado tu folio oficial de activación de 30 días para *${planText}*:\n\n🔑 *FOLIO:* \`${res.code.code}\`\n\nCanjéalo directamente desde la app en https://wildwolves.mx para desbloquear tus consultas y análisis táctico. ¡Nos vemos en la duela!`;

        // Copiar automáticamente el código al portapapeles
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(res.code.code);
          setCopiedCode(res.code.code);
        }

        setLastGenerated({
          code: res.code.code,
          plan,
          message: whatsAppMsg
        });

        const planBadgeLabel = plan === "FREE_15" ? "Bono 15 IA" : plan === "ELITE_149" ? "Familiar $149" : "Pro $99";
        setFeedback({
          type: "success",
          text: `¡Folio ${res.code.code} (${planBadgeLabel}) generado y COPIADO al portapapeles con éxito!`
        });
        setCustomCode("");
        setNotes("");
        await loadCodes();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "No se pudo generar el folio."
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Error de conexión al generar folio."
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExecuteWipe = async () => {
    setWiping(true);
    setFeedback(null);
    try {
      const res = await vaciarTodosLosCodigosAction();
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Auditoría reiniciada con éxito: se eliminaron ${res.count ?? 0} folios de la base de datos.`
        });
        setCodes([]);
        setLastGenerated(null);
      } else {
        setFeedback({
          type: "error",
          text: res.error || "No se pudieron eliminar los folios."
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Error de red al intentar limpiar los folios."
      });
    } finally {
      setWiping(false);
      setConfirmWipe(false);
    }
  };

  const handleCopyText = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSendViaWhatsApp = (codeItem: any) => {
    const isFreeBonus = codeItem.plan_type === "FREE_15";
    const planText = codeItem.plan_type === "ELITE_149"
      ? "Pack Familiar Élite ($149 MXN - 100 consultas IA)"
      : isFreeBonus
      ? "Bono de Bienvenida Wild Wolves (15 consultas cortesía Kimi IA)"
      : "Atleta Lobo Pro ($99 MXN - 50 consultas IA)";

    const message = isFreeBonus
      ? `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\n¡Bienvenido a la Manada Wild Wolves!\nEl Coach Ricardo te ha otorgado un folio de cortesía para *${planText}*:\n\n🔑 *FOLIO:* \`${codeItem.code}\`\n\nCanjéalo directamente desde la app en https://wildwolves.mx para desbloquear tus 15 consultas de IA táctica. ¡Nos vemos en la duela!`
      : `🐺 *Wild Wolves Basketball Academy CDMX*\nSede: Deportivo Carmen Serdán\n\nEstimada familia / atleta:\nEl Coach Ricardo te ha asignado tu folio oficial de activación de 30 días para *${planText}*:\n\n🔑 *FOLIO:* \`${codeItem.code}\`\n\nCanjéalo directamente desde la app en https://wildwolves.mx para desbloquear tus consultas y análisis táctico. ¡Nos vemos en la duela!`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-[#0b0e17] border border-orange-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl text-white space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f66018] to-amber-500 flex items-center justify-center text-black font-black shadow-lg shadow-orange-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                Módulo SuperAdmin
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-black">
                Temporizador 30 Días
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
              Generador y Auditoría de Folios de Activación
            </h3>
          </div>
        </div>

        <button
          onClick={loadCodes}
          disabled={loading}
          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-2 text-xs font-mono"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-orange-400" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* FEEDBACK STATUS BANNER */}
      {feedback && (
        <div className={`p-3.5 rounded-2xl text-xs font-mono flex items-center justify-between gap-3 border transition-all ${
          feedback.type === "success" 
            ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/40" 
            : "bg-red-950/60 border-red-500/50 text-red-300 shadow-lg shadow-red-950/40"
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            className="text-zinc-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* BOTONES PRINCIPALES DE 1-CLIC SOLICITADOS POR EL COACH RICARDO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-orange-400" /> Generador Rápido a 1 Clic (Auto-Copiado al Portapapeles)
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Listo para pegar en WhatsApp
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Botón 1: Generar Folio Pro $99 */}
          <button
            onClick={() => handleGenerate("PRO_99")}
            disabled={generating}
            className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/70 via-[#181310] to-[#121622] border-2 border-orange-500/60 hover:border-orange-400 hover:scale-[1.02] active:scale-[0.99] text-left transition-all duration-200 cursor-pointer shadow-xl shadow-orange-950/40 disabled:opacity-50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black font-mono text-orange-400 uppercase flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-orange-400" /> Generar Folio Pro $99
              </span>
              <span className="text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded">
                1 Clic
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-white">$99 <span className="text-xs text-zinc-400">MXN / 30 días</span></div>
            <p className="text-xs text-zinc-300 mt-1">
              50 consultas IA / mes + Biomecánica y tiro en Carmen Serdán.
            </p>
            <div className="mt-4 pt-3 border-t border-orange-500/20 flex items-center justify-between text-xs font-black text-orange-300 group-hover:text-white">
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Emitir y Copiar Código</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Botón 2: Generar Folio Familiar $149 */}
          <button
            onClick={() => handleGenerate("ELITE_149")}
            disabled={generating}
            className="p-5 rounded-2xl bg-gradient-to-r from-fuchsia-950/70 via-[#18101a] to-[#121622] border-2 border-fuchsia-500/60 hover:border-fuchsia-400 hover:scale-[1.02] active:scale-[0.99] text-left transition-all duration-200 cursor-pointer shadow-xl shadow-fuchsia-950/40 disabled:opacity-50 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black font-mono text-fuchsia-400 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-fuchsia-400" /> Generar Folio Familiar $149
              </span>
              <span className="text-[10px] font-mono font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-0.5 rounded">
                1 Clic
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-white">$149 <span className="text-xs text-zinc-400">MXN / 30 días</span></div>
            <p className="text-xs text-zinc-300 mt-1">
              100 consultas IA compartidas (Atleta + Tutor) + Reportes familiares.
            </p>
            <div className="mt-4 pt-3 border-t border-fuchsia-500/20 flex items-center justify-between text-xs font-black text-fuchsia-300 group-hover:text-white">
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Emitir y Copiar Código</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>

      {/* BANNER NEÓN DE ÚLTIMO FOLIO GENERADO Y COPIADO */}
      {lastGenerated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#0d1713] to-[#0c1219] border-2 border-emerald-500/60 shadow-2xl shadow-emerald-950/50 space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-black text-emerald-400 tracking-wider">
                  ¡Folio Generado y Copiado con Éxito!
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider flex items-center gap-2 mt-0.5">
                  <span>{lastGenerated.code}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-black uppercase font-black">
                    Copiado
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleCopyText(lastGenerated.message, "full_msg")}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode === "full_msg" ? "¡Texto Copiado!" : "Copiar Texto Completo"}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(lastGenerated.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Pegar en WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Generador Personalizado */}
      <div className="bg-[#10141f] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-orange-400" /> Generador con Clave y Plan Personalizado
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Admite Bonos de Cortesía (15 IA) o Claves Especiales
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
              Clave personalizada (opcional)
            </label>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Ej. BIENVENIDA-2026 o COMBINE-2026"
              className="w-full h-10 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl text-xs font-mono uppercase text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
              Plan / Nivel
            </label>
            <select
              value={selectedPlan}
              onChange={(e: any) => setSelectedPlan(e.target.value)}
              className="w-full h-10 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500 transition cursor-pointer"
            >
              <option value="PRO_99">Lobo Pro ($99 MXN - 50 IA)</option>
              <option value="ELITE_149">Familiar Élite ($149 MXN - 100 IA)</option>
              <option value="FREE_15">Bono Bienvenida (15 IA)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
              Nota interna (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Beca 50%, Alumno Kevin"
              className="w-full h-10 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={() => handleGenerate(selectedPlan, customCode)}
              disabled={generating}
              className="w-full h-10 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-orange-950/40 flex items-center justify-center gap-1.5 disabled:opacity-40"
              title="Crear folio personalizado"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Crear Folio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Códigos Generados */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Auditoría de Folios Emitidos ({codes.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Últimos 50 generados en Supabase</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {confirmWipe ? (
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-red-950/80 border border-red-500/60 animate-in fade-in">
                <span className="text-[10px] font-mono text-red-300 font-bold hidden sm:inline pl-1">
                  ¿Vaciar toda la auditoría?
                </span>
                <button
                  onClick={handleExecuteWipe}
                  disabled={wiping}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {wiping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  <span>Confirmar Vaciado</span>
                </button>
                <button
                  onClick={() => setConfirmWipe(false)}
                  disabled={wiping}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px] transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmWipe(true)}
                disabled={loading || codes.length === 0}
                className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 hover:border-red-500 hover:bg-red-950/70 text-red-400 hover:text-red-300 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Eliminar todos los códigos de activación y reiniciar a 0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Todos los Códigos</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#0e121c] border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              <span>Cargando folios...</span>
            </div>
          ) : codes.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500">
              No hay códigos registrados aún. Genera el primero con los botones superiores.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80 max-h-96 overflow-y-auto">
              {codes.map((item) => (
                <div key={item.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-zinc-900/50 transition">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopyText(item.code, item.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 hover:border-orange-500/60 font-mono font-bold text-xs text-white flex items-center gap-1.5 transition cursor-pointer"
                      title="Copiar código"
                    >
                      {copiedCode === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{item.code}</span>
                        </>
                      )}
                    </button>

                    <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      item.plan_type === "ELITE_149"
                        ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30"
                        : item.plan_type === "FREE_15"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                    }`}>
                      {item.plan_type === "ELITE_149" ? "Familiar $149" : item.plan_type === "FREE_15" ? "Bono 15" : "Pro $99"}
                    </span>

                    {item.notes && (
                      <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[160px] sm:max-w-[220px]" title={item.notes}>
                        {item.notes}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {item.is_used ? (
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-zinc-600" />
                        <span>Canjeado {item.used_at ? new Date(item.used_at).toLocaleDateString() : ""}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Disponible</span>
                      </span>
                    )}

                    {!item.is_used && (
                      <button
                        onClick={() => handleSendViaWhatsApp(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
