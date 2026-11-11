"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  Filter, 
  Receipt,
  Download,
  Users
} from "lucide-react";
import { 
  AttendanceRange, 
  AttendanceRecordItem, 
  AttendanceSummaryMetrics, 
  getAttendanceByTemporalRangeAction,
  registerAttendanceWithMakeupRuleAction
} from "@/app/actions/attendance-actions";

interface AttendanceHistoryViewProps {
  studentId?: string;
  studentName?: string;
  isCoachView?: boolean;
}

export default function AttendanceHistoryView({
  studentId,
  studentName = "Atleta Wild Wolves",
  isCoachView = false
}: AttendanceHistoryViewProps) {
  const [range, setRange] = useState<AttendanceRange>("mes");
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<AttendanceRecordItem[]>([]);
  const [metrics, setMetrics] = useState<AttendanceSummaryMetrics>({
    totalRecorded: 0,
    attendedCount: 0,
    justifiedCount: 0,
    makeupCount: 0,
    unjustifiedAbsences: 0,
    totalChargesMXN: 0,
    attendancePercentage: 100
  });
  const [makeupModalOpen, setMakeupModalOpen] = useState(false);
  const [selectedStudentForMakeup, setSelectedStudentForMakeup] = useState<string>(studentId || "");
  const [submittingMakeup, setSubmittingMakeup] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceByTemporalRangeAction({
        range,
        studentId
      });
      if (res.success) {
        setRecords(res.records);
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.warn("Aviso al consultar asistencias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [range, studentId]);

  const handleRegisterMakeupSession = async () => {
    if (!selectedStudentForMakeup) return;
    setSubmittingMakeup(true);
    try {
      const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
      const res = await registerAttendanceWithMakeupRuleAction({
        studentId: selectedStudentForMakeup,
        date: todayStr,
        shift: "Sábado Reposición (09:00 - 11:00)",
        status: "reposicion",
        makeupNotes: "Sesión de reposición fin de semana autorizada por Head Coach Ricardo."
      });
      if (res.success) {
        alert("¡Sesión de reposición registrada sin costo adicional!");
        setMakeupModalOpen(false);
        fetchAttendance();
      } else {
        alert("Error: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingMakeup(false);
    }
  };

  return (
    <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-5 sm:p-6 text-[#e2e2ea] shadow-xl space-y-6">
      
      {/* HEADER Y SELECTOR DE RANGO MULTITEMPORAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#282a30]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b00]" />
            <h3 className="text-base font-bold uppercase tracking-tight text-[#e2e2ea]">
              Control y Visor de Asistencias en Duela
            </h3>
          </div>
          <p className="text-xs text-[#e2bfb0] mt-0.5">
            Historial temporal verificado // Sede Carmen Serdán CDMX // Atleta: <strong className="text-white">{studentName}</strong>
          </p>
        </div>

        {/* SELECTOR DE PESTAÑAS TEMPORALES */}
        <div className="flex items-center gap-1 bg-[#191c21] p-1 rounded-xl border border-[#282a30] shadow-inner">
          {(["dia", "semana", "mes", "anio"] as AttendanceRange[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRange(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                range === tab
                  ? "bg-[#ff6b00] text-[#351000] shadow"
                  : "text-[#e2bfb0] hover:text-white hover:bg-[#282a30]"
              }`}
            >
              {tab === "dia" ? "Día" : tab === "semana" ? "Semana" : tab === "mes" ? "Mes" : "Año"}
            </button>
          ))}
        </div>
      </div>

      {/* TARJETAS KPI DE RESUMEN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#191c21] p-4 rounded-xl border border-[#282a30]">
          <span className="text-[10px] font-mono text-[#e2bfb0] uppercase tracking-wider block">Sesiones Asistidas</span>
          <div className="text-2xl font-black font-mono text-[#4edea3] mt-1">
            {metrics.attendedCount} <span className="text-xs font-normal text-[#e2bfb0]">de {metrics.totalRecorded}</span>
          </div>
          <span className="text-[11px] font-mono text-[#4edea3] block mt-1">
            ★ {metrics.attendancePercentage}% Constancia
          </span>
        </div>

        <div className="bg-[#191c21] p-4 rounded-xl border border-[#282a30]">
          <span className="text-[10px] font-mono text-[#e2bfb0] uppercase tracking-wider block">Reposiciones</span>
          <div className="text-2xl font-black font-mono text-[#7bd0ff] mt-1">
            {metrics.makeupCount} <span className="text-xs font-normal text-[#e2bfb0]">sesiones</span>
          </div>
          <span className="text-[11px] font-mono text-[#7bd0ff] block mt-1">
            Sin cargo adicional ($0)
          </span>
        </div>

        <div className="bg-[#191c21] p-4 rounded-xl border border-[#282a30]">
          <span className="text-[10px] font-mono text-[#e2bfb0] uppercase tracking-wider block">Faltas Justificadas</span>
          <div className="text-2xl font-black font-mono text-[#ffb693] mt-1">
            {metrics.justifiedCount}
          </div>
          <span className="text-[11px] font-mono text-[#ffb693] block mt-1">
            Cuota $50 congelada
          </span>
        </div>

        <div className="bg-[#191c21] p-4 rounded-xl border border-[#282a30]">
          <span className="text-[10px] font-mono text-[#e2bfb0] uppercase tracking-wider block">Aportaciones en Duela</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            ${metrics.totalChargesMXN} <span className="text-xs font-normal text-[#e2bfb0]">MXN</span>
          </div>
          <span className="text-[11px] font-mono text-[#4edea3] block mt-1">
            Tarifa $50 por sesión
          </span>
        </div>
      </div>

      {/* ACCIÓN EXCLUSIVA COACH: REGISTRAR REPOSICIÓN */}
      {isCoachView && (
        <div className="bg-[#191c21]/60 p-4 rounded-xl border border-[#ff6b00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff6b00]/20 text-[#ff6b00] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Módulo de Reposiciones de Fin de Semana</h4>
              <p className="text-xs text-[#e2bfb0]">Permite compensar inasistencias justificadas (ej. Isaac o Mateo) sin duplicar el cobro de $50 MXN.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMakeupModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#ff6b00] hover:bg-[#7a3000] text-[#351000] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Registrar Reposición</span>
          </button>
        </div>
      )}

      {/* TABLA CRONOLÓGICA DE ASISTENCIAS */}
      <div className="overflow-x-auto rounded-xl border border-[#282a30]">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-[#191c21] text-[#e2bfb0] font-mono uppercase border-b border-[#282a30]">
              <th className="py-2.5 px-3">Fecha</th>
              <th className="py-2.5 px-3">Atleta</th>
              <th className="py-2.5 px-3">Turno y Horario</th>
              <th className="py-2.5 px-3 text-center">Estatus Oficial</th>
              <th className="py-2.5 px-3">Cargo Duela</th>
              <th className="py-2.5 px-3">Observaciones Técnicas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282a30] bg-[#111319]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center font-mono text-[#e2bfb0]">
                  Cargando asistencias en duela...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center font-mono text-[#e2bfb0]">
                  No se registraron entrenamientos en este rango temporal.
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const isMakeup = r.status === "reposicion" || r.is_makeup_session;
                const isJustified = r.status === "falta_justificada" || r.status === "justificado_con_reposicion";
                const isPresent = r.status === "asistio";

                return (
                  <tr key={r.id} className="hover:bg-[#191c21]/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-[#e2e2ea] font-bold">
                      {r.date}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{r.student_name}</span>
                      <span className="font-mono text-[10px] text-[#ffb693]">#{r.jersey_number}</span>
                    </td>
                    <td className="py-3 px-3 text-[#e2bfb0] font-mono text-[11px]">
                      {r.shift}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isPresent && (
                        <span className="inline-flex items-center gap-1 bg-[#00ae78] text-[#003824] px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Asistió
                        </span>
                      )}
                      {isMakeup && (
                        <span className="inline-flex items-center gap-1 bg-[#7bd0ff]/20 text-[#7bd0ff] px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#7bd0ff]/30">
                          <RotateCcw className="w-3 h-3" /> Reposición
                        </span>
                      )}
                      {isJustified && (
                        <span className="inline-flex items-center gap-1 bg-[#ffb693]/20 text-[#ffb693] px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#ffb693]/30">
                          Justificada ($0)
                        </span>
                      )}
                      {r.status === "falta" && (
                        <span className="inline-flex items-center gap-1 bg-red-950/60 text-red-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-red-500/40">
                          Falta (Cargo $50)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {r.charge_amount > 0 ? (
                        <span className="text-[#e2e2ea]">${r.charge_amount} MXN</span>
                      ) : (
                        <span className="text-[#4edea3]">$0 (Sin Cobro)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#e2bfb0] max-w-xs truncate">
                      {r.makeup_notes || (isPresent ? "Entrenamiento regular completado al 100%." : "—")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REGISTRO DE REPOSICIÓN */}
      {makeupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#191c21] border border-[#282a30] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#282a30]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#ff6b00]" />
                <h4 className="font-bold text-sm uppercase text-white">Agendar Sesión de Reposición</h4>
              </div>
              <button
                type="button"
                onClick={() => setMakeupModalOpen(false)}
                className="text-[#e2bfb0] hover:text-white font-mono text-xs"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#e2bfb0] leading-relaxed">
              Esta sesión se marcará como <strong>Reposición Autorizada</strong> en la duela del Carmen Serdán. Sumará la asistencia al expediente del atleta y mantendrá el cargo en $0 MXN para no duplicar colegiatura.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-mono text-[#e2bfb0] uppercase block mb-1">Atleta Beneficiario</label>
                <input
                  type="text"
                  disabled
                  value={studentName}
                  className="w-full bg-[#111319] border border-[#282a30] rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#e2bfb0] uppercase block mb-1">Turno de Reposición</label>
                <input
                  type="text"
                  disabled
                  value="Sábado / Domingo (09:00 - 11:00 AM)"
                  className="w-full bg-[#111319] border border-[#282a30] rounded-lg px-3 py-2 text-xs font-mono text-[#7bd0ff]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#282a30]">
              <button
                type="button"
                onClick={() => setMakeupModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#282a30] text-[#e2e2ea] text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegisterMakeupSession}
                disabled={submittingMakeup}
                className="px-4 py-1.5 rounded-lg bg-[#ff6b00] hover:bg-[#7a3000] text-[#351000] text-xs font-bold transition shadow"
              >
                {submittingMakeup ? "Guardando..." : "Confirmar Reposición ($0)"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
