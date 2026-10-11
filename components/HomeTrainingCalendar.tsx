"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Calendar, 
  Activity, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Save, 
  TrendingUp, 
  Zap, 
  Dumbbell, 
  Info, 
  Award,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface HomeTrainingLog {
  id?: string;
  student_id: string;
  training_date: string;
  rope_jumps_completed: number;
  rope_target: number;
  cardio_type: "trote" | "carrera" | "mixto" | "ninguno";
  cardio_minutes: number;
  isometric_level: 1 | 2 | 3;
  with_weights: boolean;
  weight_kg: number;
  student_notes: string;
  created_at?: string;
}

interface HomeTrainingCalendarProps {
  studentId?: string;
  studentName?: string;
  dayNumber?: number; // Día progresivo (ej. 1 a 10)
}

export default function HomeTrainingCalendar({
  studentId,
  studentName = "Atleta",
  dayNumber = 1
}: HomeTrainingCalendarProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Cálculo de meta progresiva de cuerda:
  // Día 1 = 100 brincos, incrementando +100 por día hasta tope de 1,000
  const progressiveRopeTarget = Math.min(1000, Math.max(100, dayNumber * 100));

  // Estados del Formulario de Registro
  const [ropeJumps, setRopeJumps] = useState<number>(progressiveRopeTarget);
  const [cardioType, setCardioType] = useState<"trote" | "carrera" | "mixto" | "ninguno">("trote");
  const [cardioMinutes, setCardioMinutes] = useState<number>(20);
  const [isometricLevel, setIsometricLevel] = useState<1 | 2 | 3>(1);
  const [withWeights, setWithWeights] = useState<boolean>(false);
  const [weightKg, setWeightKg] = useState<number>(2);
  const [notes, setNotes] = useState<string>("");

  // Estado de sincronización
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [todayLog, setTodayLog] = useState<HomeTrainingLog | null>(null);
  const [monthlyLogs, setMonthlyLogs] = useState<HomeTrainingLog[]>([]);

  useEffect(() => {
    if (studentId) {
      loadHistory();
    }
  }, [studentId]);

  async function loadHistory() {
    try {
      const { data, error } = await supabase
        .from("home_training_logs")
        .select("*")
        .eq("student_id", studentId)
        .order("training_date", { ascending: false });

      if (data && !error) {
        setMonthlyLogs(data);
        const foundToday = data.find((l: any) => l.training_date === todayStr);
        if (foundToday) {
          setTodayLog(foundToday);
          setRopeJumps(foundToday.rope_jumps_completed);
          setCardioType(foundToday.cardio_type);
          setCardioMinutes(foundToday.cardio_minutes);
          setIsometricLevel(foundToday.isometric_level);
          setWithWeights(foundToday.with_weights);
          setWeightKg(foundToday.weight_kg);
          setNotes(foundToday.student_notes || "");
        }
      } else {
        // Soporte offline / fallback a localStorage
        const local = JSON.parse(localStorage.getItem(`ww_home_logs_${studentId}`) || "[]");
        setMonthlyLogs(local);
        const found = local.find((l: any) => l.training_date === todayStr);
        if (found) setTodayLog(found);
      }
    } catch (err) {
      console.warn("Carga de home_training_logs local fallback:", err);
    }
  }

  const handleSaveHomeTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    setSaving(true);
    setSavedSuccess(false);

    const payload: HomeTrainingLog = {
      student_id: studentId,
      training_date: todayStr,
      rope_jumps_completed: Number(ropeJumps) || 0,
      rope_target: progressiveRopeTarget,
      cardio_type: cardioType,
      cardio_minutes: Number(cardioMinutes) || 0,
      isometric_level: isometricLevel,
      with_weights: withWeights,
      weight_kg: withWeights ? Number(weightKg) || 0 : 0,
      student_notes: notes.trim(),
      created_at: new Date().toISOString()
    };

    // 1. Guardar en localStorage inmediatamente
    try {
      const local = JSON.parse(localStorage.getItem(`ww_home_logs_${studentId}`) || "[]");
      const filtered = local.filter((l: any) => l.training_date !== todayStr);
      filtered.unshift(payload);
      localStorage.setItem(`ww_home_logs_${studentId}`, JSON.stringify(filtered));
      setMonthlyLogs(filtered);
      setTodayLog(payload);
    } catch (e) {
      console.warn("Error guardando home training en localStorage:", e);
    }

    // 2. Persistir en Supabase
    try {
      const { error } = await supabase
        .from("home_training_logs")
        .upsert(payload, { onConflict: "student_id,training_date" });

      if (error) {
        console.warn("Supabase home_training_logs fallback:", error.message);
      }
      setSavedSuccess(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("home_training_logged", { detail: payload }));
      }
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (netErr) {
      console.warn("Excepción de red al guardar entrenamiento en casa:", netErr);
      setSavedSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  // Totales acumulados en el mes
  const totalRopeMonth = monthlyLogs.reduce((acc, l) => acc + (l.rope_jumps_completed || 0), 0);
  const totalCardioMinMonth = monthlyLogs.reduce((acc, l) => acc + (l.cardio_minutes || 0), 0);
  const totalDaysCompleted = monthlyLogs.length;

  return (
    <div className="w-full bg-[#0a0d14] text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
      
      {/* CABECERA: TÍTULO Y BANNER DE DISCIPLINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f66018] to-orange-700 flex items-center justify-center text-white shadow-lg shadow-orange-950/40 shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Entrenamiento Autónomo en Casa
              </h2>
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-[#f66018]/20 text-[#f66018] border border-[#f66018]/30">
                Día {dayNumber} del Reto
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Protocolo para los días sin cancha: Sobrecarga Progresiva &amp; Condicionamiento Aeróbico
            </p>
          </div>
        </div>

        {/* Resumen rápido de acumulación */}
        <div className="flex items-center gap-2">
          <div className="bg-[#121622] px-3 py-1.5 rounded-xl border border-zinc-800 text-center">
            <span className="text-[9px] font-mono uppercase text-zinc-400 block">Saltos Mes</span>
            <span className="text-sm font-mono font-black text-[#f66018]">{totalRopeMonth.toLocaleString()}</span>
          </div>
          <div className="bg-[#121622] px-3 py-1.5 rounded-xl border border-zinc-800 text-center">
            <span className="text-[9px] font-mono uppercase text-zinc-400 block">Cardio Mes</span>
            <span className="text-sm font-mono font-black text-emerald-400">{totalCardioMinMonth} min</span>
          </div>
          <div className="bg-[#121622] px-3 py-1.5 rounded-xl border border-zinc-800 text-center">
            <span className="text-[9px] font-mono uppercase text-zinc-400 block">Sesiones</span>
            <span className="text-sm font-mono font-black text-sky-400">{totalDaysCompleted}</span>
          </div>
        </div>
      </div>

      {/* TARJETA DINÁMICA DE SOBRECARGA PROGRESIVA DIARIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* 1. CUERDA PROGRESIVA */}
        <div className="bg-[#121622] border border-orange-500/20 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-orange-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Meta Diaria Cuerda
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-black">
              +100 Saltos/Día
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {progressiveRopeTarget}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 1,000 máx</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 leading-tight">
            Inicia en 100 brincos y escala +100 por día hasta consolidar la meta élite de 1,000 saltos por sesión.
          </p>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#f66018] to-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progressiveRopeTarget / 1000) * 100)}%` }}
            />
          </div>
        </div>

        {/* 2. CARDIO PROGRESIVO */}
        <div className="bg-[#121622] border border-emerald-500/20 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Cardio Continuo
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black">
              0 a 60 Min
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {cardioMinutes}
            </span>
            <span className="text-xs text-zinc-400 font-mono">minutos hoy</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 leading-tight">
            Trote continuo o carrera sostenida a ritmo alto. Meta progresiva de 1 hora continua.
          </p>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (cardioMinutes / 60) * 100)}%` }}
            />
          </div>
        </div>

        {/* 3. BATERÍA ISOMÉTRICA */}
        <div className="bg-[#121622] border border-sky-500/20 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-sky-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Isometría Core
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-black">
              Nivel {isometricLevel}
            </span>
          </div>
          <div className="text-sm font-black text-white">
            {isometricLevel === 1 && "Nivel 1: Plancha Tradicional"}
            {isometricLevel === 2 && "Nivel 2: Elevación de Pierna Estática"}
            {isometricLevel === 3 && "Nivel 3: Pierna en Arco (Glúteo/Lumbar)"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 leading-tight">
            {withWeights ? `Con polainas de ${weightKg} kg activadas.` : "En autocarga estricta sin flexión de espalda."}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            {[1, 2, 3].map((lvl) => (
              <span 
                key={lvl}
                className={`h-1.5 flex-1 rounded-full ${lvl <= isometricLevel ? "bg-sky-400" : "bg-zinc-800"}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* FORMULARIO DE CONFIRMACIÓN CON UN SOLO BOTÓN */}
      <form onSubmit={handleSaveHomeTraining} className="bg-[#0f131d] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f66018]" />
            <span className="text-xs font-black uppercase text-white tracking-wide">
              Registrar Entrenamiento de Hoy ({todayStr})
            </span>
          </div>
          {todayLog && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Registrado Previamente
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Campo Cuerda */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center justify-between">
              <span>Saltos de Cuerda</span>
              <span className="text-[#f66018] font-mono">Meta: {progressiveRopeTarget}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="2000"
                step="50"
                value={ropeJumps}
                onChange={(e) => setRopeJumps(Number(e.target.value))}
                className="w-full bg-[#171b26] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#f66018]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">saltos</span>
            </div>
          </div>

          {/* Campo Cardio Tipo y Minutos */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-zinc-400">Modalidad de Cardio</label>
            <div className="grid grid-cols-3 gap-1">
              {(["trote", "carrera", "mixto"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setCardioType(t)}
                  className={`py-2 text-[10px] font-black uppercase rounded-lg border transition ${
                    cardioType === t
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-[#171b26] text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative mt-2">
              <input
                type="number"
                min="0"
                max="120"
                step="5"
                value={cardioMinutes}
                onChange={(e) => setCardioMinutes(Number(e.target.value))}
                className="w-full bg-[#171b26] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">minutos</span>
            </div>
          </div>

          {/* Campo Batería Isométrica & Polainas */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-bold uppercase text-zinc-400">Nivel de Plancha Isométrica</label>
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setIsometricLevel(lvl as 1 | 2 | 3)}
                  className={`py-2 text-[10px] font-black uppercase rounded-lg border transition ${
                    isometricLevel === lvl
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/50"
                      : "bg-[#171b26] text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  Nivel {lvl}
                </button>
              ))}
            </div>

            {/* Checkbox Polainas / Carga */}
            <div className="pt-2 flex items-center justify-between bg-[#171b26] px-3 py-2 rounded-xl border border-zinc-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={withWeights}
                  onChange={(e) => setWithWeights(e.target.checked)}
                  className="w-4 h-4 accent-[#f66018] rounded cursor-pointer"
                />
                <span className="font-bold">Con Polainas / Peso Core</span>
              </label>
              {withWeights && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-12 bg-black border border-zinc-700 rounded px-1.5 py-0.5 text-center text-xs font-mono text-white"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono">kg</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Notas Adicionales */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-zinc-400">Sensaciones y Notas del Atleta (Opcional):</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Cumplí los 500 saltos sin detenerme, piernas ligeras tras el trote."
            className="w-full bg-[#171b26] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#f66018]"
          />
        </div>

        {/* BOTÓN ÚNICO DE GUARDADO */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-orange-400" />
            <span>Los registros se sincronizan con la bitácora mensual de Head Coach Ricardo.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#f66018] to-orange-500 hover:brightness-110 active:scale-98 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 cursor-pointer disabled:opacity-50 transition"
          >
            {saving ? (
              <span>Sincronizando...</span>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>¡Entrenamiento Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Confirmar y Guardar Sesión de Hoy</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* BITÁCORA HISTÓRICA RECIENTE EN CASA */}
      {monthlyLogs.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Histórico Reciente de Sesiones en Casa
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {monthlyLogs.slice(0, 6).map((log, idx) => (
              <div 
                key={log.id || idx} 
                className="bg-[#121622] border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="text-white font-bold block">{log.training_date}</span>
                  <span className="text-[10px] text-zinc-400">
                    {log.cardio_minutes} min {log.cardio_type} • Plancha N{log.isometric_level}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#f66018] block">
                    {log.rope_jumps_completed} saltos
                  </span>
                  <span className="text-[9px] text-emerald-400">
                    {log.with_weights ? `+${log.weight_kg}kg` : "Autocarga"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
