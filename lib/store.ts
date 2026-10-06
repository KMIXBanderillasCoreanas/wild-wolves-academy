'use client';

import { User, StudentProfile, Evaluation, RopeSession, EnduranceSession, MedicalRecord, BasketballMetrics } from './types';

// 1. Generate 30 Progressive Rope Overload Sessions (from 100 to 1000 jumps)
export const generateRopeSessions = (): RopeSession[] => {
  const sessions: RopeSession[] = [];
  // Progressive step: roughly +30 jumps per day from 100 to 1000
  for (let day = 1; day <= 30; day++) {
    const target = Math.min(1000, Math.round(100 + (day - 1) * (900 / 29)));
    // Mark first 6 days as completed by default for realistic demo
    sessions.push({
      day,
      targetJumps: Math.round(target / 10) * 10,
      completed: day <= 6,
      completedAt: day <= 6 ? `2026-09-0${day}` : undefined,
    });
  }
  return sessions;
};

// 2. Generate Progressive Endurance Calendar (from 30s trote to 60 min carrera continua)
export const generateEnduranceSessions = (): EnduranceSession[] => {
  const schedule = [
    { day: 1, phase: 'Fase 1: Activación Aeróbica', duration: '30 seg trote x 4 series', minutes: 2, zone: 'Zona 2 (115-130 bpm)', completed: true },
    { day: 2, phase: 'Fase 1: Activación Aeróbica', duration: '1 min trote x 3 series', minutes: 3, zone: 'Zona 2 (120-135 bpm)', completed: true },
    { day: 3, phase: 'Fase 1: Activación Aeróbica', duration: '2 min trote continuo', minutes: 2, zone: 'Zona 2 (125-140 bpm)', completed: true },
    { day: 4, phase: 'Fase 1: Activación Aeróbica', duration: '3 min trote continuo', minutes: 3, zone: 'Zona 2 (125-140 bpm)', completed: true },
    { day: 5, phase: 'Fase 1: Activación Aeróbica', duration: '5 min trote continuo', minutes: 5, zone: 'Zona 2 (130-145 bpm)', completed: true },
    { day: 6, phase: 'Fase 2: Resistencia Base', duration: '8 min trote continuo', minutes: 8, zone: 'Zona 2-3 (135-150 bpm)', completed: false },
    { day: 7, phase: 'Fase 2: Resistencia Base', duration: '10 min ritmo sostenido', minutes: 10, zone: 'Zona 3 (140-155 bpm)', completed: false },
    { day: 8, phase: 'Fase 2: Resistencia Base', duration: '12 min fartlek suave', minutes: 12, zone: 'Zona 3 (140-155 bpm)', completed: false },
    { day: 9, phase: 'Fase 2: Resistencia Base', duration: '15 min ritmo constante', minutes: 15, zone: 'Zona 3 (145-160 bpm)', completed: false },
    { day: 10, phase: 'Fase 2: Resistencia Base', duration: '18 min ritmo de partido', minutes: 18, zone: 'Zona 3 (145-160 bpm)', completed: false },
    { day: 11, phase: 'Fase 2: Resistencia Base', duration: '20 min carrera continua', minutes: 20, zone: 'Zona 3 (150-165 bpm)', completed: false },
    { day: 12, phase: 'Fase 3: Transición & Cancha Completa', duration: '25 min ritmo tempo', minutes: 25, zone: 'Zona 4 (155-170 bpm)', completed: false },
    { day: 13, phase: 'Fase 3: Transición & Cancha Completa', duration: '30 min carrera aeróbica', minutes: 30, zone: 'Zona 3-4 (150-165 bpm)', completed: false },
    { day: 14, phase: 'Fase 3: Transición & Cancha Completa', duration: '35 min ritmo medio', minutes: 35, zone: 'Zona 3-4 (150-165 bpm)', completed: false },
    { day: 15, phase: 'Fase 3: Transición & Cancha Completa', duration: '40 min resistencia tempo', minutes: 40, zone: 'Zona 4 (155-170 bpm)', completed: false },
    { day: 16, phase: 'Fase 4: Élite Combine 4to Cuarto', duration: '45 min fondo continuo', minutes: 45, zone: 'Zona 4 (160-175 bpm)', completed: false },
    { day: 17, phase: 'Fase 4: Élite Combine 4to Cuarto', duration: '50 min carrera progresiva', minutes: 50, zone: 'Zona 4 (160-175 bpm)', completed: false },
    { day: 18, phase: 'Fase 4: Élite Combine 4to Cuarto', duration: '55 min resistencia avanzada', minutes: 55, zone: 'Zona 4 (165-180 bpm)', completed: false },
    { day: 19, phase: 'Fase 4: Élite Combine 4to Cuarto', duration: '60 min carrera continua pro', minutes: 60, zone: 'Zona 4 (165-180 bpm)', completed: false },
  ];

  return schedule.map((s) => ({
    day: s.day,
    phase: s.phase,
    targetDuration: s.duration,
    minutesEstimated: s.minutes,
    completed: s.completed,
    heartRateZone: s.zone,
  }));
};

