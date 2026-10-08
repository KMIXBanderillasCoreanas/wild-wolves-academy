"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { UserCheck, Sparkles, Zap } from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const appLiveUrl = "https://wild-wolves-academy.vercel.app";

  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Resplandores ambientales cian y naranja */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#0284c7]/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#ea580c]/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 bg-transparent overflow-hidden">
            <Image
              src="/logo-official.png"
              alt="Wild Wolves Logo"
              fill
              className="object-contain mix-blend-screen"
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
          className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:brightness-110 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#0284c7]/25 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <UserCheck className="w-4 h-4" />
          <span>Ingresar / Registrarse</span>
        </button>
      </header>

      {/* Sección Central de Alto Impacto */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 z-10">
        {/* Contenedor del Logo con Transparencia Mejorada */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 mb-4 filter drop-shadow-[0_0_40px_rgba(234,88,12,0.4)]">
          <Image
            src="/logo-official.png"
            alt="Mascota Oficial Wild Wolves"
            fill
            className="object-contain mix-blend-screen select-none pointer-events-none"
            priority
          />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight max-w-xl text-white">
          Formación y Alto Rendimiento en <span className="text-[#38bdf8]">CDMX</span>
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mt-2 font-medium">
          Métricas de tiro con radar, acondicionamiento físico con sobrecarga y seguimiento para atletas y familias.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full max-w-md">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#ea580c]/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Registro Gratuito con 2FA</span>
          </button>
        </div>

        {/* Módulo de Código QR Real y Escaneable */}
        <div className="mt-8 bg-[#161b26]/90 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md shadow-xl">
          <div className="p-2 bg-white rounded-xl flex items-center justify-center">
            <QRCode
              value={appLiveUrl}
              size={64}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 64 64`}
            />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-[#ea580c]" /> QR Oficial de Cancha
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[200px]">
              Escanea con tu cámara para abrir o instalar la app al instante.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-4 text-center text-xs text-zinc-500 z-10 font-mono">
        Wild Wolves Basketball CDMX &copy; 2026. Todos los derechos reservados.
      </footer>

      {/* Modal Sobresaliente */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.push("/dashboard-student")}
      />
    </main>
  );
}
