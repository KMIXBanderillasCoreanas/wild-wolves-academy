// app/nba-intelligence/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Trophy, Crosshair, BarChart3, Target } from 'lucide-react';
import { NbaIntelligenceMasterHub } from '@/components/nba/NbaIntelligenceMasterHub';

export default function NbaIntelligencePage() {
  return (
    <main className="min-h-screen bg-[#06090e] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top breadcrumb bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-orange-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio de Wild Wolves
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              MÓDULO DE INTELIGENCIA DEPORTIVA & TELEMETRÍA NBA
            </span>
          </div>
        </div>

        {/* Master Hub with the 4 Flagship Visualizations */}
        <NbaIntelligenceMasterHub />

      </div>
    </main>
  );
}