export const DEFAULT_MEDICAL_RECORD: MedicalRecord = {
  bloodType: 'O Positivo (O+)',
  allergies: ['Penicilina', 'Picadura de avispa'],
  asthmaOrCardio: false,
  injuriesHistory: 'Esguince grado 1 tobillo derecho (junio 2025 - 100% rehabilitado)',
  emergencyContactName: 'Carmen Morales (Madre)',
  emergencyContactRelation: 'Madre / Tutora Legal',
  emergencyContactPhone: '+52 1 55 9876 5432',
  insurancePolicyNumber: 'GNP-MED-883921-WW',
  lastMedicalCheckup: '2026-08-15 (Apto para alto rendimiento)',
};

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student_01',
    name: 'Lucas "The Wolf" Morales',
    email: 'lucas.morales@wildwolves.academy',
    jerseyNumber: 7,
    position: 'Point Guard (PG)',
    age: 17,
    height: "6'1\" (185 cm)",
    weight: '172 lbs (78 kg)',
    category: 'Sub-18',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    currentMetrics: {
      shooting: 88,
      ballHandling: 94,
      verticalJump: 80,
      agilitySpeed: 92,
      defensiveIQ: 84,
      staminaFitness: 89,
    },
    benchmarkMetrics: {
      shooting: 75,
      ballHandling: 75,
      verticalJump: 70,
      agilitySpeed: 75,
      defensiveIQ: 70,
      staminaFitness: 75,
    },
    trainingPlan: {
      ropeTracker: generateRopeSessions(),
      enduranceCalendar: generateEnduranceSessions(),
    },
    medicalRecord: DEFAULT_MEDICAL_RECORD,
    evaluations: [
      {
        id: 'eval_01',
        studentId: 'student_01',
        date: '2026-09-18',
        coachName: 'Coach Marcus Vance',
        metrics: {
          shooting: 88,
          ballHandling: 94,
          verticalJump: 80,
          agilitySpeed: 92,
          defensiveIQ: 84,
          staminaFitness: 89,
        },
        rawStats: {
          verticalJumpInches: 32.5,
          threePointPct: 46.0,
          freeThrowPct: 89.0,
          laneAgilitySeconds: 10.3,
          beepTestLevel: 13.5,
        },
        coachNotes: 'Excelente control de balón en pick and roll. Muy fluido en el step-back 3PT. Actitud defensiva sobresaliente.',
        prAchieved: true,
      },
      {
        id: 'eval_00',
        studentId: 'student_01',
        date: '2026-08-10',
        coachName: 'Coach Marcus Vance',
        metrics: {
          shooting: 82,
          ballHandling: 89,
          verticalJump: 76,
          agilitySpeed: 88,
          defensiveIQ: 79,
          staminaFitness: 83,
        },
        rawStats: {
          verticalJumpInches: 30.0,
          threePointPct: 39.5,
          freeThrowPct: 82.0,
          laneAgilitySeconds: 10.8,
          beepTestLevel: 12.0,
        },
        coachNotes: 'Evaluación inicial de pretemporada. Gran visión de juego, velocidad natural.',
        prAchieved: false,
      },
    ],
  },
  {
    id: 'student_02',
    name: 'Mateo Silva',
    email: 'mateo.silva@wildwolves.academy',
    jerseyNumber: 23,
    position: 'Small Forward (SF)',
    age: 18,
    height: "6'6\" (198 cm)",
    weight: '210 lbs (95 kg)',
    category: 'Senior / Pro Prep',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    currentMetrics: {
      shooting: 82,
      ballHandling: 77,
      verticalJump: 95,
      agilitySpeed: 85,
      defensiveIQ: 90,
      staminaFitness: 91,
    },
    benchmarkMetrics: {
      shooting: 75,
      ballHandling: 75,
      verticalJump: 70,
      agilitySpeed: 75,
      defensiveIQ: 70,
      staminaFitness: 75,
    },
    trainingPlan: {
      ropeTracker: generateRopeSessions(),
      enduranceCalendar: generateEnduranceSessions(),
    },
    medicalRecord: {
      bloodType: 'A Positivo (A+)',
      allergies: ['Polvo ambiental'],
      asthmaOrCardio: false,
      injuriesHistory: 'Sin cirugías previas ni lesiones osteoarticulares de consideración.',
      emergencyContactName: 'Rodrigo Silva (Padre)',
      emergencyContactRelation: 'Padre',
      emergencyContactPhone: '+52 1 55 1234 5678',
      insurancePolicyNumber: 'AXA-WW-99482',
      lastMedicalCheckup: '2026-09-01',
    },
    evaluations: [
      {
        id: 'eval_02',
        studentId: 'student_02',
        date: '2026-09-21',
        coachName: 'Coach Marcus Vance',
        metrics: {
          shooting: 82,
          ballHandling: 77,
          verticalJump: 95,
          agilitySpeed: 85,
          defensiveIQ: 90,
          staminaFitness: 91,
        },
        rawStats: {
          verticalJumpInches: 37.5,
          threePointPct: 38.0,
          freeThrowPct: 77.0,
          laneAgilitySeconds: 11.1,
          beepTestLevel: 14.2,
        },
        coachNotes: 'Físico imponente en penetración y rebote ofensivo. Explosividad vertical sobresaliente.',
        prAchieved: true,
      },
    ],
  },
];

