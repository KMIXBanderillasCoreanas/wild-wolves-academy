'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { Role } from '@/lib/types';
import { 
  Flame, 
  ArrowRight, 
  AlertCircle,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  MessageCircle,
  Eye,
  CreditCard,
  Activity,
  HeartPulse,
  ClipboardList,
  ChevronRight,
  Download
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  // Modo de vista: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Método de autenticación formulario: 'email' | 'whatsapp'
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');

  // Rol activo seleccionado
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  // Campos de formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (errorParam === 'coach_only') {
      setErrorMessage('Acceso restringido: El panel de administración, pase de lista y finanzas requiere permisos de Entrenador (Coach Ricardo).');
    }
  }, [errorParam]);

  // Acceso Rápido 1-Clic
  const handleQuickLogin = (role: Role, studentId: string = 'student_01') => {
    setErrorMessage('');
    if (role === 'coach') {
      HoopStore.loginAsCoach();
      setSuccessMessage('Iniciando sesión como Coach Ricardo (Director Técnico)...');
      setTimeout(() => router.push(redirectParam || '/dashboard-coach'), 400);
    } else if (role === 'parent') {
      HoopStore.loginAsParent(studentId);
      setSuccessMessage('Iniciando sesión como Elena Morales (Tutor de Lucas)...');
      setTimeout(() => router.push(redirectParam || '/dashboard-student'), 400);
    } else {
      HoopStore.loginAsStudent(studentId);
      setSuccessMessage('Iniciando sesión como Lucas Morales (Alumno)...');
      setTimeout(() => router.push(redirectParam || '/dashboard-student'), 400);
    }
  };

  // 1. Google OAuth
  const handleGoogleAuth = () => {
    setErrorMessage('');
    const user = HoopStore.signInWithGoogle(selectedRole);
    setSuccessMessage(`Conectado con Google. Ingresando como ${user.role === 'coach' ? 'Coach Ricardo' : user.role === 'parent' ? 'Padre/Tutor' : 'Alumno'}...`);
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 500);
  };

  // 2. Apple Auth
  const handleAppleAuth = () => {
    setErrorMessage('');
    const user = HoopStore.signInWithApple(selectedRole);
    setSuccessMessage(`Conectado con Apple ID. Ingresando...`);
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 500);
  };

  // 3. WhatsApp Auth
  const handleWhatsAppAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Introduce un número de teléfono celular válido de 10 dígitos (CDMX / México).');
      return;
    }
    const user = HoopStore.signInWithWhatsApp(
      phone, 
      fullName || (selectedRole === 'parent' ? 'Tutor WhatsApp' : selectedRole === 'coach' ? 'Coach Ricardo' : 'Atleta WhatsApp'), 
      selectedRole
    );
    setSuccessMessage('Número validado por WhatsApp. Accediendo al sistema...');
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 500);
  };

  // 4. Correo y Contraseña
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !email.includes('@')) {
      setErrorMessage('Introduce un correo electrónico válido.');
      return;
    }
    if (authMode === 'register' && password.length < 6) {
      setErrorMessage('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    const user = HoopStore.signInWithEmail(email, fullName, selectedRole);
    setSuccessMessage(`Autenticación correcta. Accediendo como ${user.role === 'coach' ? 'Coach Ricardo' : user.role === 'parent' ? 'Padre/Tutor' : 'Alumno'}...`);
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 500);
  };

  return (
    <div className="min-h-[90vh] py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-center font-sans">
      
      {/* 1. PRESENTACIÓN OFICIAL DE LA ACADEMIA */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span>WILD WOLVES BASKETBALL ACADEMY CDMX</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
          PORTAL DE ACCESO Y <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">CONTROL DE ROLES</span>
        </h1>

        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans">
          Bienvenido al sistema de alto rendimiento deportivo. Selecciona tu rol para acceder a tus métricas, asistencias o herramientas técnicas.
        </p>

        {/* Tarifa Oficial en Grande */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-[#18181b] border border-emerald-500/40 text-emerald-400 font-bold">
            💵 $50 MXN / Clase
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-300">
            Semanal (3 clases): $150 MXN
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-300">
            Mensual (12 clases): $600 MXN
          </span>
        </div>
      </div>

      {/* 2. MATRIZ EXPLICATIVA DE ROLES: ¿QUÉ VE CADA QUIÉN? */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* ROL 1: ALUMNO / ATLETA */}
        <div 
          onClick={() => { setSelectedRole('student'); handleQuickLogin('student'); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            selectedRole === 'student'
              ? 'bg-blue-950/30 border-blue-500 shadow-xl shadow-blue-500/10'
              : 'bg-[#18181b] border-[#27272a] hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xl">
              🏀
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Solo Lectura
            </span>
          </div>

          <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">
            ROL ALUMNO / ATLETA
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 mb-3 leading-snug font-sans">
            Para los jugadores en cancha. Acceso privado y exclusivo a su propio rendimiento.
          </p>

          <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>Gráfico Radar 360° (6 ejes Combine)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>Días entrenados vs. días asignados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span>Sobrecarga: Cuerda y trote aeróbico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Cuota ($50/clase) y botón Stripe</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-4 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
          >
            <span>Entrar como Alumno</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ROL 2: PADRE / TUTOR */}
        <div 
          onClick={() => { setSelectedRole('parent'); handleQuickLogin('parent'); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            selectedRole === 'parent'
              ? 'bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-500/10'
              : 'bg-[#18181b] border-[#27272a] hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl">
              👨‍👩‍👧
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Supervisión
            </span>
          </div>

          <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">
            ROL PADRE / TUTOR
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 mb-3 leading-snug font-sans">
            Para padres de familia. Transparencia de asistencia, salud y cobranza de su hijo(a).
          </p>

          <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span>Control de asistencias a entrenamientos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Transparencia en saldo ($50/sesión)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>Ficha médica y teléfono de emergencia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Botón directo WhatsApp a Coach Ricardo</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-4 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
          >
            <span>Entrar como Padre/Tutor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ROL 3: COACH RICARDO (ADMIN TOTAL) */}
        <div 
          onClick={() => { setSelectedRole('coach'); handleQuickLogin('coach'); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            selectedRole === 'coach'
              ? 'bg-orange-950/30 border-orange-500 shadow-xl shadow-orange-500/10'
              : 'bg-[#18181b] border-[#27272a] hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xl">
              🛡️
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
              Control Total
            </span>
          </div>

          <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
            COACH RICARDO (ADMIN)
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 mb-3 leading-snug font-sans">
            Dirección técnica y administrativa de Wild Wolves. Control exclusivo de operaciones.
          </p>

          <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span>Roster completo y pase de lista diario</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span>Carga de evaluaciones Combine y Radar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Cobranza ($50 día / $150 sem / $600 mes)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>Fichas médicas confidenciales del plantel</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-4 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-600/30"
          >
            <span>Entrar como Coach Ricardo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3. CAJA CENTRAL DE INICIO DE SESIÓN / REGISTRO FORMAL */}
      <div className="max-w-xl mx-auto w-full bg-[#18181b] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Cabecera del formulario */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a] mb-5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-bold text-white text-sm">Autenticación Segura</h4>
              <p className="text-[11px] font-mono text-zinc-400">Acceso conectado con Supabase PostgreSQL</p>
            </div>
          </div>

          {/* Botones de conmutación */}
          <div className="flex bg-[#0a0e17] rounded-xl p-1 border border-[#27272a] font-mono text-xs">
            <button
              onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ingresar
            </button>
            <button
              onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>

        {/* Mensajes de feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Botones Sociales 1-Clic (Google & Apple) */}
        <div className="space-y-2.5 mb-5 font-mono text-xs">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{authMode === 'login' ? 'Continuar con Google' : 'Registrarse con Google'}</span>
          </button>

          <button
            type="button"
            onClick={handleAppleAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-700 text-white font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.06 1.71-.93 2.73 1 .08 2.03-.49 2.65-1.24z"/>
            </svg>
            <span>Continuar con Apple ID</span>
          </button>
        </div>

        {/* Separador */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272a]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-mono">
            <span className="bg-[#18181b] px-3 text-zinc-500 text-[10px]">
              O con teléfono / correo
            </span>
          </div>
        </div>

        {/* Conmutador Correo vs WhatsApp */}
        <div className="flex items-center gap-2 mb-3.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              method === 'email'
                ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold'
                : 'bg-[#0a0e17] border-[#27272a] text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Correo Electrónico</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('whatsapp')}
            className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              method === 'whatsapp'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                : 'bg-[#0a0e17] border-[#27272a] text-zinc-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp / Celular</span>
          </button>
        </div>

        {/* FORMULARIO CORREO */}
        {method === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3 font-mono text-xs">
            {authMode === 'register' && (
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Lucas Morales"
                  className="w-full bg-[#0a0e17] border border-[#27272a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atleta@wildwolves.academy"
                className="w-full bg-[#0a0e17] border border-[#27272a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a0e17] border border-[#27272a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md cursor-pointer active:scale-95 mt-2"
            >
              {authMode === 'login' ? 'Iniciar Sesión con Correo' : 'Crear Cuenta con Correo'}
            </button>
          </form>
        )}

        {/* FORMULARIO WHATSAPP */}
        {method === 'whatsapp' && (
          <form onSubmit={handleWhatsAppAuth} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Lucas Morales"
                className="w-full bg-[#0a0e17] border border-[#27272a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                Número Celular / WhatsApp (10 dígitos CDMX)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-[#0a0e17] border border-r-0 border-[#27272a] rounded-l-xl text-zinc-400 text-xs">
                  +52
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="55 2242 7769"
                  className="w-full bg-[#0a0e17] border border-[#27272a] rounded-r-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer active:scale-95 mt-2 flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Acceso Directo vía WhatsApp</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center font-mono text-zinc-400 text-xs">Cargando módulo de acceso...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
