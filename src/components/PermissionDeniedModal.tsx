'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Lock, X, ArrowRight } from 'lucide-react';

export function PermissionDeniedModal() {
  const { showPermissionDeniedModal, closeDeniedModal, switchRole } = useAuth();

  if (!showPermissionDeniedModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
        <button
          onClick={closeDeniedModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 mb-3">
          <ShieldAlert className="w-4 h-4" />
          <span>Acceso Restringido</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Permiso Denegado por RBAC</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Esta acción requiere privilegios de <strong className="text-orange-400">Coach</strong>. Como <strong className="text-blue-400">Alumno</strong>, tus permisos son estrictamente de solo lectura para garantizar la fidelidad de las métricas registradas en las sesiones de combine.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              switchRole('coach');
              closeDeniedModal();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all"
          >
            <span>Cambiar a Coach (Modo Evaluación)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={closeDeniedModal}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition-colors"
          >
            Permanecer como Alumno (Solo Lectura)
          </button>
        </div>
      </div>
    </div>
  );
}
