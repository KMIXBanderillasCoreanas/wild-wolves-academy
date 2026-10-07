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

// Generador de cronograma de 30 días de sobrecarga
export const generateSchedule = (completedDays: number = 7): TrainingDay[] => {
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

// Generador de asistencias recientes
const generateRecentAttendance = (trainedDays: string[], totalCount: number): AttendanceRecord[] => {
  const dates = [
    { date: '2026-10-05', dayName: 'Lunes', topic: 'Técnica de tiro en suspensión y lectura de pick & roll' },
    { date: '2026-10-03', dayName: 'Sábado', topic: 'Pruebas combine de salto vertical y sprint 100m' },
    { date: '2026-10-02', dayName: 'Viernes', topic: 'T-Test defensivo, desplazamientos y transiciones' },
    { date: '2026-09-30', dayName: 'Miércoles', topic: 'Sobrecarga de cuerda y resistencia anaeróbica' },
    { date: '2026-09-28', dayName: 'Lunes', topic: 'Manejo de balón bimanual y pase bajo presión' },
    { date: '2026-09-25', dayName: 'Viernes', topic: 'Tiros libres bajo fatiga (serie 20 lanzamientos)' },
    { date: '2026-09-23', dayName: 'Miércoles', topic: 'Defensa individual y ayudas defensivas' },
    { date: '2026-09-21', dayName: 'Lunes', topic: 'Film room, juego rápido y contraataque' },
  ];

  return dates.map((d, i) => ({
    id: `att_${d.date}`,
    date: d.date,
    dayName: d.dayName,
    present: i !== 3, // una falta controlada para demostración
    topic: d.topic,
  }));
};

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student_01',
    fullName: 'Lucas "El Lobo" Morales',
    email: 'lucas.morales@wildwolves.academy',
    phone: '+52 1 55 4321 8765',
    gender: 'M',
    age: 17,
    position: 'Base',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    parentPhone: '+52 1 55 9876 5432',
    medicalNotes: {
      allergies: 'Penicilina, Picadura de avispa',
      bloodType: 'O Positivo (O+)',
      emergencyContact: 'Carmen Morales (Madre)',
      emergencyPhone: '+52 1 55 9876 5432',
      medicalConditions: 'Apto para alto rendimiento. Sin asma ni cardiopatías.',
      insurancePolicy: 'GNP-MED-883921-WW',
      lastCheckup: '15/08/2026',
    },
    stripeStatus: 'active',
    // ASISTENCIA: Total de días entrenados y días que entrena
    trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
    totalDaysTrained: 24, // 24 días entrenados
    attendanceHistory: generateRecentAttendance(['Lunes', 'Miércoles', 'Viernes'], 24),
    // CONTROL FINANCIERO: Costo clase $50 pesos
    finances: {
      costPerClass: 50,
      frequency: 'al_dia', // paga por clase
      status: 'al_corriente',
      balanceDue: 0,
      lastPaymentDate: '2026-10-05',
      lastPaymentAmount: 50,
      paymentMethod: 'Efectivo',
    },
    metricsCurrent: {
      freeThrow: 85,     // 17/20 tiros
      midRange: 82,
      threePoint: 90,
      verticalJump: 78,  // 74 cm
      sprint100m: 88,    // 11.6 seg
      agilityTTest: 92,  // 9.2 seg
    },
    metricsPrevious: {
      freeThrow: 80,
      midRange: 75,
      threePoint: 82,
      verticalJump: 72,
      sprint100m: 84,
      agilityTTest: 86,
    },
    training: {
      ropeJumpsToday: 550,
      ropeTarget: 1000,
      joggingMinutesToday: 30,
      joggingTarget: 60,
      schedule: generateSchedule(12),
    },
    evaluations: [
      {
        id: 'eval_01',
        studentId: 'student_01',
        date: '18/09/2026',
        coachName: 'Coach Ricardo',
        metrics: {
          freeThrow: 85,
          midRange: 82,
          threePoint: 90,
          verticalJump: 78,
          sprint100m: 88,
          agilityTTest: 92,
        },
        rawStats: {
          freeThrowMade: 17,
          freeThrowTotal: 20,
          midRangePct: 82,
          threePointPct: 90,
          verticalJumpCm: 74,
          sprint100mSeconds: 11.6,
          agilityTTestSeconds: 9.2,
        },
        coachNotes: 'Excelente control en pick & roll. Gran asistencia y puntualidad a los entrenamientos.',
      },
    ],
  },
  {
    id: 'student_02',
    fullName: 'Sofía Ramírez',
    email: 'sofia.ramirez@wildwolves.academy',
    phone: '+52 1 55 3344 5566',
    gender: 'F',
    age: 16,
    position: 'Escolta',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    parentPhone: '+52 1 55 5555 1234',
    medicalNotes: {
      allergies: 'Polen estacional',
      bloodType: 'A Positivo (A+)',
      emergencyContact: 'Roberto Ramírez (Padre)',
      emergencyPhone: '+52 1 55 5555 1234',
      medicalConditions: 'Sin lesiones previas.',
      insurancePolicy: 'AXA-WW-77491',
      lastCheckup: '01/09/2026',
    },
    stripeStatus: 'active',
    // ASISTENCIA
    trainingDays: ['Martes', 'Jueves', 'Sábado'],
    totalDaysTrained: 31, // 31 días entrenados
    attendanceHistory: generateRecentAttendance(['Martes', 'Jueves', 'Sábado'], 31),
    // CONTROL FINANCIERO: Modalidad Mensual ($600 = 12 clases x $50)
    finances: {
      costPerClass: 50,
      frequency: 'mensual',
      status: 'al_corriente',
      balanceDue: 0,
      lastPaymentDate: '2026-10-01',
      lastPaymentAmount: 600,
      paymentMethod: 'Transferencia',
    },
    metricsCurrent: {
      freeThrow: 95,     // 19/20 tiros
      midRange: 88,
      threePoint: 94,
      verticalJump: 74,  // 68 cm
      sprint100m: 85,    // 12.1 seg
      agilityTTest: 89,  // 9.5 seg
    },
    metricsPrevious: {
      freeThrow: 90,
      midRange: 82,
      threePoint: 88,
      verticalJump: 70,
      sprint100m: 80,
      agilityTTest: 83,
    },
    training: {
      ropeJumpsToday: 700,
      ropeTarget: 1000,
      joggingMinutesToday: 40,
      joggingTarget: 60,
      schedule: generateSchedule(18),
    },
    evaluations: [
      {
        id: 'eval_02',
        studentId: 'student_02',
        date: '22/09/2026',
        coachName: 'Coach Ricardo',
        metrics: {
          freeThrow: 95,
          midRange: 88,
          threePoint: 94,
          verticalJump: 74,
          sprint100m: 85,
          agilityTTest: 89,
        },
        rawStats: {
          freeThrowMade: 19,
          freeThrowTotal: 20,
          midRangePct: 88,
          threePointPct: 94,
          verticalJumpCm: 68,
          sprint100mSeconds: 12.1,
          agilityTTestSeconds: 9.5,
        },
        coachNotes: 'Mecánica de tiro impecable y 100% de asistencia en el último mes.',
      },
    ],
  },
  {
    id: 'student_03',
    fullName: 'Mateo Silva',
    email: 'mateo.silva@wildwolves.academy',
    phone: '+52 1 55 8899 0011',
    gender: 'M',
    age: 19,
    position: 'Alero',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    parentPhone: '+52 1 55 1234 5678',
    medicalNotes: {
      allergies: 'Ninguna conocida',
      bloodType: 'B Positivo (B+)',
      emergencyContact: 'Rodrigo Silva (Padre)',
      emergencyPhone: '+52 1 55 1234 5678',
      medicalConditions: 'Ligamento anterior rehabilitado.',
      insurancePolicy: 'METLIFE-WW-2291',
      lastCheckup: '28/08/2026',
    },
    stripeStatus: 'pending',
    // ASISTENCIA
    trainingDays: ['Lunes', 'Miércoles', 'Viernes'],
    totalDaysTrained: 16, // 16 días entrenados
    attendanceHistory: generateRecentAttendance(['Lunes', 'Miércoles', 'Viernes'], 16),
    // CONTROL FINANCIERO: Modalidad Semanal ($150 = 3 clases x $50) con adeudo
    finances: {
      costPerClass: 50,
      frequency: 'semanal',
      status: 'pendiente', // TIENE ADEUDO
      balanceDue: 150, // Debe $150 MXN (1 semana de 3 clases)
      lastPaymentDate: '2026-09-25',
      lastPaymentAmount: 150,
      paymentMethod: 'Efectivo',
    },
    metricsCurrent: {
      freeThrow: 75,
      midRange: 78,
      threePoint: 72,
      verticalJump: 94,
      sprint100m: 91,
      agilityTTest: 82,
    },
    metricsPrevious: {
      freeThrow: 70,
      midRange: 72,
      threePoint: 68,
      verticalJump: 90,
      sprint100m: 87,
      agilityTTest: 78,
    },
    training: {
      ropeJumpsToday: 400,
      ropeTarget: 1000,
      joggingMinutesToday: 25,
      joggingTarget: 60,
      schedule: generateSchedule(9),
    },
    evaluations: [
      {
        id: 'eval_03',
        studentId: 'student_03',
        date: '20/09/2026',
        coachName: 'Coach Ricardo',
        metrics: {
          freeThrow: 75,
          midRange: 78,
          threePoint: 72,
          verticalJump: 94,
          sprint100m: 91,
          agilityTTest: 82,
        },
        rawStats: {
          freeThrowMade: 15,
          freeThrowTotal: 20,
          midRangePct: 78,
          threePointPct: 72,
          verticalJumpCm: 86,
          sprint100mSeconds: 11.2,
          agilityTTestSeconds: 9.8,
        },
        coachNotes: 'Físico imponente en penetración. Regularizar cuota semanal de $150 pesos.',
      },
    ],
  },
];

