export type UserRole = 'coach' | 'alumno';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  athleteId?: string; // If role is alumno, links to their specific record
}

export interface BasketballMetrics {
  shooting: number;       // 0 - 100
  ballHandling: number;   // 0 - 100
  verticalJump: number;   // 0 - 100 (normalized score) or raw cm/inches
  agilitySpeed: number;   // 0 - 100
  defensiveIQ: number;    // 0 - 100
  staminaFitness: number; // 0 - 100
}

export interface RawAthleticRecord {
  verticalJumpInches: number;
  threePointPct: number;
  freeThrowPct: number;
  laneAgilitySeconds: number;
  beepTestLevel: number;
  turnoverRatePct: number;
}

export interface TestEvaluation {
  id: string;
  athleteId: string;
  date: string;
  coachName: string;
  coachNotes: string;
  metrics: BasketballMetrics;
  rawStats: RawAthleticRecord;
  personalRecordAchieved?: boolean;
}

export interface Athlete {
  id: string;
  name: string;
  jerseyNumber: number;
  position: 'Point Guard (PG)' | 'Shooting Guard (SG)' | 'Small Forward (SF)' | 'Power Forward (PF)' | 'Center (C)';
  age: number;
  height: string; // e.g. "6'2" (188 cm)"
  weight: string; // e.g. "185 lbs (84 kg)"
  category: 'Sub-15' | 'Sub-18' | 'Senior / Pro Prep' | 'Universitario';
  avatar: string;
  currentMetrics: BasketballMetrics;
  academyBenchmark: BasketballMetrics;
  evaluations: TestEvaluation[];
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'unpaid';
  planName: 'Elite Wolf Pack' | 'Varsity Development' | 'Basic Academy';
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'whatsapp';
  label: string;
  url: string;
  handle: string;
  color: string;
  badge?: string;
}
