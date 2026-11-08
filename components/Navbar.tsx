'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Shield, 
  Users, 
  ShoppingBag, 
  Dumbbell, 
  Home, 
  Menu, 
  X,
  HeartHandshake,
  BookOpen,
  Target,
  Flame,
  LogOut
} from 'lucide-react';
import DemoModeToggle from '@/components/DemoModeToggle';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const handleGlobalSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ww_user_role');
      localStorage.removeItem('ww_user_email');
      localStorage.removeItem('ww_student_name');
      localStorage.removeItem('ww_target_name');
      document.cookie = "user_role=; path=/; max-age=0";
      document.cookie = "user_email=; path=/; max-age=0";
      window.dispatchEvent(new Event('auth_changed'));
      window.location.href = '/login';
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('ww_user_role') || '';
      const email = localStorage.getItem('ww_user_email') || '';
      setCurrentUserRole(role.toLowerCase().trim());
      setCurrentUserEmail(email.toLowerCase().trim());

      const handleAuthChange = () => {
        setCurrentUserRole((localStorage.getItem('ww_user_role') || '').toLowerCase().trim());
        setCurrentUserEmail((localStorage.getItem('ww_user_email') || '').toLowerCase().trim());
      };
      window.addEventListener('auth_changed', handleAuthChange);
      return () => window.removeEventListener('auth_changed', handleAuthChange);
    }
  }, []);

  // No mostrar Navbar en páginas de acceso aisladas
  if (
    pathname === '/login' || 
    pathname === '/apply-coach-ww' ||
    pathname === '/staff-portal-ww'
  ) {
    return null;
  }

  const isOwner = currentUserEmail === 'wildwolvescdmx@gmail.com';

  const allNavLinks = [
    {
      href: '/',
      label: 'Inicio',
      icon: Home,
      isActive: pathname === '/',
      isAccent: false,
      visible: true
    },
    {
      href: '/dashboard-student',
      label: 'Mi Zona (Alumno)',
      icon: Dumbbell,
      isActive: pathname?.startsWith('/dashboard-student'),
      isAccent: false,
      visible: isOwner || currentUserRole === 'student'
    },
    {
      href: '/dashboard-guardian',
      label: 'Tutor (Familia)',
      icon: HeartHandshake,
      isActive: pathname?.startsWith('/dashboard-guardian'),
      isAccent: false,
      visible: isOwner || currentUserRole === 'guardian' || currentUserRole === 'parent'
    },
    {
      href: '/dashboard-coach',
      label: 'Duela (Coach)',
      icon: Users,
      isActive: pathname?.startsWith('/dashboard-coach'),
      isAccent: false,
      visible: isOwner || currentUserRole === 'coach' || currentUserRole === 'superadmin'
    },
    {
      href: '/nba-intelligence',
      label: 'Player DNA (NBA)',
      icon: Target,
      isActive: pathname?.startsWith('/nba-intelligence') || pathname?.startsWith('/player-dna'),
      isAccent: false,
      visible: isOwner
    },
    {
      href: '/marketplace',
      label: 'Bazar Lobo',
      icon: ShoppingBag,
      isActive: pathname?.startsWith('/marketplace'),
      isAccent: false,
      visible: false // Oculto hasta tener stock físico en el Deportivo Carmen Serdán
    },
    {
      href: '/rules-and-court',
      label: 'Reglas & Duela',
      icon: BookOpen,
      isActive: pathname === '/rules-and-court',
      isAccent: false,
      visible: isOwner
    },
    {
      href: '/master-bunker-hq',
      label: 'Búnker SuperAdmin',
      icon: Shield,
      isActive: pathname?.startsWith('/master-bunker-hq'),
      isAccent: true,
      visible: isOwner
    }
  ];

  const navLinks = allNavLinks.filter(item => item.visible);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Logo / Marca */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="bg-orange-600 p-2 rounded-xl text-white font-black tracking-wider shadow-md group-hover:bg-orange-500 transition">
            WW
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide block leading-none">Wild Wolves</span>
            <span className="text-xs text-orange-400 font-medium">Carmen Serdán OS</span>
          </div>
        </Link>

        {/* Navegación por Módulos y Portales (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition flex items-center gap-1.5 ${
                  item.isAccent
                    ? item.isActive
                      ? 'bg-orange-700 text-white border border-orange-500/40 shadow-sm'
                      : 'text-orange-400 hover:bg-slate-800 border border-orange-500/30'
                    : item.isActive
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Acceso Móvil / Estado Rápido y Switch Demo */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {!currentUserEmail ? (
            <Link
              href="/login"
              className="text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-xl transition shadow-md shadow-orange-950/40"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <DemoModeToggle variant="navbar" className="inline-flex" />
              <button
                type="button"
                onClick={handleGlobalSignOut}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-rose-950/60 border border-zinc-700/80 hover:border-rose-500/50 text-zinc-300 hover:text-rose-300 text-xs font-bold transition shadow-sm cursor-pointer"
                title="Cerrar sesión de forma segura"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-400" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}

          {/* Badge de Sincronización (Solo Dueño/Admin) */}
          {isOwner && (
            <span className="hidden xl:inline-block text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              🟢 Sistema Sincronizado
            </span>
          )}

          {/* Botón de Menú Hamburguesa para Móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 px-4 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Módulos y Portales Wild Wolves
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              🟢 En Línea
            </span>
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center justify-between ${
                  item.isAccent
                    ? item.isActive
                      ? 'bg-orange-700 text-white border border-orange-500/40'
                      : 'text-orange-400 hover:bg-slate-800 border border-orange-500/30'
                    : item.isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span>{item.label}</span>
                </div>
                {item.isActive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30 text-white">
                    Activo
                  </span>
                )}
              </Link>
            );
          })}

          {currentUserEmail && (
            <div className="pt-2 mt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGlobalSignOut();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
