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

export const getSeedStudents = (): StudentProfile[] => {
  const now = Date.now();
  const todayStr = new Date(now).toISOString().split('T')[0];
  const yesterdayStr = new Date(now - 86400000).toISOString().split('T')[0];
  const threeDaysAgoStr = new Date(now - 3 * 86400000).toISOString().split('T')[0];
  const tenDaysAgoStr = new Date(now - 10 * 86400000).toISOString().split('T')[0];
  const fortyDaysAgoStr = new Date(now - 40 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'ww_mateo_07',
      fullName: 'Mateo "Lobo" Ramírez',
      email: 'mateo.ramirez@wildwolves.mx',
      phone: '55 2242 7769',
      parentPhone: '55 2242 7769',
      guardianName: 'Sofía Ramírez',
      gender: 'M',
      age: 16,
      position: 'Base',
      jerseyNumber: 7,
      role: 'student',
      shift: 'matutino_9_11',
      avatarUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80',
      stripeStatus: 'active',
      trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
      totalDaysTrained: 18,
      medicalNotes: {
        bloodType: 'O+',
        allergies: 'Ninguna conocida',
        emergencyContact: 'Sofía Ramírez (Mamá)',
        emergencyPhone: '55 2242 7769',
        medicalConditions: 'Apto para alto rendimiento físico.',
        lastCheckup: todayStr,
      },
      finances: {
        costPerClass: 50,
        frequency: 'mensual',
        status: 'al_corriente',
        balanceDue: 0,
        lastPaymentDate: todayStr,
        lastPaymentAmount: 600,
        paymentMethod: 'Transferencia',
        paymentHistory: [
          {
            id: 'pay_mateo_01',
            studentId: 'ww_mateo_07',
            studentName: 'Mateo Ramírez',
            guardianName: 'Sofía Ramírez',
            guardianPhone: '55 2242 7769',
            amount: 600,
            date: todayStr,
            method: 'Transferencia',
            status: 'Pagado',
            notes: 'Mensualidad completa Octubre',
            shift: 'matutino_9_11',
          },
          {
            id: 'pay_mateo_02',
            studentId: 'ww_mateo_07',
            studentName: 'Mateo Ramírez',
            guardianName: 'Sofía Ramírez',
            guardianPhone: '55 2242 7769',
            amount: 600,
            date: fortyDaysAgoStr,
            method: 'Transferencia',
            status: 'Pagado',
            notes: 'Mensualidad Septiembre',
            shift: 'matutino_9_11',
          },
        ],
      },
      metricsCurrent: {
        freeThrow: 85,
        midRange: 80,
        threePoint: 75,
        verticalJump: 78,
        sprint100m: 82,
        agilityTTest: 84,
      },
      metricsPrevious: {
        freeThrow: 75,
        midRange: 70,
        threePoint: 65,
        verticalJump: 72,
        sprint100m: 78,
        agilityTTest: 80,
      },
      training: {
        ropeJumpsToday: 450,
        ropeTarget: 800,
        joggingMinutesToday: 30,
        joggingTarget: 45,
        schedule: generateSchedule(18),
      },
      evaluations: [
        {
          id: 'eval_mateo_01',
          studentId: 'ww_mateo_07',
          date: todayStr,
          coachName: 'Coach Ricardo',
          metrics: {
            freeThrow: 85,
            midRange: 80,
            threePoint: 75,
            verticalJump: 78,
            sprint100m: 82,
            agilityTTest: 84,
          },
          rawStats: {
            freeThrowMade: 17,
            freeThrowTotal: 20,
            midRangePct: 80,
            threePointPct: 75,
            verticalJumpCm: 74,
            sprint100mSeconds: 11.4,
            agilityTTestSeconds: 9.1,
          },
          coachNotes: 'Excelente control del balón bajo presión y tiro exterior con mecánica fluida.',
        },
      ],
      attendanceHistory: [
        {
          id: 'att_m1',
          date: todayStr,
          dayName: 'Lunes',
          present: true,
          status: 'presente',
          shift: 'matutino_9_11',
          topic: 'Técnica de tiro en suspensión y transición rápida',
        },
        {
          id: 'att_m2',
          date: threeDaysAgoStr,
          dayName: 'Viernes',
          present: true,
          status: 'presente',
          shift: 'matutino_9_11',
          topic: 'Defensa perimetral y lectura de pick and roll',
        },
      ],
    },
    {
      id: 'ww_valeria_11',
      fullName: 'Valeria Morales',
      email: 'valeria.morales@wildwolves.mx',
      phone: '55 3344 5566',
      parentPhone: '55 3344 5566',
      guardianName: 'Carlos Morales',
      gender: 'F',
      age: 15,
      position: 'Escolta',
      jerseyNumber: 11,
      role: 'student',
      shift: 'vespertino_5_7',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      stripeStatus: 'active',
      trainingDays: ['Martes', 'Jueves', 'Sábado'],
      totalDaysTrained: 14,
      medicalNotes: {
        bloodType: 'A+',
        allergies: 'Penicilina',
        emergencyContact: 'Carlos Morales (Papá)',
        emergencyPhone: '55 3344 5566',
        medicalConditions: 'Sin restricciones.',
        lastCheckup: yesterdayStr,
      },
      finances: {
        costPerClass: 50,
        frequency: 'semanal',
        status: 'al_corriente',
        balanceDue: 0,
        lastPaymentDate: yesterdayStr,
        lastPaymentAmount: 150,
        paymentMethod: 'Efectivo',
        paymentHistory: [
          {
            id: 'pay_val_01',
            studentId: 'ww_valeria_11',
            studentName: 'Valeria Morales',
            guardianName: 'Carlos Morales',
            guardianPhone: '55 3344 5566',
            amount: 150,
            date: yesterdayStr,
            method: 'Efectivo',
            status: 'Pagado',
            notes: 'Semana 1 Octubre',
            shift: 'vespertino_5_7',
          },
          {
            id: 'pay_val_02',
            studentId: 'ww_valeria_11',
            studentName: 'Valeria Morales',
            guardianName: 'Carlos Morales',
            guardianPhone: '55 3344 5566',
            amount: 150,
            date: tenDaysAgoStr,
            method: 'Efectivo',
            status: 'Pagado',
            notes: 'Semana 4 Septiembre',
            shift: 'vespertino_5_7',
          },
        ],
      },
      metricsCurrent: {
        freeThrow: 90,
        midRange: 85,
        threePoint: 88,
        verticalJump: 70,
        sprint100m: 85,
        agilityTTest: 88,
      },
      metricsPrevious: {
        freeThrow: 85,
        midRange: 80,
        threePoint: 80,
        verticalJump: 68,
        sprint100m: 82,
        agilityTTest: 84,
      },
      training: {
        ropeJumpsToday: 500,
        ropeTarget: 800,
        joggingMinutesToday: 35,
        joggingTarget: 45,
        schedule: generateSchedule(14),
      },
      evaluations: [
        {
          id: 'eval_val_01',
          studentId: 'ww_valeria_11',
          date: yesterdayStr,
          coachName: 'Coach Ricardo',
          metrics: {
            freeThrow: 90,
            midRange: 85,
            threePoint: 88,
            verticalJump: 70,
            sprint100m: 85,
            agilityTTest: 88,
          },
          rawStats: {
            freeThrowMade: 18,
            freeThrowTotal: 20,
            midRangePct: 85,
            threePointPct: 88,
            verticalJumpCm: 68,
            sprint100mSeconds: 11.2,
            agilityTTestSeconds: 8.9,
          },
          coachNotes: 'Tiradora élite de media y larga distancia, gran velocidad de reacción en cortes.',
        },
      ],
      attendanceHistory: [
        {
          id: 'att_v1',
          date: yesterdayStr,
          dayName: 'Martes',
          present: true,
          status: 'presente',
          shift: 'vespertino_5_7',
          topic: 'Spacing ofensivo y tiro tras pantalla indirecta',
        },
      ],
    },
    {
      id: 'ww_santiago_23',
      fullName: 'Santiago Hernández',
      email: 'santiago.hdz@wildwolves.mx',
      phone: '55 6677 8899',
      parentPhone: '55 6677 8899',
      guardianName: 'Elena Hernández',
      gender: 'M',
      age: 17,
      position: 'Pívot',
      jerseyNumber: 23,
      role: 'student',
      shift: 'matutino_9_11',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      stripeStatus: 'pending',
      trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
      totalDaysTrained: 12,
      medicalNotes: {
        bloodType: 'B+',
        allergies: 'Ninguna',
        emergencyContact: 'Elena Hernández (Mamá)',
        emergencyPhone: '55 6677 8899',
        medicalConditions: 'Sin restricciones.',
        lastCheckup: todayStr,
      },
      finances: {
        costPerClass: 50,
        frequency: 'semanal',
        status: 'pendiente',
        balanceDue: 150,
        lastPaymentDate: tenDaysAgoStr,
        lastPaymentAmount: 150,
        paymentMethod: 'Transferencia',
        paymentHistory: [
          {
            id: 'pay_sant_01',
            studentId: 'ww_santiago_23',
            studentName: 'Santiago Hernández',
            guardianName: 'Elena Hernández',
            guardianPhone: '55 6677 8899',
            amount: 150,
            date: tenDaysAgoStr,
            method: 'Transferencia',
            status: 'Pagado',
            notes: 'Semana anterior',
            shift: 'matutino_9_11',
          },
        ],
      },
      metricsCurrent: {
        freeThrow: 70,
        midRange: 65,
        threePoint: 50,
        verticalJump: 82,
        sprint100m: 72,
        agilityTTest: 74,
      },
      metricsPrevious: {
        freeThrow: 65,
        midRange: 60,
        threePoint: 45,
        verticalJump: 78,
        sprint100m: 70,
        agilityTTest: 70,
      },
      training: {
        ropeJumpsToday: 300,
        ropeTarget: 600,
        joggingMinutesToday: 20,
        joggingTarget: 40,
        schedule: generateSchedule(12),
      },
      evaluations: [
        {
          id: 'eval_sant_01',
          studentId: 'ww_santiago_23',
          date: todayStr,
          coachName: 'Coach Ricardo',
          metrics: {
            freeThrow: 70,
            midRange: 65,
            threePoint: 50,
            verticalJump: 82,
            sprint100m: 72,
            agilityTTest: 74,
          },
          rawStats: {
            freeThrowMade: 14,
            freeThrowTotal: 20,
            midRangePct: 65,
            threePointPct: 50,
            verticalJumpCm: 79,
            sprint100mSeconds: 12.1,
            agilityTTestSeconds: 9.8,
          },
          coachNotes: 'Fuerza en la pintura y rebote defensivo destacados. Trabajar consistencia en tiro libre.',
        },
      ],
      attendanceHistory: [
        {
          id: 'att_s1',
          date: todayStr,
          dayName: 'Lunes',
          present: true,
          status: 'presente',
          shift: 'matutino_9_11',
          topic: 'Juego de pies en poste bajo y bloqueo de rebote',
        },
      ],
    },
    {
      id: 'ww_camila_03',
      fullName: 'Camila Ruiz',
      email: 'camila.ruiz@wildwolves.mx',
      phone: '55 7788 9900',
      parentPhone: '55 7788 9900',
      guardianName: 'Roberto Ruiz',
      gender: 'F',
      age: 14,
      position: 'Alero',
      jerseyNumber: 3,
      role: 'student',
      shift: 'vespertino_5_7',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      stripeStatus: 'active',
      trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
      totalDaysTrained: 10,
      medicalNotes: {
        bloodType: 'O-',
        allergies: 'Ninguna',
        emergencyContact: 'Roberto Ruiz (Papá)',
        emergencyPhone: '55 7788 9900',
        medicalConditions: 'Sin restricciones.',
        lastCheckup: threeDaysAgoStr,
      },
      finances: {
        costPerClass: 50,
        frequency: 'al_dia',
        status: 'al_corriente',
        balanceDue: 0,
        lastPaymentDate: threeDaysAgoStr,
        lastPaymentAmount: 50,
        paymentMethod: 'Efectivo',
        paymentHistory: [
          {
            id: 'pay_cam_01',
            studentId: 'ww_camila_03',
            studentName: 'Camila Ruiz',
            guardianName: 'Roberto Ruiz',
            guardianPhone: '55 7788 9900',
            amount: 50,
            date: threeDaysAgoStr,
            method: 'Efectivo',
            status: 'Pagado',
            notes: 'Clase individual',
            shift: 'vespertino_5_7',
          },
        ],
      },
      metricsCurrent: {
        freeThrow: 78,
        midRange: 75,
        threePoint: 72,
        verticalJump: 74,
        sprint100m: 80,
        agilityTTest: 82,
      },
      metricsPrevious: {
        freeThrow: 72,
        midRange: 70,
        threePoint: 68,
        verticalJump: 70,
        sprint100m: 76,
        agilityTTest: 78,
      },
      training: {
        ropeJumpsToday: 350,
        ropeTarget: 700,
        joggingMinutesToday: 25,
        joggingTarget: 40,
        schedule: generateSchedule(10),
      },
      evaluations: [
        {
          id: 'eval_cam_01',
          studentId: 'ww_camila_03',
          date: threeDaysAgoStr,
          coachName: 'Coach Ricardo',
          metrics: {
            freeThrow: 78,
            midRange: 75,
            threePoint: 72,
            verticalJump: 74,
            sprint100m: 80,
            agilityTTest: 82,
          },
          rawStats: {
            freeThrowMade: 15,
            freeThrowTotal: 20,
            midRangePct: 75,
            threePointPct: 72,
            verticalJumpCm: 71,
            sprint100mSeconds: 11.6,
            agilityTTestSeconds: 9.3,
          },
          coachNotes: 'Gran agresividad atacando el aro y tiro perimetral constante.',
        },
      ],
      attendanceHistory: [
        {
          id: 'att_c1',
          date: threeDaysAgoStr,
          dayName: 'Viernes',
          present: true,
          status: 'presente',
          shift: 'vespertino_5_7',
          topic: 'Ataque contra zona 2-3 y tiro desde esquinas',
        },
      ],
    },
    {
      id: 'ww_diego_10',
      fullName: 'Diego Mendoza',
      email: 'diego.mendoza@wildwolves.mx',
      phone: '55 8899 0011',
      parentPhone: '55 8899 0011',
      guardianName: 'Patricia Mendoza',
      gender: 'M',
      age: 16,
      position: 'Ala-Pívot',
      jerseyNumber: 10,
      role: 'student',
      shift: 'matutino_9_11',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      stripeStatus: 'pending',
      trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
      totalDaysTrained: 15,
      medicalNotes: {
        bloodType: 'O+',
        allergies: 'Ninguna',
        emergencyContact: 'Patricia Mendoza (Mamá)',
        emergencyPhone: '55 8899 0011',
        medicalConditions: 'Sin restricciones.',
        lastCheckup: todayStr,
      },
      finances: {
        costPerClass: 50,
        frequency: 'al_dia',
        status: 'pendiente',
        balanceDue: 100,
        lastPaymentDate: tenDaysAgoStr,
        lastPaymentAmount: 50,
        paymentMethod: 'Efectivo',
        paymentHistory: [
          {
            id: 'pay_dieg_01',
            studentId: 'ww_diego_10',
            studentName: 'Diego Mendoza',
            guardianName: 'Patricia Mendoza',
            guardianPhone: '55 8899 0011',
            amount: 50,
            date: tenDaysAgoStr,
            method: 'Efectivo',
            status: 'Pagado',
            notes: 'Clase previa',
            shift: 'matutino_9_11',
          },
        ],
      },
      metricsCurrent: {
        freeThrow: 72,
        midRange: 68,
        threePoint: 60,
        verticalJump: 79,
        sprint100m: 75,
        agilityTTest: 77,
      },
      metricsPrevious: {
        freeThrow: 68,
        midRange: 62,
        threePoint: 55,
        verticalJump: 75,
        sprint100m: 72,
        agilityTTest: 74,
      },
      training: {
        ropeJumpsToday: 400,
        ropeTarget: 750,
        joggingMinutesToday: 25,
        joggingTarget: 45,
        schedule: generateSchedule(15),
      },
      evaluations: [
        {
          id: 'eval_dieg_01',
          studentId: 'ww_diego_10',
          date: todayStr,
          coachName: 'Coach Ricardo',
          metrics: {
            freeThrow: 72,
            midRange: 68,
            threePoint: 60,
            verticalJump: 79,
            sprint100m: 75,
            agilityTTest: 77,
          },
          rawStats: {
            freeThrowMade: 14,
            freeThrowTotal: 20,
            midRangePct: 68,
            threePointPct: 60,
            verticalJumpCm: 76,
            sprint100mSeconds: 11.9,
            agilityTTestSeconds: 9.5,
          },
          coachNotes: 'Muy buen tiro de media distancia y versatilidad defensiva.',
        },
      ],
      attendanceHistory: [
        {
          id: 'att_d1',
          date: todayStr,
          dayName: 'Lunes',
          present: true,
          status: 'retardo',
          shift: 'matutino_9_11',
          topic: 'Retardo de 10 min por transporte. Completó el bloque de resistencia.',
        },
      ],
    },
  ];
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
        const seed = getSeedStudents();
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(seed));
        return seed;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      const seed = getSeedStudents();
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(seed));
      return seed;
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  getStudent: (id: string): StudentProfile => {
    const list = HoopStore.getStudents();
    const found = list.find((s) => s.id === id);
    if (found) return found;
    if (list.length > 0) return list[0];

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

    if (yearIncome < 8400) {
      yearIncome += 8400; // balance base histórico acumulado
    }

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
