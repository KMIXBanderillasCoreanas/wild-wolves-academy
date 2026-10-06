export type UserRole = 'coach' | 'student';

export interface MedicalRecord {
  bloodType: string;
  allergies: string[];
  asthmaOrCardio: boolean;
  injuriesHistory: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  insurancePolicyNumber?: string;
  lastMedicalCheckup: string;
}

export interface BasketballMetrics {
  shooting: number;       // 0 - 100 (% tiro exterior y libres)
  ballHandling: number;   // 0 - 100 (control con ambas manos y drible)
  verticalJump: number;   // 0 - 100 (explosividad en salto)
  agilitySpeed: number;   // 0 - 100 (Lane Agility & sprint)
  defensiveIQ: number;    // 0 - 100 (desplazamiento y lectura táctica)
  staminaFitness: number; // 0 - 100 (capacidad aeróbica y resistencia)
}

export interface RawAthleticRecord {
  verticalJumpInches: number;
  threePointPct: number;
  freeThrowPct: number;
  laneAgilitySeconds: number;
  beepTestLevel: number;
}

export interface Evaluation {
  id: string;
  studentId: string;
  date: string;
  coachName: string;
  metrics: BasketballMetrics;
  rawStats: RawAthleticRecord;
  coachNotes: string;
  prAchieved: boolean;
}

export interface RopeSession {
  day: number;
  targetJumps: number; // Progressive from 100 to 1000 jumps
  completed: boolean;
  completedAt?: string;
}

export interface EnduranceSession {
  day: number;
  phase: string;
  targetDuration: string; // e.g. "30 seg trote continuo", "5 min trote", "60 min carrera continua"
  minutesEstimated: number;
  completed: boolean;
  heartRateZone: string; // e.g. "Zona 2 (120-140 bpm)"
}

export interface TrainingPlan {
  ropeTracker: RopeSession[];
  enduranceCalendar: EnduranceSession[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  jerseyNumber: number;
  position: 'Point Guard (PG)' | 'Shooting Guard (SG)' | 'Small Forward (SF)' | 'Power Forward (PF)' | 'Center (C)';
  age: number;
  height: string;
  weight: string;
  category: 'Sub-15' | 'Sub-18' | 'Senior / Pro Prep' | 'Universitario';
  avatar: string;
  currentMetrics: BasketballMetrics;
  benchmarkMetrics: BasketballMetrics;
  evaluations: Evaluation[];
  trainingPlan: TrainingPlan;
  medicalRecord: MedicalRecord;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  studentId?: string; // If student, links to student profile
}
