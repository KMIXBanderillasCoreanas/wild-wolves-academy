'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { User } from '@/lib/types';
import { 
  Flame, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  LogOut, 
  Instagram, 
  Youtube, 
  Facebook, 
  MessageCircle,
  ExternalLink,
  ChevronRight
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

  const handleLogout = () => {
    HoopStore.logout();
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      {/* 1. Top Mini Social Bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Wild Wolves Official Channels:</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Comunidad de Alto Rendimiento</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5215500000000?text=Hola%20Coach%2C%20solicito%20informaci%C3%B3n%20sobre%20HoopPerformance%20OS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
              title="WhatsApp Directo con Coach"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Directo</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://instagram.com/wildwolvesbasketball"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
              title="Instagram Oficial"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Instagram</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://tiktok.com/@wildwolveshoops"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              title="TikTok Academy"
            >
              <span className="font-bold text-[10px]">TikTok</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://youtube.com/@wildwolvesacademy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
              title="YouTube Film Room"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span className="hidden md:inline">YouTube</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://facebook.com/wildwolvesacademy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              title="Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                HOOPPERFORMANCE
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                v0.3.0
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 -mt-1 font-medium">
              Wild Wolves Basketball Academy
            </p>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              pathname === '/'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Inicio &amp; Registro
          </Link>
          <Link
            href="/dashboard-student"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              pathname.startsWith('/dashboard-student')
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Portal Alumno (Solo Lectura)
          </Link>
          <Link
            href="/dashboard-coach"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              pathname.startsWith('/dashboard-coach')
                ? 'bg-orange-600/20 text-orange-300 border border-orange-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Panel Coach (Admin CRUD)
          </Link>
        </div>

        {/* Right Session / Auth Switcher */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                    {currentUser.role === 'coach' ? 'Coach (CRUD)' : 'Alumno (Read-Only)'}
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                title="Cambiar de Rol"
              >
                Cambiar Rol
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/20 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Iniciar Sesión / Roles</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
