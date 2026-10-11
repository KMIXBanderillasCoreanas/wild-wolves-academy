"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  User,
  Users,
  Activity,
  UserCheck,
  RefreshCw,
  Link as LinkIcon
} from "lucide-react";

// Motor de cálculo de Tier en cliente para fallback resiliente
export function calculateClientTier(laps: number, rope: number, pushups: number, form: string): string {
  if (laps >= 20 && rope >= 800 && pushups >= 50 && form === "pie_sobre_pie") return "ultra_instinto";
  if (laps >= 15 && rope >= 600 && pushups >= 40) return "titan_wolf";
  if (laps >= 12 && rope >= 400 && pushups >= 30) return "bestia_alfa";
  if (laps >= 10 && rope >= 300 && pushups >= 25) return "elite";
  if (laps >= 8 && rope >= 200 && pushups >= 20) return "militar";
  if (laps >= 6 && rope >= 100 && pushups >= 15) return "avanzado";
  if (laps >= 4 && rope >= 60 && pushups >= 12) return "intermedio";
  if (laps >= 3 || rope >= 40 || pushups >= 8) return "basico";
  return "principiante";
}

export default function SmartPlacementCRM() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Pestañas principales de separación: Atletas vs Directorio de Tutores
  const [activeTab, setActiveTab] = useState<"athletes" | "guardians">("athletes");
  const [subFilter, setSubFilter] = useState<string>("todos");

  // Selector interactivo de Rol y Parentesco
  const [selectedRoleOption, setSelectedRoleOption] = useState<string>("Alumno Activo");
  const [selectedRelationship, setSelectedRelationship] = useState<string>("padre_madre");
  const [selectedLinkedStudentName, setSelectedLinkedStudentName] = useState<string>("");
  const [updatingRole, setUpdatingRole] = useState<boolean>(false);
  const [roleUpdateMsg, setRoleUpdateMsg] = useState<string | null>(null);

  // Campos de la prueba exprés de colocación
  const [laps, setLaps] = useState<number>(3);
  const [rope, setRope] = useState<number>(40);
  const [pushups, setPushups] = useState<number>(12);
  const [pushupsForm, setPushupsForm] = useState<string>("brazos_cerrados");
  const [notes, setNotes] = useState<string>("");

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);

  useEffect(() => {
    loadAthletes();
  }, []);

  async function loadAthletes() {
    try {
      // Consultar perfiles de Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Consultar prospect_athletes para unificar pre-fichas familiares (ej. Osmar Lopez)
      let prospects: any[] = [];
      try {
        const { data: prospectData } = await supabase
          .from("prospect_athletes")
          .select("*")
          .order("created_at", { ascending: false });
        if (prospectData) {
          prospects = prospectData;
        }
      } catch {
        // Fallback silencioso si la tabla no está creada aún en Supabase
      }

      if (data && data.length > 0) {
        // EXCLUSIÓN PERMANENTE DEL HEAD COACH / CREADOR:
        // wildwolvescdmx@gmail.com o cualquier usuario con role === 'superadmin' o role === 'coach'
        const nonCoachProfiles = data.filter((p: any) => {
          const email = (p.email || "").toLowerCase().trim();
          const role = (p.role || "").toLowerCase().trim();
          if (email === "wildwolvescdmx@gmail.com" || email === "ricardo@wildwolves.mx") return false;
          if (role === "superadmin" || role === "coach") return false;
          return true;
        });

        // Combinar con prospectos de prospect_athletes que aún no estén en profiles
        const mappedProspects = prospects
          .filter(pr => !nonCoachProfiles.some(p => p.id === pr.claimed_user_id || (p.full_name && p.full_name.toLowerCase() === (pr.athlete_full_name || "").toLowerCase())))
          .map(pr => ({
            id: pr.id || `prospect_${pr.athlete_full_name}`,
            full_name: pr.athlete_full_name,
            email: pr.contact_email || "",
            role: "student",
            account_category: "student",
            user_type: "prospecto",
            crm_status: "prospecto",
            current_tier: pr.assigned_tier || "principiante",
            is_prospect_record: true,
            tutor_name: pr.guardian_name || pr.tutor_name || "Catalina Lopez",
            emergency_phone: pr.emergency_phone || pr.contact_phone || "",
          }));

        const unifiedList = [...nonCoachProfiles, ...mappedProspects];
        setStudents(unifiedList);

        if (!selectedStudent) {
          selectStudent(unifiedList[0]);
        } else {
          const fresh = unifiedList.find((d: any) => d.id === selectedStudent.id);
          if (fresh) setSelectedStudent(fresh);
          else selectStudent(unifiedList[0]);
        }
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.warn("Error cargando atletas en SmartPlacementCRM:", err);
    }
  }

  function selectStudent(st: any) {
    if (!st) return;
    setSelectedStudent(st);
    setAiVerdict(null);
    setRoleUpdateMsg(null);

    // Pre-cargar valores de rol interactivo según el registro
    const isGuardian = 
      st.account_category === "guardian_family" || 
      st.user_type === "tutor" || 
      st.role === "parent" || 
      st.role === "guardian";

    if (isGuardian) {
      if (st.relationship_type === "tutor_familiar" || st.relationship_type === "abuela" || st.relationship_type === "abuelo") {
        setSelectedRoleOption("Tutor Familiar");
      } else if (st.relationship_type === "otro") {
        setSelectedRoleOption("Otro");
      } else {
        setSelectedRoleOption("Padre / Madre");
      }
    } else {
      setSelectedRoleOption("Alumno Activo");
    }

    setSelectedRelationship(st.relationship_type || "padre_madre");
    setSelectedLinkedStudentName(st.linked_student_name || "");
  }

  // Lista de alumnos disponibles para vinculación desplegable
  const registeredAthletes = students.filter(s => 
    s.account_category !== "guardian_family" && 
    s.user_type !== "tutor" && 
    s.role !== "parent" && 
    s.role !== "guardian"
  );

  // Guardar cambio interactivo de Rol y Parentesco
  const handleUpdateUserRole = async () => {
    if (!selectedStudent) return;
    setUpdatingRole(true);
    setRoleUpdateMsg(null);

    const isStudent = selectedRoleOption === "Alumno Activo";
    const targetRole = isStudent ? "student" : "guardian";
    const targetCategory = isStudent ? "student" : "guardian_family";
    const targetUserType = isStudent ? "alumno" : "tutor";
    const relationshipVal = isStudent ? "propio_atleta" : selectedRelationship;
    const linkedNameVal = isStudent ? "" : selectedLinkedStudentName;

    try {
      if (!selectedStudent.is_prospect_record) {
        const { error } = await supabase.from("profiles").update({
          role: targetRole,
          account_category: targetCategory,
          user_type: targetUserType,
          relationship_type: relationshipVal,
          linked_student_name: linkedNameVal
        }).eq("id", selectedStudent.id);

        if (error) throw error;
      }

      // Actualizar estado local inmediatamente sin recargar la página
      setStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        return {
          ...s,
          role: targetRole,
          account_category: targetCategory,
          user_type: targetUserType,
          relationship_type: relationshipVal,
          linked_student_name: linkedNameVal
        };
      }));

      setSelectedStudent((prev: any) => ({
        ...prev,
        role: targetRole,
        account_category: targetCategory,
        user_type: targetUserType,
        relationship_type: relationshipVal,
        linked_student_name: linkedNameVal
      }));

      // Si se convirtió en tutor y estábamos en atletas, cambiar de pestaña o notificar
      if (!isStudent && activeTab === "athletes") {
        setActiveTab("guardians");
      } else if (isStudent && activeTab === "guardians") {
        setActiveTab("athletes");
      }

      setRoleUpdateMsg(`✅ Rol actualizado: ${selectedStudent.full_name} ahora es ${selectedRoleOption}.`);
      window.dispatchEvent(new Event("payment_recorded"));
    } catch (err: any) {
      setRoleUpdateMsg(`❌ Error al actualizar rol: ${err.message}`);
    } finally {
      setUpdatingRole(false);
    }
  };

  // Simulación del motor analítico de colocación en cancha
  const handleRunSmartAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Guardar en la tabla baseline
      if (!selectedStudent.is_prospect_record) {
        const { error } = await supabase.from("student_initial_baseline").upsert({
          student_id: selectedStudent.id,
          coach_id: user?.id,
          initial_laps_completed: laps,
          initial_jump_rope_max: rope,
          initial_pushups_form: pushupsForm,
          initial_squats_count: pushups,
          initial_posture_notes: notes || "Evaluación inteligente aplicada en cancha."
        }, { onConflict: "student_id" });

        if (error) {
          console.warn("Fallo baseline upsert, aplicando fallback directo:", error);
        }
      }

      // Cálculo del tier
      const calculatedTier = calculateClientTier(laps, rope, pushups, pushupsForm);

      // Asegurar actualización en profiles
      if (!selectedStudent.is_prospect_record) {
        await supabase
          .from("profiles")
          .update({
            current_tier: calculatedTier,
            crm_status: "activo",
            days_inactive: 0,
            last_attended_at: new Date().toISOString().split("T")[0]
          })
          .eq("id", selectedStudent.id);
      }

      // Actualizar también caché local
      if (typeof window !== "undefined") {
        const localBaseline = JSON.parse(localStorage.getItem("ww_student_baseline") || "{}");
        localBaseline[selectedStudent.id] = {
          initial_laps_completed: laps,
          initial_jump_rope_max: rope,
          initial_pushups_form: pushupsForm,
          initial_squats_count: pushups,
          current_tier: calculatedTier
        };
        localStorage.setItem("ww_student_baseline", JSON.stringify(localBaseline));
        window.dispatchEvent(new Event("payment_recorded"));
      }

      setAiVerdict(calculatedTier);
      await loadAthletes();
      alert(`✅ Diagnóstico completado. El atleta fue posicionado automáticamente en el nivel: ${calculatedTier.toUpperCase()}`);
    } catch (err: any) {
      alert("Error en diagnóstico: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Filtrado por Pestaña 1: Atletas / Alumnos
  const athletesList = students.filter(s => {
    const isGuardian = 
      s.account_category === "guardian_family" || 
      s.user_type === "tutor" || 
      s.role === "parent" || 
      s.role === "guardian";
    if (isGuardian) return false;

    if (subFilter === "todos") return true;
    if (subFilter === "prospecto") return s.crm_status === "prospecto" || s.user_type === "prospecto";
    if (subFilter === "activo") return s.crm_status === "activo" || !s.crm_status;
    if (subFilter === "inactivo_retorno") return s.crm_status === "inactivo_retorno" || (s.days_inactive && s.days_inactive > 45);
    if (subFilter === "en_riesgo") return s.crm_status === "en_riesgo" || (s.days_inactive && s.days_inactive > 14 && s.days_inactive <= 45);
    return true;
  });

  // Filtrado por Pestaña 2: Directorio de Tutores y Familiares
  const guardiansList = students.filter(s => {
    return s.account_category === "guardian_family" || 
      s.user_type === "tutor" || 
      s.role === "parent" || 
      s.role === "guardian";
  });

  const displayedList = activeTab === "athletes" ? athletesList : guardiansList;

  return (
    <div className="w-full bg-[#0a0d14] border border-zinc-800 rounded-3xl p-5 sm:p-8 text-zinc-100 shadow-2xl space-y-6">
      
      {/* HEADER: PIPELINE CRM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Motor Autónomo • Diagnóstico & CRM Deportivo
          </span>
          <h2 className="text-2xl font-black uppercase text-white mt-2">Nivelación Automática de Atletas</h2>
        </div>

        {/* SUB-FILTROS DE ATLETAS */}
        {activeTab === "athletes" && (
          <div className="flex flex-wrap gap-1.5 bg-[#121724] p-1.5 rounded-2xl border border-zinc-800 text-xs">
            {[
              { id: "todos", label: "Todos los Atletas" },
              { id: "activo", label: "Alumnos Activos" },
              { id: "prospecto", label: "Prospectos" },
              { id: "inactivo_retorno", label: "Retorno (>45d)" },
              { id: "en_riesgo", label: "En Riesgo" }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSubFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition cursor-pointer ${
                  subFilter === f.id ? "bg-orange-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PESTAÑAS PRINCIPALES DE SEPARACIÓN */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("athletes");
            if (athletesList.length > 0 && !athletesList.some(a => a.id === selectedStudent?.id)) {
              selectStudent(athletesList[0]);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase text-xs transition cursor-pointer ${
            activeTab === "athletes"
              ? "bg-[#f66018] text-white shadow-lg shadow-orange-950/40"
              : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Activity className="w-4 h-4 text-white" />
          <span>Atletas / Alumnos en Cancha ({athletesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("guardians");
            if (guardiansList.length > 0 && !guardiansList.some(g => g.id === selectedStudent?.id)) {
              selectStudent(guardiansList[0]);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase text-xs transition cursor-pointer ${
            activeTab === "guardians"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
              : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          <Users className="w-4 h-4 text-purple-300" />
          <span>Directorio de Tutores y Familiares ({guardiansList.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LISTA RÁPIDA DE SELECCIÓN */}
        <div className="bg-[#121724] border border-zinc-800/80 rounded-2xl p-4 space-y-3 max-h-[580px] overflow-y-auto">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
            {activeTab === "athletes" ? `Atletas en Cancha (${displayedList.length}):` : `Tutores Registrados (${displayedList.length}):`}
          </span>

          {displayedList.length === 0 ? (
            <p className="text-xs text-zinc-500 p-3">
              {activeTab === "athletes" ? "No hay atletas en esta vista." : "No hay tutores o familiares registrados aún."}
            </p>
          ) : (
            displayedList.map(s => {
              const isSelected = selectedStudent?.id === s.id;
              const isReturning = s.crm_status === "inactivo_retorno" || (s.days_inactive && s.days_inactive > 45);
              const isProspect = s.is_prospect_record || s.user_type === "prospecto";

              return (
                <div
                  key={s.id}
                  onClick={() => selectStudent(s)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? activeTab === "athletes" 
                        ? "bg-orange-600/20 border-orange-500 text-white shadow-md ring-1 ring-orange-500/40"
                        : "bg-purple-600/20 border-purple-500 text-white shadow-md ring-1 ring-purple-500/40"
                      : "bg-[#0a0d14] border-zinc-800 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs truncate">{s.full_name || s.email}</h4>
                      {isReturning && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                          Retorno Obligatorio
                        </span>
                      )}
                      {isProspect && (
                        <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                          Pre-Ficha
                        </span>
                      )}
                    </div>

                    {activeTab === "athletes" ? (
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                        Nivel Actual: <b className="text-zinc-300 uppercase">{s.current_tier ? s.current_tier.replace("_", " ") : "Sin nivel"}</b>
                        {s.tutor_name && <span className="block text-zinc-400">Tutor: {s.tutor_name}</span>}
                      </span>
                    ) : (
                      <span className="text-[10px] text-purple-400 font-mono block mt-0.5">
                        Parentesco: <b className="text-zinc-200 capitalize">{s.relationship_type ? s.relationship_type.replace("_", " ") : "Tutor / Familiar"}</b>
                        {s.linked_student_name && <span className="block text-emerald-400">Atleta: {s.linked_student_name}</span>}
                      </span>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* DETALLE Y ACCIONES: FORMULARIO Y SELECTOR DE ROL */}
        <div className="lg:col-span-2 bg-[#121724] border border-zinc-800 rounded-2xl p-5 space-y-5">
          
          {/* HEADER DEL ATLETA / TUTOR SELECCIONADO */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                {activeTab === "athletes" ? "Evaluando Atleta:" : "Gestionando Perfil Familiar:"}
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white uppercase">{selectedStudent?.full_name || "Selecciona un Usuario"}</h3>
                {selectedStudent?.is_prospect_record && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    Pre-Ficha Familiar / Tutor: {selectedStudent.tutor_name}
                  </span>
                )}
              </div>
            </div>

            {selectedStudent?.current_tier && activeTab === "athletes" && (
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Nivel Guardado:</span>
                <span className="text-xs font-black text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {selectedStudent.current_tier.replace("_", " ")}
                </span>
              </div>
            )}
          </div>

          {/* MÓDULO INTERACTIVO DE ASIGNACIÓN DE ROL Y PARENTESCO */}
          {selectedStudent && (
            <div className="p-4 rounded-xl bg-[#0a0d14] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-zinc-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#f66018]" />
                  Selector Funcional de Rol y Parentesco
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Sincronización en Tiempo Real</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Selector de Rol */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Rol en la Academia:</label>
                  <select
                    value={selectedRoleOption}
                    onChange={(e) => setSelectedRoleOption(e.target.value)}
                    className="w-full h-10 px-3 bg-[#121724] border border-zinc-700 rounded-lg font-bold text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Alumno Activo">Alumno Activo (En Cancha)</option>
                    <option value="Padre / Madre">Padre / Madre</option>
                    <option value="Tutor Familiar">Tutor Familiar</option>
                    <option value="Otro">Otro Familiar</option>
                  </select>
                </div>

                {/* 2. Parentesco (si es tutor) */}
                {selectedRoleOption !== "Alumno Activo" && (
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Parentesco Específico:</label>
                    <select
                      value={selectedRelationship}
                      onChange={(e) => setSelectedRelationship(e.target.value)}
                      className="w-full h-10 px-3 bg-[#121724] border border-zinc-700 rounded-lg font-bold text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="madre">Madre</option>
                      <option value="padre">Padre</option>
                      <option value="abuela">Abuela</option>
                      <option value="abuelo">Abuelo</option>
                      <option value="tutor_familiar">Tutor Legal / Familiar</option>
                      <option value="hermano_mayor">Hermano(a) Mayor</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                )}

                {/* 3. Vincular a Alumno (si es tutor) */}
                {selectedRoleOption !== "Alumno Activo" && (
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-emerald-400" /> Vincular a Alumno:
                    </label>
                    <select
                      value={selectedLinkedStudentName}
                      onChange={(e) => setSelectedLinkedStudentName(e.target.value)}
                      className="w-full h-10 px-3 bg-[#121724] border border-zinc-700 rounded-lg font-bold text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="">-- Seleccionar Alumno --</option>
                      {registeredAthletes.map(ath => (
                        <option key={ath.id} value={ath.full_name}>
                          {ath.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleUpdateUserRole}
                  disabled={updatingRole}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingRole ? "animate-spin" : ""}`} />
                  <span>{updatingRole ? "Actualizando Rol..." : "Actualizar Rol"}</span>
                </button>

                {roleUpdateMsg && (
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {roleUpdateMsg}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* FORMULARIO DE EVALUACIÓN EXPRÉS DE COLOCACIÓN (SOLO PARA ATLETAS) */}
          {activeTab === "athletes" && (
            <form onSubmit={handleRunSmartAssessment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Vueltas a la cancha sin detenerse:</label>
                  <input
                    type="number"
                    min="0"
                    value={laps}
                    onChange={(e) => setLaps(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="Ej. 2 para principiante, 10 para intermedio"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Saltos de cuerda continuos logrados:</label>
                  <input
                    type="number"
                    min="0"
                    value={rope}
                    onChange={(e) => setRope(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="Ej. 30 saltos"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Repeticiones de lagartijas completadas:</label>
                  <input
                    type="number"
                    min="0"
                    value={pushups}
                    onChange={(e) => setPushups(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="Ej. 15 reps"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Forma / Técnica de Lagartija observada:</label>
                  <select
                    value={pushupsForm}
                    onChange={(e) => setPushupsForm(e.target.value)}
                    className="w-full h-11 px-3 bg-[#0a0d14] border border-zinc-700 rounded-xl font-bold text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="hincado">1. Rodillas / Hincado (Iniciación)</option>
                    <option value="brazos_cerrados">2. Brazos Cerrados estándar</option>
                    <option value="brazos_abiertos">3. Brazos Abiertos</option>
                    <option value="pie_sobre_pie">4. Pie sobre pie alternado (Avanzado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 text-xs">Observaciones del Coach / Motivo de ausencia si aplica:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-[#0a0d14] border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="Ej. El alumno regresó tras 2 meses de inactividad por escuela. Buena memoria muscular pero requiere readaptación cardiovascular."
                />
              </div>

              <button
                type="submit"
                disabled={analyzing || !selectedStudent}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-purple-600 via-orange-600 to-amber-500 text-white font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition shadow-xl cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{analyzing ? "Analizando y Posicionando Atleta..." : "Ejecutar Nivelación Inteligente y Asignar Nivel"}</span>
              </button>
            </form>
          )}

          {/* VISTA DEL DIRECTORIO DE TUTORES EN LA COLUMNA DE DETALLE */}
          {activeTab === "guardians" && (
            <div className="p-4 rounded-xl bg-[#0a0d14] border border-zinc-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-purple-300">Detalles del Tutor / Familiar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#121724] p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono block">Nombre Registrado:</span>
                  <span className="font-bold text-white text-sm">{selectedStudent?.full_name || "--"}</span>
                </div>
                <div className="bg-[#121724] p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono block">Correo Electrónico:</span>
                  <span className="font-bold text-zinc-300">{selectedStudent?.email || "--"}</span>
                </div>
                <div className="bg-[#121724] p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono block">Parentesco con el Alumno:</span>
                  <span className="font-bold text-amber-400 capitalize">{selectedStudent?.relationship_type ? selectedStudent.relationship_type.replace("_", " ") : "Tutor"}</span>
                </div>
                <div className="bg-[#121724] p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono block">Atleta a su Cargo:</span>
                  <span className="font-bold text-emerald-400">{selectedStudent?.linked_student_name || "Sin vincular"}</span>
                </div>
              </div>
            </div>
          )}

          {/* VEREDICTO VISUAL DE LA NIVELACIÓN */}
          {aiVerdict && (
            <div className="bg-[#0a0d14] border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Posicionamiento Exitoso
                </span>
                <p className="text-xs text-zinc-300 mt-0.5">
                  El atleta fue clasificado automáticamente en: <b className="text-white uppercase">{aiVerdict.replace("_", " ")}</b>.
                </p>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  El alumno ya tiene habilitadas las rutinas correspondientes a este nivel en su portal.
                </span>
              </div>
              <Zap className="w-6 h-6 text-amber-400 shrink-0" />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
