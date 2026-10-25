"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HoopStore } from "@/lib/store";
import { 
  enqueueOfflineAction, 
  getCachedRoster, 
  cacheRosterLocally, 
  syncOfflineQueueToSupabase,
  generateUUID,
  getOfflineQueueCount
} from "@/lib/offlineSync";
import { 
  Activity, 
  Sun, 
  Users, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Search, 
  RefreshCw, 
  X, 
  AlertCircle, 
  XCircle, 
  Settings,
  Sparkles,
  ShieldAlert,
  UserCheck,
  DollarSign,
  MessageCircle,
  Send,
  Share2,
  UserPlus,
  Zap,
  Target
} from "lucide-react";
import SportsTestExpressModal from "@/components/SportsTestExpressModal";
import { queueOfflineAction, saveLocalAthletes } from "@/lib/offline/db";
import ManageStudentFinanceModal, { 
  StudentFinanceData, 
  FinancialStatus, 
  UserType 
} from "@/components/ManageStudentFinanceModal";

export interface StudentRosterItem {
  id: string;
  full_name: string;
  number?: string;
  category?: string;
  schedule_days?: string;
  attendance_rate?: number;
  last_payment_status: "al_corriente" | "adeudo"; // compatibilidad interna
  financial_status: FinancialStatus;
  current_debt_amount: number;
  last_payment_amount?: number;
  last_session_date?: string;
  attendance_status?: "presente" | "retardo" | "falta";
  tutor_phone?: string;
  shift?: "matutino" | "vespertino" | string;
  user_type: UserType;
  training_days?: string;
  training_schedule?: string;
  selected_days?: string[];
  schedules_by_day?: Record<string, string>;
  is_prospect?: boolean;
  prospect_tutor?: string;
  scholarship_percentage?: number;
  default_class_cost?: number;
}

