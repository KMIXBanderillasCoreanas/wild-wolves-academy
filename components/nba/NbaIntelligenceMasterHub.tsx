// components/nba/NbaIntelligenceMasterHub.tsx
// Centro de Mando Integral: Arquitectura Maestra NBA Intelligence en Wild Wolves OS
'use client';

import React, { useState } from 'react';
import { NbaPlayerExplorer } from './NbaPlayerExplorer';
import { PlayerCareerTimeline } from './PlayerCareerTimeline';
import { InteractiveShotChartKinexon } from './InteractiveShotChartKinexon';
import { StudentVsNbaComparison } from './StudentVsNbaComparison';
import NbaTraditionalStatsViewer from './NbaTraditionalStatsViewer';
import { Sparkles, Key, Database, Layers, ShieldCheck, Flame, Compass, Target, BarChart, Crosshair } from 'lucide-react';

export function NbaIntelligenceMasterHub() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'timeline' | 'shotchart' | 'comparison' | 'traditional'>('explorer');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 my-8 px-4 sm:px-6">
      
      {/* Top Banner: DunkAPI Connection & Credit Protection Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-indigo-900/60 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                DunkAPI Live MCP Connected
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Caché Inteligente Zero-Waste Activo
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Plan Gratuito: ~475 Créditos Protegidos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
              NBA Player Intelligence & DunkAPI Master Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Arquitectura de telemetría multi-proveedor con coordenadas espaciales $(X,Y)$, modelado en 6 dimensiones y normalización formativa por 36 minutos y categorías de edad.
            </p>
          </div>

          {/* MCP Command snippet pill */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Transporte MCP Oficial</div>
            <div className="text-indigo-300 font-semibold select-all break-all">
              https://mcp.dunkapi.com/mcp?key=sk_live_...
            </div>
          </div>
        </div>

        {/* 6 Dimensions Quick Badge Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-6 pt-6 border-t border-indigo-900/40">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono font-bold text-amber-400 block">DIMENSIÓN A</span>
            <span className="text-xs font-bold text-white">Producción Ofensiva</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono font-bold text-blue-400 block">DIMENSIÓN B</span>
            <span className="text-xs font-bold text-white">Mapa de Tiro (X,Y)</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono font-bold text-emerald-400 block">DIMENSIÓN C</span>
            <span className="text-xs font-bold text-white">Creación de Juego</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono font-bold text-cyan-400 block">DIMENSIÓN D</span>
            <span className="text-xs font-bold text-white">Defensa & Tapones</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono font-bold text-purple-400 block">DIMENSIÓN E</span>
            <span className="text-xs font-bold text-white">Eficiencia & P/36m</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono font-bold text-rose-400 block">DIMENSIÓN F</span>
            <span className="text-xs font-bold text-white">Juego Completo</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for the 4 Visualizations */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'explorer'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-4 h-4" />
          A. Explorador Atleta NBA
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'timeline'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <BarChart className="w-4 h-4" />
          B. Línea de Tiempo de Carrera
        </button>

        <button
          onClick={() => setActiveTab('shotchart')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'shotchart'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          C. Mapa de Cancha (Kinexon)
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'comparison'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Target className="w-4 h-4" />
          D. Comparativa Alumno vs NBA
        </button>

        <button
          onClick={() => setActiveTab('traditional')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'traditional'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Database className="w-4 h-4" />
          Tablas Tradicionales (stats.nba.com)
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'explorer' && <NbaPlayerExplorer />}
      {activeTab === 'timeline' && <PlayerCareerTimeline />}
      {activeTab === 'shotchart' && <InteractiveShotChartKinexon />}
      {activeTab === 'comparison' && <StudentVsNbaComparison />}
      {activeTab === 'traditional' && <NbaTraditionalStatsViewer />}

    </div>
  );
}
