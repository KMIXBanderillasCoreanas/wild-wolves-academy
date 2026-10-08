"use client";

import React, { useState, useRef } from "react";
import { X, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { HoopStore } from "@/lib/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<"auth" | "2fa">("auth");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 8 dígitos separados para 2FA
  const [code, setCode] = useState<string[]>(new Array(8).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  const handleOAuthLogin = (provider: "google" | "facebook") => {
    // Al autenticar con redes, se pasa inmediatamente a la verificación de 2 factores
    setStep("2fa");
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("2fa");
  };

  const handleDigitChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const nextCode = [...code];
    nextCode[index] = val;
    setCode(nextCode);

    // Salto automático de foco
    if (val && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 8) {
      const userEmail = email.trim() || "atleta@wildwolves.mx";
      if (typeof window !== "undefined") {
        localStorage.setItem("ww_user_role", "student");
        localStorage.setItem("ww_user_email", userEmail);
        document.cookie = "user_role=student; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `user_email=${encodeURIComponent(userEmail)}; path=/; max-age=86400; SameSite=Lax`;
        window.dispatchEvent(new Event("auth_changed"));
      }
      HoopStore.loginAsStudent("student_01", "Atleta Wild Wolves", userEmail);
      onSuccess("student");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#0f131c] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(2,132,199,0.2)] text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-[#161b26] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "auth" ? (
          <div>
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 px-3 py-1 rounded-full font-mono">
                Acceso Oficial Atletas &amp; Familias
              </span>
              <h2 className="text-2xl font-black uppercase mt-3 tracking-wide">
                {isRegister ? "Crear Nueva Cuenta" : "Iniciar Sesión"}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Conéctate con tu cuenta social o ingresa tus credenciales.
              </p>
            </div>

            {/* Proveedores de Acceso Rápido Social */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#161b26] hover:bg-[#1f2636] border border-zinc-700 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("facebook")}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#161b26] hover:bg-[#1f2636] border border-zinc-700 text-xs font-bold transition text-[#1877F2] shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-wider font-semibold font-mono">o con tu correo</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="tutor@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#0284c7] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#090d16] border border-zinc-700 focus:border-[#0284c7] focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-[#0284c7]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Continuar a Verificación 2FA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-zinc-400 hover:text-white underline transition cursor-pointer"
              >
                {isRegister ? "¿Ya tienes cuenta? Inicia sesión aquí" : "¿No tienes cuenta? Regístrate aquí"}
              </button>
            </div>
          </div>
        ) : (
          /* Paso de Verificación 2FA de 8 Dígitos */
          <form onSubmit={handleVerify2FA} className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center mx-auto mb-3 text-[#38bdf8]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase text-white">Verificación de 2 Pasos (2FA)</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Ingresa el código de seguridad de 8 dígitos enviado a tu correo o teléfono registrado.
              </p>
            </div>

            {/* Inputs de 8 dígitos en dos bloques de 4 */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={code[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-11 sm:h-14 text-center text-lg font-bold bg-[#090d16] border border-zinc-700 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl text-white outline-none font-mono"
                  />
                ))}
                <span className="text-zinc-600 font-black text-lg mx-1">-</span>
                {[4, 5, 6, 7].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={code[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-11 sm:h-14 text-center text-lg font-bold bg-[#090d16] border border-zinc-700 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl text-white outline-none font-mono"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={code.join("").length !== 8}
              className="w-full py-3.5 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-[#0284c7]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validar y Entrar al Dashboard</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep("auth")}
                className="text-xs text-zinc-500 hover:text-white transition cursor-pointer"
              >
                Volver a métodos de acceso
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
