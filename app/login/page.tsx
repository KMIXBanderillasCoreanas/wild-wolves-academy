'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { 
  KeyRound, 
  UserCheck, 
  Flame, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (errorParam === 'coach_only') {
      setErrorMessage('Acceso denegado: El área administrativa requiere permisos de Coach.');
    }
  }, [errorParam]);

  const handleLoginCoach = () => {
    HoopStore.loginAsCoach();
    router.push(redirectParam || '/dashboard-coach');
  };

  const handleLoginStudent = (studentId: string = 'student_01') => {
    HoopStore.loginAsStudent(studentId);
    router.push(redirectParam || '/dashboard-student');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase().includes('coach') || email.toLowerCase().includes('vance')) {
      handleLoginCoach();
    } else {
      handleLoginStudent();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-600/30">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Acceso a HoopPerformance OS</h2>
          <p className="text-xs text-slate-400 mt-1">
            Wild Wolves Academy • Portal de Autenticación &amp; RBAC
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Fast Role Switchers for testing */}
        <div className="mb-8 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
            ⚡ Conmutador Rápido de Roles (Testing Antigravity)
          </div>

          {/* Coach Button */}
          <button
            onClick={handleLoginCoach}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-orange-600/20 to-slate-800 hover:from-orange-600/30 border border-orange-500/40 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Modo Head Coach</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-500/30 text-orange-300">
                    CRUD Total
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Coach Marcus Vance (Evaluador)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Student 1 Button */}
          <button
            onClick={() => handleLoginStudent('student_01')}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-600/20 to-slate-800 hover:from-blue-600/30 border border-blue-500/40 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Modo Alumno #7</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300">
                    Solo Lectura
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Lucas &quot;The Wolf&quot; Morales (PG)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Student 2 Button */}
          <button
            onClick={() => handleLoginStudent('student_02')}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-850 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center font-black text-xs">
                #23
              </div>
              <div>
                <div className="text-xs font-bold text-white">Modo Alumno #23 (Mateo Silva)</div>
                <div className="text-[11px] text-slate-400">Small Forward (SF) • Senior Prep</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold text-[10px]">
              O ingresar con credenciales
            </span>
          </div>
        </div>

        {/* Traditional Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@wildwolves.academy"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all"
          >
            Entrar al Sistema
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Middleware Edge Protection activado. Permisos validados por Cookie criptográfica.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-slate-400 text-xs">Cargando autenticación...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
