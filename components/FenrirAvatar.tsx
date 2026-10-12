"use client";

import React, { useRef, useEffect } from "react";

export type FenrirMood = "neutral" | "happy" | "angry";

interface FenrirAvatarProps {
  mood?: FenrirMood;
  isSpeaking?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function FenrirAvatar({
  mood = "neutral",
  isSpeaking = false,
  size = "md",
}: FenrirAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reproducir video suavemente cuando habla
  useEffect(() => {
    if (isSpeaking && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!isSpeaking && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isSpeaking]);

  // Configuración de estilos y emociones según el contexto táctico
  const moodStyles = {
    neutral: {
      border: "border-orange-500",
      glow: "shadow-[0_0_25px_rgba(249,115,22,0.45)]",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
      label: "[ENFOQUE TÁCTICO]",
      imgSrc: "/assets/fenrir/neutral.jpg",
    },
    happy: {
      border: "border-cyan-400 animate-pulse",
      glow: "shadow-[0_0_35px_rgba(34,211,238,0.7)] scale-105",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      label: "[MODO VICTORIA]",
      imgSrc: "/assets/fenrir/happy.jpg",
    },
    angry: {
      border: "border-red-600 animate-bounce",
      glow: "shadow-[0_0_35px_rgba(220,38,38,0.75)]",
      badge: "bg-red-500/20 text-red-400 border-red-600/40",
      label: "[DISCIPLINA EXIGIDA]",
      imgSrc: "/assets/fenrir/angry.jpg",
    },
  };

  const current = moodStyles[mood] || moodStyles.neutral;

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24 sm:w-28 sm:h-28",
    lg: "w-32 h-32 sm:w-36 sm:h-36",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative ${sizeClasses[size]} rounded-full border-2 overflow-hidden transition-all duration-300 shadow-xl ${
          isSpeaking
            ? "border-orange-400 shadow-[0_0_35px_rgba(251,146,60,0.8)] ring-4 ring-orange-500/50 scale-105"
            : `${current.border} ${current.glow}`
        }`}
      >
        {/* VIDEO DE FENRIR HABLANDO */}
        <video
          ref={videoRef}
          src="/assets/fenrir/speaking.mp4"
          muted
          playsInline
          autoPlay={isSpeaking}
          loop
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isSpeaking ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* IMAGEN SEGÚN ESTADO EMOCIONAL (VISIBLE CUANDO NO HABLA) */}
        <img
          src={current.imgSrc}
          alt={`Fenrir Cyber Wolf - ${current.label}`}
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            isSpeaking ? "opacity-0" : "opacity-100"
          }`}
          onError={(e) => {
            // Si la imagen falla, intentar con avatar base o fallback
            (e.currentTarget as HTMLImageElement).src = "/assets/fenrir/avatar.webp";
          }}
        />

        {/* Isotipo de respaldo seguro */}
        <div className="absolute inset-0 bg-[#0d1017] flex items-center justify-center -z-10">
          <span className="text-4xl sm:text-5xl select-none">
            {mood === "angry" ? "🐺💢" : mood === "happy" ? "🐺🔥" : "🐺"}
          </span>
        </div>

        {/* Halo reactivo si está emitiendo voz */}
        {isSpeaking && (
          <span className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-75 pointer-events-none" />
        )}
      </div>

      <span
        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
          isSpeaking
            ? "bg-orange-500/25 text-orange-300 border-orange-400 animate-pulse"
            : current.badge
        }`}
      >
        {isSpeaking ? "TRANSMITIENDO DIRECTIVA" : current.label}
      </span>
    </div>
  );
}
