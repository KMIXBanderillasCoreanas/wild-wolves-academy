"use client";

import React, { useState } from "react";
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
  CheckCircle2
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function WildWolvesHome() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [selectedBranch, setSelectedBranch] = useState<"femenil" | "varonil">("femenil");
  const [activeTab, setActiveTab] = useState<number>(1);

  const liveUrl = "https://wild-wolves-academy.vercel.app";
  // WhatsApp oficial con Coach Ricardo en Wild Wolves CDMX: 55 2242 7769
  const whatsappUrl = `https://wa.me/525522427769?text=Hola%20Coach%20Ricardo,%20quiero%20agendar%20mi%20Clase%20Muestra%20Gratuita%20(${selectedBranch.toUpperCase()})%20en%20Wild%20Wolves%20CDMX%20(Deportivo%20Carmen%20Serdán)`;

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
      focus: "Fundamentos motrices, bote ambidiestro, mecánica de tiro y disciplina de equipo.",
      schedule: "Lun a Sáb • Turno Matutino (09:00 - 11:00) o Vespertino (17:00 - 19:00)",
      tag: "Ideal Principiantes"
    },
    {
      id: 1,
      name: "Desarrollo Competitivo",
      age: "11 a 15 Años",
      focus: "Mecánica de suspensión, salto vertical con cuerda, defensa y lectura táctica integral.",
      schedule: "Lun a Sáb • Turno Matutino (09:00 - 11:00) o Vespertino (17:00 - 19:00)",
      tag: "Categoría Estrella"
    },
    {
      id: 2,
      name: "Élite & Selectivo CDMX",
      age: "16 a 21 Años",
      focus: "Acondicionamiento físico de alto impacto, torneos metropolitanos y visorías universitarias.",
      schedule: "Lun a Sáb • Turno Matutino (09:00 - 11:00) o Vespertino (17:00 - 19:00)",
      tag: "Alto Rendimiento"
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-[#ea580c] selection:text-white relative overflow-x-hidden">
      {/* Resplandores Atmosféricos Duales */}
      <div className="fixed -top-24 left-1/4 w-[600px] h-[600px] bg-[#0284c7]/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="fixed top-1/3 -right-24 w-[600px] h-[600px] bg-[#ea580c]/15 blur-[160px] pointer-events-none rounded-full" />

      {/* Header Oficial */}
      <header className="sticky top-0 z-40 w-full bg-[#07090e]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center">
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
            <span className="text-base font-black tracking-wider uppercase text-white block leading-tight">
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
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-3.5 py-2 rounded-xl hover:bg-[#22c55e]/20 transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> Coach Ricardo
          </a>
          <button
            onClick={openLoginModal}
            className="text-zinc-300 hover:text-white text-xs font-semibold px-3 py-2 transition"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={openRegisterModal}
            className="bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#ea580c]/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Crear Cuenta</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION: Logo Oficial Prominente Transparente */}
      <section className="relative z-10 pt-8 sm:pt-12 pb-12 px-4 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Badge de Sede y Temporada */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-[#121724] border border-[#ea580c]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#ea580c] mb-6 shadow-inner">
          <Flame className="w-4 h-4 text-[#ea580c] animate-pulse" />
          <span>TEMPORADA 2026 • CLASE DE PRUEBA Y DIAGNÓSTICO GRATUITO</span>
          <span className="hidden md:inline text-zinc-500">•</span>
          <span className="text-zinc-300 flex items-center gap-1 font-mono text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-[#ea580c]" /> Deportivo Carmen Serdán
          </span>
        </div>

        {/* LOGO OFICIAL WILD WOLVES: Transparente y Protagonista */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-4 flex items-center justify-center drop-shadow-[0_0_40px_rgba(234,88,12,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.2)_0%,transparent_70%)] blur-2xl rounded-full pointer-events-none" />
          <Image
            src="/logo-official.png"
            alt="Logotipo Oficial Wild Wolves CDMX Basketball Academy"
            width={320}
            height={320}
            className="object-contain select-none transition-transform hover:scale-105 duration-300"
            priority
          />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.08]">
          DOMINA LA CANCHA CON EL ESPÍRITU DE LA{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#38bdf8]">
            MANADA
          </span>
        </h1>
        <p className="text-zinc-300 text-sm sm:text-base max-w-2xl mt-4 font-medium leading-relaxed">
          En <strong className="text-white">Wild Wolves CDMX</strong> formamos atletas de alto rendimiento en el <span className="text-[#f97316] font-bold">Deportivo Carmen Serdán</span>. Preparación física integral, salto vertical con cuerda, biomecánica de tiro y seguimiento personalizado.
        </p>

        {/* HORARIOS DESTACADOS OFICIALES */}
        <div className="mt-6 bg-[#0d1017] border border-zinc-800 p-4 rounded-2xl max-w-lg w-full flex flex-col sm:flex-row items-center justify-around gap-4 text-xs font-mono shadow-xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ea580c]" />
            <span className="text-zinc-300 font-bold">Lunes a Sábado</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-zinc-800" />
          <div className="flex flex-col items-start gap-1 text-[11px]">
            <span className="text-[#38bdf8] flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5" /> Matutino: 09:00 a 11:00 hrs
            </span>
            <span className="text-[#f97316] flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5" /> Vespertino: 17:00 a 19:00 hrs
            </span>
          </div>
        </div>

        {/* SELECTOR DE RAMA: FEMENIL / VARONIL */}
        <div className="mt-6 bg-[#121724] p-1.5 rounded-2xl border border-zinc-800 flex items-center gap-2 shadow-xl">
          <button
            onClick={() => setSelectedBranch("femenil")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedBranch === "femenil"
                ? "bg-[#38bdf8] text-black shadow-lg shadow-[#38bdf8]/30 font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Rama Femenil (Wild Wolves Girls)
          </button>
          <button
            onClick={() => setSelectedBranch("varonil")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedBranch === "varonil"
                ? "bg-[#ea580c] text-white shadow-lg shadow-[#ea580c]/30 font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4" /> Rama Varonil
          </button>
        </div>

        {/* CTAs PRINCIPALES */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-md">
          <button
            onClick={openRegisterModal}
            className="w-full sm:flex-1 py-4 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-[#ea580c]/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Registrarme para Clase Gratis
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-4 bg-[#121724] hover:bg-[#1a2233] border border-zinc-700 text-zinc-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#22c55e]" /> WhatsApp
          </a>
        </div>
      </section>

      {/* SECCIÓN INTERACTIVA: CATEGORÍAS & HORARIOS */}
      <section className="relative z-10 py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8] bg-[#0284c7]/10 px-3 py-1 rounded-full border border-[#0284c7]/30">
              Desarrollo a tu Medida
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-2">
              Categorías de Entrenamiento
            </h2>
          </div>
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 bg-[#121724] px-3 py-1.5 rounded-xl border border-zinc-800">
            <MapPin className="w-4 h-4 text-[#ea580c]" />
            <span>Deportivo Carmen Serdán (CDMX)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`cursor-pointer rounded-3xl p-6 border transition-all ${
                activeTab === cat.id
                  ? "bg-[#121724] border-[#ea580c] shadow-[0_0_30px_rgba(234,88,12,0.15)] scale-[1.02]"
                  : "bg-[#0d1017]/70 border-zinc-800/80 hover:border-zinc-700 opacity-80"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono font-bold text-[#ea580c] uppercase bg-[#ea580c]/10 px-2.5 py-0.5 rounded-full border border-[#ea580c]/20">
                  {cat.tag}
                </span>
                <span className="text-xs font-bold text-zinc-400 font-mono">{cat.age}</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase">{cat.name}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed min-h-[48px]">{cat.focus}</p>
              
              <div className="mt-4 pt-4 border-t border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
                <span>{cat.schedule}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN DE CREDIBILIDAD Y CÓDIGO QR CON LOGO EMBEBIDO */}
      <section className="relative z-10 py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="bg-[#121724]/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-left">
            <span className="text-[11px] font-mono font-bold text-[#38bdf8] uppercase">Tecnología Única en CDMX</span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">
              Test Day Mensual &amp; Radar de Tiro 360°
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed">
              No somos una cascarita de fin de semana. Evaluamos la efectividad real en tiros libres, triples, velocidad y salto con nuestra plataforma. Los padres pueden ver el avance mes con mes directo desde su celular.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Target className="w-4 h-4 text-[#ea580c]" /> Radar de Tiro 360°
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Activity className="w-4 h-4 text-[#38bdf8]" /> Salto Vertical con Cuerda
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" /> Ficha Médica y Seguro
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Users className="w-4 h-4 text-[#facc15]" /> Visorías Universitarias
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center gap-3 text-xs text-zinc-400 font-mono">
              <MapPin className="w-4 h-4 text-[#ea580c] flex-shrink-0" />
              <span>Sede Oficial: Deportivo Carmen Serdán (CDMX)</span>
            </div>
          </div>

          {/* PASE DIGITAL CON QR REAL MÁS GRANDE + LOGO OFICIAL EMBEBIDO EN EL CENTRO */}
          <div className="bg-[#090d16] border border-zinc-700/80 p-6 rounded-3xl flex flex-col items-center text-center shadow-xl w-full md:w-80">
            <span className="text-[10px] font-mono font-bold text-[#ea580c] uppercase mb-3 bg-[#ea580c]/10 border border-[#ea580c]/30 px-3.5 py-1 rounded-full">
              Pase Digital Directo
            </span>

            {/* CONTENEDOR QR AMPLIADO A 200px CON CORRECCIÓN ALTA */}
            <div className="relative p-4 bg-white rounded-2xl shadow-inner inline-flex items-center justify-center">
              <QRCode
                value={liveUrl}
                size={200}
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
              Escanea con tu celular para obtener tu clase muestra gratuita en Deportivo Carmen Serdán.
            </p>
          </div>
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
                Deportivo Carmen Serdán (CDMX)
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
