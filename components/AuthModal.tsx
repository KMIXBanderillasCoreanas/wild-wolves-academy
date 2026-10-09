"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Activity, 
  X, 
  Check, 
  Sun, 
  CreditCard, 
  ArrowRight, 
  Lock 
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  targetRole?: string;
  initialMode?: "signup" | "login" | "register";
  onSuccess?: () => void;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  userId, 
  targetRole = "student",
  initialMode = "signup",
  onSuccess 
}: AuthModalProps) {
  const [freq, setFreq] = useState<"daily" | "alternate" | "custom">("alternate");
  const [presetDays, setPresetDays] = useState<"Lun-Mié-Vie" | "Mar-Jue-Sáb">("Lun-Mié-Vie");
  const [customDays, setCustomDays] = useState<string[]>(["M", "J"]);
  const [shift, setShift] = useState<"matutino_9_11" | "vespertino_5_7">("vespertino_5_7");
  const [loading, setLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(userId || null);

  useEffect(() => {
    if (!activeUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id) {
          setActiveUserId(data.user.id);
        }
      });
    }
  }, [activeUserId]);

  if (!isOpen) return null;

  const toggleCustomDay = (d: string) => {
    setCustomDays(prev => 
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const handleSaveCommitment = async () => {
    setLoading(true);
    try {
      let finalDays: string[] = [];
      let freqType = "cada_tercer_dia_3_dias";

      if (freq === "daily") {
        freqType = "diario_6_dias";
        finalDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      } else if (freq === "alternate") {
        freqType = "cada_tercer_dia_3_dias";
        finalDays = presetDays === "Lun-Mié-Vie" 
          ? ["Lunes", "Miércoles", "Viernes"] 
          : ["Martes", "Jueves", "Sábado"];
      } else {
        freqType = "dos_dias_semana";
        const mapDay: Record<string, string> = {
          L: "Lunes",
          M: "Martes",
          Mi: "Miércoles",
          J: "Jueves",
          V: "Viernes",
          S: "Sábado"
        };
        finalDays = customDays.map(d => mapDay[d] || d);
      }

      // Guardar respaldo en localStorage para sesiones móviles y offline
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_selected_days", JSON.stringify(finalDays));
        localStorage.setItem("ww_selected_shift", shift);
        localStorage.setItem("ww_frequency_type", freqType);
        localStorage.setItem("ww_target_role", targetRole);
      }

      let effectiveUserId = activeUserId;
      if (!effectiveUserId) {
        const { data } = await supabase.auth.getUser();
        effectiveUserId = data?.user?.id || null;
      }

      if (effectiveUserId) {
        const { error } = await supabase.from("attendance_commitments").upsert({
          user_id: effectiveUserId,
          frequency_type: freqType,
          days_selected: finalDays,
          shift: shift,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

        if (error) {
          console.warn("Aviso al guardar en Supabase, compromiso respaldado localmente:", error.message);
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error al guardar pacto de entrenamiento: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-surface-container-lowest/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-surface-container rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-surface-container-high my-auto text-on-surface">
        
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-surface-container-high/60 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary shadow-md">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">WILD WOLVES ACADEMY</span>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary text-[10px] font-semibold">CDMX</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight mt-0.5">Pacto de Entrenamiento</h1>
              </div>
            </div>
            <button 
              onClick={onClose}
              aria-label="Cerrar modal" 
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
            Selecciona tu disciplina semanal y turno oficial de entrenamiento en Deportivo Carmen Serdán.
          </p>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: FREQUENCY */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold">01</span>
                <h2 className="text-sm font-bold text-on-surface">Frecuencia Semanal</h2>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">3 OPCIONES</span>
            </div>

            {/* Card A: Diario */}
            <div 
              onClick={() => setFreq("daily")}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                freq === "daily" 
                  ? "bg-surface-container-high border-primary-container shadow-md" 
                  : "bg-surface-container-low border-transparent hover:bg-surface-container-high"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-secondary font-semibold uppercase px-2 py-0.5 rounded-full bg-on-secondary/40">Élite Intensivo</span>
                  <h3 className="text-sm text-on-surface font-bold mt-1">Diario (Lun a Sáb - 6 días)</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">6 sesiones semanales de alta exigencia técnica y física.</p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  freq === "daily" ? "bg-primary-container text-on-primary" : "bg-surface-variant text-transparent"
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card B: Cada 3er Día */}
            <div 
              onClick={() => setFreq("alternate")}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${
                freq === "alternate" 
                  ? "bg-surface-container-high border-primary-container shadow-md" 
                  : "bg-surface-container-low border-transparent hover:bg-surface-container-high"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-primary font-bold uppercase px-2 py-0.5 rounded-full bg-on-primary/20">Formativo & Selectivo</span>
                    <span className="text-[10px] text-tertiary font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1"></span>Recomendado
                    </span>
                  </div>
                  <h3 className="text-sm text-primary font-bold mt-1">Cada 3er Día (3 días/sem)</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Desarrollo táctico balanceado para competencia y fundamentos.</p>
                  
                  {/* Preset Pills */}
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPresetDays("Lun-Mié-Vie"); setFreq("alternate"); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        presetDays === "Lun-Mié-Vie" && freq === "alternate"
                          ? "bg-primary-container text-on-primary shadow-sm"
                          : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Lun-Mié-Vie
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPresetDays("Mar-Jue-Sáb"); setFreq("alternate"); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        presetDays === "Mar-Jue-Sáb" && freq === "alternate"
                          ? "bg-primary-container text-on-primary shadow-sm"
                          : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Mar-Jue-Sáb
                    </button>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  freq === "alternate" ? "bg-primary-container text-on-primary" : "bg-surface-variant text-transparent"
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card C: 2 Días */}
            <div 
              onClick={() => setFreq("custom")}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                freq === "custom" 
                  ? "bg-surface-container-high border-primary-container shadow-md" 
                  : "bg-surface-container-low border-transparent hover:bg-surface-container-high"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-[10px] text-on-surface-variant uppercase px-2 py-0.5 rounded-full bg-surface-container font-mono">Personalizado</span>
                  <h3 className="text-sm text-on-surface font-bold mt-1">2 Días por Semana</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Ideal para iniciación o compaginación escolar.</p>

                  <div className="flex items-center space-x-1.5 mt-3">
                    {["L", "M", "Mi", "J", "V", "S"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleCustomDay(d); setFreq("custom"); }}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                          customDays.includes(d) && freq === "custom"
                            ? "bg-primary-container text-on-primary"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  freq === "custom" ? "bg-primary-container text-on-primary" : "bg-surface-variant text-transparent"
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </section>

          {/* STEP 2: SHIFT */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-bold">02</span>
                <h2 className="text-sm font-bold text-on-surface">Selección de Turno Oficial</h2>
              </div>
              <span className="text-[10px] text-secondary font-mono">HORARIO LOCAL</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div 
                onClick={() => setShift("matutino_9_11")}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition border ${
                  shift === "matutino_9_11" 
                    ? "bg-surface-container-high border-secondary shadow-sm" 
                    : "bg-surface-container-low border-transparent hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                    <Sun className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-on-surface">Turno Matutino</h3>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px]">Menor afluencia</span>
                    </div>
                    <p className="text-xs text-secondary font-mono mt-0.5">09:00 - 11:00 HRS</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  shift === "matutino_9_11" ? "bg-secondary text-on-secondary" : "bg-surface-variant text-transparent"
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => setShift("vespertino_5_7")}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition border ${
                  shift === "vespertino_5_7" 
                    ? "bg-surface-container-high border-secondary shadow-sm" 
                    : "bg-surface-container-low border-transparent hover:bg-surface-container-high"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-on-secondary/40 flex items-center justify-center text-secondary">
                    <Activity className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-on-surface">Turno Vespertino</h3>
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-semibold">Turno Principal</span>
                    </div>
                    <p className="text-xs text-secondary font-mono font-semibold mt-0.5">17:00 - 19:00 HRS</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  shift === "vespertino_5_7" ? "bg-secondary text-on-secondary" : "bg-surface-variant text-transparent"
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: CUOTAS */}
          <section className="rounded-2xl bg-surface-container-lowest p-4 space-y-2 border border-surface-container-high">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">CUOTAS REGLAMENTARIAS</span>
                <p className="text-xs text-on-surface font-semibold mt-0.5">
                  Tarifas en Cancha: <span className="text-primary font-bold">$50</span> por clase individual • <span className="text-primary font-bold">$150</span> semanal • <span className="text-primary font-bold">$600</span> mensualidad completa.
                </p>
                <p className="text-[11px] text-on-surface-variant mt-1.5">
                  Pagos directos en mesa de control Carmen Serdán vía Efectivo o SPEI. Incluye seguro y registro a rol de partidos.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-5 bg-surface-container-high/40 flex flex-col items-center space-y-2 border-t border-surface-container-high">
          <button
            onClick={handleSaveCommitment}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary-container hover:brightness-110 active:scale-[0.99] text-on-primary font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-primary-container/20 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Guardando..." : "Guardar Compromiso y Acceder al Club"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-on-surface-variant flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-secondary" />
            Compromiso modificable directamente con tu Head Coach
          </span>
        </div>

      </div>
    </div>
  );
}