export const INITIAL_COACH_USER: User = {
  id: 'usr_coach_ricardo',
  fullName: 'Coach Ricardo',
  email: 'ricardo@wildwolves.academy',
  role: 'coach',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  provider: 'demo',
};

export const INITIAL_STUDENT_USER: User = {
  id: 'usr_student',
  fullName: 'Lucas "El Lobo" Morales',
  email: 'lucas.morales@wildwolves.academy',
  role: 'student',
  studentId: 'student_01',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  provider: 'demo',
};

export const INITIAL_PARENT_USER: User = {
  id: 'usr_parent_elena',
  fullName: 'Elena Morales (Tutor)',
  email: 'elena.morales@wildwolves.academy',
  role: 'parent',
  studentId: 'student_01',
  parentOfStudentId: 'student_01',
  phone: '+52 1 55 9988 7766',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  provider: 'google',
};

const STORAGE_KEYS = {
  STUDENTS: 'hoop_athletes_v7',
  USER: 'hoop_session_user_v7',
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
    return list.find((s) => s.id === id) || list[0] || INITIAL_STUDENTS[0];
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
        ropeTarget: 1000,
        joggingMinutesToday: 10,
        joggingTarget: 60,
        schedule: generateSchedule(1),
      },
      evaluations: [],
    };
    const updated = [created, ...students];
    HoopStore.saveStudents(updated);
    return created;
  },

  // 1. CONTROL DE ASISTENCIA (Solo Coach marca, Alumno visualiza)
  recordAttendance: (studentId: string, date: string, dayName: string, present: boolean, topic: string) => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const existingIdx = s.attendanceHistory.findIndex((a) => a.date === date);
        let newHistory = [...s.attendanceHistory];

        if (existingIdx >= 0) {
          newHistory[existingIdx] = { ...newHistory[existingIdx], present, topic };
        } else {
          newHistory = [
            {
              id: `att_${Date.now()}`,
              date,
              dayName,
              present,
              topic,
            },
            ...newHistory,
          ];
        }

        // Recalcular total de días entrenados
        const totalPresent = newHistory.filter((a) => a.present).length;

        // Si paga "al día" ($50) y asiste, si no ha pagado se agrega al adeudo
        let newFinances = { ...s.finances };
        if (s.finances.frequency === 'al_dia' && present && existingIdx < 0) {
          newFinances.balanceDue += 50;
          newFinances.status = 'pendiente' as PaymentStatus;
        }

        return {
          ...s,
          totalDaysTrained: totalPresent,
          attendanceHistory: newHistory,
          finances: newFinances,
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    // Persistencia en segundo plano en Supabase
    SupabaseSync.recordAttendance(studentId, present, dayName, topic).catch((e) => console.warn('Supabase attendance sync:', e));
    return updated.find((s) => s.id === studentId);
  },

  // 2. CONTROL FINANCIERO: Registrar Pago Recibido ($50 pesos / $150 / $600)
  recordPayment: (studentId: string, amount: number, method: 'Efectivo' | 'Transferencia' | 'Stripe') => {
    const students = HoopStore.getStudents();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const newBalance = Math.max(0, s.finances.balanceDue - amount);
        return {
          ...s,
          stripeStatus: newBalance === 0 ? ('active' as const) : s.stripeStatus,
          finances: {
            ...s.finances,
            balanceDue: newBalance,
            status: newBalance === 0 ? ('al_corriente' as PaymentStatus) : ('pendiente' as PaymentStatus),
            lastPaymentDate: new Date().toLocaleDateString('es-MX'),
            lastPaymentAmount: amount,
            paymentMethod: method,
          },
        };
      }
      return s;
    });

    HoopStore.saveStudents(updated);
    // Persistencia en segundo plano en Supabase
    SupabaseSync.recordPayment(studentId, amount, method).catch((e) => console.warn('Supabase payment sync:', e));
    return updated.find((s) => s.id === studentId);
  },

  // 3. CAMBIAR MODALIDAD DE PAGO (Al día $50, Semanal $150, Mensual $600)
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

  // 4. ACTUALIZAR DÍAS QUE ENTRENA EL ATLETA
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
      document.cookie = `user_role=${user.role}; path=/; max-age=86400`;
      window.dispatchEvent(new Event('auth_changed'));
    } catch (e) {
      console.error('Error al guardar sesión', e);
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
      fullName: student.fullName,
      email: student.email,
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
      fullName: student.medicalNotes.emergencyContact ? `${student.medicalNotes.emergencyContact}` : `Tutor de ${student.fullName.split(' ')[0]}`,
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

  signInWithGoogle: (role: Role = 'student', customEmail?: string, customName?: string) => {
    if (role === 'coach') {
      HoopStore.setCurrentUser(INITIAL_COACH_USER);
      return INITIAL_COACH_USER;
    }
    const email = customEmail || (role === 'parent' ? 'tutor.wolves@gmail.com' : 'atleta.wolves@gmail.com');
    const fullName = customName || (role === 'parent' ? 'Elena Morales (Tutor Google)' : 'Lucas "El Lobo" Morales');
    const user: User = {
      id: `usr_g_${Date.now()}`,
      fullName,
      email,
      role,
      studentId: 'student_01',
      parentOfStudentId: role === 'parent' ? 'student_01' : undefined,
      avatarUrl: role === 'parent'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      provider: 'google',
    };
    HoopStore.setCurrentUser(user);
    return user;
  },

  signInWithApple: (role: Role = 'student', customName?: string) => {
    if (role === 'coach') {
      HoopStore.setCurrentUser(INITIAL_COACH_USER);
      return INITIAL_COACH_USER;
    }
    const user: User = {
      id: `usr_apple_${Date.now()}`,
      fullName: customName || (role === 'parent' ? 'Tutor Apple ID' : 'Atleta Apple ID'),
      email: role === 'parent' ? 'tutor.privaterelay@appleid.com' : 'atleta.privaterelay@appleid.com',
      role,
      studentId: 'student_01',
      parentOfStudentId: role === 'parent' ? 'student_01' : undefined,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      provider: 'apple',
    };
    HoopStore.setCurrentUser(user);
    return user;
  },

  signInWithWhatsApp: (phone: string, fullName: string, role: Role = 'student') => {
    const cleanPhone = phone.trim();
    const user: User = {
      id: `usr_wa_${Date.now()}`,
      fullName: fullName.trim() || (role === 'parent' ? 'Tutor WhatsApp' : 'Atleta WhatsApp'),
      email: `${cleanPhone.replace(/[^0-9]/g, '')}@whatsapp.wildwolves.academy`,
      phone: cleanPhone,
      role,
      studentId: 'student_01',
      parentOfStudentId: role === 'parent' ? 'student_01' : undefined,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      provider: 'whatsapp',
    };
    HoopStore.setCurrentUser(user);
    return user;
  },

  signInWithEmail: (email: string, fullName: string, role: Role = 'student') => {
    if (email.toLowerCase().includes('ricardo') || email.toLowerCase() === 'coach@wildwolves.academy') {
      HoopStore.setCurrentUser(INITIAL_COACH_USER);
      return INITIAL_COACH_USER;
    }
    const user: User = {
      id: `usr_mail_${Date.now()}`,
      fullName: fullName.trim() || (role === 'parent' ? 'Tutor Registrado' : 'Atleta Registrado'),
      email: email.trim(),
      role,
      studentId: 'student_01',
      parentOfStudentId: role === 'parent' ? 'student_01' : undefined,
      avatarUrl: role === 'parent'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      provider: 'email',
    };
    HoopStore.setCurrentUser(user);
    return user;
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
            balanceDue: 0,
            status: 'al_corriente' as PaymentStatus,
            lastPaymentDate: new Date().toLocaleDateString('es-MX'),
            lastPaymentAmount: s.finances.costPerClass,
            paymentMethod: 'Stripe' as const,
          }
        };
      }
      return s;
    });
    HoopStore.saveStudents(updated);
    return updated.find((s) => s.id === studentId);
  },

  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.dispatchEvent(new Event('auth_changed'));
  },
};