export const INITIAL_COACH_USER: User = {
  id: 'usr_coach',
  name: 'Coach Marcus Vance',
  email: 'm.vance@wildwolves.academy',
  role: 'coach',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_STUDENT_USER: User = {
  id: 'usr_student',
  name: 'Lucas "The Wolf" Morales',
  email: 'lucas.morales@wildwolves.academy',
  role: 'student',
  studentId: 'student_01',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
};

// Storage Keys
const STORAGE_KEYS = {
  STUDENTS: 'hoop_students_v3',
  USER: 'hoop_active_user_v3',
};

// Helper to access LocalStorage safely
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
    return list.find((s) => s.id === id) || list[0] || INITIAL_STUDENTS[0];
  },

  saveStudents: (students: StudentProfile[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Error saving students to LocalStorage', e);
    }
  },

  registerStudent: (newStudent: Omit<StudentProfile, 'id' | 'trainingPlan' | 'currentMetrics' | 'benchmarkMetrics' | 'evaluations'>): StudentProfile => {
    const students = HoopStore.getStudents();
    const created: StudentProfile = {
      ...newStudent,
      id: `student_${Date.now()}`,
      currentMetrics: {
        shooting: 70,
        ballHandling: 70,
        verticalJump: 70,
        agilitySpeed: 70,
        defensiveIQ: 70,
        staminaFitness: 70,
      },
      benchmarkMetrics: {
        shooting: 75,
        ballHandling: 75,
        verticalJump: 70,
        agilitySpeed: 75,
        defensiveIQ: 70,
        staminaFitness: 75,
      },
      trainingPlan: {
        ropeTracker: generateRopeSessions(),
        enduranceCalendar: generateEnduranceSessions(),
      },
      evaluations: [],
    };
    const updated = [created, ...students];
    HoopStore.saveStudents(updated);
    return created;
  },

  updateStudentMetrics: (studentId: string, metrics: BasketballMetrics, evaluation: Evaluation) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          currentMetrics: metrics,
          evaluations: [evaluation, ...s.evaluations],
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
  },

  toggleRopeSession: (studentId: string, day: number) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const ropeList = s.trainingPlan.ropeTracker.map((r) => {
          if (r.day === day) {
            return {
              ...r,
              completed: !r.completed,
              completedAt: !r.completed ? new Date().toISOString().split('T')[0] : undefined,
            };
          }
          return r;
        });
        return {
          ...s,
          trainingPlan: {
            ...s.trainingPlan,
            ropeTracker: ropeList,
          },
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  toggleEnduranceSession: (studentId: string, day: number) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const enduranceList = s.trainingPlan.enduranceCalendar.map((e) => {
          if (e.day === day) {
            return {
              ...e,
              completed: !e.completed,
            };
          }
          return e;
        });
        return {
          ...s,
          trainingPlan: {
            ...s.trainingPlan,
            enduranceCalendar: enduranceList,
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
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_COACH_USER));
        document.cookie = 'user_role=coach; path=/; max-age=86400';
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
      // Sync cookie for Next.js Middleware route guarding
      document.cookie = `user_role=${user.role}; path=/; max-age=86400`;
      window.dispatchEvent(new Event('auth_changed'));
    } catch (e) {
      console.error('Error saving user', e);
    }
  },

  loginAsCoach: () => {
    HoopStore.setCurrentUser(INITIAL_COACH_USER);
    return INITIAL_COACH_USER;
  },

  loginAsStudent: (studentId: string = 'student_01') => {
    const student = HoopStore.getStudent(studentId);
    const user: User = {
      id: `usr_${student.id}`,
      name: student.name,
      email: student.email,
      role: 'student',
      studentId: student.id,
      avatar: student.avatar,
    };
    HoopStore.setCurrentUser(user);
    return user;
  },

  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.dispatchEvent(new Event('auth_changed'));
  },
};
