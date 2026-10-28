"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HoopStore } from "@/lib/store";
import { 
  Sparkles, 
  ShieldAlert, 
  UserCheck, 
  Users, 
  ChevronDown, 
  ArrowRight,
  Eye,
  Check
} from "lucide-react";

export type DemoRole = "coach" | "student" | "guardian" | "superadmin";

interface DemoRoleSwitcherProps {
  currentRole?: string;
  variant?: "floating" | "inline" | "header";
}

export default function DemoRoleSwitcher({
  currentRole = "superadmin",
  variant = "floating"
}: DemoRoleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState<DemoRole>(
    (currentRole as DemoRole) || "superadmin"
  );
  const [switching, setSwitching] = useState(false);

  const rolesConfig: {
    id: DemoRole;
    label: string;
    description: string;
    icon: string;
    badgeColor: string;
    path: string;
    email: string;
    name: string;
  }[] = [
    {
      id: "coach",
      label: "🐺 Vista Coach Demo",
      description: "Captura en cancha: Asistencia, $50 MXN y Báscula Bioimpedancia",
      icon: "📋",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/40",
      path: "/dashboard-coach",
      email: "coach.demo@wildwolves.mx",
      name: "Coach Ricardo (Modo Demo)"
    },
    {
      id: "student",
      label: "🏀 Vista Alumno Demo",
      description: "Shot Science 3D, Mapa de Calor, Radar 360° e Insignias",
      icon: "🎯",
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40",
      path: "/dashboard-student?student=Bruno",
      email: "bruno.sanchez@wildwolves.mx",
      name: "Bruno Sánchez (#11 Demo)"
    },
    {
      id: "guardian",
      label: "👨‍👩‍👦 Vista Tutor / Papá Demo",
      description: "Control de pagos ($50/clase), asistencia y reporte Kimi WhatsApp",
      icon: "🛡️",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      path: "/dashboard-guardian",
      email: "catalinalopez2450@gmail.com",
      name: "Familia Sánchez (Tutor Demo)"
    },
    {
      id: "superadmin",
      label: "👑 Búnker Central Master HQ",
      description: "Comando total de ingresos, arqueo de caja y directorio",
      icon: "⚡",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      path: "/master-bunker-hq",
      email: "wildwolvescdmx@gmail.com",
      name: "Director General Wild Wolves"
    }
  ];

  const handleSelectRole = (roleConfig: typeof rolesConfig[0]) => {
    setSwitching(true);
    setActiveDemo(roleConfig.id);

    try {
      if (typeof window !== "undefined") {
        // Establecer credenciales simuladas en LocalStorage y Cookies
        localStorage.setItem("ww_demo_mode", "active");
        localStorage.setItem("ww_user_role", roleConfig.id);
        localStorage.setItem("ww_user_email", roleConfig.email);
        localStorage.setItem("ww_student_name", roleConfig.name);

        document.cookie = `user_role=${roleConfig.id}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `user_email=${encodeURIComponent(roleConfig.email)}; path=/; max-age=86400; SameSite=Lax`;

        // Configurar HoopStore local
        if (roleConfig.id === "coach" || roleConfig.id === "superadmin") {
          HoopStore.setCurrentUser({
            id: `usr_${roleConfig.id}_demo`,
            fullName: roleConfig.name,
            email: roleConfig.email,
            role: roleConfig.id === "superadmin" ? "superadmin" : "coach",
            avatarUrl: "/logo-official.png",
            provider: "email"
          });
        } else {
          HoopStore.loginAsStudent(
            "c7829cdf-7d4e-4d62-acdd-70fd5de08a77",
            roleConfig.name,
            roleConfig.email
          );
        }

        window.dispatchEvent(new Event("auth_changed"));
      }
    } catch (err) {
      console.warn("Aviso modo demo:", err);
    }

    setTimeout(() => {
      setSwitching(false);
      setIsOpen(false);
      router.push(roleConfig.path);
    }, 400);
  };

  const currentConfig = rolesConfig.find((r) => r.id === activeDemo) || rolesConfig[0];

  if (variant === "header") {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold hover:brightness-125 transition cursor-pointer shadow-lg shadow-purple-950/40"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Modo Demo:</span>
          <span>{currentConfig.label.split(" ")[1]}</span>
          <ChevronDown className="w-3 h-3 text-purple-300" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-[#0c101a] border border-zinc-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-xl animate-fade-in">
            <div className="px-3 py-2 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
              Alternar Rol de Demostración
            </div>
            {rolesConfig.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRole(r)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition flex items-start gap-2.5 cursor-pointer ${
                  activeDemo === r.id
                    ? "bg-purple-600/20 text-white border border-purple-500/40"
                    : "hover:bg-zinc-800/60 text-zinc-300"
                }`}
              >
                <span className="text-base">{r.icon}</span>
                <div className="flex-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{r.label}</span>
                    {activeDemo === r.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">{r.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Floating variant por defecto (Esquina inferior derecha)
  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {isOpen ? (
        <div className="bg-[#0c101a]/95 border border-purple-500/50 rounded-3xl p-4 shadow-2xl backdrop-blur-xl w-80 sm:w-96 space-y-3 animate-fade-in border-t-2 border-t-purple-400">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black uppercase text-white tracking-wide">
                Simulador de Roles (Modo Demo)
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-zinc-800"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Permite a la Dirección Técnica auditar y recorrer la experiencia de cada usuario en tiempo real:
          </p>

          <div className="space-y-1.5">
            {rolesConfig.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRole(r)}
                disabled={switching}
                className={`w-full text-left p-3 rounded-2xl transition flex items-center gap-3 cursor-pointer border ${
                  activeDemo === r.id
                    ? "bg-purple-600/25 border-purple-500/50 text-white"
                    : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-300"
                }`}
              >
                <div className="text-2xl">{r.icon}</div>
                <div className="flex-1">
                  <div className="font-extrabold text-xs text-white flex items-center justify-between">
                    <span>{r.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{r.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-[10px] font-mono text-zinc-500 text-center pt-1">
            • Sesión simulada segura sin alterar registros reales de Supabase •
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-950/70 border border-purple-400/30 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>Modo Demo / Vista Previa</span>
        </button>
      )}
    </div>
  );
}
