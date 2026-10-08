"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { 
  Flame, 
  Trophy, 
  ShieldCheck, 
  Activity, 
  Users, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  Clock,
  Target,
  MapPin,
  Calendar,
  Shield,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Zap,
  Check
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function WildWolvesHome() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [selectedBranch, setSelectedBranch] = useState<"femenil" | "varonil">("femenil");
  const [selectedShift, setSelectedShift] = useState<"matutino" | "vespertino">("vespertino");
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const liveUrl = "https://wild-wolves-academy.vercel.app";
  const venueMapsUrl = "https://maps.google.com/?q=Deportivo+Carmen+Serdan+CDMX";

  // Control de scroll para la barra flotante móvil
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // WhatsApp dinámico con mensaje estructurado según selección
  const branchText = selectedBranch === "femenil" ? "Femenil (Wild Wolves Girls)" : "Varonil";
  const shiftText = selectedShift === "matutino" ? "Matutino (09:00 - 11:00 hrs)" : "Vespertino (17:00 - 19:00 hrs)";
  const whatsappUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
    `Hola Coach Ricardo, quiero agendar mi Clase Muestra Gratuita en Wild Wolves CDMX (Deportivo Carmen Serdán).\n\n• Rama: ${branchText}\n• Turno de Interés: ${shiftText}\n\n¿Qué días tienen cupo esta semana?`
  )}`;

  const openRegisterModal = () => {
    setAuthMode("register");
    setIsModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthMode("login");
    setIsModalOpen(true);
  };

  const categories = [
    {
      id: 0,
      name: "Cachorros & Iniciación",
      age: "6 a 10 Años",
      focus: "Fundamentos motrices, bote ambidiestro, mecánica de tiro natural, respeto y diversión formativa en equipo.",
      schedule: "Lun a Sáb • Turno Matutino (9-11) o Vespertino (17-19)",
      tag: "Principiantes Bienvenidos",
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      skills: ["Bote básico ambas manos", "Pase de pecho y picado", "Juegos de agilidad motriz", "Coordinación ojo-mano"]
    },
    {
      id: 1,
      name: "Desarrollo Competitivo",
      age: "11 a 15 Años",
      focus: "Mecánica de suspensión, salto vertical con cuerda, defensa individual, lecturas de pantalla y transición rápida.",
      schedule: "Lun a Sáb • Turno Matutino (9-11) o Vespertino (17-19)",
      tag: "Categoría Estrella",
      color: "border-[#ea580c]/50 text-[#ea580c] bg-[#ea580c]/10",
      skills: ["Tiro tras drible", "Salto de cuerda 500+ repeticiones", "Defensa 1v1 y ayudas", "Ataque contra zona"]
    },
    {
      id: 2,
      name: "Élite & Selectivo CDMX",
      age: "16 a 21 Años",
      focus: "Acondicionamiento físico de alta exigencia, tiro de 3 puntos perimetral, visorías universitarias y torneos metropolitanos.",
      schedule: "Lun a Sáb • Turno Matutino (9-11) o Vespertino (17-19)",
      tag: "Alto Rendimiento",
      color: "border-sky-500/40 text-sky-400 bg-sky-500/10",
      skills: ["Radar de Tiro 360°", "Fuerza explosiva pliométrica", "Sistemas ofensivos tácticos", "Preparación para visorías"]
    }
  ];

  const pricingPlans = [
    {
      title: "Por Clase (Al Día)",
      price: "$50",
      currency: "MXN",
      period: "por sesión asistida",
      badge: "Flexibilidad Total",
      badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
      description: "Paga solo cuando vayas a entrenar. Sin contratos ni penalizaciones.",
      features: [
        "Acceso a 2 horas completas en cancha",
        "Entrenamiento físico y fundamentos",
        "Pago directo en cancha (Efectivo o SPEI)",
        "Sin compromiso mensual forzoso"
      ],
      popular: false
    },
    {
      title: "Plan Semanal (3 Clases)",
      price: "$150",
      currency: "MXN",
      period: "por semana",
      badge: "Más Recomendado",
      badgeColor: "bg-[#ea580c] text-white border-[#ea580c]",
      description: "Ideal para atletas que buscan progreso constante y disciplina deportiva.",
      features: [
        "3 sesiones completas a la semana",
        "Plan de salto vertical con cuerda",
        "Acompañamiento personalizado de coaches",
        "Registro y control de asistencia"
      ],
      popular: true
    },
    {
      title: "Mensualidad Élite (12 Clases)",
      price: "$600",
      currency: "MXN",
      period: "al mes",
      badge: "Desarrollo Completo",
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40",
      description: "Inmersión total de rendimiento con diagnóstico biomecánico mensual.",
      features: [
        "12 sesiones intensivas en duela",
        "Participación en Test Day Mensual",
        "Perfil digital con radar de estadísticas",
        "Prioridad de convocatoria para partidos"
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      q: "¿Cómo funciona la Clase Muestra Gratuita?",
      a: "Tu primera sesión de entrenamiento es 100% libre de costo. Llegas a la duela del Deportivo Carmen Serdán, el Coach Ricardo y el equipo te asignan a tu grupo de edad, realizas el calentamiento y los ejercicios. Al finalizar, si te gusta el ambiente y la exigencia, decides si continuar."
    },
    {
      q: "¿Qué indumentaria o equipo debo llevar a mi primer entrenamiento?",
      a: "Ropa deportiva cómoda (short o pants, playera transpirable), tenis con suela limpia y buen soporte de tobillo, y un termo con agua para hidratación. El material de básquetbol (balones de distintos calibres, conos y cuerdas) lo provee la academia."
    },
    {
      q: "¿Hay que pagar inscripción o cuota de examen?",
      a: "No cobramos cuotas de inscripción obligatorias ni exámenes forzosos. Manejamos una política transparente desde $50 MXN por sesión asistida o paquetes semanales y mensuales para facilitar el acceso al deporte a todas las familias de la CDMX."
    },
    {
      q: "¿Dónde está ubicada la cancha y en qué horarios entrenan?",
      a: "Entrenamos en el Deportivo Carmen Serdán (Gustavo A. Madero, CDMX). Las sesiones se imparten de Lunes a Sábado en dos turnos: Matutino de 09:00 a 11:00 hrs y Vespertino de 17:00 a 19:00 hrs. Puedes asistir en el turno que mejor se adapte a tus actividades escolares o laborales."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-[#ea580c] selection:text-white relative overflow-x-hidden">
      {/* Resplandores Atmosféricos Duales */}
      <div className="fixed -top-24 left-1/4 w-[600px] h-[600px] bg-[#0284c7]/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="fixed top-1/3 -right-24 w-[600px] h-[600px] bg-[#ea580c]/15 blur-[160px] pointer-events-none rounded-full" />

      {/* HEADER TÁCTICO FLOTANTE */}
      <header className="sticky top-0 z-40 w-full bg-[#07090e]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              width={42}
              height={42}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-sm sm:text-base font-black tracking-wider uppercase text-white block leading-tight">
              WILD WOLVES <span className="text-[#ea580c]">CDMX</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest block">
              BASKETBALL ACADEMY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-3.5 py-2 rounded-xl hover:bg-[#22c55e]/20 transition shadow-sm active:scale-95"
          >
            <MessageCircle className="w-4 h-4" /> Coach Ricardo
          </a>
          <button
            onClick={openLoginModal}
            className="text-zinc-300 hover:text-white text-xs font-semibold px-2.5 sm:px-3 py-2 transition"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={openRegisterModal}
            className="bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-bold text-xs px-3.5 sm:px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#ea580c]/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Crear Cuenta</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION DE ULTRA-CONVERSIÓN (RETENCIÓN EN 3 SEGUNDOS) */}
      <section className="relative z-10 pt-8 sm:pt-14 pb-12 px-4 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Eyebrow / Indicador de Cupos & Territorio */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-[#121724] border border-[#ea580c]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#ea580c] mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-emerald-400">TEMPORADA 2026</span>
          <span className="text-zinc-600">•</span>
          <span className="text-white">CLASE MUESTRA GRATUITA EN CANCHA</span>
          <span className="hidden md:inline text-zinc-600">•</span>
          <span className="text-zinc-300 flex items-center gap-1 font-mono text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-[#ea580c]" /> Deportivo Carmen Serdán
          </span>
        </div>

        {/* LOGO OFICIAL TRANSPARENTE CON RESPLANDOR */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-3 flex items-center justify-center drop-shadow-[0_0_40px_rgba(234,88,12,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.22)_0%,transparent_70%)] blur-2xl rounded-full pointer-events-none" />
          <Image
            src="/logo-official.png"
            alt="Logotipo Oficial Wild Wolves CDMX Basketball Academy"
            width={260}
            height={260}
            className="object-contain select-none transition-transform hover:scale-105 duration-300"
            priority
          />
        </div>

        {/* H1 DE ALTO IMPACTO */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.08]">
          FORJA TU JUEGO. LIDERA LA CANCHA CON LA{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#38bdf8]">
            MANADA
          </span>
        </h1>

        {/* SUBTÍTULO PERSUASIVO DE 3 SEGUNDOS */}
        <p className="text-zinc-300 text-sm sm:text-base max-w-2xl mt-4 font-medium leading-relaxed">
          Academia formativa y de alto rendimiento en el <strong className="text-white">Deportivo Carmen Serdán (CDMX)</strong>. Biomecánica de tiro, salto vertical con cuerda y disciplina de duela. Desde <span className="text-[#f97316] font-bold font-mono">$50 MXN</span> por clase, sin mensualidades forzosas.
        </p>

        {/* CONTROL INTERACTIVO DE PREFERENCIAS (RAMA Y TURNO) */}
        <div className="mt-8 bg-[#0d1017]/90 border border-zinc-800 p-3 sm:p-4 rounded-3xl max-w-2xl w-full shadow-2xl backdrop-blur-md flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              1. Selecciona Rama Deportiva:
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedBranch("femenil")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedBranch === "femenil"
                    ? "bg-[#38bdf8] text-black shadow-lg shadow-[#38bdf8]/30 font-black"
                    : "bg-[#121724] text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Femenil (Wild Wolves Girls)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBranch("varonil")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedBranch === "varonil"
                    ? "bg-[#ea580c] text-white shadow-lg shadow-[#ea580c]/30 font-black"
                    : "bg-[#121724] text-zinc-400 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Rama Varonil
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              2. Turno en Deportivo Carmen Serdán:
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedShift("matutino")}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedShift === "matutino"
                    ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20"
                    : "bg-[#121724] text-zinc-400 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Matutino (09:00 - 11:00)
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift("vespertino")}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedShift === "vespertino"
                    ? "bg-[#ea580c] text-white font-black shadow-lg shadow-[#ea580c]/30"
                    : "bg-[#121724] text-zinc-400 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Vespertino (17:00 - 19:00)
              </button>
            </div>
          </div>
        </div>

        {/* CTAs PRINCIPALES DE ACCIÓN DIRECTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-7 w-full max-w-lg">
          <button
            onClick={openRegisterModal}
            className="w-full sm:flex-1 py-4 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-[#ea580c]/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Agendar Clase Muestra (Gratis)
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 bg-[#121724] hover:bg-[#1a2233] border border-zinc-700 text-zinc-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-[#22c55e]" /> WhatsApp Coach
          </a>
        </div>

        {/* Micro-aviso de garantía */}
        <p className="text-[11px] text-zinc-500 font-mono mt-3 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sin costo de prueba • Sin datos bancarios requeridos
        </p>
      </section>

      {/* SECCIÓN: TRANSPARENCIA TOTAL DE CUOTAS ($50 MXN) */}
      <section className="relative z-10 py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Cuotas Claras y Sin Engaños
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white mt-2">
            Inversión en Deporte Formativo
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mt-2">
            El baloncesto de calidad debe ser accesible para las familias de la Ciudad de México. Elige la modalidad que se adapte a tu ritmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? "bg-[#121724] border-2 border-[#ea580c] shadow-[0_0_35px_rgba(234,88,12,0.2)] md:-translate-y-2"
                  : "bg-[#0d1017] border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                  <Zap className={`w-4 h-4 ${plan.popular ? "text-[#ea580c]" : "text-zinc-600"}`} />
                </div>

                <h3 className="text-xl font-black text-white">{plan.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">{plan.description}</p>

                <div className="mt-5 mb-6 pb-5 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white">{plan.price}</span>
                    <span className="text-xs font-bold text-[#ea580c] font-mono">{plan.currency}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={openRegisterModal}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                  plan.popular
                    ? "bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-lg shadow-orange-600/30"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                }`}
              >
                <span>Elegir este Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN INTERACTIVA: CATEGORÍAS & PLAN DE ENTRENAMIENTO */}
      <section className="relative z-10 py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8] bg-[#0284c7]/10 px-3 py-1 rounded-full border border-[#0284c7]/30">
              Desarrollo por Edades
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-2">
              Categorías de Entrenamiento
            </h2>
          </div>
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 bg-[#121724] px-3.5 py-2 rounded-xl border border-zinc-800">
            <MapPin className="w-4 h-4 text-[#ea580c]" />
            <span>Deportivo Carmen Serdán (CDMX)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-[#121724] border-[#ea580c] shadow-[0_0_30px_rgba(234,88,12,0.18)] scale-[1.02]"
                  : "bg-[#0d1017]/70 border-zinc-800/80 hover:border-zinc-700 opacity-80"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                  {cat.tag}
                </span>
                <span className="text-xs font-bold text-zinc-400 font-mono">{cat.age}</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase">{cat.name}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed min-h-[48px]">{cat.focus}</p>
              
              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">Fundamentos Clave:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {cat.skills.map((s, sIdx) => (
                    <div key={sIdx} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
                <span>{cat.schedule}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN DE CREDIBILIDAD, RADAR 360° Y CÓDIGO QR CON LOGO EMBEBIDO */}
      <section className="relative z-10 py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="bg-[#121724]/90 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-left">
            <span className="text-[11px] font-mono font-bold text-[#38bdf8] uppercase">
              Rigor Técnico Baloncestístico
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">
              Test Day Mensual &amp; Radar de Tiro 360°
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed">
              No somos una cascarita de fin de semana. Evaluamos la efectividad real en tiros libres, triples, velocidad y salto con nuestra plataforma. Los padres de familia pueden consultar el avance de su atleta directo desde su celular.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-[#0d1017] p-2.5 rounded-xl border border-zinc-800">
                <Target className="w-4 h-4 text-[#ea580c]" /> Radar de Tiro 360°
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-[#0d1017] p-2.5 rounded-xl border border-zinc-800">
                <Activity className="w-4 h-4 text-[#38bdf8]" /> Salto con Cuerda
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-[#0d1017] p-2.5 rounded-xl border border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" /> Ficha y Salud
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-[#0d1017] p-2.5 rounded-xl border border-zinc-800">
                <Users className="w-4 h-4 text-[#facc15]" /> Visorías CDMX
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ea580c] flex-shrink-0" />
                <span>Sede Oficial: Deportivo Carmen Serdán</span>
              </div>
              <a
                href={venueMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38bdf8] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* PASE DIGITAL CON QR REAL MÁS GRANDE + LOGO OFICIAL EMBEBIDO EN EL CENTRO */}
          <div className="bg-[#090d16] border border-zinc-700/80 p-6 rounded-3xl flex flex-col items-center text-center shadow-xl w-full md:w-80 flex-shrink-0">
            <span className="text-[10px] font-mono font-bold text-[#ea580c] uppercase mb-3 bg-[#ea580c]/10 border border-[#ea580c]/30 px-3.5 py-1 rounded-full">
              Pase Digital Directo
            </span>

            {/* CONTENEDOR QR AMPLIADO A 200px CON CORRECCIÓN ALTA */}
            <div className="relative p-4 bg-white rounded-2xl shadow-inner inline-flex items-center justify-center">
              <QRCode
                value={liveUrl}
                size={190}
                level="H"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
              {/* Badge Circular con el Logo Oficial en el Centro */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 bg-white rounded-full p-1.5 shadow-md border-2 border-white flex items-center justify-center">
                  <Image
                    src="/logo-official.png"
                    alt="Wild Wolves Icon"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-medium mt-3.5 leading-snug">
              Escanea para abrir en tu celular o compartir con otros atletas y familias.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN FAQ (PREGUNTAS FRECUENTES) */}
      <section className="relative z-10 py-12 px-4 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700">
            Resolución de Dudas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-2">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#0d1017] border border-zinc-800 rounded-2xl overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#ea580c] flex-shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    activeFaq === idx ? "rotate-180 text-[#ea580c]" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 border-t border-zinc-800/60 leading-relaxed font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER OFICIAL CON ENLACES A LAS 3 PUERTAS */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-10 px-6 text-xs text-zinc-500 mt-auto font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/logo-official.png"
                alt="Wild Wolves Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <p className="font-bold text-zinc-300">Wild Wolves CDMX Basketball Academy &copy; 2026</p>
              <p className="text-[11px] text-zinc-500">
                Deportivo Carmen Serdán (Gustavo A. Madero, CDMX)
              </p>
            </div>
          </div>

          {/* Accesos Directos a las 3 Puertas */}
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={openRegisterModal}
              className="text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#38bdf8]" /> Alumnos & Padres
            </button>
            <span className="text-zinc-700">•</span>
            <Link
              href="/apply-coach-ww"
              className="text-zinc-400 hover:text-[#ea580c] transition flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-[#ea580c]" /> Postulación Coach
            </Link>
            <span className="text-zinc-700">•</span>
            <Link
              href="/master-bunker-hq"
              className="text-zinc-500 hover:text-amber-400 transition flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Búnker Master
            </Link>
          </div>
        </div>
      </footer>

      {/* STICKY BOTTOM ACTION BAR PARA MÓVILES (APARECE AL SCROLLEAR) */}
      {showStickyBar && (
        <div className="sm:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#0d1017]/95 border border-[#ea580c]/50 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col text-left pl-1">
            <span className="text-[10px] font-mono text-[#ea580c] font-black uppercase">
              Clase Muestra Gratis
            </span>
            <span className="text-xs text-white font-bold">Carmen Serdán</span>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40"
              aria-label="WhatsApp Coach"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              onClick={openRegisterModal}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-orange-600/30 active:scale-95"
            >
              <span>Agendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Sobresaliente de Registro con Google, Correo y Horarios */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetRole="student"
        initialMode={authMode}
        onSuccess={() => router.push("/dashboard-student")}
      />
    </div>
  );
}
