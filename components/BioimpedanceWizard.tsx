'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  Sparkles, 
  Activity, 
  Flame, 
  Droplet, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  TrendingDown,
  TrendingUp,
  Download
} from 'lucide-react';

interface BioimpedanceData {
  studentId: string;
  studentName: string;
  weightKg: number;
  bodyFatPct: number;
  waterPct: number;
  muscleMassKg: number;
  visceralFatLevel: number;
}

interface NutritionalPlan {
  bmrKcal: number;
  tdeeKcal: number;
  leanMassKg: number;
  fatMassKg: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatsGrams: number;
  hydrationLiters: number;
  strategy: 'Recomposición Muscular' | 'Déficit para Agilidad' | 'Superávit Hipertrofia & Salto';
  dailyMenu: {
    breakfast: string;
    preWorkout: string;
    postWorkout: string;
    dinner: string;
  };
}

interface BioimpedanceWizardProps {
  students: { id: string; fullName: string; currentTier?: string }[];
  onSaveReport?: (studentId: string, data: BioimpedanceData, plan: NutritionalPlan) => void;
}

export default function BioimpedanceWizard({
  students = [],
  onSaveReport
}: BioimpedanceWizardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [weightKg, setWeightKg] = useState<number>(68.5);
  const [bodyFatPct, setBodyFatPct] = useState<number>(14.5);
  const [waterPct, setWaterPct] = useState<number>(58.0);
  const [muscleMassKg, setMuscleMassKg] = useState<number>(55.2);
  const [visceralFatLevel, setVisceralFatLevel] = useState<number>(4);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<NutritionalPlan | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || {
    id: 'demo',
    fullName: 'Bruno Díaz',
    currentTier: 'competitivo_elite'
  };

  // Cálculo Katch-McArdle y dosificación nutricional FIBA
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const fatMass = Number(((weightKg * bodyFatPct) / 100).toFixed(1));
    const leanMass = Number((weightKg - fatMass).toFixed(1));

    // Katch-McArdle: BMR = 370 + (21.6 * LeanMassKG)
    const bmr = Math.round(370 + (21.6 * leanMass));
    // Factor de actividad basquetbol competitivo (1.6 a 1.75)
    const tdee = Math.round(bmr * 1.65);

    // Dosificación de proteína: 2.2g por kg de masa magra
    const proteinGrams = Math.round(leanMass * 2.2);
    // Grasas: 0.9g por kg de peso total
    const fatsGrams = Math.round(weightKg * 0.9);
    // Carbohidratos: restantes para cubrir calorías de alta intensidad
    const proteinKcal = proteinGrams * 4;
    const fatsKcal = fatsGrams * 9;
    const carbsKcal = Math.max(800, tdee - (proteinKcal + fatsKcal));
    const carbsGrams = Math.round(carbsKcal / 4);

    // Hidratación deportiva: 40ml por kg + 500ml compensación duela
    const hydration = Number(((weightKg * 0.04) + 0.5).toFixed(1));

    let strat: 'Recomposición Muscular' | 'Déficit para Agilidad' | 'Superávit Hipertrofia & Salto' = 'Recomposición Muscular';
    if (bodyFatPct > 18.0) strat = 'Déficit para Agilidad';
    else if (bodyFatPct < 11.0) strat = 'Superávit Hipertrofia & Salto';

    const plan: NutritionalPlan = {
      bmrKcal: bmr,
      tdeeKcal: tdee,
      leanMassKg: leanMass,
      fatMassKg: fatMass,
      targetProteinGrams: proteinGrams,
      targetCarbsGrams: carbsGrams,
      targetFatsGrams: fatsGrams,
      hydrationLiters: hydration,
      strategy: strat,
      dailyMenu: {
        breakfast: 'Omelette de 3 claras + 1 huevo entero con espinacas y 2 tortillas de maíz + 1 taza de avena con manzana.',
        preWorkout: '1 plátano maduro + 30g de crema de cacahuate o 1 barra de cereal 45 min antes de entrar a la duela.',
        postWorkout: 'Batido con 1 scoop de proteína aislada + 300ml de leche de almendras/deslactosada + 1 taza de frutos rojos para recarga glucogénica inmediata.',
        dinner: '180g de pechuga de pollo o atún a la plancha con ensalada verde mixta, aguacate (40g) y 1 taza de arroz al vapor o camote asado.'
      }
    };

    setGeneratedPlan(plan);
    setIsCalculated(true);

    if (onSaveReport) {
      onSaveReport(
        selectedStudentId,
        {
          studentId: selectedStudentId,
          studentName: selectedStudent.fullName,
          weightKg,
          bodyFatPct,
          waterPct,
          muscleMassKg,
          visceralFatLevel
        },
        plan
      );
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      
      {/* 1. ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
              MÉDICO &amp; PREPARACIÓN FÍSICA • BÁSCULA
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <span>Wizard de Bioimpedancia &amp; Plan Nutricional</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ingreso táctico en 5 segundos desde duela para atletas de Wild Wolves CDMX.
          </p>
        </div>

        {/* SELECTOR DE ATLETA */}
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
            Atleta a Calibrar:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setIsCalculated(false);
            }}
            className="w-full sm:w-56 bg-[#141926] border border-zinc-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition"
          >
            {students.length > 0 ? (
              students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName}
                </option>
              ))
            ) : (
              <option value="demo">Bruno Díaz (Alumno Demo)</option>
            )}
          </select>
        </div>
      </div>

      {/* 2. FORMULARIO DE 5 PARÁMETROS DE LA BÁSCULA */}
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          {/* PESO (KG) */}
          <div className="bg-[#121624] border border-zinc-800 p-3.5 rounded-2xl focus-within:border-purple-500 transition">
            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
              1. Peso Total (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-xl font-mono font-black text-white outline-none"
              required
            />
          </div>

          {/* % GRASA */}
          <div className="bg-[#121624] border border-zinc-800 p-3.5 rounded-2xl focus-within:border-purple-500 transition">
            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
              2. Grasa (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={bodyFatPct}
              onChange={(e) => setBodyFatPct(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-xl font-mono font-black text-amber-400 outline-none"
              required
            />
          </div>

          {/* % AGUA */}
          <div className="bg-[#121624] border border-zinc-800 p-3.5 rounded-2xl focus-within:border-purple-500 transition">
            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
              3. Agua Corporal (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={waterPct}
              onChange={(e) => setWaterPct(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-xl font-mono font-black text-cyan-400 outline-none"
              required
            />
          </div>

          {/* MASA MUSCULAR */}
          <div className="bg-[#121624] border border-zinc-800 p-3.5 rounded-2xl focus-within:border-purple-500 transition">
            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
              4. M. Muscular (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={muscleMassKg}
              onChange={(e) => setMuscleMassKg(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-xl font-mono font-black text-emerald-400 outline-none"
              required
            />
          </div>

          {/* GRASA VISCERAL */}
          <div className="bg-[#121624] border border-zinc-800 p-3.5 rounded-2xl focus-within:border-purple-500 transition col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
              5. Grasa Visceral
            </label>
            <input
              type="number"
              step="1"
              value={visceralFatLevel}
              onChange={(e) => setVisceralFatLevel(parseInt(e.target.value) || 1)}
              className="w-full bg-transparent text-xl font-mono font-black text-purple-400 outline-none"
              required
            />
          </div>

        </div>

        {/* BOTÓN CALCULAR EN 1 CLICK */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generar Plan Nutricional &amp; Biomecánico IA</span>
        </button>
      </form>

      {/* 3. REPORTE RESULTANTE DESPLEGABLE */}
      {isCalculated && generatedPlan && (
        <div className="space-y-5 pt-4 border-t border-zinc-800 animate-fadeIn">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase text-white tracking-wider">
                Diagnóstico de {selectedStudent.fullName}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Estrategia: {generatedPlan.strategy}
            </span>
          </div>

          {/* 4 PILLS DE MACRONUTRIENTES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            
            <div className="bg-[#121624] p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Gasto Diario (TDEE)</span>
              <span className="text-xl font-black text-white font-mono">{generatedPlan.tdeeKcal}</span>
              <span className="text-[9px] text-zinc-500 block">kcal / día</span>
            </div>

            <div className="bg-[#121624] p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Proteína Pura</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{generatedPlan.targetProteinGrams}g</span>
              <span className="text-[9px] text-emerald-500 block">2.2 g/kg masa magra</span>
            </div>

            <div className="bg-[#121624] p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Carbohidratos Duela</span>
              <span className="text-xl font-black text-amber-400 font-mono">{generatedPlan.targetCarbsGrams}g</span>
              <span className="text-[9px] text-amber-500 block">Energía explosiva</span>
            </div>

            <div className="bg-[#121624] p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Agua &amp; Electrolitos</span>
              <span className="text-xl font-black text-cyan-400 font-mono">{generatedPlan.hydrationLiters}L</span>
              <span className="text-[9px] text-cyan-500 block">Mínimo diario</span>
            </div>

          </div>

          {/* MENU SUGERIDO FIBA / PREPARADOR FÍSICO */}
          <div className="bg-[#0e121d] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Pauta Alimenticia Oficial Carmen Serdán</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#141926] p-3 rounded-xl border border-zinc-800">
                <strong className="text-orange-400 block text-[11px] mb-1 font-mono uppercase">Desayuno de Enfoque:</strong>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{generatedPlan.dailyMenu.breakfast}</p>
              </div>

              <div className="bg-[#141926] p-3 rounded-xl border border-zinc-800">
                <strong className="text-amber-400 block text-[11px] mb-1 font-mono uppercase">Pre-Entrenamiento (45 min antes):</strong>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{generatedPlan.dailyMenu.preWorkout}</p>
              </div>

              <div className="bg-[#141926] p-3 rounded-xl border border-zinc-800">
                <strong className="text-emerald-400 block text-[11px] mb-1 font-mono uppercase">Post-Entrenamiento Inmediato:</strong>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{generatedPlan.dailyMenu.postWorkout}</p>
              </div>

              <div className="bg-[#141926] p-3 rounded-xl border border-zinc-800">
                <strong className="text-cyan-400 block text-[11px] mb-1 font-mono uppercase">Cena Regenerativa:</strong>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{generatedPlan.dailyMenu.dinner}</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
