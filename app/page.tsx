'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { Position } from '@/lib/types';
import { 
  Flame, 
  Zap, 
  Target, 
  HeartPulse, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  MessageCircle,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LandingPage() {
  const router = useRouter();

  // Estado del formulario de registro
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+52 1 55 0000 0000');
  const [parentPhone, setParentPhone] = useState('+52 1 55 9999 8888');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [position, setPosition] = useState<Position>('Base');
  const [age, setAge] = useState<number>(17);
  const [bloodType, setBloodType] = useState('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergies, setAllergies] = useState('Ninguna conocida');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const created = HoopStore.registerStudent({
      fullName,
      email,
      phone,
      parentPhone,
      gender,
      age: Number(age),
      position,
      role: 'student',
      avatarUrl: gender === 'M' 
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      stripeStatus: 'active',
      medicalNotes: {
        bloodType,
        allergies,
        emergencyContact: emergencyContact || 'Contacto Familiar',
        emergencyPhone: emergencyPhone || phone,
        medicalConditions: 'Sin lesiones activas ni restricciones físicas.',
        lastCheckup: new Date().toLocaleDateString('es-MX'),
      },
    });

    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f97316', '#38bdf8', '#10b981'],
      });
    } catch {}

    setIsRegistered(true);

    setTimeout(() => {
      HoopStore.loginAsStudent(created.id);
      router.push('/dashboard-student');
    }, 1200);
  };

  return (
    <div className="space-y-16 pb-16 font-sans">
      {/* 1. Sección Hero */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-orange-400 text-xs font-mono font-bold tracking-wider">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>WILD WOLVES BASKETBALL ACADEMY • HOOPPERFORMANCE OS v0.3.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            SISTEMA DE ALTO RENDIMIENTO,<br />
            <span className="text-orange-500 font-mono">RADAR 360°</span> &amp; CONTROL DE ROLES
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
            Plataforma biomecánica para academias de baloncesto. Control estricto de roles (Entrenador vs. Alumno en solo lectura), comparativa mensual en radar de 6 ejes, sobrecarga de cuerda (meta 1,000 saltos) y resistencia aeróbica (meta 60 min).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
            <a
              href="#registro"
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Registrar Atleta al Combine</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#27272a] font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Acceso de Roles (Coach / Alumno)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/525522427769?text=Hola%20Coach%2C%20quiero%20informes%20del%20Combine%20de%20Baloncesto"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Directo (55 2242 7769)</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Tres Pilares de Rendimiento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Radar Biomecánico 360°</h3>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              6 ejes clave: Tiros libres (20T), media distancia, tiro de 3 puntos, salto vertical (cm), velocidad 100m y agilidad T-Test defensivo.
            </p>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Sobrecarga de Cuerda &amp; Trote</h3>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Monitor de saltos de cuerda diarios hacia la meta de 1,000 saltos y calendario de trote continuo escalonado hasta los 60 minutos de juego.
            </p>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Seguridad RBAC &amp; Ficha Médica</h3>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Modo alumno 100% de solo lectura que protege la validez de los récords. Ficha médica privada y de emergencia con acceso exclusivo para el cuerpo técnico.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Formulario de Inscripción Oficial de Atletas */}
      <section id="registro" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-[#27272a]">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
              REGISTRO DE ATLETAS AL COMBINE
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Inscripción Oficial a Wild Wolves Academy</h2>
            <p className="text-xs font-mono text-zinc-400">
              Crea tu perfil atlético en HoopPerformance OS para inicializar tu radar y sobrecarga de entrenamiento.
            </p>
          </div>

          {isRegistered ? (
            <div className="p-6 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-center space-y-2 font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">¡Atleta Registrado Exitosamente!</h3>
              <p className="text-xs text-zinc-300">
                Tu perfil y plan progresivo han sido generados. Redirigiendo a tu portal de alumno...
              </p>
            </div>
          ) : (
            <div>
              {/* Opciones de Registro Rápido */}
              <div className="space-y-3 mb-6 font-mono text-xs">
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  ⚡ Opciones de Registro Inmediato:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      HoopStore.signInWithGoogle('student');
                      router.push('/dashboard-student');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Inscribirse con Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      HoopStore.signInWithApple('student');
                      router.push('/dashboard-student');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-700 text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.06 1.71-.93 2.73 1 .08 2.03-.49 2.65-1.24z"/>
                    </svg>
                    <span>Inscribirse con Apple ID</span>
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#27272a]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-[#18181b] px-3 text-zinc-500">
                      O ficha de combine completa por correo
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Nombre Completo del Atleta</label>
                    <input
                    type="text"
                    required
                    placeholder="Ej. Lucas Morales"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="lucas@wildwolves.academy"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Teléfono Personal del Atleta</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Teléfono del Tutor (Si es menor)</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="M">Varonil (M)</option>
                    <option value="F">Femenil (F)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Edad</label>
                  <input
                    type="number"
                    min="10"
                    max="35"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 16)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Posición en Cancha</label>
                  <select
                    value={position}
                    onChange={(e: any) => setPosition(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Base">Base</option>
                    <option value="Escolta">Escolta</option>
                    <option value="Alero">Alero</option>
                    <option value="Ala-Pívot">Ala-Pívot</option>
                    <option value="Pívot">Pívot</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Grupo Sanguíneo</label>
                  <input
                    type="text"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    placeholder="Ej. O+, A+"
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Nombre Contacto de Emergencia</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carmen Morales"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Teléfono Contacto de Emergencia</label>
                  <input
                    type="tel"
                    required
                    placeholder="+52 1 55 9876 5432"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Completar Registro e Ingresar al Sistema</span>
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </section>
    </div>
  );
}
