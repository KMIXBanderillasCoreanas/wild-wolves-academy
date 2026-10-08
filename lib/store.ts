'use client';

import { 
  StudentProfile, 
  User, 
  Evaluation, 
  BasketballMetrics, 
  RawEvaluationStats,
  ProgressiveTraining, 
  TrainingDay, 
  AttendanceRecord, 
  FinancialRecord, 
  PaymentFrequency, 
  PaymentStatus, 
  Role, 
  Position,
  ShiftType,
  AttendanceStatus,
  PaymentRecord
} from './types';
import { SupabaseSync } from './supabaseSync';

// ==========================================
// 1. ESPECIFICACIÓN OFICIAL DE ATLETAS & MÉTRICAS
// ==========================================
export interface AthleteMetric {
  date: string;
  freeThrows: number;
  midRange: number;
  threePoints: number;
  verticalJump: number;
  sprintSpeed: number;
  agility: number;
}

export interface Athlete {
  id: string;
  name: string;
  category: "Infantil" | "Juvenil" | "Libre";
  branch: "Varonil" | "Femenil";
  position: string;
  ropeGoalDaily: number;
  ropeCurrentDaily: number;
  joggingMinutesGoal: number;
  joggingMinutesCompleted: number;
  guardianPhone: string;
  emergencyContact: string;
  medicalConditions: string;
  metricsHistory: AthleteMetric[];
}

// BASE COMPLETAMENTE VACÍA: Todos los usuarios anteriores eliminados
export const INITIAL_ATHLETES: Athlete[] = [];
export const INITIAL_STUDENTS: StudentProfile[] = [];

// Generador de cronograma de 30 días de sobrecarga
export const generateSchedule = (completedDays: number = 0): TrainingDay[] => {
  const schedule: TrainingDay[] = [];
  for (let d = 1; d <= 30; d++) {
    const rope = Math.min(1000, Math.round(100 + (d - 1) * (900 / 29)));
    const minutes = Math.min(60, Math.round(10 + (d - 1) * (50 / 29)));
    
    let phase = 'Fase 1: Activación Aeróbica';
    if (d > 7 && d <= 15) phase = 'Fase 2: Resistencia Base';
    else if (d > 15 && d <= 23) phase = 'Fase 3: Ritmo de Juego';
    else if (d > 23) phase = 'Fase 4: Élite Combine 4to Cuarto';

    schedule.push({
      day: d,
      label: `Día ${d}: ${rope} saltos / ${minutes} min`,
      completed: d <= completedDays,
      ropeJumps: Math.round(rope / 10) * 10,
      joggingMinutes: minutes,
      phase,
    });
  }
  return schedule;
};

export const INITIAL_COACH_USER: User = {
  id: 'usr_coach_ricardo',
  fullName: 'Coach Ricardo',
  email: 'coach@wildwolves.mx',
  role: 'coach',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  provider: 'demo',
};

const STORAGE_KEYS = {
  STUDENTS: 'hoop_athletes_clean_v10',
  USER: 'hoop_session_user_clean_v10',
};

