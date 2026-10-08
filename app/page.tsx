"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  Target
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function WildWolvesHome() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<"femenil" | "varonil">("femenil");
  const [activeTab, setActiveTab] = useState<number>(1);

  const liveUrl = "https://wild-wolves-academy.vercel.app";
  // WhatsApp oficial de Wild Wolves CDMX: 55 2242 7769
  const whatsappUrl = `https://wa.me/525522427769?text=Hola%20Coach,%20quiero%20agendar%20mi%20Clase%20Muestra%20Gratuita%20(${selectedBranch.toUpperCase()})%20en%20Wild%20Wolves%20CDMX`;

  const categories = [
    {
      id: 0,
      name: "Cachorros & Iniciación",
      age: "6 a 10 Años",
      focus: "Fundamentos, bote con ambas manos, pase y diversión en cancha.",
      schedule: "Lun, Mié y Vie • 16:00 a 17:30 hrs",
      tag: "Ideal Principiantes"
    },
    {
      id: 1,
      name: "Desarrollo Competitivo",
      age: "11 a 15 Años",
      focus: "Mecánica de tiro, defensa agresiva, salto vertical con cuerda y juego táctico.",
      schedule: "Mar y Jue 17:00 hrs • Sáb 09:00 hrs",
      tag: "Categoría Estrella"
    },
    {
      id: 2,
      name: "Élite & Selectivo CDMX",
      age: "16 a 21 Años",
      focus: "Preparación física avanzada, torneos metropolitanos y visorías universitarias.",
      schedule: "Lun a Vie • 18:00 a 20:00 hrs",
      tag: "Alto Rendimiento"
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-[#ea580c] selection:text-white relative overflow-x-hidden">
      {/* Resplandores Atmosféricos Duales */}
      <div className="fixed -top-24 left-1/4 w-[600px] h-[600px] bg-[#0284c7]/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="fixed top-1/3 -right-24 w-[600px] h-[600px] bg-[#ea580c]/15 blur-[160px] pointer-events-none rounded-full" />

      {/* Header Oficial */}
      <header className="sticky top-0 z-40 w-full bg-[#07090e]/85 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 bg-transparent overflow-hidden rounded-xl border border-[#ea580c]/40 shadow-inner">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              fill
              className="object-contain mix-blend-screen scale-110"
              priority
            />
          </div>
          <div>
            <span className="text-base font-black tracking-wider uppercase text-white block">
              WILD WOLVES <span className="text-[#ea580c]">CDMX</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest">BASKETBALL ACADEMY</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-3 py-2 rounded-xl hover:bg-[#22c55e]/20 transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> Hablar con Coach
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:brightness-110 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-[#0284c7]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Ingreso Atletas</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION: Fusión del Logo sin caja negra + Gancho Inmediato */}
      <section className="relative z-10 pt-10 pb-12 px-4 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#121724] border border-[#ea580c]/50 px-4 py-1.5 rounded-full text-xs font-bold text-[#ea580c] mb-6 shadow-inner">
          <Flame className="w-4 h-4 text-[#ea580c] animate-pulse" />
          TEMPORADA 2026 • CLASE DE PRUEBA Y DIAGNÓSTICO GRATUITO ($0)
        </div>

        {/* LOGO OFICIAL CON MÁSCARA RADIAL: Elimina bordes rectangulares */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.25)_0%,transparent_70%)] blur-2xl rounded-full pointer-events-none" />
          <div className="relative w-full h-full [mask-image:radial-gradient(circle_at_center,black_60%,transparent_98%)]">
            <Image
              src="/logo-official.png"
              alt="Mascota Husky Oficial Wild Wolves"
              fill
              className="object-contain mix-blend-screen select-none pointer-events-none"
              priority
            />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.05]">
          DOMINA LA DUELA CON EL ESPÍRITU DE LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#ea580c]">MANADA</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-4 font-medium leading-relaxed">
          En Wild Wolves CDMX combinamos el método de entrenamiento atlético moderno, salto vertical con sobrecarga y seguimiento por radar de tiro para niños, niñas y jóvenes.
        </p>

        {/* SELECTOR DE RAMA: FEMENIL / VARONIL (Foco de inclusión y crecimiento) */}
        <div className="mt-8 bg-[#121724] p-1.5 rounded-2xl border border-zinc-800 flex items-center gap-2 shadow-xl">
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

        {/* CTA PRINCIPAL DE REGISTRO / AGENDAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-md">
          <button
            onClick={() => setIsModalOpen(true)}
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
          <span className="text-xs text-zinc-400 font-mono">
            Sede: Duela Techada • CDMX
          </span>
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
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" /> {cat.schedule}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN DE CREDIBILIDAD: QUÉ INCLUYE Y POR QUÉ SOMOS DIFERENTES */}
      <section className="relative z-10 py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="bg-[#121724]/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-left">
            <span className="text-[11px] font-mono font-bold text-[#38bdf8] uppercase">Tecnología Única en CDMX</span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">
              Test Day Mensual &amp; Reporte Radar 360°
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed">
              No somos una cascarita de fin de semana. Evaluamos la efectividad real en tiros libres, triples, velocidad y salto con nuestra plataforma. Los padres pueden ver el avance mes con mes directo desde su celular.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Target className="w-4 h-4 text-[#ea580c]" /> Radar de Tiro 360°
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Activity className="w-4 h-4 text-[#38bdf8]" /> Sobrecarga de Salto
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" /> Ficha Médica y Seguro
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Users className="w-4 h-4 text-[#facc15]" /> Visorías Universitarias
              </div>
            </div>
          </div>

          {/* PASE DIGITAL CON QR REAL DE CANCHA */}
          <div className="bg-[#090d16] border border-zinc-700/80 p-6 rounded-3xl flex flex-col items-center text-center shadow-xl w-full md:w-64">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase mb-3">Pase Directo de Cancha</span>
            <div className="p-3 bg-white rounded-2xl shadow-inner">
              <QRCode
                value={liveUrl}
                size={140}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 140 140`}
              />
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-3">
              Escanea con tu celular para obtener tu clase muestra gratuita en duela.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-8 px-6 text-center text-xs text-zinc-500 mt-auto font-mono">
        <p className="font-semibold text-zinc-400">Wild Wolves CDMX Basketball Academy &copy; 2026</p>
        <p className="text-[11px] mt-1 text-zinc-600">
          Entrenamientos en duela techada y acondicionamiento integral en Ciudad de México.
        </p>
      </footer>

      {/* Modal Sobresaliente de Registro y 2FA */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.push("/dashboard-student")}
      />
    </div>
  );
}
