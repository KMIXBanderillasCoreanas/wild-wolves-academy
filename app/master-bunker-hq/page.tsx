"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Crown,
  Check,
  X,
  Trash2,
  RefreshCw,
  Users,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldCheck,
  Activity,
  UserCheck
} from "lucide-react";

interface CoachProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at?: string;
}

interface StudentCommitment {
  id: string;
  user_id: string;
  days_selected: string[];
  shift: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export default function MasterBunkerHQ() {
  const [authenticated, setAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"coaches" | "students">("coaches");

  const checkSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretKey.trim() === "WW-SUPERADMIN-FULL-2026") {
      setAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Clave Maestra de Hardware Incorrecta. Acceso Denegado.");
    }
  };

  const fetchPendingCoaches = useCallback(async () => {
    setLoading(true);
    try {
      // Intentar primero mediante API de administración con llave maestra
      const res = await fetch(`/api/master-bunker?secret=${encodeURIComponent(secretKey)}`);
      if (res.ok) {
        const json = await res.json();
        setCoaches(json.coaches || []);
        setCommitments(json.commitments || []);
      } else {
        // Fallback a cliente Supabase
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .in("role", ["coach_pending", "coach"])
          .order("created_at", { ascending: false });
        setCoaches(data || []);

        const { data: commitData } = await supabase
          .from("attendance_commitments")
          .select("*, profiles:user_id(email, full_name)");
        setCommitments(commitData || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [secretKey]);

  useEffect(() => {
    if (authenticated) {
      fetchPendingCoaches();
    }
  }, [authenticated, fetchPendingCoaches]);

  const approveCoach = async (userId: string) => {
    try {
      const res = await fetch("/api/master-bunker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, action: "approve", userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al aprobar");
      fetchPendingCoaches();
    } catch (err: any) {
      alert("Error al aprobar coach: " + err.message);
    }
  };

  const rejectOrDelete = async (userId: string) => {
    if (!confirm("¿Seguro que deseas eliminar a este usuario de la base de datos?")) return;
    try {
      const res = await fetch("/api/master-bunker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, action: "reject", userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      fetchPendingCoaches();
    } catch (err: any) {
      alert("Error al eliminar usuario: " + err.message);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Image
                src="/logo-official.png"
                alt="Wild Wolves CDMX"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <form
            onSubmit={checkSecret}
            className="bg-[#0d1017] border border-amber-500/30 p-8 rounded-3xl text-center shadow-2xl relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-500">
              <KeyRound className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
              ACCESO RESTRINGIDO NIVEL 0
            </span>

            <h2 className="text-2xl font-black uppercase mt-3 tracking-wide text-white">
              Búnker Super Administrador
            </h2>
            <p className="text-xs text-zinc-400 mt-1 mb-6">
              Ingresa la Clave Maestra para gestionar entrenadores, horarios y datos de Wild Wolves CDMX.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <input
              type="password"
              placeholder="WW-SUPERADMIN-FULL-2026"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full bg-[#05070a] border border-zinc-700 focus:border-amber-500 rounded-xl py-3 px-4 text-sm text-center font-mono text-white mb-4 outline-none transition"
              autoFocus
            />

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Desbloquear Consola Total
            </button>

            <div className="mt-5">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
                ← Volver al sitio público
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const pendingCount = coaches.filter((c) => c.role === "coach_pending").length;
  const activeCount = coaches.filter((c) => c.role === "coach").length;

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src="/logo-official.png"
                alt="Wild Wolves Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase font-bold">
                  BÚNKER MASTER • FULL ACCESS
                </span>
                <span className="text-xs text-zinc-400">Deportivo Carmen Serdán</span>
              </div>
              <h1 className="text-2xl font-black uppercase text-white mt-1">
                Panel Central de Dirección
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPendingCoaches}
              disabled={loading}
              className="flex items-center gap-2 text-xs bg-[#161b26] border border-zinc-700 px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs bg-[#121724] border border-zinc-800 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Salir al Sitio
            </Link>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#0d1017] border border-zinc-800 p-4 rounded-2xl">
            <span className="text-xs text-zinc-400">Coaches Pendientes</span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-between">
              <span>{pendingCount}</span>
              <ShieldAlert className="w-5 h-5 text-amber-400/50" />
            </div>
          </div>

          <div className="bg-[#0d1017] border border-zinc-800 p-4 rounded-2xl">
            <span className="text-xs text-zinc-400">Coaches Activos</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center justify-between">
              <span>{activeCount}</span>
              <UserCheck className="w-5 h-5 text-emerald-400/50" />
            </div>
          </div>

          <div className="bg-[#0d1017] border border-zinc-800 p-4 rounded-2xl">
            <span className="text-xs text-zinc-400">Alumnos con Horario</span>
            <div className="text-2xl font-black text-[#ea580c] mt-1 flex items-center justify-between">
              <span>{commitments.length}</span>
              <Users className="w-5 h-5 text-[#ea580c]/50" />
            </div>
          </div>

          <div className="bg-[#0d1017] border border-zinc-800 p-4 rounded-2xl">
            <span className="text-xs text-zinc-400">Sede Oficial</span>
            <div className="text-xs font-bold text-zinc-200 mt-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#ea580c] flex-shrink-0" />
              <span>Deportivo Carmen Serdán</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 gap-2">
          <button
            onClick={() => setActiveTab("coaches")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === "coaches"
                ? "border-[#ea580c] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users className="w-4 h-4 text-[#ea580c]" />
            Gestión de Coaches ({coaches.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === "students"
                ? "border-[#ea580c] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#ea580c]" />
            Compromisos de Asistencia Alumnos ({commitments.length})
          </button>
        </div>

        {/* Tab 1: Coaches */}
        {activeTab === "coaches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ea580c]" />
                Entrenadores Registrados & Aspirantes
              </h3>
              <span className="text-xs text-zinc-500">
                Aprobación con 1 clic activa el acceso a /dashboard-coach
              </span>
            </div>

            {loading ? (
              <div className="bg-[#0d1017] border border-zinc-800 p-8 rounded-2xl text-center text-xs text-zinc-500">
                Cargando registros desde la nube de Supabase...
              </div>
            ) : coaches.length === 0 ? (
              <div className="bg-[#0d1017] border border-zinc-800 p-8 rounded-2xl text-center text-xs text-zinc-500">
                No hay solicitudes de Coach pendientes en este momento. Comparte el enlace privado{" "}
                <code className="text-[#ea580c] bg-[#161b26] px-2 py-0.5 rounded">
                  /apply-coach-ww
                </code>{" "}
                a los aspirantes.
              </div>
            ) : (
              <div className="space-y-3">
                {coaches.map((c) => {
                  const isPending = c.role === "coach_pending" || c.status === "pending";
                  return (
                    <div
                      key={c.id}
                      className="bg-[#0d1017] border border-zinc-800 hover:border-zinc-700 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            {c.full_name || "Sin nombre registrado"}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isPending
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {isPending ? "PENDIENTE DE APROBACIÓN" : "COACH ACTIVO"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{c.email}</p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1">
                          ID: {c.id} {c.created_at && `• Registro: ${new Date(c.created_at).toLocaleDateString()}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => approveCoach(c.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Aprobar Rol Coach
                          </button>
                        )}
                        <button
                          onClick={() => rejectOrDelete(c.id)}
                          title="Eliminar de Supabase"
                          className="p-2.5 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Students Attendance Commitments */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ea580c]" />
              Compromisos de Asistencia Semanal Registrados
            </h3>

            {commitments.length === 0 ? (
              <div className="bg-[#0d1017] border border-zinc-800 p-8 rounded-2xl text-center text-xs text-zinc-500">
                Aún no hay compromisos registrados en Supabase.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commitments.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0d1017] border border-zinc-800 p-4 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {item.profiles?.full_name || item.profiles?.email || "Atleta Wild Wolves"}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ea580c]/20 text-[#f97316]">
                        {item.shift === "matutino_9_11" ? "09:00 - 11:00 hrs" : "17:00 - 19:00 hrs"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.days_selected?.map((d: string) => (
                        <span
                          key={d}
                          className="text-[10px] bg-[#161b26] border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Sede: Deportivo Carmen Serdán (CDMX)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
