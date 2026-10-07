'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { Role } from '@/lib/types';
import { 
  KeyRound, 
  UserCheck, 
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
  HelpCircle
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  // Modo: 'login' (iniciar sesión) o 'register' (registrarse)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Método activo en el formulario: 'email' | 'whatsapp'
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');

  // Rol seleccionado para registrarse o ingresar
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  // Campos del formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (errorParam === 'coach_only') {
      setErrorMessage('Acceso restringido: El área de administración y evaluación requiere permisos de Entrenador.');
    }
  }, [errorParam]);

  // Acceso Rápido 1-Clic para pruebas
  const handleQuickCoach = () => {
    HoopStore.loginAsCoach();
    router.push(redirectParam || '/dashboard-coach');
  };

  const handleQuickStudent = (studentId: string = 'student_01') => {
    HoopStore.loginAsStudent(studentId);
    router.push(redirectParam || '/dashboard-student');
  };

  const handleQuickParent = (studentId: string = 'student_01') => {
    HoopStore.loginAsParent(studentId);
    router.push(redirectParam || '/dashboard-student');
  };

  // 1. Registro / Login con GOOGLE
  const handleGoogleAuth = () => {
    setErrorMessage('');
    const user = HoopStore.signInWithGoogle(selectedRole);
    setSuccessMessage(`¡Bienvenido(a) con Google! Ingresando como ${user.role === 'coach' ? 'Coach Ricardo' : user.role === 'parent' ? 'Tutor' : 'Alumno'}...`);
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 600);
  };

  // 2. Registro / Login con APPLE
  const handleAppleAuth = () => {
    setErrorMessage('');
    const user = HoopStore.signInWithApple(selectedRole);
    setSuccessMessage(`¡Conectado con Apple ID! Ingresando...`);
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 600);
  };

  // 3. Registro / Login con WHATSAPP / CELULAR
  const handleWhatsAppAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Por favor introduce un número de teléfono celular válido (mínimo 10 dígitos).');
      return;
    }
    const user = HoopStore.signInWithWhatsApp(phone, fullName || (selectedRole === 'parent' ? 'Tutor WhatsApp' : 'Atleta WhatsApp'), selectedRole);
    setSuccessMessage('¡Número validado por WhatsApp! Redirigiendo a tu consola...');
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 600);
  };

  // 4. Registro / Login con CORREO Y CONTRASEÑA
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !email.includes('@')) {
      setErrorMessage('Introduce un correo electrónico válido.');
      return;
    }
    if (authMode === 'register' && password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const user = HoopStore.signInWithEmail(email, fullName, selectedRole);
    setSuccessMessage(`¡Autenticación correcta! Accediendo como ${user.role === 'coach' ? 'Coach Ricardo' : user.role === 'parent' ? 'Tutor' : 'Alumno'}...`);
    setTimeout(() => {
      if (user.role === 'coach') {
        router.push(redirectParam || '/dashboard-coach');
      } else {
        router.push(redirectParam || '/dashboard-student');
      }
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 font-sans">
      <div className="max-w-lg w-full bg-[#18181b] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Resplandor superior sutil */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Cabecera */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-orange-600/30">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">HoopPerformance OS</h2>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Wild Wolves Academy CDMX • Autenticación &amp; RBAC
          </p>
        </div>

        {/* Conmutador de Pestañas: Iniciar Sesión vs. Registrarse */}
        <div className="flex bg-[#0a0e17] rounded-xl p-1 border border-[#27272a] mb-5 font-mono text-xs">
          <button
            onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Registrarse (Nuevo Atleta/Tutor)
          </button>
        </div>

        {/* Mensajes de Alerta */}
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

        {/* Selector de Rol cuando se registra o entra */}
        <div className="mb-4 bg-[#0a0e17] p-3 rounded-xl border border-[#27272a]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 font-bold">
            ¿Cómo deseas ingresar al sistema?
          </span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="text-sm">🏀</div>
              <div className="text-[11px] mt-0.5">Alumno</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('parent')}
              className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                selectedRole === 'parent'
                  ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="text-sm">👨‍👦</div>
              <div className="text-[11px] mt-0.5">Padre/Tutor</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('coach')}
              className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                selectedRole === 'coach'
                  ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="text-sm">🛡️</div>
              <div className="text-[11px] mt-0.5">Coach Ricardo</div>
            </button>
          </div>
        </div>

        {/* BOTONES DE PROVEEDORES SOCIALES (GOOGLE & APPLE) */}
        <div className="space-y-2.5 mb-5 font-mono text-xs">
          {/* Botón de Google */}
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

          {/* Botón de Apple */}
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
              O continuar con
            </span>
          </div>
        </div>

        {/* Selector de Método: Correo vs WhatsApp */}
        <div className="flex items-center gap-2 mb-3 font-mono text-xs">
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
            <span>WhatsApp / Móvil</span>
          </button>
        </div>

        {/* FORMULARIO POR CORREO */}
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
              {authMode === 'login' ? 'Entrar con Correo' : 'Crear Cuenta con Correo'}
            </button>
          </form>
        )}

        {/* FORMULARIO POR WHATSAPP / MÓVIL */}
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
                Número de Celular / WhatsApp (10 dígitos CDMX/México)
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
              <span>Acceso Rápido vía WhatsApp</span>
            </button>
          </form>
        )}

        {/* CONMUTADOR RÁPIDO PARA VALIDACIÓN DE ROLES (DEMOSTRACIÓN ANTIGRAVITY) */}
        <div className="mt-6 pt-4 border-t border-[#27272a] space-y-2.5 font-mono">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>Acceso Instantáneo de Demostración:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Coach Ricardo (Acceso Total) */}
            <button
              onClick={handleQuickCoach}
              className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="text-[10px] font-bold text-orange-400 uppercase">Coach Ricardo</div>
              <div className="text-[11px] font-bold text-white truncate">Acceso Total (Admin)</div>
            </button>

            {/* Alumno (Solo Lectura) */}
            <button
              onClick={() => handleQuickStudent('student_01')}
              className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="text-[10px] font-bold text-blue-400 uppercase">Lucas Morales #7</div>
              <div className="text-[11px] font-bold text-white truncate">Alumno (Lectura)</div>
            </button>

            {/* Padre / Tutor */}
            <button
              onClick={() => handleQuickParent('student_01')}
              className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="text-[10px] font-bold text-purple-400 uppercase">Elena Morales</div>
              <div className="text-[11px] font-bold text-white truncate">Tutor / Finanzas</div>
            </button>
          </div>
        </div>
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
