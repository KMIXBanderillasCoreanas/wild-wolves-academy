"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserCheck, QrCode, Zap, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Luces Ambientales Neón Dual (Azul y Naranja) */}
      <div className="absolute top-12 left-10 w-96 h-96 bg-[#0284c7]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#ea580c]/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Barra Superior Minimalista */}
      <header className="w-full border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#ea580c]/50">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-wider text-white">
              WILD WOLVES <span className="text-[#ea580c]">CDMX</span>
            </h1>
            <p className="text-[10px] text-zinc-400">Basketball Academy OS</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:brightness-110 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#0284c7]/20 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <UserCheck className="w-4 h-4" />
          <span>Ingresar / Registrarse</span>
        </button>
      </header>

      {/* Contenido Central: Sin Relleno, Directo y de Alto Impacto */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 z-10">
        {/* Emblema Oficial con Logo Central */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-6 drop-shadow-[0_0_35px_rgba(234,88,12,0.35)]">
          <Image
            src="/logo-official.png"
            alt="Mascota Oficial Wild Wolves"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Mensaje Concreto */}
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight max-w-xl text-white">
          Formación y Alto Rendimiento en <span className="text-[#38bdf8]">CDMX</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mt-2 font-medium">
          Métricas de tiro por radar, preparación física con sobrecarga y seguimiento mensual directo para atletas y familias.
        </p>

        {/* Acciones Directas */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full max-w-md">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#ea580c]/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Iniciar Registro Gratuito</span>
          </button>
        </div>

        {/* Bloque QR de Acceso en Cancha */}
        <div className="mt-8 bg-[#161b26]/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shadow-inner">
            {/* Generador SVG nativo de QR de enlace */}
            <QrCode className="w-14 h-14 text-black" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-[#ea580c]" /> Escanea en Cancha
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Acceso directo a la plataforma desde tu dispositivo móvil sin costo alguno.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="border-t border-zinc-800/80 px-6 py-4 text-center text-xs text-zinc-500 z-10 font-mono">
        Wild Wolves Basketball CDMX &copy; 2026. Todos los derechos reservados.
      </footer>

      {/* Modal Sobresaliente de Acceso */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.push("/dashboard-student")}
      />
    </main>
  );
}
