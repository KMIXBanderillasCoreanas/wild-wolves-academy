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
  Lock,
  Calendar,
  Sparkles
} from "lucide-react";
import CustomScheduleSelector from "@/components/CustomScheduleSelector";

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
  const [selectedDays, setSelectedDays] = useState<string[]>(["lunes", "miercoles", "viernes"]);
  const [daySchedules, setDaySchedules] = useState<Record<string, string>>({
    lunes: "17:00 - 19:00",
    miercoles: "17:00 - 19:00",
    viernes: "17:00 - 19:00",
  });
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

  const handleSaveCommitment = async () => {
    if (selectedDays.length === 0) {
      alert("Por favor selecciona al menos 1 día de entrenamiento.");
      return;
    }

    setLoading(true);
    try {
      const DAY_MAP_SPANISH: Record<string, string> = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
        sabado: "Sábado",
        domingo: "Domingo",
      };

      const finalDaysSpanish = selectedDays.map(d => DAY_MAP_SPANISH[d] || d);

      const hasMatutino = Object.values(daySchedules).some(s => s.includes("09:00"));
      const hasVespertino = Object.values(daySchedules).some(s => s.includes("17:00"));
      const hasDomingo = Object.values(daySchedules).some(s => s.includes("16:00"));
      
      const summaryShifts: string[] = [];
      if (hasMatutino) summaryShifts.push("Matutino (09:00 - 11:00)");
      if (hasVespertino) summaryShifts.push("Vespertino (17:00 - 19:00)");
      if (hasDomingo) summaryShifts.push("Domingo (16:00 - 18:00)");
      const scheduleSummary = summaryShifts.join(" / ") || "Vespertino (17:00 - 19:00)";

      const formattedTrainingDays = finalDaysSpanish.map(d => d.slice(0, 3)).join("-");
      const defaultShiftCode = hasMatutino && !hasVespertino ? "matutino_9_11" : "vespertino_5_7";
      const freqType = selectedDays.length >= 6 ? "diario_6_dias" : selectedDays.length === 3 ? "cada_tercer_dia_3_dias" : "personalizado";

      // Guardar respaldo en localStorage para sesiones móviles y offline
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_selected_days", JSON.stringify(finalDaysSpanish));
        localStorage.setItem("ww_selected_days_keys", JSON.stringify(selectedDays));
        localStorage.setItem("ww_schedules_by_day", JSON.stringify(daySchedules));
        localStorage.setItem("ww_selected_shift", defaultShiftCode);
        localStorage.setItem("ww_frequency_type", freqType);
        localStorage.setItem("ww_target_role", targetRole);
      }

      let effectiveUserId = activeUserId;
      if (!effectiveUserId) {
        const { data } = await supabase.auth.getUser();
        effectiveUserId = data?.user?.id || null;
      }

      if (effectiveUserId) {
        // 1. Guardar en attendance_commitments
        const { error: commErr } = await supabase.from("attendance_commitments").upsert({
          user_id: effectiveUserId,
          frequency_type: freqType,
          days_selected: finalDaysSpanish,
          shift: defaultShiftCode,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

        if (commErr) {
          console.warn("Aviso al guardar compromiso:", commErr.message);
        }

        // 2. Guardar en profiles
        const { error: profErr } = await supabase.from("profiles").update({
          training_days: formattedTrainingDays,
          training_schedule: scheduleSummary,
          selected_days: selectedDays,
          schedules_by_day: daySchedules
        }).eq("id", effectiveUserId);

        if (profErr) {
          console.warn("Aviso al actualizar perfil con horario:", profErr.message);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0d1017] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-800 my-auto text-zinc-100">
        
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-[#161b26]/70 border-b border-zinc-800 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-bold">WILD WOLVES ACADEMY</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-semibold">CDMX</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">Pacto de Entrenamiento</h1>
              </div>
            </div>
            <button 
              onClick={onClose}
              aria-label="Cerrar modal" 
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
            Configura tu combinación personalizada de días y horarios para tus sesiones en Deportivo Carmen Serdán.
          </p>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* SELECTOR GRANULAR 7 DÍAS */}
          <CustomScheduleSelector
            initialDays={selectedDays}
            initialSchedules={daySchedules}
            onSave={(days, schedules) => {
              setSelectedDays(days);
              setDaySchedules(schedules);
            }}
          />

          {/* CUOTAS REGLAMENTARIAS */}
          <section className="rounded-2xl bg-[#161b26] p-4 space-y-2 border border-zinc-800">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">CUOTAS EN CANCHA</span>
                <p className="text-xs text-white font-semibold mt-0.5">
                  Tarifas Oficiales: <span className="text-orange-400 font-bold">$50</span> por clase • <span className="text-orange-400 font-bold">$150</span> semanal (3 sesiones) • <span className="text-orange-400 font-bold">$600</span> mensualidad completa.
                </p>
                <p className="text-[11px] text-zinc-400 mt-1.5">
                  Pagos directos en mesa de control Carmen Serdán vía Efectivo o Transferencia SPEI.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-[#121622] flex flex-col items-center space-y-2 border-t border-zinc-800">
          <button
            onClick={handleSaveCommitment}
            disabled={loading || selectedDays.length === 0}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Guardando..." : "Confirmar Horario y Acceder al Club"}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3 text-orange-400" />
            Horario modificable en cualquier momento desde tu panel
          </span>
        </div>

      </div>
    </div>
  );
}
