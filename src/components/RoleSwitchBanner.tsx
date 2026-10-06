'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Lock, 
  Unlock, 
  ArrowRightLeft,
  KeyRound
} from 'lucide-react';

export function RoleSwitchBanner() {
  const { currentUser, role, isCoach, switchRole } = useAuth();

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 text-xs py-2.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Current Active Role status */}
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg border ${
            isCoach 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {isCoach ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RBAC Security Guard:</span>
            {isCoach ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                ROL: COACH (Permisos de Escritura &amp; Evaluación)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <ShieldAlert className="w-3.5 h-3.5" />
                ROL: ALUMNO (Modo Seguro - Solo Lectura)
              </span>
            )}
          </div>
        </div>

        {/* Center / Right: Active User info & Role Switcher Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-600"
            />
            <span>Sesión activa: <strong className="text-white">{currentUser.name}</strong></span>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 gap-1">
            <button
              onClick={() => switchRole('coach')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                isCoach
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              <span>Coach</span>
            </button>
            <button
              onClick={() => switchRole('alumno')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                !isCoach
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Alumno</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