export default function CourtAttendanceCommand() {
  // Turnos: Matutino (9:00 AM), Vespertino (5:00 PM), Fin de Semana
  const [shift, setShift] = useState<"matutino" | "vespertino" | "fin_de_semana">(() => {
    if (typeof window === "undefined") return "vespertino";
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) return "fin_de_semana";
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const timeVal = hour + minutes / 60;
    // Si son entre las 08:00 y las 12:30 hrs -> Turno Matutino
    if (timeVal >= 8 && timeVal < 12.5) {
      return "matutino";
    }
    // De lo contrario -> Turno Vespertino (16:30 - 19:30 o Domingo 16:00 - 18:00)
    return "vespertino";
  });
  
  // Selector de fecha CDMX para sesión y filtrado de asistencia
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());
  });

  // Notificación de guardado instantáneo 1-tap
  const [instantSaveToast, setInstantSaveToast] = useState<string | null>(null);

  const [filterMode, setFilterMode] = useState<"scheduled_today" | "all">("scheduled_today");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "al_corriente" | "adeudo" | "abono_parcial" | "becado">("all");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "alumno" | "prospecto" | "visitante" | "tutor">("all");
  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  // Modal rápido de cobro en cancha de 1 toque (Efectivo / Transferencia)
  const [selectedAthleteForQuickPay, setSelectedAthleteForQuickPay] = useState<StudentRosterItem | null>(null);
  const [quickPayAmount, setQuickPayAmount] = useState<number>(150);
  const [quickPayMethod, setQuickPayMethod] = useState<"efectivo" | "transferencia">("efectivo");

  // Ventana modal de éxito con Generador de Comprobante WhatsApp
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<{
    athleteName: string;
    amountPaid: number;
    paymentMethod: string;
    date: string;
    remainingDebt: number;
    tutorPhone: string;
  } | null>(null);

  // Modal táctil de finanzas y horarios
  const [selectedStudentForFinance, setSelectedStudentForFinance] = useState<StudentRosterItem | null>(null);

  // Modal para Pruebas Deportivas Express en Cancha (Tiro & Velocidad)
  const [selectedAthleteForSportsTest, setSelectedAthleteForSportsTest] = useState<StudentRosterItem | null>(null);

  // Modal de Registro Rápido en Cancha [+ Nuevo Atleta en Cancha] (Caso Osmar López)
  const [isFastAthleteModalOpen, setIsFastAthleteModalOpen] = useState<boolean>(false);
  const [fastAthleteName, setFastAthleteName] = useState<string>("");
  const [fastAthleteCategory, setFastAthleteCategory] = useState<string>("U-15 FORMATIVO");
  const [fastAthleteShift, setFastAthleteShift] = useState<"matutino" | "vespertino">("vespertino");
  const [fastAthleteTutor, setFastAthleteTutor] = useState<string>("Abuela: Catalina Lopez / Padre: Omar Lopez");
  const [fastAthletePhone, setFastAthletePhone] = useState<string>("55 2242 7769");

  // Lista de atletas con carga resiliente
  const [students, setStudents] = useState<StudentRosterItem[]>([]);

  const daysMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const currentDayName = daysMap[new Date().getDay()];
  const todayFormatted = new Intl.DateTimeFormat("es-MX", { 
    weekday: "long", 
    day: "numeric", 
    month: "short" 
  }).format(new Date());

  const loadRoster = useCallback(async () => {
    try {
      // 1. Intentar cargar desde Supabase si hay conexión con timeout de protección
      if (typeof window !== "undefined" && navigator.onLine) {
        const fetchProfilesPromise = supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        // Timeout de 3.5 segundos para no colgar la UI en canchas con baja señal celular
        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout de red en duela")), 3500)
        );

        let profiles: any[] | null = null;
        try {
          const res: any = await Promise.race([fetchProfilesPromise, timeoutPromise]);
          profiles = res?.data || null;
        } catch {
          // Si timeout o red inestable, saltar de inmediato al caché local
          profiles = null;
        }

        if (profiles && profiles.length > 0) {
          const { data: comms } = await supabase
            .from("attendance_commitments")
            .select("user_id, days_selected, shift");

          const { data: payments } = await supabase
            .from("membership_payments")
            .select("student_id, amount, status, payment_date")
            .order("payment_date", { ascending: false });

          let todayAttendance: any[] = [];
          try {
            const targetDate = selectedDate || new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Mexico_City",
            }).format(new Date());
            const { data: attData, error: attError } = await supabase
              .from("daily_attendance")
              .select("id, student_id, status, date")
              .eq("date", targetDate);
            if (attError) {
              console.warn("Aviso en daily_attendance de CourtAttendanceCommand:", attError.message);
            } else if (attData) {
              todayAttendance = attData;
            }
          } catch (err) {
            console.error("Fallo recuperable en asistencia:", err);
          }

          // Exclusión permanente del Head Coach Ricardo de listas de evaluación
          // Exclusión permanente del Head Coach Ricardo y tutores/familiares de listas de evaluación en cancha
          const nonCoachProfiles = (profiles || []).filter((p: any) => {
            if (!p) return false;
            const email = (p.email || "").toLowerCase().trim();
            const role = (p.role || "").toLowerCase().trim();
            const cat = (p.account_category || "").toLowerCase().trim();
            if (email === "wildwolvescdmx@gmail.com" || email === "ricardo@wildwolves.mx") return false;
            if (role === "superadmin" || role === "coach") return false;
            // Exclusión estricta de tutores de tarjetas de cancha
            if (role === "guardian" || role === "parent" || cat === "guardian_family") return false;
            return true;
          });

          // Consultar pre-fichas de prospect_athletes
          let prospects: any[] = [];
          try {
            const { data: pData } = await supabase
              .from("prospect_athletes")
              .select("*")
              .order("created_at", { ascending: false });
            if (pData) prospects = pData;
          } catch {
            // Fallback silencioso
          }

          const mapped: StudentRosterItem[] = nonCoachProfiles.map((p: any, idx: number) => {
            const comm = comms?.find((c: any) => c.user_id === p.id);
            const pay = payments?.find((pay: any) => pay.student_id === p.id);
            const att = todayAttendance?.find((a: any) => a.student_id === p.id);

            // Determinar rol real de usuario
            let uType: UserType = "alumno";
            if (p.account_category === "guardian_family" || p.role === "parent" || p.role === "guardian") {
              uType = "tutor";
            } else if (p.user_type) {
              uType = p.user_type as UserType;
            }

            // Determinar estatus financiero dinámico
            let finStatus: FinancialStatus = "al_corriente";
            let debtAmt = 0;

            if (p.scholarship_percentage === 100) {
              finStatus = "becado";
              debtAmt = 0;
            } else if (p.financial_status) {
              finStatus = p.financial_status as FinancialStatus;
              debtAmt = Number(p.current_debt_amount ?? (finStatus === "adeudo_pendiente" ? 150 : 0));
            } else {
              const isPaid = pay ? pay.status === "pagado" : false;
              if (isPaid) {
                finStatus = "al_corriente";
                debtAmt = 0;
              } else {
                finStatus = "adeudo_pendiente";
                debtAmt = pay ? Number(pay.amount) : 150;
              }
            }

            const scheduleDays = p.training_days || (comm?.days_selected?.join("-") || "Lun-Mié-Vie");
            const scheduleTime = p.training_schedule || (comm?.shift?.includes("matutino") ? "Matutino: 09:00 - 11:00" : "Vespertino: 17:00 - 19:00");
            const shiftResolved = scheduleTime.toLowerCase().includes("matutino") || comm?.shift?.includes("matutino") ? "matutino" : "vespertino";

            return {
              id: p.id,
              full_name: p.full_name || "Atleta Wild Wolves",
              number: `#${(idx * 7 + 8) % 99 || 11}`,
              category: idx % 3 === 0 ? "U-15 FORMATIVO" : idx % 3 === 1 ? "U-17 COMPETITIVO" : "ADULTOS +20",
              schedule_days: scheduleDays,
              training_days: scheduleDays,
              training_schedule: scheduleTime,
              shift: shiftResolved,
              selected_days: p.selected_days || (comm?.days_selected ? comm.days_selected.map((d: string) => d.toLowerCase()) : undefined),
              schedules_by_day: p.schedules_by_day,
              attendance_rate: 85,
              financial_status: finStatus,
              current_debt_amount: debtAmt,
              last_payment_status: (finStatus === "adeudo_pendiente" || finStatus === "abono_parcial") ? "adeudo" : "al_corriente",
              last_payment_amount: debtAmt > 0 ? debtAmt : (pay ? Number(pay.amount) : 150),
              attendance_status: (att?.status as any) || undefined,
              tutor_phone: p.parent_phone || p.emergency_phone || "+525522427769",
              user_type: uType,
              is_prospect: false,
              scholarship_percentage: p.scholarship_percentage ?? 0,
              default_class_cost: p.default_class_cost ?? 50
            };
          });

          // Integrar prospectos pre-registrados que no hayan reclamado cuenta
          const mappedProspects: StudentRosterItem[] = prospects
            .filter(pr => {
              if (!pr) return false;
              const prospectName = (pr.athlete_full_name || pr.full_name || "").toLowerCase().trim();
              return !nonCoachProfiles.some(p => {
                if (!p) return false;
                const pName = (p.full_name || p.name || "").toLowerCase().trim();
                return p.id === pr.claimed_user_id || (pName && prospectName && (pName.includes(prospectName) || prospectName.includes(pName)));
              });
            })
            .map((pr, pIdx) => ({
              id: pr.id || `prospect_${pr.athlete_full_name}`,
              full_name: pr.athlete_full_name,
              number: `#P${pIdx + 1}`,
              category: "PROSPECTO EN CANCHA",
              schedule_days: "Lun-Mié-Vie",
              training_days: "Lun-Mié-Vie",
              training_schedule: "Vespertino: 17:00 - 19:00",
              shift: "vespertino",
              attendance_rate: 100,
              financial_status: "al_corriente",
              current_debt_amount: 0,
              last_payment_status: "al_corriente",
              last_payment_amount: 0,
              tutor_phone: pr.contact_phone || pr.emergency_phone || "+525522427769",
              user_type: "prospecto",
              is_prospect: true,
              prospect_tutor: pr.guardian_name || pr.tutor_name || "Catalina Lopez"
            }));

          const finalRoster = [...mapped, ...mappedProspects];
          setStudents(finalRoster);
          cacheRosterLocally(finalRoster);
          return;
        } else {
          setStudents([]);
          return;
        }
      }

      // 2. Fallback offline solo si hay atletas reales cacheados previamente
      const cached = getCachedRoster();
      if (cached && cached.length > 0) {
        setStudents(cached);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.warn("Fallo cargando roster en CourtAttendanceCommand:", err);
      setStudents([]);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      setOfflineCount(getOfflineQueueCount());
    }
    loadRoster();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueUpdated = (e: any) => {
      setOfflineCount(e.detail?.count ?? getOfflineQueueCount());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline_queue_updated", handleQueueUpdated as EventListener);
    window.addEventListener("payment_recorded", loadRoster);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline_queue_updated", handleQueueUpdated as EventListener);
      window.removeEventListener("payment_recorded", loadRoster);
    };
  }, [loadRoster]);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await syncOfflineQueueToSupabase();
      setOfflineCount(getOfflineQueueCount());
      await loadRoster();
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: "presente" | "retardo" | "falta") => {
    // Optimistic UI update
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance_status: status } : s));

    // Toast de guardado instantáneo 1-tap
    setInstantSaveToast("🟢 Guardado al instante");
    setTimeout(() => {
      setInstantSaveToast(null);
    }, 2500);

    const targetDate = selectedDate || new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());
    const shiftCode = shift === "matutino" ? "matutino_9_11" : shift === "fin_de_semana" ? "fin_de_semana" : "vespertino_5_7";
    const payload = {
      student_id: studentId,
      date: targetDate,
      status
    };

    // Sincronizar en HoopStore
    HoopStore.recordDailyAttendance(
      studentId,
      targetDate,
      shiftCode,
      status,
      "Pase de lista Stitch Command"
    );

    if (!navigator.onLine) {
      enqueueOfflineAction("ATTENDANCE", payload);
      setOfflineCount(getOfflineQueueCount());
    } else {
      try {
        await supabase.from("daily_attendance").upsert(payload, { onConflict: "student_id,date" });
      } catch {
        enqueueOfflineAction("ATTENDANCE", payload);
        setOfflineCount(getOfflineQueueCount());
      }
    }
  };

  // 1-TAP COBRO INSTANTÁNEO EN CANCHA (Sin modales lentos)
  const handleInstantQuickPay = async (st: StudentRosterItem) => {
    if (st.scholarship_percentage === 100) {
      setInstantSaveToast("🎓 Alumno Becado 100% (Cuota $0)");
      setTimeout(() => setInstantSaveToast(null), 2500);
      return;
    }

    const studentId = st.id;
    const amountToCharge = Number(st.current_debt_amount > 0 ? st.current_debt_amount : (st.default_class_cost || 50));
    const targetDate = selectedDate || new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());

    const currentDebt = Number(st.current_debt_amount) || 0;
    const nextDebt = Math.max(0, currentDebt - amountToCharge);
    const nextFinStatus: FinancialStatus = "al_corriente";

    // 1. Actualización optimista de UI
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        current_debt_amount: nextDebt,
        financial_status: nextFinStatus,
        last_payment_status: "al_corriente",
        last_payment_amount: amountToCharge,
        last_session_date: targetDate,
      };
    }));

    // Toast de guardado instantáneo
    setInstantSaveToast(`🟢 Guardado al instante • Cobro de $${amountToCharge} MXN asentado`);
    setTimeout(() => {
      setInstantSaveToast(null);
    }, 3000);

    // Actualizar caché local
    const cached = getCachedRoster();
    if (cached && cached.length > 0) {
      const updatedCache = cached.map((s: any) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          current_debt_amount: nextDebt,
          financial_status: nextFinStatus,
          last_payment_status: "al_corriente",
          last_payment_amount: amountToCharge,
        };
      });
      cacheRosterLocally(updatedCache);
    }

    // Payload para Supabase payment_transactions_history y profiles
    const transactionPayload = {
      student_id: studentId,
      amount_paid: amountToCharge,
      remaining_debt: nextDebt,
      payment_method: "efectivo",
      concept: `Clase Cancha Carmen Serdán (${targetDate})`,
      transaction_date: targetDate,
      created_at: new Date().toISOString(),
    };

    const profileUpdatePayload = {
      id: studentId,
      current_debt_amount: nextDebt,
      financial_status: nextFinStatus,
    };

    if (!navigator.onLine) {
      enqueueOfflineAction("PAYMENT", transactionPayload);
      enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", profileUpdatePayload);
      setOfflineCount(getOfflineQueueCount());
    } else {
      try {
        await supabase.from("payment_transactions_history").insert(transactionPayload);
        await supabase.from("profiles").update({
          current_debt_amount: nextDebt,
          financial_status: nextFinStatus
        }).eq("id", studentId);
      } catch {
        enqueueOfflineAction("PAYMENT", transactionPayload);
        enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", profileUpdatePayload);
        setOfflineCount(getOfflineQueueCount());
      }
    }

    window.dispatchEvent(new Event("payment_recorded"));
  };

  // Cambio rápido inline de Tipo de Usuario
  const handleQuickChangeUserType = async (studentId: string, newType: UserType) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, user_type: newType } : s));
    
    const payload = {
      id: studentId,
      user_type: newType
    };

    if (!navigator.onLine) {
      enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", payload);
      setOfflineCount(getOfflineQueueCount());
    } else {
      try {
        await supabase.from("profiles").update({ user_type: newType }).eq("id", studentId);
      } catch {
        enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", payload);
        setOfflineCount(getOfflineQueueCount());
      }
    }
  };

  // 2. PASO: REGISTRAR COBRO RÁPIDO EN CANCHA AL TERMINAR LA CLASE
  const handleRegisterQuickPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteForQuickPay) return;

    const studentId = selectedAthleteForQuickPay.id;
    const amount = Number(quickPayAmount) || 0;
    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
    }).format(new Date());

    const currentDebt = Number(selectedAthleteForQuickPay.current_debt_amount) || 0;
    const nextDebt = Math.max(0, currentDebt - amount);
    const nextFinStatus: FinancialStatus = nextDebt <= 0 ? "al_corriente" : "abono_parcial";

    // 1. Optimistic UI update en el estado local de alumnos
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      return {
        ...s,
        current_debt_amount: nextDebt,
        financial_status: nextFinStatus,
        last_payment_status: nextFinStatus === "al_corriente" ? "al_corriente" : "adeudo",
        last_payment_amount: amount,
        last_session_date: todayDate,
      };
    }));

    // Actualizar también la caché local
    const cached = getCachedRoster();
    if (cached && cached.length > 0) {
      const updatedCache = cached.map((s: any) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          current_debt_amount: nextDebt,
          financial_status: nextFinStatus,
          last_payment_status: nextFinStatus === "al_corriente" ? "al_corriente" : "adeudo",
          last_payment_amount: amount,
        };
      });
      cacheRosterLocally(updatedCache);
    }

    // 2. Payload para historial de transacciones y pagos
    const transactionPayload = {
      student_id: studentId,
      amount_paid: amount,
      payment_method: quickPayMethod,
      concept: `Cuota Cancha Carmen Serdán (${todayDate})`,
      transaction_date: todayDate,
      created_at: new Date().toISOString(),
    };

    const profileUpdatePayload = {
      id: studentId,
      current_debt_amount: nextDebt,
      financial_status: nextFinStatus,
    };

    if (!navigator.onLine) {
      enqueueOfflineAction("PAYMENT_TRANSACTION", transactionPayload);
      enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", profileUpdatePayload);
      setOfflineCount(getOfflineQueueCount());
    } else {
      try {
        await supabase.from("payment_transactions_history").insert(transactionPayload);
        await supabase.from("profiles").update({
          current_debt_amount: nextDebt,
          financial_status: nextFinStatus,
        }).eq("id", studentId);
      } catch {
        enqueueOfflineAction("PAYMENT_TRANSACTION", transactionPayload);
        enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", profileUpdatePayload);
        setOfflineCount(getOfflineQueueCount());
      }
    }

    const athleteName = selectedAthleteForQuickPay.full_name;
    const tutorPhone = selectedAthleteForQuickPay.tutor_phone || "5522427769";

    // Disparar ventana de éxito con generador de comprobante WhatsApp
    setPaymentSuccessReceipt({
      athleteName,
      amountPaid: amount,
      paymentMethod: quickPayMethod,
      date: todayDate,
      remainingDebt: nextDebt,
      tutorPhone,
    });

    setSelectedAthleteForQuickPay(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("payment_recorded"));
    }
  };

  // 3. PASO: ALTA RÁPIDA DE ATLETA EN CANCHA (CASO OSMAR LÓPEZ)
  const handleCreateFastAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fastAthleteName.trim();
    if (!cleanName) return;

    const newId = `prospect_${Date.now()}`;
    const newAthleteItem: StudentRosterItem = {
      id: newId,
      full_name: cleanName,
      number: `#P${students.length + 1}`,
      category: fastAthleteCategory,
      schedule_days: "Lun-Mié-Vie",
      training_days: "Lun-Mié-Vie",
      training_schedule: fastAthleteShift === "matutino" ? "Matutino: 09:00 - 11:00" : "Vespertino: 17:00 - 19:00",
      shift: fastAthleteShift,
      attendance_rate: 100,
      financial_status: "al_corriente",
      current_debt_amount: 0,
      last_payment_status: "al_corriente",
      last_payment_amount: 0,
      tutor_phone: fastAthletePhone.trim() || "+525522427769",
      user_type: "prospecto",
      is_prospect: true,
      prospect_tutor: fastAthleteTutor.trim() || "Catalina Lopez"
    };

    // 1. Inserción optimista inmediata en la UI de cancha
    setStudents(prev => [newAthleteItem, ...prev]);

    // 2. Guardar en caché local y base IndexedDB del dispositivo
    const cached = getCachedRoster() || [];
    cacheRosterLocally([newAthleteItem, ...cached]);
    saveLocalAthletes([newAthleteItem, ...cached]);

    // 3. Payload para prospect_athletes
    const prospectPayload = {
      id: newId,
      athlete_full_name: cleanName,
      category: fastAthleteCategory,
      shift: fastAthleteShift,
      tutor_name: fastAthleteTutor.trim() || "Catalina Lopez",
      contact_phone: fastAthletePhone.trim() || "+525522427769",
      notes: "Pre-ficha rápida creada en cancha por Head Coach Ricardo.",
      created_at: new Date().toISOString()
    };

    if (!navigator.onLine) {
      queueOfflineAction({
        type: "PROSPECT_STUDENT",
        table: "prospect_athletes",
        payload: prospectPayload
      });
      enqueueOfflineAction("PROFILE_FINANCIAL_UPDATE", prospectPayload);
      setOfflineCount(getOfflineQueueCount());
    } else {
      try {
        await supabase.from("prospect_athletes").upsert(prospectPayload, { onConflict: "athlete_full_name" });
      } catch {
        queueOfflineAction({
          type: "PROSPECT_STUDENT",
          table: "prospect_athletes",
          payload: prospectPayload
        });
        setOfflineCount(getOfflineQueueCount());
      }
    }

    // Resetear formulario y cerrar modal
    setFastAthleteName("");
    setIsFastAthleteModalOpen(false);
  };

  // Callback exitoso del modal de finanzas
  const handleFinanceModalSuccess = (updated: StudentFinanceData) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== updated.id) return s;
      return {
        ...s,
        financial_status: updated.financial_status,
        current_debt_amount: updated.current_debt_amount,
        training_days: updated.training_days,
        training_schedule: updated.training_schedule,
        schedule_days: updated.training_days,
        user_type: updated.user_type,
        selected_days: updated.selected_days,
        schedules_by_day: updated.schedules_by_day,
        last_payment_status: (updated.financial_status === "adeudo_pendiente" || updated.financial_status === "abono_parcial") ? "adeudo" : "al_corriente",
        last_payment_amount: updated.current_debt_amount,
      };
    }));
  };

  // Filtrado reactivo de atletas
  // Si filterMode es "scheduled_today", enfocamos en atletas en cancha (excluyendo tutores del turno de duela directo),
  // pero en "all" o cuando se busca/filtra por tutor, mostramos a todos los usuarios registrados sin omisiones.
  const onCourtCandidates = (filterMode === "scheduled_today" && userTypeFilter !== "tutor")
    ? students.filter(s => s.user_type !== "tutor")
    : students;

  // Identificador del día seleccionado o día actual
  const getDayKeyFromDateStr = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][d.getDay()];
    } catch {
      return ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][new Date().getDay()];
    }
  };

  const currentDayKey = getDayKeyFromDateStr(selectedDate);

  // Función para determinar si el atleta entrena hoy y en qué turno
  const isStudentScheduledForSession = (st: StudentRosterItem, targetShift: "matutino" | "vespertino" | "fin_de_semana"): boolean => {
    // 1. Fin de semana especial
    if (targetShift === "fin_de_semana") {
      const rawDays = ((st.training_days || "") + " " + (st.schedule_days || "") + " " + (st.training_schedule || "")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const isFinDeSemanaScheduled = rawDays.includes("sab") || rawDays.includes("dom") || rawDays.includes("fin de semana");
      const hasWeekendInSelected = st.selected_days?.some(d => {
        const norm = d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return norm.includes("sab") || norm.includes("dom");
      });
      return Boolean(isFinDeSemanaScheduled || hasWeekendInSelected);
    }

    // 2. Si tiene configuración granular día por día
    if (st.selected_days && st.selected_days.length > 0) {
      const isDaySelected = st.selected_days.some(d => {
        const norm = d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return norm === currentDayKey || norm.startsWith(currentDayKey.slice(0, 3));
      });
      if (!isDaySelected) return false;

      // Verificar franja horaria para el día de hoy
      if (st.schedules_by_day && st.schedules_by_day[currentDayKey]) {
        const daySchedule = st.schedules_by_day[currentDayKey];
        if (targetShift === "matutino") return daySchedule.includes("09:00");
        if (targetShift === "vespertino") return daySchedule.includes("17:00") || daySchedule.includes("16:00");
      }
    }

    // 3. Fallback a cadena de días (ej. Lun-Mié-Vie o Martes)
    if (st.schedule_days || st.training_days) {
      const rawDays = (st.schedule_days || st.training_days || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const dayPrefix = currentDayKey.slice(0, 3); // lun, mar, mie, jue, vie, sab, dom
      const matchesDay = rawDays.includes(dayPrefix) || rawDays.includes("diario");
      if (!matchesDay) return false;
    }

    // 4. Si el horario explícito contempla turnos combinados (ej. Matutino / Vespertino)
    const scheduleStr = ((st.training_schedule || "") + " " + (st.schedule_days || "")).toLowerCase();
    if (scheduleStr.includes("matutino") && scheduleStr.includes("vespertino")) {
      return true;
    }

    // 5. Fallback de turno general
    if (st.shift) {
      return st.shift === targetShift;
    }

    return true;
  };

  const filtered = (onCourtCandidates || []).filter(st => {
    if (!st) return false;
    // 1. Búsqueda
    const q = (search || "").toLowerCase().trim();
    const stName = (st.full_name || "").toLowerCase();
    const stCat = (st.category || "").toLowerCase();
    const stNum = (st.number || "").toLowerCase();

    const matchesSearch = 
      !q ||
      stName.includes(q) ||
      stCat.includes(q) ||
      stNum.includes(q);
    if (!matchesSearch) return false;

    // 2. Filtro de Turno / Día Programado Granular
    if (filterMode === "scheduled_today") {
      if (!isStudentScheduledForSession(st, shift)) return false;
    }

    // 3. Filtro Financiero Reactivo
    if (paymentFilter === "al_corriente" && st.financial_status !== "al_corriente") return false;
    if (paymentFilter === "adeudo" && st.financial_status !== "adeudo_pendiente") return false;
    if (paymentFilter === "abono_parcial" && st.financial_status !== "abono_parcial") return false;
    if (paymentFilter === "becado" && st.financial_status !== "becado") return false;

    // 4. Filtro por Rol / Tipo de Usuario
    if (userTypeFilter !== "all" && st.user_type !== userTypeFilter) return false;

    return true;
  });

  // Métricas calculadas para la barra táctica (excluyendo tutores)
  const sessionStudents = onCourtCandidates.filter(s => filterMode === "all" || isStudentScheduledForSession(s, shift));
  const totalInSession = sessionStudents.length;
  const presentCount = sessionStudents.filter(s => s.attendance_status === "presente").length;
  const lateCount = sessionStudents.filter(s => s.attendance_status === "retardo").length;
  const absentCount = sessionStudents.filter(s => s.attendance_status === "falta").length;
  
  // Total de alumnos con saldo por cobrar (adeudo pendiente o abono parcial)
  const debtorStudents = sessionStudents.filter(s => s.financial_status === "adeudo_pendiente" || s.financial_status === "abono_parcial");
  const debtorCount = debtorStudents.length;
  const totalDebtAmount = debtorStudents.reduce((acc, curr) => acc + (curr.current_debt_amount || 0), 0);
  const attendanceRatePct = totalInSession > 0 ? Math.round((presentCount / totalInSession) * 100) : 0;

  // Render Badge Financiero Reactivo
  const renderFinancialBadge = (st: StudentRosterItem) => {
    switch (st.financial_status) {
      case "al_corriente":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Al Corriente ($0 Adeudo)</span>
          </div>
        );
      case "abono_parcial":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Abonó Parcial (Resta: ${st.current_debt_amount} MXN)</span>
          </div>
        );
      case "becado":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black border border-sky-400/30 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Becado / Exento</span>
          </div>
        );
      case "adeudo_pendiente":
      default:
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/80 text-red-300 text-[10px] font-black border border-red-500/40 animate-pulse shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Adeudo Pendiente (${st.current_debt_amount || 150} MXN)</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-[#0a0d14] text-zinc-100 rounded-3xl border border-zinc-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-5 transition-all duration-300">
      
      {/* 1. COURT SESSION CONTROL & SYNC STRIP (100% RESPONSIVE) */}
      <section className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Sede y Título Táctico */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#f66018]/15 border border-[#f66018]/30 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-[#f66018]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-white uppercase tracking-tight text-base sm:text-lg">
                  On-Court Command
                </span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#f66018]/20 text-[#f66018] border border-[#f66018]/30">
                  Carmen Serdán Court
                </span>
              </div>
              <p className="text-xs text-zinc-400 capitalize mt-0.5">
                {todayFormatted} • Head Coach Command Center
              </p>
            </div>
          </div>

          {/* Turnos Selector + Fecha CDMX + Sync Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
            {/* Selector de Fecha Local CDMX */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">Fecha:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* Turno Switcher: 3 Turnos */}
            <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 flex-wrap">
              <button
                type="button"
                onClick={() => setShift("matutino")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  shift === "matutino" 
                    ? "bg-[#f66018] text-white shadow-sm font-black" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span>☀️ Matutino 9:00 AM</span>
              </button>
              <button
                type="button"
                onClick={() => setShift("vespertino")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  shift === "vespertino" 
                    ? "bg-[#f66018] text-white shadow-sm font-black" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Activity className="w-4 h-4 text-orange-400" />
                <span>🌙 Vespertino 5:00 PM</span>
              </button>
              <button
                type="button"
                onClick={() => setShift("fin_de_semana")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  shift === "fin_de_semana" 
                    ? "bg-[#f66018] text-white shadow-sm font-black" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>⚡ Fin de Semana</span>
              </button>
            </div>

            {/* Offline-First Sync Pill */}
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : "bg-red-500"}`} />
                <span className={`text-[11px] font-black uppercase ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
                  {isOnline ? (offlineCount > 0 ? `Subiendo (${offlineCount})...` : "En Línea • Sincronizado") : `Offline (${offlineCount} en cola)`}
                </span>
              </div>
              <button 
                onClick={triggerSync} 
                disabled={syncing}
                className={`text-emerald-400 hover:text-white transition cursor-pointer ml-1 p-0.5 rounded hover:bg-zinc-800 ${syncing ? "animate-spin" : ""}`} 
                type="button"
                title="Sincronizar cambios ahora"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
              </button>
            </div>

            {/* BOTÓN PROMINENTE DE ALTA EN CANCHA (CASO OSMAR LÓPEZ) */}
            <button
              type="button"
              onClick={() => setIsFastAthleteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer shrink-0"
              title="Registrar Atleta en Cancha de Forma Inmediata (Modo Offline Seguro)"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>+ Nuevo Atleta en Cancha</span>
            </button>

          </div>
        </div>

        {/* TOAST FLOTANTE DE GUARDADO INSTANTÁNEO 1-TAP */}
        {instantSaveToast && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-black flex items-center justify-between shadow-xl animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{instantSaveToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setInstantSaveToast(null)}
              className="text-zinc-400 hover:text-white p-1"
            >
              &times;
            </button>
          </div>
        )}
      </section>

      {/* 2. QUICK KPI METRICS BANNER (RESPONSIVE 2X2 ON MOBILE, 4-COL ON DESKTOP) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Roster Hoy */}
        <div className="flex flex-col justify-between bg-zinc-900/50 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-black tracking-wider">
              Roster Sesión
            </span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalInSession}</span>
            <span className="text-xs text-zinc-400 font-medium">alumnos</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 font-semibold capitalize">Turno {shift}</span>
        </div>

        {/* Presentes */}
        <div className="flex flex-col justify-between bg-zinc-900/50 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-emerald-400 uppercase font-black tracking-wider">
              Presentes
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{presentCount}</span>
            <span className="text-xs text-emerald-400/80 font-bold">({attendanceRatePct}%)</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 font-medium">Asistencia en duela/cancha</span>
        </div>

        {/* Retardos / Faltas */}
        <div className="flex flex-col justify-between bg-zinc-900/50 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-amber-400 uppercase font-black tracking-wider">
              Retardos / Faltas
            </span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-amber-400">{lateCount} <span className="text-xs font-normal text-zinc-400">ret.</span></span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-xl sm:text-2xl font-black text-red-400">{absentCount} <span className="text-xs font-normal text-zinc-400">falt.</span></span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 font-medium">Incidencias hoy</span>
        </div>

        {/* Cobros Pendientes Dinámicos */}
        <div className="flex flex-col justify-between bg-zinc-900/50 p-3.5 sm:p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-red-400 uppercase font-black tracking-wider">
              Cobros Pendientes
            </span>
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-red-400">{debtorCount}</span>
            <span className="text-xs text-red-400/80 font-bold">(${totalDebtAmount} MXN)</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 font-medium">Adeudos o abonos parciales</span>
        </div>
      </section>

      {/* 3. TOOLBAR: SEARCH & RESPONSIVE FILTER TABS */}
      <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-10 rounded-xl bg-zinc-950 text-white text-xs placeholder:text-zinc-500 focus:outline-none border border-zinc-800 focus:border-[#f66018] transition"
            placeholder="Buscar por atleta, categoría, dorsal o tutor..."
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Modalidad de Roster */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("scheduled_today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === "scheduled_today"
                  ? "bg-[#f66018] text-white shadow-sm font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Hoy en Turno
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterMode === "all"
                  ? "bg-[#f66018] text-white shadow-sm font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Todo el Plantel
            </button>
          </div>

          {/* Filtro por Tipo de Usuario */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setUserTypeFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                userTypeFilter === "all"
                  ? "bg-zinc-800 text-white font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setUserTypeFilter("alumno")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                userTypeFilter === "alumno"
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Alumnos
            </button>
            <button
              type="button"
              onClick={() => setUserTypeFilter("prospecto")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                userTypeFilter === "prospecto"
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Prospectos
            </button>
            <button
              type="button"
              onClick={() => setUserTypeFilter("tutor")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                userTypeFilter === "tutor"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Tutores / Fam.
            </button>
          </div>

          {/* Filtro Estatus Financiero Reactivo */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setPaymentFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                paymentFilter === "all"
                  ? "bg-zinc-800 text-white font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter("al_corriente")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                paymentFilter === "al_corriente"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Al Corriente
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter("abono_parcial")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                paymentFilter === "abono_parcial"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Abonos
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter("adeudo")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                paymentFilter === "adeudo"
                  ? "bg-red-950/80 text-red-300 border border-red-500/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Adeudos
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter("becado")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                paymentFilter === "becado"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Becados
            </button>
          </div>
        </div>
      </section>

      {/* 4. ATHLETE ROSTER: RESPONSIVE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 px-6 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 shadow-2xl flex flex-col items-center justify-center max-w-xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 shadow-inner">
              <Activity className="w-8 h-8 text-[#f66018]" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              {search ? "Sin resultados para tu búsqueda" : "No hay alumnos en este filtro o turno"}
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mt-2 leading-relaxed">
              {search 
                ? `No se encontró ningún registro con "${search}".` 
                : "Recuerda que los Tutores/Familiares se ocultan automáticamente del pase de lista y cobro de cancha."}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-[#f66018]">
              <span className="w-2 h-2 rounded-full bg-[#f66018] animate-pulse" />
              <span>Turno: {shift === "matutino" ? "Matutino (09:00 - 11:00 hrs)" : "Vespertino (17:00 - 19:00 hrs)"}</span>
            </div>
          </div>
        ) : (
          filtered.map((st) => (
            <article 
              key={st.id} 
              className="flex flex-col justify-between bg-zinc-900/60 hover:bg-zinc-900 p-4 rounded-2xl gap-3.5 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 shadow-md hover:shadow-xl group"
            >
              {/* Card Header: Dorsal, Nombre, Rol, Categoría & Semáforo Financiero */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f66018] to-orange-700 flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0">
                      {st.number || "#"}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white block leading-tight">
                        {st.full_name}
                      </span>
                      
                      {/* Días y Horarios */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {st.is_prospect ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                            Pre-Ficha Familiar / Tutor: {st.prospect_tutor || "Catalina Lopez"}
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                              {st.category}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {st.training_days || st.schedule_days}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón de Engrane para abrir Modal de Finanzas */}
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForFinance(st)}
                    className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Gestionar Finanzas, Días, Horario y Rol"
                  >
                    <Settings className="w-4 h-4 text-zinc-300" />
                  </button>
                </div>

                {/* Sub-header: Selector Rápido de Rol e Identificación del Usuario */}
                <div className="mt-3 flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-800/50">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Rol:</span>
                    <select
                      value={st.user_type}
                      onChange={(e) => handleQuickChangeUserType(st.id, e.target.value as UserType)}
                      className={`text-[10px] font-black uppercase rounded-lg px-2 py-0.5 bg-zinc-950 border cursor-pointer focus:outline-none ${
                        st.user_type === "alumno"
                          ? "border-emerald-500/40 text-emerald-400"
                          : st.user_type === "prospecto"
                          ? "border-amber-500/40 text-amber-300"
                          : st.user_type === "visitante"
                          ? "border-sky-500/40 text-sky-300"
                          : "border-purple-500/40 text-purple-300"
                      }`}
                    >
                      <option value="alumno">Alumno Activo</option>
                      <option value="prospecto">Prospecto / Muestra</option>
                      <option value="visitante">Visitante</option>
                      <option value="tutor">Tutor / Familiar</option>
                    </select>
                  </div>

                  {/* Horario asignado compacto */}
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {st.shift === "matutino" ? "09:00 - 11:00" : "17:00 - 19:00"}
                  </span>
                </div>

                {/* Badge Financiero Dinámico Reactivo */}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  {renderFinancialBadge(st)}

                  {/* Acceso Rápido al Botón de Cobro / Ajuste */}
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForFinance(st)}
                    className="text-[10px] font-black uppercase text-[#f66018] hover:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ajustar</span>
                  </button>
                </div>

                {/* Botón de Cobro Rápido Directo (1-Tap Auto-Sync) */}
                <div className="mt-2.5 flex items-center gap-2">
                  {st.scholarship_percentage === 100 ? (
                    <div className="flex-1 flex items-center justify-center h-10 px-3 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-300 font-black text-xs">
                      🎓 Beca 100% ($0 Beca)
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInstantQuickPay(st)}
                      className="flex-1 flex items-center justify-between h-10 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer"
                      title="1-Tap: Cobrar y guardar al instante en Supabase"
                    >
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-white" />
                        <span>💵 Cobrar ${st.current_debt_amount > 0 ? st.current_debt_amount : (st.default_class_cost || 50)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-black">
                        {st.current_debt_amount > 0 ? "Adeudo" : "Cuota"}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForFinance(st)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Ajuste Financiero Detallado"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                  {/* Botón de Pruebas Deportivas (Tiro & Velocidad) */}
                  <button
                    type="button"
                    onClick={() => setSelectedAthleteForSportsTest(st)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition active:scale-95 cursor-pointer shadow-sm"
                    title="Evaluar Pruebas Deportivas (Tiro 20 TL, Velocidad 100m, T-Test)"
                  >
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    <span>🎯 Pruebas Deportivas (Tiro & Velocidad)</span>
                  </button>
                </div>

                {/* Botón de agregar a la cancha si no está programado hoy en este turno */}
                {!isStudentScheduledForSession(st, shift) && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAttendance(st.id, "presente")}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-[11px] font-bold transition cursor-pointer"
                      title="Asistencia extraordinaria en cancha"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>➕ Agregar a la Cancha (Extraordinario)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer: 3-State Attendance Selector (1-Tap Auto-Sync) */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>Pase de Lista ({selectedDate})</span>
                  {st.attendance_status && (
                    <span className="capitalize font-black text-[#f66018]">
                      {st.attendance_status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(st.id, "presente")}
                    className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      st.attendance_status === "presente"
                        ? "bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Marcar Presente (Auto-Sync)"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">🟢 Presente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(st.id, "retardo")}
                    className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      st.attendance_status === "retardo"
                        ? "bg-amber-500 text-black font-black shadow-md shadow-amber-950/50"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Marcar Retardo (Auto-Sync)"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">🟡 Retardo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(st.id, "falta")}
                    className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      st.attendance_status === "falta"
                        ? "bg-red-600 text-white font-black shadow-md shadow-red-950/50"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Marcar Falta (Auto-Sync)"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">🔴 Falta</span>
                  </button>
                </div>
              </div>

            </article>
          ))
        )}
      </section>

      {/* 5. MODAL TÁCTIL: COBRO RÁPIDO EN CANCHA AL FINALIZAR CLASE */}
      {selectedAthleteForSportsTest && (
        <SportsTestExpressModal
          athlete={{
            id: selectedAthleteForSportsTest.id,
            full_name: selectedAthleteForSportsTest.full_name,
            category: selectedAthleteForSportsTest.category || "U-15",
          }}
          onClose={() => setSelectedAthleteForSportsTest(null)}
          onSaved={() => {
            setInstantSaveToast(`🎯 Pruebas guardadas para ${selectedAthleteForSportsTest.full_name}`);
            setTimeout(() => setInstantSaveToast(null), 3000);
            setSelectedAthleteForSportsTest(null);
          }}
        />
      )}
      {selectedAthleteForQuickPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121724] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedAthleteForQuickPay(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Cobro Rápido en Cancha</h3>
                <p className="text-xs text-zinc-400">
                  {selectedAthleteForQuickPay.full_name} ({selectedAthleteForQuickPay.number || "#"})
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterQuickPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Monto Recibido ($ MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">$</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={quickPayAmount}
                    onChange={(e) => setQuickPayAmount(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-black text-xl focus:border-emerald-500 focus:outline-none"
                    placeholder="0"
                    autoFocus
                    required
                  />
                </div>
                {/* Botones de sugerencias rápidas */}
                <div className="flex gap-2 mt-2">
                  {[50, 100, 150, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQuickPayAmount(amt)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                        quickPayAmount === amt
                          ? "bg-emerald-500 text-black border-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickPayMethod("efectivo")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      quickPayMethod === "efectivo"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                    }`}
                  >
                    <span>💵 Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPayMethod("transferencia")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      quickPayMethod === "transferencia"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                    }`}
                  >
                    <span>📱 Transferencia</span>
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Adeudo actual:</span>
                  <span className="font-bold text-white">${selectedAthleteForQuickPay.current_debt_amount || 0} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span>Saldo restante tras pago:</span>
                  <span className="font-black text-emerald-400">
                    ${Math.max(0, (selectedAthleteForQuickPay.current_debt_amount || 0) - (Number(quickPayAmount) || 0))} MXN
                  </span>
                </div>
                {!navigator.onLine && (
                  <p className="text-amber-400 text-[10px] mt-1 pt-1 border-t border-zinc-800">
                    ⚡ Modo sin conexión: Se guardará en la cola local y se sincronizará automáticamente al reconectar.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAthleteForQuickPay(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition shadow-lg shadow-emerald-950/50 active:scale-95 cursor-pointer"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.1 VENTANA DE ÉXITO: COMPROBANTE DE PAGO INMEDIATO POR WHATSAPP */}
      {paymentSuccessReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121724] border-2 border-emerald-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                PAGO REGISTRADO CON ÉXITO
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                ${paymentSuccessReceipt.amountPaid} MXN
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Alumno: <strong className="text-white">{paymentSuccessReceipt.athleteName}</strong>
              </p>
            </div>

            {/* Ficha Resumen de Comprobante */}
            <div className="bg-[#0b0e16] p-4 rounded-2xl border border-zinc-800 text-left text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Concepto:</span>
                <span className="text-white font-bold">Cuota Cancha Carmen Serdán</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Fecha:</span>
                <span className="text-zinc-300">{paymentSuccessReceipt.date}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Método:</span>
                <span className="capitalize text-zinc-300">{paymentSuccessReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-400 pt-1.5 border-t border-zinc-800">
                <span>Saldo Restante:</span>
                <span className={`font-black ${paymentSuccessReceipt.remainingDebt === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  ${paymentSuccessReceipt.remainingDebt} MXN
                </span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2 pt-2">
              {/* Botón WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  const cleanPhone = paymentSuccessReceipt.tutorPhone.replace(/\D/g, "");
                  const validPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone.length === 12 && cleanPhone.startsWith("52") ? cleanPhone : "525522427769";
                  
                  const messageText = `🐺 *COMPROBANTE OFICIAL DE PAGO - WILD WOLVES CDMX* 🏀\n\n` +
                    `¡Hola! Confirmamos la recepción de tu aportación de entrenamiento:\n\n` +
                    `👤 *Atleta:* ${paymentSuccessReceipt.athleteName}\n` +
                    `💵 *Monto Cubierto:* $${paymentSuccessReceipt.amountPaid} MXN\n` +
                    `📱 *Método:* ${paymentSuccessReceipt.paymentMethod.toUpperCase()}\n` +
                    `📅 *Fecha:* ${paymentSuccessReceipt.date}\n` +
                    `📍 *Sede:* Canchas Techadas Deportivo Carmen Serdán\n` +
                    `✅ *Saldo Restante:* $${paymentSuccessReceipt.remainingDebt} MXN\n\n` +
                    `_Agradecemos tu confianza y compromiso con el desarrollo de la manada._ 🐺🔥\n` +
                    `*Head Coach Ricardo • Wild Wolves Academy*`;

                  const waUrl = `https://wa.me/${validPhone}?text=${encodeURIComponent(messageText)}`;
                  window.open(waUrl, "_blank");
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>📲 Enviar Comprobante WhatsApp al Tutor</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentSuccessReceipt(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL TÁCTIL: GESTIONAR FINANZAS, ABONOS, HORARIOS & ROLES */}
      {selectedStudentForFinance && (
        <ManageStudentFinanceModal
          isOpen={!!selectedStudentForFinance}
          student={{
            id: selectedStudentForFinance.id,
            full_name: selectedStudentForFinance.full_name,
            category: selectedStudentForFinance.category,
            tutor_phone: selectedStudentForFinance.tutor_phone,
            financial_status: selectedStudentForFinance.financial_status,
            current_debt_amount: selectedStudentForFinance.current_debt_amount,
            training_days: selectedStudentForFinance.training_days || selectedStudentForFinance.schedule_days || "Lun-Mié-Vie",
            training_schedule: selectedStudentForFinance.training_schedule || "Vespertino: 17:00 - 19:00",
            user_type: selectedStudentForFinance.user_type,
            selected_days: selectedStudentForFinance.selected_days,
            schedules_by_day: selectedStudentForFinance.schedules_by_day,
          }}
          onClose={() => setSelectedStudentForFinance(null)}
          onSuccess={handleFinanceModalSuccess}
        />
      )}

      {/* 7. MODAL TÁCTIL: REGISTRO RÁPIDO EN CANCHA [+ NUEVO ATLETA EN CANCHA] (CASO OSMAR LÓPEZ) */}
      {isFastAthleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121724] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative font-sans space-y-4">
            <button
              onClick={() => setIsFastAthleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Alta Rápida en Cancha</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Genera ficha local inmediata en la memoria de tu celular
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateFastAthlete} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Nombre Completo del Alumno *
                </label>
                <input
                  type="text"
                  required
                  value={fastAthleteName}
                  onChange={(e) => setFastAthleteName(e.target.value)}
                  placeholder="Ej. Osmar Lopez"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Categoría
                  </label>
                  <select
                    value={fastAthleteCategory}
                    onChange={(e) => setFastAthleteCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="U-12 INICIACIÓN">U-12 Iniciación</option>
                    <option value="U-15 FORMATIVO">U-15 Formativo</option>
                    <option value="U-17 COMPETITIVO">U-17 Competitivo</option>
                    <option value="ADULTOS +20">Adultos +20</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Turno Pactado
                  </label>
                  <select
                    value={fastAthleteShift}
                    onChange={(e) => setFastAthleteShift(e.target.value as "matutino" | "vespertino")}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="matutino">Matutino (09:00 - 11:00)</option>
                    <option value="vespertino">Vespertino (17:00 - 19:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Tutor / Familiar de Contacto
                </label>
                <input
                  type="text"
                  value={fastAthleteTutor}
                  onChange={(e) => setFastAthleteTutor(e.target.value)}
                  placeholder="Ej. Abuela: Catalina Lopez / Padre: Omar Lopez"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Teléfono Tutor (WhatsApp)
                </label>
                <input
                  type="tel"
                  value={fastAthletePhone}
                  onChange={(e) => setFastAthletePhone(e.target.value)}
                  placeholder="Ej. 55 2242 7769"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <span className="text-emerald-400 font-bold block">✓ Incorporación Inmediata a la Lista:</span>
                <span>Aparecerá al instante en tu lista de cancha para tomarle asistencia hoy y registrar cobros de $50 o $150 MXN.</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFastAthleteModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition shadow-lg shadow-emerald-950/50 active:scale-95"
                >
                  Crear Pre-Ficha en Cancha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
