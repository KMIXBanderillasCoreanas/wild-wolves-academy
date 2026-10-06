'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HoopStore } from '@/lib/store';
import { 
  Flame, 
  Zap, 
  Target, 
  HeartPulse, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Trophy, 
  Sparkles,
  MessageCircle,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LandingPage() {
  const router = useRouter();

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<number>(10);
  const [position, setPosition] = useState<'Point Guard (PG)' | 'Shooting Guard (SG)' | 'Small Forward (SF)' | 'Power Forward (PF)' | 'Center (C)'>('Point Guard (PG)');
  const [age, setAge] = useState<number>(16);
  const [height, setHeight] = useState("6'0\" (183 cm)");
  const [weight, setWeight] = useState("165 lbs (75 kg)");
  const [category, setCategory] = useState<'Sub-15' | 'Sub-18' | 'Senior / Pro Prep' | 'Universitario'>('Sub-18');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const created = HoopStore.registerStudent({
      name,
      email,
      jerseyNumber: Number(jerseyNumber),
      position,
      age: Number(age),
      height,
      weight,
      category,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      medicalRecord: {
        bloodType: 'O+',
        allergies: ['Ninguna declarada'],
        asthmaOrCardio: false,
        injuriesHistory: 'Sin cirugías previas',
        emergencyContactName: emergencyName || 'Contacto Familiar',
        emergencyContactRelation: 'Tutor Legal',
        emergencyContactPhone: emergencyPhone || '+52 1 55 0000 0000',
        lastMedicalCheckup: new Date().toISOString().split('T')[0],
      },
    });

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#38bdf8', '#10b981', '#fbbf24'],
      });
    } catch {}

    setIsRegistered(true);

    setTimeout(() => {
      // Auto login as this new student and redirect to their dashboard
      HoopStore.loginAsStudent(created.id);
      router.push('/dashboard-student');
    }, 1200);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-600/20 to-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Flame className="w-4 h-4" />
            <span>Wild Wolves Basketball Academy • HoopPerformance OS v0.3.0</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
            BIOMECÁNICA, RBAC SEGURO &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600">
              ANALÍTICA DE COMBINE
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Plataforma integral de alto rendimiento para baloncesto. Evalúa atletas en 6 ejes con radar 360°, controla sobrecarga progresiva de cuerda (100 a 1,000 saltos), resistencia aeróbica escalonada (30s a 60m) y gestiona la academia con control estricto de roles.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#registro"
              className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2"
            >
              <span>Registrar Atleta en el Combine</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <span>Acceso de Roles (Coach / Alumno)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/5215500000000?text=Hola%20Coach%2C%20quiero%20agendar%20mi%20prueba%20Combine"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars / Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Radar 360 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Radar Biomecánico 360°</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Medición de 6 ejes de combine baloncestístico: Tiro (3PT/FT), Manejo de balón, Salto vertical (in/cm), Agilidad de carril, Defensa e IQ y Stamina VO2 Max.
            </p>
            <div className="text-[11px] font-bold text-orange-400 flex items-center gap-1">
              <span>Comparación vs Benchmark Top 10%</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Sobrecarga Progresiva */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rope &amp; Endurance Overload</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Monitor de saltos de cuerda de 100 a 1,000 saltos progresivos y calendario de carrera aeróbica de 30 segundos de activación hasta 60 minutos de resistencia continua.
            </p>
            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <span>Adaptación cardiovascular de 4to cuarto</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: RBAC & Seguridad Médica */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">RBAC Estricto &amp; Ficha Médica</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Modo Alumno 100% solo lectura que protege la integridad deportiva. Acceso a fichas clínicas confidenciales y contactos de emergencia reservado para Coaches.
            </p>
            <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
              <span>Protección Edge Middleware Activa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Athlete Registration Section */}
      <section id="registro" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inscripción Oficial de Atletas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Únete a Wild Wolves Basketball Academy
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Completa el formulario para generar tu perfil en HoopPerformance OS y comenzar tu plan de sobrecarga y pruebas combine.
            </p>
          </div>

          {isRegistered ? (
            <div className="p-8 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">¡Atleta Registrado con Éxito!</h3>
              <p className="text-xs text-slate-300">
                Tu perfil ha sido creado y cargado en el sistema con tu plan inicial de saltos y resistencia. Redirigiendo a tu Dashboard de Alumno...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nombre Completo del Atleta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Lucas Morales"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="lucas@wildwolves.academy"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Número y Posición */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Número de Camiseta
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    required
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Posición en Cancha
                  </label>
                  <select
                    value={position}
                    onChange={(e: any) => setPosition(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Point Guard (PG)">Point Guard (Base - PG)</option>
                    <option value="Shooting Guard (SG)">Shooting Guard (Escolta - SG)</option>
                    <option value="Small Forward (SF)">Small Forward (Alero - SF)</option>
                    <option value="Power Forward (PF)">Power Forward (Ala-Pívot - PF)</option>
                    <option value="Center (C)">Center (Pívot - C)</option>
                  </select>
                </div>

                {/* Edad y Categoría */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Edad
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="30"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 16)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Sub-15">Sub-15 (Juvenil Menor)</option>
                    <option value="Sub-18">Sub-18 (Juvenil Mayor)</option>
                    <option value="Senior / Pro Prep">Senior / Pro Prep</option>
                    <option value="Universitario">Universitario / Becas</option>
                  </select>
                </div>

                {/* Estatura y Peso */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Estatura
                  </label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ej. 6'2&quot; (188 cm)"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Peso
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ej. 175 lbs (79 kg)"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Contacto de Emergencia */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Contacto de Emergencia (Nombre Tutor)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carmen Morales"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Teléfono de Emergencia / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+52 1 55 0000 0000"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Completar Registro e Iniciar Pruebas</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
