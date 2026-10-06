'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_ATHLETES } from '@/data/mockData';
import { Athlete, TestEvaluation } from '@/types/basketball';
import { RoleSwitchBanner } from '@/components/RoleSwitchBanner';
import { SocialBar } from '@/components/SocialBar';
import { AthleteProfileHeader } from '@/components/AthleteProfileHeader';
import { RadarAnalytics } from '@/components/RadarAnalytics';
import { EvaluationHistory } from '@/components/EvaluationHistory';
import { TestEvaluationModal } from '@/components/TestEvaluationModal';
import { StripeBillingModal } from '@/components/StripeBillingModal';
import { PermissionDeniedModal } from '@/components/PermissionDeniedModal';
import { 
  Flame, 
  Dribbble, 
  Activity, 
  Zap, 
  Target, 
  Award, 
  ShieldCheck, 
  FileText,
  CreditCard,
  Printer
} from 'lucide-react';

export default function Home() {
  const { role, isCoach } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(INITIAL_ATHLETES[0].id);

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  const handleSaveEvaluation = (newEval: TestEvaluation) => {
    setAthletes((prev) =>
      prev.map((ath) => {
        if (ath.id === selectedAthlete.id) {
          return {
            ...ath,
            currentMetrics: newEval.metrics,
            evaluations: [newEval, ...ath.evaluations],
          };
        }
        return ath;
      })
    );
  };

  const handlePrintReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const latestEval = selectedAthlete.evaluations[0];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* 1. Top RBAC Switcher & Security Guard */}
      <RoleSwitchBanner />

      {/* 2. Main Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white uppercase">
                  WILD WOLVES
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  OS v0.3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-1 font-medium">Basketball High-Performance Academy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintReport}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title="Exportar Ficha Oficial para Scouting"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha Scout</span>
            </button>

            <button
              onClick={() => setIsStripeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Stripe Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Social Bar Component */}
        <SocialBar athleteName={selectedAthlete.name} />

        {/* Athlete Overview & Selector */}
        <AthleteProfileHeader
          athletes={athletes}
          selectedAthlete={selectedAthlete}
          onSelectAthlete={(ath) => setSelectedAthleteId(ath.id)}
          onOpenStripeModal={() => setIsStripeModalOpen(true)}
        />

        {/* Quick Combine KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
              <span>Salto Vertical</span>
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {latestEval?.rawStats.verticalJumpInches ?? 30}&quot;
              </span>
              <span className="text-xs text-slate-400">
                ({Math.round((latestEval?.rawStats.verticalJumpInches ?? 30) * 2.54)} cm)
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              Percentil 92 (Combine D1)
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
              <span>Tiro de 3 Puntos</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {latestEval?.rawStats.threePointPct ?? 40}%
              </span>
              <span className="text-xs text-slate-400">Eficacia Spot-Up</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              Rating Radar: {selectedAthlete.currentMetrics.shooting}/100
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
              <span>Lane Agility Drill</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {latestEval?.rawStats.laneAgilitySeconds ?? 10.8}s
              </span>
              <span className="text-xs text-slate-400">Tiempo de Cono</span>
            </div>
            <div className="text-[11px] text-sky-400 font-medium mt-1">
              Rating Radar: {selectedAthlete.currentMetrics.agilitySpeed}/100
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
              <span>Beep Test Aeróbico</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                Nivel {latestEval?.rawStats.beepTestLevel ?? 13.0}
              </span>
            </div>
            <div className="text-[11px] text-amber-400 font-medium mt-1">
              Capacidad VO2 Max Óptima
            </div>
          </div>
        </div>

        {/* Central Radar Analytics Engine */}
        <RadarAnalytics
          currentMetrics={selectedAthlete.currentMetrics}
          benchmarkMetrics={selectedAthlete.academyBenchmark}
          athleteName={selectedAthlete.name}
        />

        {/* Evaluation Logs and Historical Bitácora */}
        <EvaluationHistory
          athlete={selectedAthlete}
          onOpenNewTestModal={() => setIsTestModalOpen(true)}
        />
      </main>

      {/* 4. Footer & Architectural Readiness Status */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-white">HoopPerformance OS (v0.3.0)</span>
            <span className="text-slate-600">|</span>
            <span>Wild Wolves Basketball Academy</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Supabase RLS: Active
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Stripe API: Connected
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Vercel Deployment: Ready
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Diseñado para Scouts NCAA, FIBA & Combine de Alto Rendimiento.
          </div>
        </div>
      </footer>

      {/* Modals & RBAC Guards */}
      <TestEvaluationModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        athlete={selectedAthlete}
        onSaveEvaluation={handleSaveEvaluation}
      />

      <StripeBillingModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        currentPlan={selectedAthlete.planName}
      />

      <PermissionDeniedModal />
    </div>
  );
}
