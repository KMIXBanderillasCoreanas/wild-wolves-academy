'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { User } from '@/lib/types';
import { 
  Flame, 
  KeyRound, 
  LogOut, 
  Instagram, 
  Youtube, 
  Facebook, 
  MessageCircle, 
  ArrowRightLeft,
  Download
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(HoopStore.getCurrentUser());

    const handleAuthChange = () => {
      setCurrentUser(HoopStore.getCurrentUser());
    };

    window.addEventListener('auth_changed', handleAuthChange);
    return () => window.removeEventListener('auth_changed', handleAuthChange);
  }, []);

  const handleQuickToggleRole = () => {
    if (!currentUser || currentUser.role === 'coach') {
      const studentUser = HoopStore.loginAsStudent('student_01');
      setCurrentUser(studentUser);
      router.push('/dashboard-student');
    } else if (currentUser.role === 'student') {
      const parentUser = HoopStore.loginAsParent('student_01');
      setCurrentUser(parentUser);
      router.push('/dashboard-student');
    } else {
      const coachUser = HoopStore.loginAsCoach();
      setCurrentUser(coachUser);
      router.push('/dashboard-coach');
    }
  };

  const handleLogout = () => {
    HoopStore.logout();
    setCurrentUser(null);
    router.push('/login');
  };

  const isCoach = currentUser?.role === 'coach';

  return (
    <nav className="bg-[#0a0e17] border-b border-[#27272a] sticky top-0 z-50 font-sans">
      {/* 1. Barra de Canales Oficiales y Redes Sociales */}
      <div className="bg-[#18181b] border-b border-[#27272a] px-4 py-1.5 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-300">WILD WOLVES CDMX:</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">Academia Oficial de Baloncesto</span>
          </div>

          {/* Enlaces Oficiales a Redes Sociales */}
          <div className="flex items-center gap-3">
            {/* WhatsApp Oficial: 01 55 2242 7769 */}
            <a
              href="https://wa.me/525522427769?text=Hola%20Coach%2C%20solicito%20informaci%C3%B3n%20sobre%20las%20clases%20de%20baloncesto%20Wild%20Wolves"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
              title="WhatsApp: 01 55 2242 7769"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp (55 2242 7769)</span>
            </a>
            <span className="text-zinc-700">|</span>
            {/* Instagram: https://www.instagram.com/wild_wolves_cdmx/ */}
            <a
              href="https://www.instagram.com/wild_wolves_cdmx/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
              title="@wild_wolves_cdmx"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@wild_wolves_cdmx</span>
            </a>
            <span className="text-zinc-700">|</span>
            {/* TikTok: https://www.tiktok.com/@wild_wolves_cdmx */}
            <a
              href="https://www.tiktok.com/@wild_wolves_cdmx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              title="TikTok Oficial"
            >
              <svg width="14" height="14" style={{ minWidth: 14, minHeight: 14 }} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.37a6.34 6.34 0 0 0-1-.08 6.34 6.34 0 0 0-6.33 6.34 6.34 0 0 0 6.33 6.37 6.34 6.34 0 0 0 6.33-6.37V9.75a8.16 8.16 0 0 0 5.08 1.75V8.05a4.83 4.83 0 0 1-1.15-1.36z" />
              </svg>
              <span>TikTok</span>
            </a>
            <span className="text-zinc-700">|</span>
            {/* Facebook Oficial */}
            <a
              href="https://www.facebook.com/profile.php?id=61590139041471"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              title="Facebook Wild Wolves"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Facebook</span>
            </a>
            <span className="text-zinc-700">|</span>
            {/* YouTube Oficial: @WildWolvesCDMX */}
            <a
              href="https://www.youtube.com/@WildWolvesCDMX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors font-medium"
              title="Canal Oficial de YouTube @WildWolvesCDMX"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <span className="text-zinc-700">|</span>
            {/* Botón Universal de Instalación PWA */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-pwa-install'));
                }
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 font-bold border border-orange-500/30 transition-all cursor-pointer text-[11px]"
              title="Instalar App en Windows, Android, iPhone o Mac"
            >
              <Download className="w-3 h-3 animate-pulse" />
              <span>Instalar App 📲</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Barra de Navegación Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logotipo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black shadow-md">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white uppercase font-sans">
                WILD WOLVES CDMX
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                OS v0.3.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 -mt-1">
              Basketball High-Performance OS • $50/Clase
            </p>
          </div>
        </Link>

        {/* Enlaces de Navegación */}
        {/* Enlaces de Navegación Seguros */}
        <div className="hidden md:flex items-center gap-1.5 font-mono text-xs">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/'
                ? 'bg-[#18181b] text-white border border-[#27272a]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Inicio &amp; Registro
          </Link>
          <Link
            href="/dashboard-student"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith('/dashboard-student')
                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Portal Alumno (Lectura)
          </Link>
          {isCoach && (
            <Link
              href="/dashboard-coach"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname.startsWith('/dashboard-coach')
                  ? 'bg-orange-500/10 text-orange-300 border border-orange-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Panel Coach (Admin)
            </Link>
          )}
        </div>

        {/* Conmutador Rápido de Sesión */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickToggleRole}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] text-zinc-200 text-xs font-mono font-bold transition-all cursor-pointer"
                title="Cambiar instantáneamente entre Coach Ricardo, Alumno y Tutor"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Cambiar a:</span>
                <span className={
                  currentUser.role === 'coach' ? 'text-blue-400' :
                  currentUser.role === 'student' ? 'text-purple-400' : 'text-orange-400'
                }>
                  {currentUser.role === 'coach' ? 'Modo Alumno' :
                   currentUser.role === 'student' ? 'Modo Tutor' : 'Coach Ricardo'}
                </span>
              </button>

              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#18181b] border border-[#27272a]">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-5 h-5 rounded-md object-cover"
                />
                <span className="text-[10px] font-mono text-zinc-300 truncate max-w-[100px]">
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  currentUser.role === 'coach' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  currentUser.role === 'parent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {currentUser.role === 'coach' ? 'COACH RICARDO' : currentUser.role === 'parent' ? 'TUTOR' : 'ALUMNO'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-[#18181b] hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-[#27272a] transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Acceso Familias</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
