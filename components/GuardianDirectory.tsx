"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, 
  Phone, 
  MessageSquare, 
  User, 
  Search, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  RotateCcw,
  Sparkles
} from "lucide-react";

interface GuardianProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  relationship_type: string;
  linked_student_name: string | null;
  emergency_phone: string | null;
  account_category: string;
  user_type?: string;
  selected_days?: string[];
  schedules_by_day?: Record<string, string>;
  created_at?: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  padre_madre: "Padre / Madre",
  abuelo_abuela: "Abuelo / Abuela",
  tio_tia: "Tío / Tía",
  hermano_hermana: "Hermano / Hermana",
  primo_prima: "Primo / Prima",
  tutor_legal: "Tutor Legal",
  propio_atleta: "Atleta Directo",
};

export default function GuardianDirectory() {
  const [guardians, setGuardians] = useState<GuardianProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadGuardians();
  }, []);

  async function loadGuardians() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone_number, relationship_type, linked_student_name, emergency_phone, account_category, user_type, selected_days, schedules_by_day, created_at")
        .or("account_category.eq.guardian_family,user_type.eq.tutor,role.eq.parent")
        .order("full_name", { ascending: true });

      if (data && !error) {
        setGuardians(data);
      } else {
        setGuardians([]);
      }
    } catch (err) {
      console.warn("Error cargando directorio de tutores:", err);
      setGuardians([]);
    } finally {
      setLoading(false);
    }
  }

  // Cambiar rol de Tutor a Alumno Activo
  const handleSwitchToStudent = async (guardianId: string) => {
    try {
      await supabase.from("profiles").update({
        account_category: "student",
        role: "student",
        user_type: "alumno",
      }).eq("id", guardianId);

      setActionSuccess("Rol actualizado a Alumno Activo exitosamente.");
      setTimeout(() => setActionSuccess(null), 3000);
      await loadGuardians();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("payment_recorded"));
      }
    } catch (e: any) {
      alert("Error al cambiar rol: " + e.message);
    }
  };

  const filtered = guardians.filter(
    (g) =>
      g.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) ||
      g.phone_number?.includes(search) ||
      g.linked_student_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#0d1017] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Directorio Familiar &amp; Tutores
              </h3>
              <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                {guardians.length} Registrados
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Contactos oficiales, atletas representados, parentesco y acceso rápido a WhatsApp
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tutor, alumno o teléfono..."
            className="w-full pl-9 pr-3 py-2 bg-[#121724] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* GRID DE TUTORES */}
      {loading ? (
        <div className="py-14 text-center text-xs text-zinc-500 font-mono">
          Cargando directorio familiar...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center bg-[#121724]/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center space-y-2">
          <Users className="w-8 h-8 text-zinc-600 mb-1" />
          <p className="text-sm font-bold text-zinc-300 uppercase">Sin tutores registrados</p>
          <p className="text-xs text-zinc-500 max-w-sm">
            Los padres o familiares que completen la ficha de identificación oficial aparecerán aquí con su WhatsApp directo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => {
            const cleanPhone = (g.phone_number || "").replace(/\D/g, "");
            const hasPhone = cleanPhone.length >= 10;
            const waUrl = hasPhone
              ? `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(
                  `Hola ${g.full_name}, te saludamos de Wild Wolves Basketball Academy CDMX respecto al entrenamiento de ${g.linked_student_name || "tu atleta"}.`
                )}`
              : null;

            return (
              <div
                key={g.id}
                className="bg-[#121724] border border-zinc-800/80 hover:border-purple-500/40 transition rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{g.full_name}</h4>
                      <span className="text-[10px] font-mono text-zinc-400 block">{g.email}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                      {RELATIONSHIP_LABELS[g.relationship_type] || g.relationship_type || "Tutor"}
                    </span>
                  </div>

                  {/* Atleta Representado */}
                  <div className="mt-3 p-2.5 bg-[#0a0d14] rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">
                      Atleta Representado:
                    </span>
                    <p className="text-xs font-black text-white mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      <span>{g.linked_student_name || "Pendiente de vincular"}</span>
                    </p>
                  </div>

                  {/* Teléfono / WhatsApp */}
                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Teléfono:</span>
                    <span className="font-bold text-white">{g.phone_number || "Sin teléfono"}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Directo</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">Sin WhatsApp</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSwitchToStudent(g.id)}
                    className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-bold uppercase transition cursor-pointer"
                    title="Si este usuario es realmente el alumno que entrena, conviértelo a Alumno Activo"
                  >
                    Hacer Alumno
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
