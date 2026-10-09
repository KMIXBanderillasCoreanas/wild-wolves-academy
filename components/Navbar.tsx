'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@/lib/types';
import { 
  LogOut, 
  Instagram, 
  Youtube, 
  Facebook, 
  MessageCircle, 
  Download,
  ShoppingBag,
  Compass,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);

  useEffect(() => {
    async function syncUser() {
      // 1. HoopStore
      const storeUser = HoopStore.getCurrentUser();
      
      // 2. Supabase
      const { data: { user } } = await supabase.auth.getUser();

      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('ww_user_role') : null;
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('ww_user_email') : null;
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('ww_student_name') : null;

      const email = (user?.email || storedEmail || storeUser?.email || '').toLowerCase().trim();
      const isFounder = 
        email === 'wildwolvescdmx@gmail.com' ||
        email === 'ricardo@wildwolves.mx' ||
        email === 'director@wildwolves.mx';

      let role = storedRole || storeUser?.role;
      if (isFounder) role = 'superadmin';

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (isFounder) role = 'superadmin';
          else if (profile.role) role = profile.role;

          setCurrentUser({
            id: user.id,
            fullName: isFounder ? 'Coach Ricardo' : (profile.full_name || storeUser?.fullName || 'Atleta Wild Wolves'),
            email: email,
            role: role as any,
            avatarUrl: profile.avatar_url || storeUser?.avatarUrl || '/logo-official.png',
            provider: 'supabase'
          });
          return;
        }
      }

      if (isFounder || role === 'superadmin') {
        setCurrentUser({
          id: 'dir_ricardo',
          fullName: 'Coach Ricardo',
          email: 'wildwolvescdmx@gmail.com',
          role: 'superadmin',
          avatarUrl: '/logo-official.png',
          provider: 'supabase'
        });
        return;
      }

      if (storeUser) {
        setCurrentUser(storeUser);
      } else if (storedEmail && storedRole) {
        setCurrentUser({
          id: 'user_local',
          fullName: storedName || (storedRole === 'coach' ? 'Coach Wild Wolves' : 'Atleta Wild Wolves'),
          email: storedEmail,
          role: storedRole as any,
          avatarUrl: '/logo-official.png',
          provider: 'supabase'
        });
      } else {
        setCurrentUser(null);
      }
    }

    syncUser();

    const handleAuthChange = () => {
      syncUser();
    };

    window.addEventListener('auth_changed', handleAuthChange);
    window.addEventListener('profile_avatar_updated', handleAuthChange);
    return () => {
      window.removeEventListener('auth_changed', handleAuthChange);
      window.removeEventListener('profile_avatar_updated', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    HoopStore.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ww_user_role');
      localStorage.removeItem('ww_user_email');
      localStorage.removeItem('ww_student_name');
      document.cookie = 'user_role=; path=/; max-age=0';
      document.cookie = 'user_email=; path=/; max-age=0';
      window.dispatchEvent(new Event('auth_changed'));
    }
    setCurrentUser(null);
    router.push('/login');
  };

  // No mostrar Navbar en páginas de acceso aisladas
  if (
    pathname === '/login' || 
    pathname === '/apply-coach-ww' ||
    pathname === '/staff-portal-ww'
  ) {
    return null;
  }

  const emailLower = (currentUser?.email || '').toLowerCase().trim();
  const isSuperAdmin = 
    currentUser?.role === 'superadmin' || 
    emailLower === 'wildwolvescdmx@gmail.com' || 
    emailLower === 'ricardo@wildwolves.mx' ||
    emailLower === 'director@wildwolves.mx';

  const isCoach = isSuperAdmin || currentUser?.role === 'coach';
  const isStudent = !isCoach && currentUser?.role === 'student';
  const hasActiveSession = !!currentUser;

  const displayName = isSuperAdmin 
    ? 'Coach Ricardo' 
    : (currentUser?.fullName?.split(' ')[0] || (isCoach ? 'Coach' : 'Atleta'));

  const displayAvatar = currentUser?.avatarUrl || '/logo-official.png';

  return (
    <nav className="bg-[#0a0e17] border-b border-[#27272a] sticky top-0 z-50 font-sans">
      {/* 1. Barra Superior Institucional (Redes y Contacto) */}
      <div className="bg-[#121620] border-b border-[#27272a]/80 px-4 py-1.5 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-300">WILD WOLVES CDMX:</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">Deportivo Carmen Serdán</span>
          </div>

          <div className="flex items-center gap-3">
            {/* WhatsApp */}
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
            {/* Instagram */}
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
            {/* TikTok */}
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
            {/* Facebook */}
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
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@WildWolvesCDMX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors font-medium"
              title="YouTube @WildWolvesCDMX"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <span className="text-zinc-700">|</span>
            {/* PWA Install */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-pwa-install'));
                }
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 font-bold border border-orange-500/30 transition-all cursor-pointer text-[11px]"
              title="Instalar App en el dispositivo"
            >
              <Download className="w-3 h-3 animate-pulse" />
              <span>Instalar App 📲</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Barra de Navegación Principal Limpia */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* LADO IZQUIERDO: Logo y Título Institucional Limpio */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-orange-500/40 bg-black/60 p-1 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/10">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Emblem"
              width={36}
              height={36}
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans">
            WILD WOLVES <span className="text-[#ea580c]">CDMX</span>
          </span>
        </Link>

        {/* CENTRO: Navegación Contextual por Rol */}
        <div className="flex items-center gap-2">
          {/* Si es SuperAdmin / Fundador: [Panel Cancha] y [Búnker Central] */}
          {isSuperAdmin && (
            <>
              <Link
                href="/dashboard-coach"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition ${
                  pathname.startsWith('/dashboard-coach')
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                Panel Cancha
              </Link>
              <Link
                href="/master-bunker-hq"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition ${
                  pathname.startsWith('/master-bunker-hq')
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                Búnker Central
              </Link>
            </>
          )}

          {/* Si es Coach estándar (no superadmin): [Panel Cancha] */}
          {isCoach && !isSuperAdmin && (
            <Link
              href="/dashboard-coach"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition ${
                pathname.startsWith('/dashboard-coach')
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Panel Cancha
            </Link>
          )}

          {/* Si es Alumno: [Mi Portal Atleta] */}
          {isStudent && (
            <Link
              href="/dashboard-student"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition ${
                pathname.startsWith('/dashboard-student')
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Mi Portal Atleta
            </Link>
          )}

          {/* Si NO hay sesión iniciada: Enlace Inicio */}
          {!hasActiveSession && (
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition ${
                pathname === '/'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Inicio
            </Link>
          )}

          {/* Accesos Directos Oficiales Fase 2: Tienda Wolves & Gira Nacional */}
          <button
            type="button"
            onClick={() => setShowStoreModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer border border-transparent hover:border-zinc-700"
            title="Tienda Oficial Wild Wolves"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden lg:inline">Tienda Wolves</span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Próximamente
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowTourModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer border border-transparent hover:border-zinc-700"
            title="Gira Nacional Wild Wolves"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">Gira Nacional</span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Próximamente
            </span>
          </button>
        </div>

        {/* LADO DERECHO: Chip de Perfil Oficial y Logout */}
        <div className="flex items-center gap-2.5">
          {hasActiveSession ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121620] border border-zinc-800">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-orange-500/30 bg-black flex items-center justify-center flex-shrink-0">
                  <Image
                    src={displayAvatar}
                    alt={displayName}
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="text-xs font-bold text-white tracking-wide truncate max-w-[120px] hidden sm:inline">
                  {displayName}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                  isSuperAdmin 
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : isCoach
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                }`}>
                  {isSuperAdmin ? 'DIRECCIÓN' : isCoach ? 'COACH' : 'ATLETA'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#121620] hover:bg-red-500/15 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition cursor-pointer"
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-mono font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#ea580c]/20"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: TIENDA OFICIAL WILD WOLVES (PRÓXIMAMENTE)                          */}
      {/* ========================================================================= */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#10131a] border border-[#272a32] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-start justify-between pb-4 border-b border-[#272a32] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black uppercase text-white tracking-tight">
                      Tienda Oficial Wild Wolves
                    </h3>
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-orange-500 text-black">
                      Fase 2
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Equipamiento técnico para el entrenamiento de alta intensidad
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowStoreModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
              {[
                {
                  title: "🏀 Balones Oficiales Wild Wolves",
                  desc: "Cuero composite microfibra con canales profundos y grip anti-sudor para duela y exteriores.",
                  status: "Preventa en Cancha"
                },
                {
                  title: "⚡ Cuerdas de Salto de Alta Velocidad",
                  desc: "Cable de acero ultra ligero con baleros de alta rotación 360° para series de 250 a 1,000 saltos.",
                  status: "Próximamente"
                },
                {
                  title: "🏋️ Polainas con Peso (2 kg cada una)",
                  desc: "Neopreno ergonómico con velcro reforzado para potenciar el despegue vertical y fuerza de piernas.",
                  status: "Próximamente"
                },
                {
                  title: "💨 Paracaídas de Aceleración",
                  desc: "Resistencia aerodinámica para sprints de 100m y desarrollo de velocidad de reacción explosiva.",
                  status: "Próximamente"
                },
                {
                  title: "🐺 Uniformes Oficiales de Juego",
                  desc: "Jersey y short transpirable con tecnología M3, escudo bordado CDMX y número personalizado.",
                  status: "Edición 2026"
                }
              ].map((item, i) => (
                <div key={i} className="p-3 bg-[#191b23] border border-[#272a32] rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-xs">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">{item.desc}</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-[#0b0e15] text-orange-400 border border-orange-500/30 whitespace-nowrap">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#272a32] flex gap-2">
              <a
                href="https://wa.me/525522427769?text=Hola%20Coach%20Ricardo%2C%20solicito%20informaci%C3%B3n%20sobre%20la%20preventa%20de%20la%20Tienda%20Oficial%20Wild%20Wolves"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Solicitar Preventa vía WhatsApp</span>
              </a>
              <button
                onClick={() => setShowStoreModal(false)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GIRA NACIONAL WILD WOLVES (PRÓXIMAMENTE)                           */}
      {/* ========================================================================= */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#10131a] border border-[#272a32] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-start justify-between pb-4 border-b border-[#272a32] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black uppercase text-white tracking-tight">
                      Gira Nacional Wild Wolves
                    </h3>
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-sky-500 text-black">
                      Expediciones
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Convocatoria a expediciones y torneos en canchas de la República
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTourModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3.5 bg-[#191b23] border border-sky-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <h4 className="font-bold text-white text-xs">Canchas Emblemáticas de México</h4>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Encuentros y torneos de fogueo en canchas profesionales y duela contra selectivos estatales en Puebla, Querétaro, Guadalajara, Monterrey y Acapulco.
                </p>
              </div>

              <div className="p-3.5 bg-[#191b23] border border-[#272a32] rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-white text-xs">Campamentos de Acondicionamiento Físico en Altura</h4>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Expediciones de adaptación neuromuscular, trote continuo de montaña y fortalecimiento cardiovascular en altura para elevar la capacidad biológica del atleta.
                </p>
              </div>

              <div className="p-3.5 bg-[#191b23] border border-[#272a32] rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  <h4 className="font-bold text-white text-xs">Criterio de Selección del Roster</h4>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Convocatoria abierta para atletas con rango formal en el Escalafón Biológico a partir de Tier 5 (Militar), Tier 6 (Élite) o superior, con asistencia validada en Carmen Serdán.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#272a32] flex gap-2">
              <a
                href="https://wa.me/525522427769?text=Hola%20Coach%20Ricardo%2C%20solicito%20informaci%C3%B3n%20sobre%20la%20Gira%20Nacional%20y%20Expediciones%20Wild%20Wolves"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Solicitar Informe de Gira en WhatsApp</span>
              </a>
              <button
                onClick={() => setShowTourModal(false)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
