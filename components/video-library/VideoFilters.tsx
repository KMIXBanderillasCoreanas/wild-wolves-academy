'use client';

import React from 'react';
import { VideoTheme, VideoCategory } from '@/lib/types/video-library';
import { Award, Bookmark, Layers, Flame, Dumbbell, HeartPulse } from 'lucide-react';

interface VideoFiltersProps {
  activeTheme: 'todos' | VideoTheme;
  activeCategory: 'todas' | VideoCategory;
  officialOnly: boolean;
  favoritesOnly: boolean;
  onThemeChange: (theme: 'todos' | VideoTheme) => void;
  onCategoryChange: (category: 'todas' | VideoCategory) => void;
  onOfficialToggle: () => void;
  onFavoritesToggle: () => void;
  favoritesCount?: number;
}

export default function VideoFilters({
  activeTheme,
  activeCategory,
  officialOnly,
  favoritesOnly,
  onThemeChange,
  onCategoryChange,
  onOfficialToggle,
  onFavoritesToggle,
  favoritesCount = 0
}: VideoFiltersProps) {
  const themeTabs = [
    { id: 'todos' as const, label: 'Todo el Catálogo', icon: Layers },
    { id: 'baloncesto' as const, label: 'Básquetbol', icon: Flame }
  ];

  const categoriesByTheme: Record<string, { id: 'todas' | VideoCategory; label: string }[]> = {
    todos: [
      { id: 'todas', label: 'Todas las Especialidades' },
      { id: 'baloncesto_tiro', label: 'Tiro & Gather Step' },
      { id: 'baloncesto_drible', label: 'Drible & Desaceleración' },
      { id: 'baloncesto_defensa', label: 'Postura Defensiva' },
      { id: 'baloncesto_pick_roll', label: 'Pick & Roll' },
      { id: 'preparacion_fisica_salto', label: 'Salto Vertical' },
      { id: 'preparacion_fisica_calistenia', label: 'Calistenia 3x25' },
      { id: 'educacion_hidratacion', label: 'Hidratación Duela' }
    ],
    baloncesto: [
      { id: 'todas', label: 'Todo Básquetbol' },
      { id: 'baloncesto_tiro', label: 'Mecánica de Tiro' },
      { id: 'baloncesto_drible', label: 'Crossover y Desaceleración' },
      { id: 'baloncesto_defensa', label: 'Defensa Perimetral' },
      { id: 'baloncesto_pick_roll', label: 'Táctica Pick & Roll' }
    ],
    preparacion_fisica: [
      { id: 'todas', label: 'Toda la Preparación Física' },
      { id: 'preparacion_fisica_salto', label: 'Salto & Pliometría' },
      { id: 'preparacion_fisica_calistenia', label: 'Calistenia de Autocarga' },
      { id: 'preparacion_fisica_core', label: 'Isometría y Core' }
    ],
    educacion_deportiva: [
      { id: 'todas', label: 'Toda Educación' },
      { id: 'educacion_nutricion', label: 'Nutrición Juvenil' },
      { id: 'educacion_hidratacion', label: 'Electrolitos & Hidratación' },
      { id: 'educacion_psicologia', label: 'Mentalidad Ultra Instinto' }
    ]
  };

  const currentCategories = categoriesByTheme[activeTheme] || categoriesByTheme.todos;

  return (
    <div className="w-full space-y-3">
      {/* Pestañas de Temáticas Principales y Filtros Globales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        {/* Temáticas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {themeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTheme === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onThemeChange(tab.id);
                  onCategoryChange('todas');
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-[#0f1422] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Toggles: Oficial y Favoritos */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOfficialToggle}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition ${
              officialOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-[#0f1422] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            Curriculum Oficial
          </button>

          <button
            type="button"
            onClick={onFavoritesToggle}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition ${
              favoritesOnly
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.25)]'
                : 'bg-[#0f1422] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5 text-fuchsia-400" />
            Favoritos {favoritesCount > 0 && `(${favoritesCount})`}
          </button>
        </div>
      </div>

      {/* Subcategorías específicas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {currentCategories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 font-black shadow'
                  : 'bg-[#0a0f1d] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
