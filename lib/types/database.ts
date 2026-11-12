/**
 * Database Schema Definitions and Type Mapping for Wild Wolves Academy OS
 * 
 * Tables covered:
 * - profiles
 * - daily_attendance
 * - payment_transactions_history
 * - detailed_test_records
 * - student_initial_baseline
 * - basketball_skills_logs
 * - physical_training_logs
 * - student_earned_badges
 * - prospect_athletes
 */

export type UserRole = 'student' | 'coach' | 'coach_pending' | 'superadmin' | 'admin' | 'director';
export type UserStatus = 'active' | 'pending' | 'rejected';
export type FinancialStatus = 'al_corriente' | 'adeudo' | 'becado' | 'convenio' | 'inactivo';
export type UserType = 'alumno' | 'prospecto' | 'invitado' | 'staff';
export type ShiftType = 'matutino_9_11' | 'vespertino_5_7';
export type AttendanceStatus = 'presente' | 'falta' | 'retardo' | 'justificado';
export type AthleticLevelAssessed = 'iniciacion_adaptacion' | 'formativo_desarrollo' | 'competitivo_elite';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'spei' | 'tarjeta' | 'condonacion' | 'stripe';
export type BadgeTier = 'bronce' | 'plata' | 'oro' | 'diamante' | 'elite';

export interface ProfileRow {
  id: string; // UUID primary key references auth.users(id)
  email: string;
  full_name?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  status: UserStatus;
  current_tier?: string | null;
  jersey_number?: number | null;
  number?: number | null;
  financial_status?: FinancialStatus | string | null;
  current_debt_amount?: number | null;
  default_class_cost?: number | null;
  scholarship_percentage?: number | null;
  is_provisional?: boolean | null;
  training_days?: string[] | string | null;
  training_schedule?: string | null;
  selected_days?: string[] | null;
  schedules_by_day?: Record<string, string> | null;
  account_category?: string | null;
  user_type?: UserType | string | null;
  category?: string | null;
  guardian_name?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  athletic_level?: AthleticLevelAssessed | null;
  created_at?: string;
  updated_at?: string;
}

export interface DailyAttendanceRow {
  id?: string;
  student_id: string; // UUID references profiles(id)
  date: string;       // YYYY-MM-DD
  shift: ShiftType | string;
  status: AttendanceStatus | string;
  notes?: string | null;
  created_at?: string;
}

export interface PaymentTransactionHistoryRow {
  id?: string;
  student_id: string; // UUID references profiles(id)
  amount_paid: number;
  previous_debt?: number;
  remaining_debt?: number;
  payment_method: PaymentMethod | string;
  transaction_type?: 'pago_completo' | 'abono' | 'perdon_adeudo' | string;
  concept?: string;
  transaction_date?: string; // YYYY-MM-DD
  notes?: string | null;
  venue?: string;
  created_at?: string;
}

export interface DetailedTestRecordRow {
  id?: string;
  student_id: string; // UUID references profiles(id)
  coach_id?: string | null;
  evaluation_date: string; // YYYY-MM-DD
  athletic_level_assessed: AthleticLevelAssessed;
  court_laps_count?: number;
  squats_count?: number;
  pushups_count?: number;
  plank_seconds?: number;
  jump_rope_count?: number;
  short_range_shots_made?: number;
  jogging_minutes?: number;
  stairs_jumps_count?: number;
  jump_rope_series_count?: number;
  mid_range_shots_made?: number;
  elite_jogging_minutes?: number;
  elite_plank_seconds?: number;
  elite_jump_rope_count?: number;
  plyometric_circuit_minutes?: number;
  three_point_shots_made?: number;
  half_court_shots_made?: number;
  overall_ovr: number;
  coach_feedback?: string | null;
  created_at?: string;
}

export interface StudentInitialBaselineRow {
  id?: string;
  student_id: string; // UUID references profiles(id) UNIQUE
  coach_id?: string | null;
  entry_date?: string; // YYYY-MM-DD
  initial_laps_completed?: number;
  initial_jump_rope_max?: number;
  initial_pushups_form?: string | null;
  initial_squats_count?: number;
  initial_posture_notes?: string | null;
  created_at?: string;
}

