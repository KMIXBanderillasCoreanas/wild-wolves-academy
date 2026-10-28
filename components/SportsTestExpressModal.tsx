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
  // Pruebas Oficiales de Tiro
  const [freeThrowsMade, setFreeThrowsMade] = useState<number>(7); // 10 Tiros Libres
  const [midRangeLeftMade, setMidRangeLeftMade] = useState<number>(6); // 10 Media Distancia Izquierda
  const [midRangeRightMade, setMidRangeRightMade] = useState<number>(6); // 10 Media Distancia Derecha
  const [threePointMade, setThreePointMade] = useState<number>(15); // 25 Tiros Triples (5 spots x 5 tiros)

  // Pruebas Oficiales de Velocidad, Condición y Circuitos
  const [jumpRopeCount, setJumpRopeCount] = useState<number>(50); // Saltos de Cuerda (Mínimo 10)
  const [circuitLinesSec, setCircuitLinesSec] = useState<number>(11.2); // Circuito 1: Línea a Línea
  const [sprint100mSec, setSprint100mSec] = useState<number>(14.5); // Circuito 2: 100 Metros Máxima Velocidad

  const [notes, setNotes] = useState<string>("Evaluación oficial en duela Deportivo Carmen Serdán.");
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Cargar datos previos si existen
  useEffect(() => {
    async function loadPrevious() {
      try {
        const { data: basket } = await supabase
          .from("basketball_skills_logs")
          .select("free_throws_made, mid_range_made, three_point_made, sprint_100m_seconds, lines_round_trip_seconds, coach_notes")
          .eq("student_id", athlete.id)
          .order("test_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (basket) {
          if (basket.free_throws_made !== undefined) setFreeThrowsMade(Math.min(10, basket.free_throws_made));
          if (basket.mid_range_made !== undefined) {
            setMidRangeLeftMade(Math.min(10, Math.round(basket.mid_range_made / 2)));
            setMidRangeRightMade(Math.min(10, Math.round(basket.mid_range_made / 2)));
          }
          if (basket.three_point_made !== undefined) setThreePointMade(Math.min(25, basket.three_point_made));
          if (basket.sprint_100m_seconds !== undefined) setSprint100mSec(basket.sprint_100m_seconds);
          if (basket.lines_round_trip_seconds !== undefined) setCircuitLinesSec(basket.lines_round_trip_seconds);
          if (basket.coach_notes) setNotes(basket.coach_notes);
        }

        const { data: baseline } = await supabase
          .from("student_initial_baseline")
          .select("initial_jump_rope_max")
          .eq("student_id", athlete.id)
          .maybeSingle();

        if (baseline && baseline.initial_jump_rope_max !== undefined) {
          setJumpRopeCount(Math.max(10, baseline.initial_jump_rope_max));
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

      const totalMidRange = Number(midRangeLeftMade) + Number(midRangeRightMade);
      const totalShotsMade = Number(freeThrowsMade) + totalMidRange + Number(threePointMade);
      const shootingPct = Math.round((totalShotsMade / 55) * 100);

      // Calcular OVR integral
      const ropeScore = Math.min(100, Math.round((Number(jumpRopeCount) / 80) * 100));
      const physScore = Math.min(99, Math.max(45, Math.round(ropeScore * 0.75 + 15)));
      const explScore = Math.min(99, Math.max(45, Math.round((Number(sprint100mSec) > 0 ? (15.5 / Number(sprint100mSec)) * 85 : 70))));
      const overallOvr = Math.max(50, Math.min(99, Math.round(shootingPct * 0.55 + physScore * 0.25 + explScore * 0.20)));

      // Mapear tier
      let calculatedTier = "formativo_desarrollo";
      let tierDisplayName = "🐺 Lobo Cazador Avanzado";
      if (overallOvr >= 85 || Number(threePointMade) >= 16) {
        calculatedTier = "competitivo_elite";
        tierDisplayName = "🐺 Lobo Leyenda / Élite FIBA";
      } else if (overallOvr >= 72 || Number(threePointMade) >= 12) {
        calculatedTier = "competitivo_elite";
        tierDisplayName = "🐺 Lobo Alfa Competitivo";
      } else if (overallOvr < 60) {
        calculatedTier = "iniciacion_adaptacion";
        tierDisplayName = "🐺 Lobo en Formación";
      }

      // Guardar de forma robusta e infalible vía API interna (Bypass RLS)
      const res = await fetch("/api/sync-offline-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: [
            {
              student_id: athlete.id,
              athlete_name: athlete.full_name,
              evaluation_date: todayDate,
              overall_ovr: overallOvr,
              calculated_tier: calculatedTier,
              free_throws_made: Number(freeThrowsMade),
              mid_range_made: totalMidRange,
              three_point_made: Number(threePointMade),
              spot_corner_left: Math.round(Number(threePointMade) * 0.2),
              spot_wing_left: Math.round(Number(threePointMade) * 0.2),
              spot_top_key: Math.round(Number(threePointMade) * 0.25),
              spot_wing_right: Math.round(Number(threePointMade) * 0.2),
              spot_corner_right: Math.max(0, Number(threePointMade) - Math.round(Number(threePointMade) * 0.85)),
              jump_rope_count: Number(jumpRopeCount),
              lines_round_trip_seconds: Number(circuitLinesSec),
              sprint_100m_seconds: Number(sprint100mSec),
              vertical_jump_cm: 50,
              squats_3x25_done: true,
              coach_feedback: `${notes || "Evaluación oficial en duela Carmen Serdán."} [TL: ${freeThrowsMade}/10, Media: ${totalMidRange}/20, Triples: ${threePointMade}/25, Cuerda: ${jumpRopeCount}]`
            }
          ]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Error del servidor HTTP ${res.status}`);
      }

      // Respaldo en localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("ww_student_evaluations") || "{}");
        stored[athlete.id] = {
          student_id: athlete.id,
          evaluation_date: todayDate,
          free_throws_pct: Math.round((Number(freeThrowsMade) / 10) * 100),
          mid_range_total: totalMidRange,
          three_point_made: Number(threePointMade),
          jump_rope_count: Number(jumpRopeCount),
          circuit_lines_seconds: Number(circuitLinesSec),
          sprint_seconds: Number(sprint100mSec),
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

  const freeThrowPct = Math.round((freeThrowsMade / 10) * 100);
  const midRangePct = Math.round(((midRangeLeftMade + midRangeRightMade) / 20) * 100);
  const threePointPct = Math.round((threePointMade / 25) * 100);

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
                TL: {freeThrowPct}% • Media: {midRangePct}% • 3PT: {threePointPct}%
              </span>
            </div>

            {/* 10 Tiros Libres */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-zinc-300 font-bold">
                  Tiros Libres Anotados (10 Tiros):
                </label>
                <span className="text-sm font-black text-white">{freeThrowsMade} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={freeThrowsMade}
                onChange={(e) => setFreeThrowsMade(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Media Distancia Izquierda (10) y Derecha (10) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#0b0e16] p-2.5 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-zinc-300 font-bold">Media Lado Izquierdo (10):</label>
                  <span className="text-xs font-black text-purple-300">{midRangeLeftMade}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={midRangeLeftMade}
                  onChange={(e) => setMidRangeLeftMade(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div className="bg-[#0b0e16] p-2.5 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-zinc-300 font-bold">Media Lado Derecho (10):</label>
                  <span className="text-xs font-black text-purple-300">{midRangeRightMade}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={midRangeRightMade}
                  onChange={(e) => setMidRangeRightMade(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

            {/* 25 Tiros Triples (5 spots x 5 tiros) */}
            <div className="bg-[#0b0e16] p-2.5 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-zinc-300 font-bold">
                  Tiros Triples (25 Tiros en 5 Spots Diferentes):
                </label>
                <span className="text-xs font-black text-amber-400">{threePointMade} / 25</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={threePointMade}
                onChange={(e) => setThreePointMade(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[9px] text-zinc-500 block mt-1 font-mono">
                5 puntos de la cancha: Esquina Izq, 45° Izq, Centro, 45° Der, Esquina Der (5 tiros c/u).
              </span>
            </div>
          </div>

          {/* BLOQUE 2: PRUEBAS DE CONDICIÓN, CIRCUITOS & VELOCIDAD */}
          <div className="bg-[#121724] border border-amber-500/30 p-3.5 rounded-2xl space-y-3">
            <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 2. Circuitos, Cuerda & Velocidad
            </span>

            {/* Saltos de Cuerda (Mínimo 10) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-zinc-300 font-bold">
                  Saltos de Cuerda (Mínimo 10 saltos):
                </label>
                <span className="text-xs font-mono font-black text-emerald-400">{jumpRopeCount} saltos</span>
              </div>
              <input
                type="number"
                min="10"
                step="5"
                max="2000"
                value={jumpRopeCount}
                onChange={(e) => setJumpRopeCount(Math.max(10, Number(e.target.value)))}
                className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-emerald-400 font-black text-center text-sm"
              />
            </div>

            {/* Los 2 Circuitos Test: Línea a Línea y 100 Metros */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#0b0e16] p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-amber-300 font-bold block mb-1">
                  Circuito 1: Línea a Línea (segundos)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="40"
                  value={circuitLinesSec}
                  onChange={(e) => setCircuitLinesSec(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-amber-300 font-black text-center text-sm"
                />
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">Ida y vuelta de duela</span>
              </div>

              <div className="bg-[#0b0e16] p-2.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] text-sky-300 font-bold block mb-1">
                  Circuito 2: 100 Metros Max (segundos)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="9"
                  max="35"
                  value={sprint100mSec}
                  onChange={(e) => setSprint100mSec(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-zinc-700 rounded-xl py-2 px-3 text-sky-300 font-black text-center text-sm"
                />
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">Sprint a máxima velocidad</span>
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
