"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Target,
  Zap,
  Activity,
  Flame,
  CheckCircle2,
  Save,
  RotateCcw,
  Search,
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  X
} from "lucide-react";

interface AthleteItem {
  id: string;
  full_name: string;
  category?: string;
  current_tier?: string;
}

interface SportsTestExpressModalProps {
  athlete: {
    id: string;
    full_name: string;
    category?: string;
  };
  onClose: () => void;
  onSaved?: () => void;
}

export default function SportsTestExpressModal({
  athlete,
  onClose,
  onSaved,
}: SportsTestExpressModalProps) {
  // Pruebas Iniciales de Tiro
  const [freeThrowsMade, setFreeThrowsMade] = useState<number>(12); // de 20 tiros
  const [midRangeMade, setMidRangeMade] = useState<number>(6); // de 10 tiros
  const [threePointMade, setThreePointMade] = useState<number>(3); // de 10 tiros

  // Pruebas Iniciales de Velocidad y Condición
  const [sprint100mSec, setSprint100mSec] = useState<number>(14.5); // segundos
  const [tTestAgilitySec, setTTestAgilitySec] = useState<number>(10.8); // segundos
  const [courtLaps, setCourtLaps] = useState<number>(6); // vueltas duela
  const [jumpRopeCount, setJumpRopeCount] = useState<number>(150); // saltos

  const [notes, setNotes] = useState<string>("Evaluación inicial directa en cancha Carmen Serdán.");
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Cargar datos previos si existen
  useEffect(() => {
    async function loadPrevious() {
      try {
        const { data: basket } = await supabase
          .from("basketball_skills_logs")
          .select("free_throws_made, mid_range_made, three_point_made, sprint_100m_seconds")
          .eq("student_id", athlete.id)
          .order("test_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (basket) {
          if (basket.free_throws_made !== undefined) setFreeThrowsMade(basket.free_throws_made);
          if (basket.mid_range_made !== undefined) setMidRangeMade(basket.mid_range_made);
          if (basket.three_point_made !== undefined) setThreePointMade(basket.three_point_made);
          if (basket.sprint_100m_seconds !== undefined) setSprint100mSec(basket.sprint_100m_seconds);
        }

        const { data: baseline } = await supabase
          .from("student_initial_baseline")
          .select("initial_laps_completed, initial_jump_rope_max")
          .eq("student_id", athlete.id)
          .maybeSingle();

        if (baseline) {
          if (baseline.initial_laps_completed !== undefined) setCourtLaps(baseline.initial_laps_completed);
          if (baseline.initial_jump_rope_max !== undefined) setJumpRopeCount(baseline.initial_jump_rope_max);
        }
      } catch (e) {
        console.warn("Fallo cargando historial previo del atleta:", e);
      }
    }
    loadPrevious();
  }, [athlete.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());

    try {
      const coachUser = await supabase.auth.getUser();
      const coachId = coachUser.data?.user?.id || null;

      // 1. Guardar en basketball_skills_logs
      await supabase.from("basketball_skills_logs").insert({
        student_id: athlete.id,
        coach_id: coachId,
        test_date: todayDate,
        shooting_base_attempts: 20,
        free_throws_made: Number(freeThrowsMade),
        mid_range_made: Number(midRangeMade),
        three_point_made: Number(threePointMade),
        sprint_100m_seconds: Number(sprint100mSec),
        lines_round_trip_seconds: Number(tTestAgilitySec),
        coach_notes: notes,
      });

      // 2. Guardar en student_initial_baseline
      await supabase.from("student_initial_baseline").upsert(
        {
          student_id: athlete.id,
          coach_id: coachId,
          entry_date: todayDate,
          initial_laps_completed: Number(courtLaps),
          initial_jump_rope_max: Number(jumpRopeCount),
          initial_posture_notes: `Prueba en Cancha: ${freeThrowsMade}/20 TL, 100m: ${sprint100mSec}s, T-Test: ${tTestAgilitySec}s.`,
        },
        { onConflict: "student_id" }
      );

      // Respaldo en localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("ww_student_evaluations") || "{}");
        stored[athlete.id] = {
          student_id: athlete.id,
          evaluation_date: todayDate,
          shooting_percentage: Math.round((Number(freeThrowsMade) / 20) * 100),
          sprint_seconds: Number(sprint100mSec),
          court_laps: Number(courtLaps),
        };
        localStorage.setItem("ww_student_evaluations", JSON.stringify(stored));
      } catch {}

      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      alert("Error al guardar prueba deportiva: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const freeThrowPct = Math.round((freeThrowsMade / 20) * 100);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d1017] border-2 border-purple-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-purple-950/50 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                Prueba Deportiva Inicial en Cancha
              </span>
              <h3 className="text-base font-black uppercase text-white truncate max-w-[240px] sm:max-w-none">
                {athlete.full_name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>✅ Prueba guardada al instante en el expediente del alumno.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* BLOQUE 1: PRUEBAS DE TIRO */}
          <div className="bg-[#121724] border border-purple-500/30 p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-purple-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" /> 1. Pruebas de Tiro
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Efectividad TL: {freeThrowPct}%
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-zinc-300 font-bold">
                  Tiros Libres Anotados (Base oficial de 20 tiros):
                </label>
                <span className="text-sm font-black text-white">{freeThrowsMade} / 20</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={freeThrowsMade}
                onChange={(e) => setFreeThrowsMade(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Media Distancia (/10):</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={midRangeMade}
                  onChange={(e) => setMidRangeMade(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-white font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Triples (/10):</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={threePointMade}
                  onChange={(e) => setThreePointMade(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-white font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: PRUEBAS DE VELOCIDAD & AGILIDAD */}
          <div className="bg-[#121724] border border-amber-500/30 p-3.5 rounded-2xl space-y-3">
            <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 2. Pruebas de Velocidad & Condición
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Sprint 100m (segundos):</label>
                <input
                  type="number"
                  step="0.1"
                  min="9"
                  max="30"
                  value={sprint100mSec}
                  onChange={(e) => setSprint100mSec(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-amber-300 font-black text-center text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Circuito T-Test (segundos):</label>
                <input
                  type="number"
                  step="0.1"
                  min="7"
                  max="25"
                  value={tTestAgilitySec}
                  onChange={(e) => setTTestAgilitySec(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-amber-300 font-black text-center text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Vueltas a la Cancha (Laps):</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={courtLaps}
                  onChange={(e) => setCourtLaps(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-white font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Saltos de Cuerda Max:</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  max="2000"
                  value={jumpRopeCount}
                  onChange={(e) => setJumpRopeCount(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-white font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Observaciones en Cancha (Opcional):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#121724] border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-950/50 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Guardar Prueba Deportiva"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
