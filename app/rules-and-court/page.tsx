'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import CourtRulesEncyclopedia from '@/components/CourtRulesEncyclopedia';
import { NbaIntelligenceMasterHub } from '@/components/nba/NbaIntelligenceMasterHub';

export default function RulesAndCourtPage() {
  return (
    <main className="min-h-screen bg-[#080b11] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ENLACE DE RETORNO Y MIGAS DE PAN */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-orange-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio de Wild Wolves
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              🟢 MÓDULO FORMATIVO PÚBLICO
            </span>
          </div>
        </div>

        {/* COMPONENTE INTERACTIVO DE REGLAMENTO Y DUELA */}
        <CourtRulesEncyclopedia />

        {/* MASTER HUB: ARQUITECTURA NBA PLAYER INTELLIGENCE & DUNKAPI (LAS 4 VISUALIZACIONES) */}
        <NbaIntelligenceMasterHub />
      </div>
    </main>
  );
}
