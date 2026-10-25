"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, User, CheckCircle2 } from "lucide-react";
import CustomScheduleSelector from "./CustomScheduleSelector";

interface OnboardingProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
}

export default function FamilyOnboardingModal({ userId, userEmail, onComplete }: OnboardingProps) {
  const [isGuardian, setIsGuardian] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [relationship, setRelationship] = useState<string>("propio_atleta");
  const [linkedStudentName, setLinkedStudentName] = useState<string>("");
  const [emergencyPhone, setEmergencyPhone] = useState<string>("");

  // Atribución de Marketing y Recomendación
  const [originChannel, setOriginChannel] = useState<string>("redes_sociales");
  const [referredBy, setReferredBy] = useState<string>("Coach Ricardo");
  
  // Días y turnos pactados
  const [selectedDays, setSelectedDays] = useState<string[]>(["lunes", "miercoles", "viernes"]);
  const [schedules, setSchedules] = useState<Record<string, string>>({
    lunes: "17:00 - 19:00",
    miercoles: "17:00 - 19:00",
    viernes: "17:00 - 19:00",
  });

  const [saving, setSaving] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    setSaving(true);
    try {
      const payload: any = {
        full_name: fullName.trim() || userEmail.split("@")[0],
        phone_number: cleanPhone || null,
        account_category: isGuardian ? "guardian_family" : "student",
        relationship_type: isGuardian ? relationship : "propio_atleta",
        linked_student_name: isGuardian ? linkedStudentName.trim() : null,
        emergency_phone: emergencyPhone.replace(/\D/g, "") || cleanPhone || null,
        selected_days: selectedDays,
        schedules_by_day: schedules,
        notes: `Origen: ${originChannel}. Recomendado por: ${referredBy || "Coach Ricardo"}.`,
      };

      const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
      if (error) {
        console.warn("Supabase update profile error:", error);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("ww_account_category", isGuardian ? "guardian_family" : "student");
        if (cleanPhone) localStorage.setItem("ww_user_phone", cleanPhone);
        localStorage.setItem("ww_student_name", fullName.trim() || userEmail.split("@")[0]);
        localStorage.setItem("ww_origin_channel", originChannel);
        localStorage.setItem("ww_referred_by", referredBy);
        window.dispatchEvent(new Event("profile_updated"));
      }

      alert("Registro completado con éxito. Bienvenido al sistema Wild Wolves.");
      onComplete();
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#10131a] border border-orange-500/40 w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-zinc-100 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        
        <div className="border-b border-zinc-800 pb-4">
          <span className="text-[10px] font-mono tracking-widest uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full font-bold">
            Ficha de Identificación Oficial • Wild Wolves CDMX
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-2">
            Paso Obligatorio: Datos de Registro y Parentesco
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Ayúdanos a identificar quién asistirá a cancha y mantener contacto directo con el tutor o atleta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. SELECCIÓN DE ROL */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 block mb-2 font-bold">
              ¿Quién es el titular de esta cuenta?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setIsGuardian(false); setRelationship("propio_atleta"); }}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                  !isGuardian
                    ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-950/40"
                    : "bg-[#161b26] border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Soy el Alumno / Atleta</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsGuardian(true); setRelationship("padre_madre"); }}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                  isGuardian
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-950/40"
                    : "bg-[#161b26] border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Soy Papá / Mamá / Tutor Familiar</span>
              </button>
            </div>
          </div>

          {/* 2. DATOS GENERALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Nombre Completo:</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full h-11 px-3 bg-[#161b26] border border-zinc-700 rounded-xl font-bold text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-400 block">Teléfono WhatsApp:</label>
                <span className="text-[10px] text-zinc-500 font-mono">(Opcional / Menores o Tutores)</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="55 1234 5678"
                className="w-full h-11 px-3 bg-[#161b26] border border-zinc-700 rounded-xl font-bold text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          {/* 3. ATRIBUCIÓN: ¿CÓMO SUPIERON DE NOSOTROS? */}
          <div className="bg-[#141923] border border-orange-500/20 p-4 rounded-2xl space-y-3 text-xs">
            <span className="text-xs font-mono uppercase text-orange-400 block font-bold">
              ¿Cómo supiste de Wild Wolves CDMX?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Medio o Canal:</label>
                <select
                  value={originChannel}
                  onChange={(e) => setOriginChannel(e.target.value)}
                  className="w-full h-11 px-3 bg-[#10131a] border border-zinc-700 rounded-xl font-bold text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="redes_sociales">Redes Sociales (TikTok, Instagram, Facebook)</option>
                  <option value="recomendacion">Recomendado por Alguien</option>
                  <option value="cancha_carmen_serdan">Vi el entrenamiento en Canchas Carmen Serdán</option>
                  <option value="otro">Otro Canal</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">¿Quién te recomendó o invitó?</label>
                <input
                  type="text"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  placeholder="Ej. Coach Ricardo, Amigo o Familiar"
                  className="w-full h-11 px-3 bg-[#10131a] border border-zinc-700 rounded-xl font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 4. CAMPOS ESPECÍFICOS DE TUTOR/FAMILIAR */}
          {isGuardian && (
            <div className="bg-[#161b26] border border-purple-500/30 p-4 rounded-2xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-purple-300 block mb-1 font-bold">Parentesco con el Atleta:</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full h-11 px-3 bg-[#10131a] border border-purple-500/40 rounded-xl font-bold text-white focus:outline-none"
                  >
                    <option value="padre_madre">Padre / Madre</option>
                    <option value="abuelo_abuela">Abuelo / Abuela</option>
                    <option value="tio_tia">Tío / Tía</option>
                    <option value="hermano_hermana">Hermano / Hermana</option>
                    <option value="primo_prima">Primo / Prima</option>
                    <option value="tutor_legal">Tutor Legal</option>
                  </select>
                </div>

                <div>
                  <label className="text-purple-300 block mb-1 font-bold">Nombre del Alumno(a) a quien representa:</label>
                  <input
                    type="text"
                    required
                    value={linkedStudentName}
                    onChange={(e) => setLinkedStudentName(e.target.value)}
                    placeholder="Ej. Mateo Pérez"
                    className="w-full h-11 px-3 bg-[#10131a] border border-purple-500/40 rounded-xl font-bold text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. SELECCIÓN DE DÍAS Y HORARIOS PACTADOS */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-zinc-400 block font-bold">
              {isGuardian 
                ? "Días y turnos en que se compromete a asistir el alumno representado:" 
                : "Días y turnos en que te comprometes a entrenar:"}
            </span>
            <CustomScheduleSelector
              initialDays={selectedDays}
              initialSchedules={schedules}
              onSave={(days, scheds) => {
                setSelectedDays(days);
                setSchedules(scheds);
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 active:scale-98 text-white font-black uppercase tracking-wider text-sm shadow-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{saving ? "Registrando Ficha..." : "Confirmar y Guardar Registro"}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
