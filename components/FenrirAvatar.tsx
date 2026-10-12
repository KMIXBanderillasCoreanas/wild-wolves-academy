"use client";

import React, { useRef, useEffect } from "react";

export type FenrirMood = "neutral" | "happy" | "angry";

interface FenrirAvatarProps {
  mood?: FenrirMood;
  isSpeaking?: boolean;
  isListening?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function FenrirAvatar({
  mood = "neutral",
  isSpeaking = false,
  isListening = false,
  size = "md",
}: FenrirAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const sizeClasses = {
    sm: "w-14 h-14",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const moodConfig = {
    neutral: {
      img: "/assets/fenrir/neutral.jpg",
      border: "border-orange-500",
      glow: "shadow-[0_0_20px_rgba(246,96,24,0.4)]",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      label: "ENFOQUE TÁCTICO",
    },
    happy: {
      img: "/assets/fenrir/happy.jpg",
      border: "border-cyan-400 animate-pulse",
      glow: "shadow-[0_0_25px_rgba(6,182,212,0.6)] scale-105",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
      label: "MODO VICTORIA",
    },
    angry: {
      img: "/assets/fenrir/angry.jpg",
      border: "border-red-600 animate-bounce",
      glow: "shadow-[0_0_25px_rgba(220,38,38,0.7)]",
      badge: "bg-red-500/20 text-red-400 border-red-600/30",
      label: "DISCIPLINA EXIGIDA",
    },
  };

  const current = moodConfig[mood] || moodConfig.neutral;

  useEffect(() => {
    if (isSpeaking && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (!isSpeaking && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isSpeaking]);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className={`relative ${sizeClasses[size]} rounded-full border-2 overflow-hidden bg-[#0c0f17] transition-all duration-300 ${
          isListening
            ? "border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-105"
            : isSpeaking
            ? "border-orange-500 shadow-[0_0_30px_rgba(246,96,24,0.8)] ring-4 ring-orange-500/50"
            : `${current.border} ${current.glow}`
        }`}
      >
        {isSpeaking ? (
          <video
            ref={videoRef}
            src="/assets/fenrir/speaking.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={current.img}
            alt="Fenrir Cyber Wolf"
            className="w-full h-full object-cover object-center transition-all duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/assets/fenrir/avatar.webp";
            }}
          />
        )}

        {/* Halo reactivo si habla */}
        {isSpeaking && (
          <span className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-60 pointer-events-none" />
        )}
      </div>

      <span
        className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
          isListening
            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 animate-pulse"
            : isSpeaking
            ? "bg-orange-500/25 text-orange-300 border-orange-400 animate-pulse"
            : current.badge
        }`}
      >
        {isListening ? "ESCUCHANDO..." : isSpeaking ? "ORDENANDO..." : current.label}
      </span>
    </div>
  );
}