export const HoopStore = {
  getStudents: (): StudentProfile[] => {
    if (typeof window === 'undefined') return INITIAL_STUDENTS;
    try {
      // Limpieza profunda de almacenamiento previo
      localStorage.removeItem('hoop_athletes_clean_v8');
      localStorage.removeItem('hoop_athletes_clean_v7');
      localStorage.removeItem('hoop_athletes_clean_v6');
      localStorage.removeItem('hoop_athletes_clean_v5');
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        return INITIAL_STUDENTS;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  getStudent: (id: string): StudentProfile | null => {
    const list = HoopStore.getStudents();
    if (!list || list.length === 0) return null;
    const found = list.find((s) => s.id === id);
    return found || list[0] || null;
  },

  saveStudents: (students: StudentProfile[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Error al guardar atletas', e);
    }
  },

  syncWithSupabase: async (): Promise<StudentProfile[]> => {
    try {
      const remote = await SupabaseSync.getStudentsFromSupabase();
      if (remote && remote.length > 0) {
        HoopStore.saveStudents(remote);
        return remote;
      }
    } catch (e) {
      console.warn('Sync fallback to local store:', e);
    }
    return HoopStore.getStudents();
  },

  registerStudent: (newStudent: Omit<StudentProfile, 'id' | 'training' | 'metricsCurrent' | 'metricsPrevious' | 'evaluations' | 'trainingDays' | 'totalDaysTrained' | 'attendanceHistory' | 'finances'>): StudentProfile => {
    const students = HoopStore.getStudents();
    const created: StudentProfile = {
      ...newStudent,
      id: `student_${Date.now()}`,
      trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
      totalDaysTrained: 1,
      attendanceHistory: [
        {
          id: `att_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          dayName: 'Lunes',
          present: true,
          topic: 'Entrenamiento inicial de bienvenida y diagnósticos',
        },
      ],
      finances: {
        costPerClass: 50,
        frequency: 'al_dia',
        status: 'al_corriente',
        balanceDue: 0,
        lastPaymentDate: new Date().toLocaleDateString('es-MX'),
        lastPaymentAmount: 50,
        paymentMethod: 'Efectivo',
      },
      metricsCurrent: {
        freeThrow: 70,
        midRange: 70,
        threePoint: 70,
        verticalJump: 70,
        sprint100m: 70,
        agilityTTest: 70,
      },
      metricsPrevious: {
        freeThrow: 65,
        midRange: 65,
        threePoint: 65,
        verticalJump: 65,
        sprint100m: 65,
        agilityTTest: 65,
      },
      training: {
        ropeJumpsToday: 100,
        ropeTarget: 500,
        joggingMinutesToday: 10,
        joggingTarget: 30,
        schedule: generateSchedule(1),
      },
      evaluations: [],
    };

    const updated = [created, ...students];
    HoopStore.saveStudents(updated);
    return created;
  },

  updateAttendance: (studentId: string, date: string, dayName: string, present: boolean, topic?: string) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const history = [...s.attendanceHistory];
        const existingIdx = history.findIndex((h) => h.date === date);
        if (existingIdx >= 0) {
          history[existingIdx] = { ...history[existingIdx], present, topic: topic || history[existingIdx].topic };
        } else {
          history.unshift({
            id: `att_${Date.now()}`,
            date,
            dayName,
            present,
            topic: topic || 'Entrenamiento técnico de básquetbol',
          });
        }
        const totalDaysTrained = history.filter((h) => h.present).length;
        return {
          ...s,
          attendanceHistory: history,
          totalDaysTrained,
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    SupabaseSync.recordAttendance(studentId, present, dayName, topic).catch((e: unknown) => console.warn('Supabase att sync:', e));
    return updated.find((s) => s.id === studentId);
  },

  recordAttendance: (studentId: string, dateOrPresent: string | boolean, dayName: string, presentOrTopic?: boolean | string, topic?: string) => {
    if (typeof dateOrPresent === 'string') {
      const date = dateOrPresent;
      const present = Boolean(presentOrTopic);
      return HoopStore.updateAttendance(studentId, date, dayName, present, topic);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const present = Boolean(dateOrPresent);
      const top = typeof presentOrTopic === 'string' ? presentOrTopic : topic;
      return HoopStore.updateAttendance(studentId, today, dayName, present, top);
    }
  },

  toggleScheduleDay: (studentId: string, dayNumber: number) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const newSched = s.training.schedule.map((item) => {
          if (item.day === dayNumber) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        return {
          ...s,
          training: {
            ...s.training,
            schedule: newSched,
          },
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  recordPayment: (studentId: string, amount: number, method: 'Efectivo' | 'Stripe' | 'Transferencia' = 'Efectivo') => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          finances: {
            ...s.finances,
            lastPaymentDate: new Date().toLocaleDateString('es-MX'),
            lastPaymentAmount: amount,
            balanceDue: Math.max(0, (s.finances?.balanceDue || 0) - amount),
            status: 'al_corriente' as PaymentStatus,
            paymentMethod: method,
          },
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    SupabaseSync.recordPayment(studentId, amount, method).catch((e: unknown) => console.warn('Supabase payment sync:', e));
    return updated.find((s) => s.id === studentId);
  },

  updatePaymentFrequency: (studentId: string, frequency: PaymentFrequency) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          finances: {
            ...s.finances,
            frequency,
          },
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  updateTrainingDays: (studentId: string, days: string[]) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          trainingDays: days,
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  updateStudentMetrics: (studentId: string, newMetrics: BasketballMetrics, evaluation: Evaluation) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          metricsPrevious: s.metricsCurrent,
          metricsCurrent: newMetrics,
          evaluations: [evaluation, ...s.evaluations],
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  updateTrainingTargets: (studentId: string, ropeTarget: number, joggingTarget: number, ropeToday: number, joggingToday: number) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          training: {
            ...s.training,
            ropeTarget,
            joggingTarget,
            ropeJumpsToday: ropeToday,
            joggingMinutesToday: joggingToday,
          },
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  payStripeTuition: (studentId: string) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          stripeStatus: 'active' as const,
          finances: {
            ...s.finances,
            status: 'al_corriente' as PaymentStatus,
            balanceDue: 0,
            lastPaymentDate: new Date().toLocaleDateString('es-MX'),
            lastPaymentAmount: s.finances?.frequency === 'mensual' ? 600 : s.finances?.frequency === 'semanal' ? 150 : 50,
            paymentMethod: 'Stripe' as const,
          },
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  editEvaluation: (studentId: string, evalId: string, updatedMetrics: BasketballMetrics, updatedRaw: RawEvaluationStats, coachNotes: string) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const evals = s.evaluations.map((ev) => {
          if (ev.id === evalId) {
            return {
              ...ev,
              metrics: updatedMetrics,
              rawStats: updatedRaw,
              coachNotes,
            };
          }
          return ev;
        });
        const isLatest = s.evaluations.length > 0 && s.evaluations[0].id === evalId;
        return {
          ...s,
          evaluations: evals,
          metricsCurrent: isLatest ? updatedMetrics : s.metricsCurrent,
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  deleteEvaluation: (studentId: string, evalId: string) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const evals = s.evaluations.filter((ev) => ev.id !== evalId);
        const newCurrent = evals.length > 0 ? evals[0].metrics : s.metricsPrevious;
        const newPrevious = evals.length > 1 ? evals[1].metrics : evals.length === 1 ? evals[0].metrics : s.metricsPrevious;
        return {
          ...s,
          evaluations: evals,
          metricsCurrent: newCurrent,
          metricsPrevious: newPrevious,
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  recordPaymentWithReceipt: (payment: Omit<PaymentRecord, 'id'>) => {
    const students = HoopStore.getStudents();
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReceipt: PaymentRecord = {
      ...payment,
      id: paymentId,
    };

    const updated = students.map((s) => {
      if (s.id === payment.studentId) {
        const history = s.finances?.paymentHistory || [];
        const isPaid = payment.status === 'Pagado';
        const currentBalance = s.finances?.balanceDue || 0;
        const newBalance = isPaid ? Math.max(0, currentBalance - payment.amount) : currentBalance + payment.amount;

        return {
          ...s,
          finances: {
            ...s.finances,
            balanceDue: newBalance,
            status: (newBalance === 0 ? 'al_corriente' : 'pendiente') as PaymentStatus,
            lastPaymentDate: payment.date,
            lastPaymentAmount: payment.amount,
            paymentMethod: payment.method,
            paymentHistory: [newReceipt, ...history],
          },
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    SupabaseSync.recordPayment(payment.studentId, payment.amount, payment.method).catch((e: unknown) => console.warn(e));
    return newReceipt;
  },

  recordDailyAttendance: (studentId: string, date: string, shift: ShiftType, status: AttendanceStatus, notes?: string) => {
    const students = HoopStore.getStudents();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = dayNames[new Date(date).getDay()] || 'Lunes';
    const isPresent = status === 'presente' || status === 'retardo';

    const updated = students.map((s) => {
      if (s.id === studentId) {
        const history = [...(s.attendanceHistory || [])];
        const existingIdx = history.findIndex((h) => h.date === date);
        const record: AttendanceRecord = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          date,
          dayName,
          present: isPresent,
          status,
          shift,
          topic: notes || (status === 'presente' ? 'Asistencia a sesión' : status === 'retardo' ? 'Retardo justificado' : 'Falta en cancha'),
        };

        if (existingIdx >= 0) {
          history[existingIdx] = record;
        } else {
          history.unshift(record);
        }

        const totalDaysTrained = history.filter((h) => h.present).length;
        return {
          ...s,
          shift: s.shift || shift,
          attendanceHistory: history,
          totalDaysTrained,
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    SupabaseSync.recordDailyAttendance(studentId, date, shift, status, notes).catch((e: unknown) => console.warn(e));
    return updated.find((s) => s.id === studentId);
  },

  getAllPayments: (): PaymentRecord[] => {
    const students = HoopStore.getStudents();
    const all: PaymentRecord[] = [];
    students.forEach((s) => {
      if (s.finances?.paymentHistory && s.finances.paymentHistory.length > 0) {
        all.push(...s.finances.paymentHistory);
      } else if (s.finances?.lastPaymentAmount) {
        all.push({
          id: `pay_${s.id}_last`,
          studentId: s.id,
          studentName: s.fullName,
          guardianName: s.guardianName || s.medicalNotes?.emergencyContact || 'Tutor Registrado',
          guardianPhone: s.parentPhone || s.phone || '5522427769',
          amount: s.finances.lastPaymentAmount,
          date: s.finances.lastPaymentDate || new Date().toISOString().split('T')[0],
          method: s.finances.paymentMethod || 'Efectivo',
          status: s.finances.status === 'al_corriente' ? 'Pagado' : 'Adeudo',
          shift: s.shift || 'matutino_9_11',
        });
      }
    });
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getFinancialAnalytics: () => {
    const allPayments = HoopStore.getAllPayments();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let todayIncome = 0;
    let weekIncome = 0;
    let monthIncome = 0;
    let yearIncome = 0;

    allPayments.forEach((p) => {
      if (p.status === 'Pagado') {
        const pDate = new Date(p.date);
        if (p.date === todayStr) {
          todayIncome += p.amount;
        }
        if (pDate >= sevenDaysAgo && pDate <= now) {
          weekIncome += p.amount;
        }
        if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
          monthIncome += p.amount;
        }
        if (pDate.getFullYear() === currentYear) {
          yearIncome += p.amount;
        }
      }
    });

    return {
      todayIncome,
      weekIncome,
      monthIncome,
      yearIncome,
      allPayments,
    };
  },

  getCurrentUser: (): User => {
    if (typeof window === 'undefined') return INITIAL_COACH_USER;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (!data) {
        return INITIAL_COACH_USER;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COACH_USER;
    }
  },

  setCurrentUser: (user: User) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      document.cookie = `user_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new Event('auth_changed'));
    } catch (e) {
      console.error('Error al guardar sesión', e);
    }
  },

  loginAsCoach: () => {
    HoopStore.setCurrentUser(INITIAL_COACH_USER);
    return INITIAL_COACH_USER;
  },

  loginAsStudent: (studentId: string = 'student_01', customName?: string, customEmail?: string) => {
    let student = HoopStore.getStudent(studentId);
    if (!student) {
      student = {
        id: studentId,
        fullName: customName || 'Atleta Wild Wolves',
        email: customEmail || 'atleta@wildwolves.mx',
        age: 14,
        gender: 'M',
        position: 'Alero',
        role: 'student',
        trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
        phone: '55 2242 7769',
        parentPhone: '55 2242 7769',
        totalDaysTrained: 0,
        avatarUrl: '/logo-official.png',
        stripeStatus: 'active',
        finances: {
          frequency: 'al_dia',
          status: 'al_corriente',
          costPerClass: 50,
          balanceDue: 0,
          lastPaymentDate: new Date().toLocaleDateString('es-MX'),
          lastPaymentAmount: 50,
          paymentMethod: 'Efectivo',
        },
        medicalNotes: {
          allergies: 'Ninguna',
          bloodType: 'O+',
          emergencyContact: 'Coach Ricardo (55 2242 7769)',
          emergencyPhone: '55 2242 7769',
          medicalConditions: 'Ninguna',
        },
        attendanceHistory: [],
        metricsCurrent: {
          freeThrow: 70,
          midRange: 65,
          threePoint: 55,
          verticalJump: 50,
          sprint100m: 65,
          agilityTTest: 68,
        },
        metricsPrevious: {
          freeThrow: 60,
          midRange: 55,
          threePoint: 45,
          verticalJump: 45,
          sprint100m: 60,
          agilityTTest: 60,
        },
        training: {
          ropeTarget: 300,
          joggingTarget: 20,
          ropeJumpsToday: 0,
          joggingMinutesToday: 0,
          schedule: generateSchedule(0),
        },
        evaluations: [],
      };
      const all = HoopStore.getStudents();
      all.push(student);
      HoopStore.saveStudents(all);
    }
    const user: User = {
      id: `usr_${student.id}`,
      fullName: customName || student.fullName,
      email: customEmail || student.email,
      role: 'student',
      studentId: student.id,
      avatarUrl: student.avatarUrl,
      provider: 'email',
    };
    HoopStore.setCurrentUser(user);
    return user;
  },

  loginAsParent: (studentId: string = 'student_01') => {
    let student = HoopStore.getStudent(studentId);
    if (!student) {
      student = HoopStore.getStudents()[0];
    }
    const user: User = {
      id: `usr_parent_${student?.id || '01'}`,
      fullName: student?.medicalNotes?.emergencyContact ? `${student.medicalNotes.emergencyContact}` : `Tutor de Atleta`,
      email: student?.email ? student.email.replace('@', '.tutor@') : 'tutor@wildwolves.mx',
      role: 'parent',
      studentId: student?.id || 'student_01',
      parentOfStudentId: student?.id || 'student_01',
      phone: student?.parentPhone || student?.phone || '55 2242 7769',
      avatarUrl: '/logo-official.png',
      provider: 'email',
    };
    HoopStore.setCurrentUser(user);
    return user;
  },

  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('ww_user_role');
    localStorage.removeItem('ww_user_email');
    document.cookie = 'user_role=; path=/; max-age=0';
    document.cookie = 'user_email=; path=/; max-age=0';
    window.dispatchEvent(new Event('auth_changed'));
  },
};
