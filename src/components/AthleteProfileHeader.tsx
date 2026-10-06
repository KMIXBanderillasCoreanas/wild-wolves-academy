'use client';

import React from 'react';
import { Athlete } from '@/types/basketball';
import { 
  ShieldCheck, 
  CreditCard, 
  ChevronDown, 
  Ruler, 
  Weight, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface AthleteProfileHeaderProps {
  athletes: Athlete[];
  selectedAthlete: Athlete;
  onSelectAthlete: (athlete: Athlete) => void;
  onOpenStripeModal: () => void;
}

export function AthleteProfileHeader({
  athletes,
  selectedAthlete,
  onSelectAthlete,
  onOpenStripeModal,
}: AthleteProfileHeaderProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar + Details */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-xl shadow-orange-500/20 bg-slate-800">
              <img
                src={selectedAthlete.avatar}
                alt={selectedAthlete.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white font-black text-xs px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow-md">
              #{selectedAthlete.jerseyNumber}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {selectedAthlete.position}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {selectedAthlete.category}
              </span>
              <button
                onClick={onOpenStripeModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3 h-3" />
                <span>{selectedAthlete.planName}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedAthlete.name}
              </h1>

              {/* Athlete Switcher Dropdown */}
              <div className="relative inline-block">
                <select
                  value={selectedAthlete.id}
                  onChange={(e) => {
                    const found = athletes.find((a) => a.id === e.target.value);
                    if (found) onSelectAthlete(found);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-700 cursor-pointer focus:outline-none focus:border-orange-500"
                >
                  {athletes.map((ath) => (
                    <option key={ath.id} value={ath.id} className="bg-slate-900 text-white">
                      Cambiar Atleta: #{ath.jerseyNumber} {ath.name} ({ath.position.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Physical specs bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2.5">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-orange-400" />
                <span>Estatura: <strong className="text-slate-200">{selectedAthlete.height}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Weight className="w-4 h-4 text-orange-400" />
                <span>Peso: <strong className="text-slate-200">{selectedAthlete.weight}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>Edad: <strong className="text-slate-200">{selectedAthlete.age} años</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Membership status card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between w-full md:w-auto min-w-[220px]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado de Membresía</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Suscripción Activa
            </span>
          </div>
          <div className="text-sm font-black text-white">{selectedAthlete.planName}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Acceso a Combine, Radar & Coaching</p>
          <button
            onClick={onOpenStripeModal}
            className="mt-3 w-full py-1.5 px-3 bg-slate-700 hover:bg-slate-650 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Gestionar Stripe Checkout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
