export type Role = 'coach' | 'student' | 'parent';

export type Position = 'Base' | 'Escolta' | 'Alero' | 'Ala-Pívot' | 'Pívot';

export type PaymentFrequency = 'al_dia' | 'semanal' | 'mensual';

export type PaymentStatus = 'al_corriente' | 'pendiente';

export type AuthProvider = 'google' | 'email' | 'whatsapp' | 'apple' | 'demo';

export interface BasketballMetrics {
  freeThrow: number;    // % tiros libres (base 20 tiros) (0-100)
  midRange: number;     // % tiro de media distancia (0-100)
  threePoint: number;   // % tiros de tres / larga distancia (0-100)
  verticalJump: number; // Salto vertical normalizado (cm) (0-100)
  sprint100m: number;   // Velocidad 100m planos (segundos convertidos a escala de rendimiento) (0-100)
  agilityTTest: number; // Agilidad en T-Test defensivo (0-100)
}

export interface TrainingDay {
  day: number;
  label: string;
  completed: boolean;
  ropeJumps: number;
  joggingMinutes: number;
  phase: string;
}

export interface ProgressiveTraining {
  ropeJumpsToday: number;       // ej. 450
  ropeTarget: number;           // meta final: 1000
  joggingMinutesToday: number;   // ej. 25 min
  joggingTarget: number;        // meta final: 60 min
  schedule: TrainingDay[];      // Días completados vs. pendientes
}

export interface MedicalNotes {
  allergies: string;
  bloodType: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions?: string;
  insurancePolicy?: string;
  lastCheckup?: string;
}

export interface RawEvaluationStats {
  freeThrowMade: number;        // ej. 17
  freeThrowTotal: number;       // base 20 tiros
  midRangePct: number;          // %
  threePointPct: number;        // %
  verticalJumpCm: number;       // cm reales (ej. 76 cm)
  sprint100mSeconds: number;    // seg reales (ej. 11.8s)
  agilityTTestSeconds: number;  // seg reales (ej. 9.4s)
}

export interface Evaluation {
  id: string;
  studentId: string;
  date: string;
  coachName: string;
  metrics: BasketballMetrics;
  rawStats: RawEvaluationStats;
  coachNotes: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;                 // YYYY-MM-DD o DD/MM/AAAA
  dayName: string;             // Lunes, Martes, etc.
  present: boolean;
  topic?: string;               // Ej. Fundamentos de tiro y drible
}

export interface FinancialRecord {
  costPerClass: number;         // 50 pesos fijos
  frequency: PaymentFrequency;  // 'al_dia' | 'semanal' | 'mensual'
  status: PaymentStatus;        // 'al_corriente' | 'pendiente'
  balanceDue: number;           // Monto pendiente en MXN (ej. 0 o 50 o 150)
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentMethod?: 'Efectivo' | 'Transferencia' | 'Stripe';
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  age: number;
  position: Position;
  role: Role;
  avatarUrl: string;
  parentPhone?: string;         // si es menor de edad
  medicalNotes: MedicalNotes;   // alergias, tipo de sangre, contacto de emergencia
  stripeStatus: 'active' | 'pending';
  // Asistencia deportiva
  trainingDays: string[];       // Días que entrena (ej. ['Lunes', 'Miércoles', 'Viernes'])
  totalDaysTrained: number;     // Total de días que ha entrenado acumulados
  attendanceHistory: AttendanceRecord[];
  // Control financiero (Costo clase: $30 pesos)
  finances: FinancialRecord;
  // Métricas y entrenamiento
  metricsCurrent: BasketballMetrics;
  metricsPrevious: BasketballMetrics;
  training: ProgressiveTraining;
  evaluations: Evaluation[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl: string;
  studentId?: string;
  parentOfStudentId?: string;
  phone?: string;
  provider?: AuthProvider;
}
