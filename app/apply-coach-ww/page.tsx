"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, Users, Award } from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function ApplyCoachPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ea580c]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#121724] border border-zinc-800 px-4 py-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>

      <div className="max-w-md w-full text-center relative z-10 my-12">
        {/* Official Logo */}
        <div className="relative w-24 h-24 mx-auto mb-5 drop-shadow-[0_0_25px_rgba(234,88,12,0.4)]">
          <Image
            src="/logo-official.png"
            alt="Wild Wolves CDMX Logo"
            width={96}
            height={96}
            className="object-contain"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea580c]/15 border border-[#ea580c]/30 text-[#f97316] text-[11px] font-mono uppercase tracking-widest mb-3">
          <Shield className="w-3.5 h-3.5" /> Portal Privado • Staff Técnico
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          Postulación de Entrenadores
        </h1>
        <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed">
          Portal exclusivo para entrenadores y preparadores físicos de <strong className="text-zinc-200">Wild Wolves CDMX</strong> en Deportivo Carmen Serdán.
          Tu postulación quedará en estado <span className="text-amber-400 font-bold">Pendiente</span> hasta ser aprobada directamente por la Dirección Técnica desde el Búnker Central.
        </p>

        {/* Benefits Card */}
        <div className="bg-[#0d1017] border border-zinc-800/90 rounded-2xl p-5 mb-6 text-left space-y-3">
          <div className="flex items-start gap-3 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#ea580c] flex-shrink-0 mt-0.5" />
            <span>Gestión integral de listas de asistencia (Matutino 9-11 / Vespertino 17-19 hrs).</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#ea580c] flex-shrink-0 mt-0.5" />
            <span>Captura de métricas de tiro, salto vertical, sprint y preparación física en pavimento.</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#ea580c] flex-shrink-0 mt-0.5" />
            <span>Acceso al sistema de comunicación y expedientes de atletas y tutores.</span>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-3.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:brightness-110 text-white font-black rounded-xl text-sm shadow-xl shadow-[#ea580c]/25 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          Abrir Formulario de Registro Coach
        </button>

        <p className="text-[11px] text-zinc-500 mt-4">
          ¿Ya fuiste aprobado? Inicia sesión con las mismas credenciales para ingresar a tu panel de Coach.
        </p>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetRole="coach_pending"
        onSuccess={() => {
          // Modal handles success notification
        }}
      />
    </div>
  );
}
