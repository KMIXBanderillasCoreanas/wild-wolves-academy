'use client';

import { 
  StudentProfile, 
  User, 
  Evaluation, 
  BasketballMetrics, 
  ProgressiveTraining, 
  TrainingDay, 
  AttendanceRecord, 
  FinancialRecord, 
  PaymentFrequency, 
  PaymentStatus, 
  Role, 
  Position 
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
  STUDENTS: 'hoop_athletes_clean_v8',
  USER: 'hoop_session_user_clean_v8',
};

export const HoopStore = {
  getStudents: (): StudentProfile[] => {
    if (typeof window === 'undefined') return INITIAL_STUDENTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  getStudent: (id: string): StudentProfile => {
    const list = HoopStore.getStudents();
    const found = list.find((s) => s.id === id);
    if (found) return found;
    if (list.length > 0) return list[0];

    // Plantilla limpia para atletas
    const cleanStudent: StudentProfile = {
      id: id || `student_${Date.now()}`,
      fullName: 'Atleta Wild Wolves',
      email: 'atleta@wildwolves.academy',
      phone: '+52 55 2242 7769',
      gender: 'M',
      age: 16,
      position: 'Base',
      role: 'student',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      parentPhone: '+52 55 2242 7769',
      medicalNotes: {
        bloodType: 'O+',
        allergies: 'Ninguna conocida',
        emergencyContact: 'Tutor de Atleta',
        emergencyPhone: '55 2242 7769',
        medicalConditions: 'Sin restricciones físicas.',
        lastCheckup: new Date().toLocaleDateString('es-MX'),
      },
      stripeStatus: 'pending',
      trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
      totalDaysTrained: 0,
      attendanceHistory: [],
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
        freeThrow: 50,
        midRange: 50,
        threePoint: 50,
        verticalJump: 50,
        sprint100m: 50,
        agilityTTest: 50,
      },
      metricsPrevious: {
        freeThrow: 50,
        midRange: 50,
        threePoint: 50,
        verticalJump: 50,
        sprint100m: 50,
        agilityTTest: 50,
      },
      training: {
        ropeJumpsToday: 0,
        ropeTarget: 500,
        joggingMinutesToday: 0,
        joggingTarget: 30,
        schedule: generateSchedule(0),
      },
      evaluations: [],
    };
    return cleanStudent;
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
    const student = HoopStore.getStudent(studentId);
    const user: User = {
      id: `usr_${student.id}`,
      fullName: customName || student.fullName,
      email: customEmail || student.email,
      role: 'student',
      studentId: student.id,
      avatarUrl: student.avatarUrl,
      provider: 'demo',
    };
    HoopStore.setCurrentUser(user);
    return user;
  },

  loginAsParent: (studentId: string = 'student_01') => {
    const student = HoopStore.getStudent(studentId);
    const user: User = {
      id: `usr_parent_${student.id}`,
      fullName: student.medicalNotes.emergencyContact ? `${student.medicalNotes.emergencyContact}` : `Tutor de Atleta`,
      email: student.email.replace('@', '.tutor@'),
      role: 'parent',
      studentId: student.id,
      parentOfStudentId: student.id,
      phone: student.parentPhone || student.phone,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      provider: 'demo',
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