export interface BasketballSkillsLogRow {
  id?: string;
  student_id: string;
  coach_id?: string | null;
  test_date: string;
  is_shooting_active?: boolean;
  is_speed_lines_active?: boolean;
  is_flight_active?: boolean;
  shooting_base_attempts?: number;
  free_throws_made?: number;
  mid_range_made?: number;
  three_point_made?: number;
  half_court_made?: number;
  sprint_100m_seconds?: number | null;
  lines_one_way_seconds?: number | null;
  lines_round_trip_seconds?: number | null;
  defensive_touch_verified?: boolean;
  vertical_jump_cm?: number | null;
  broad_jump_cm?: number | null;
  board_rebound_drill_done?: boolean;
  spot_corner_left?: number;
  spot_wing_left?: number;
  spot_top_key?: number;
  spot_wing_right?: number;
  spot_corner_right?: number;
  spots_total_made?: number;
  coach_notes?: string | null;
  created_at?: string;
}

export interface PhysicalTrainingLogRow {
  id?: string;
  student_id: string;
  coach_id?: string | null;
  training_date: string;
  week_number?: number;
  month_number?: number;
  is_cardio_active?: boolean;
  is_strength_active?: boolean;
  is_isometric_active?: boolean;
  court_laps_done?: number;
  jogging_minutes?: number;
  jump_rope_count?: number;
  pushups_variation?: string;
  pushups_reps?: number;
  squats_3x25_done?: boolean;
  abs_3x25_done?: boolean;
  wall_sit_seconds?: number;
  plank_seconds?: number;
  lunges_laps?: number;
  has_ankle_weights?: boolean;
  created_at?: string;
}

export interface StudentEarnedBadgeRow {
  id?: string;
  student_id: string;
  badge_name?: string;
  badge_key?: string;
  badge_title?: string;
  badge_tier?: BadgeTier | string;
  badge_icon?: string;
  badge_description?: string;
  date_earned?: string;
  unlocked_at?: string;
  metadata?: Record<string, any>;
}

export interface ProspectAthleteRow {
  id?: string;
  full_name: string;
  category?: string;
  training_days?: string[] | string;
  training_schedule?: string;
  guardian_name?: string;
  parent_name?: string;
  parent_phone?: string;
  financial_status?: string;
  debt_amount?: number;
  notes?: string;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'email'>;
        Update: Partial<ProfileRow>;
      };
      daily_attendance: {
        Row: DailyAttendanceRow;
        Insert: DailyAttendanceRow;
        Update: Partial<DailyAttendanceRow>;
      };
      payment_transactions_history: {
        Row: PaymentTransactionHistoryRow;
        Insert: PaymentTransactionHistoryRow;
        Update: Partial<PaymentTransactionHistoryRow>;
      };
      detailed_test_records: {
        Row: DetailedTestRecordRow;
        Insert: DetailedTestRecordRow;
        Update: Partial<DetailedTestRecordRow>;
      };
      student_initial_baseline: {
        Row: StudentInitialBaselineRow;
        Insert: StudentInitialBaselineRow;
        Update: Partial<StudentInitialBaselineRow>;
      };
      basketball_skills_logs: {
        Row: BasketballSkillsLogRow;
        Insert: BasketballSkillsLogRow;
        Update: Partial<BasketballSkillsLogRow>;
      };
      physical_training_logs: {
        Row: PhysicalTrainingLogRow;
        Insert: PhysicalTrainingLogRow;
        Update: Partial<PhysicalTrainingLogRow>;
      };
      student_earned_badges: {
        Row: StudentEarnedBadgeRow;
        Insert: StudentEarnedBadgeRow;
        Update: Partial<StudentEarnedBadgeRow>;
      };
      prospect_athletes: {
        Row: ProspectAthleteRow;
        Insert: ProspectAthleteRow;
        Update: Partial<ProspectAthleteRow>;
      };
    };
  };
}
