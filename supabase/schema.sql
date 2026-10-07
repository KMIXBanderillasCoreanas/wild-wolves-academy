-- 1. TIPOS QUE FALTABAN
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('al_corriente', 'pendiente');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA DE PERFILES (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE ATLETAS (STUDENTS)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  parent_phone TEXT,
  gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  age INT NOT NULL CHECK (age BETWEEN 6 AND 40),
  position player_position NOT NULL DEFAULT 'Base',
  avatar_url TEXT,
  stripe_status TEXT NOT NULL DEFAULT 'active',
  allergies TEXT DEFAULT 'Ninguna conocida',
  blood_type TEXT DEFAULT 'O+',
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  medical_conditions TEXT DEFAULT 'Apto para actividad física de alto rendimiento',
  training_days TEXT[] DEFAULT ARRAY['Lunes', 'Miércoles', 'Viernes'],
  total_days_trained INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE FINANZAS ($50 PESOS / CLASE)
CREATE TABLE IF NOT EXISTS public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
  cost_per_class NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  frequency payment_frequency NOT NULL DEFAULT 'al_dia',
  status payment_status NOT NULL DEFAULT 'al_corriente',
  balance_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  last_payment_date DATE,
  last_payment_amount NUMERIC(10,2) DEFAULT 50.00,
  payment_method TEXT DEFAULT 'Efectivo',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE ASISTENCIA
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_name TEXT NOT NULL,
  present BOOLEAN NOT NULL DEFAULT true,
  topic TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, session_date)
);

-- 6. TABLA DE EVALUACIONES COMBINE & RADAR 360°
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  coach_name TEXT NOT NULL DEFAULT 'Coach Ricardo',
  coach_notes TEXT,
  score_free_throw INT NOT NULL CHECK (score_free_throw BETWEEN 0 AND 100),
  score_mid_range INT NOT NULL CHECK (score_mid_range BETWEEN 0 AND 100),
  score_three_point INT NOT NULL CHECK (score_three_point BETWEEN 0 AND 100),
  score_vertical_jump INT NOT NULL CHECK (score_vertical_jump BETWEEN 0 AND 100),
  score_sprint_100m INT NOT NULL CHECK (score_sprint_100m BETWEEN 0 AND 100),
  score_agility_t_test INT NOT NULL CHECK (score_agility_t_test BETWEEN 0 AND 100),
  raw_free_throw_made INT NOT NULL CHECK (raw_free_throw_made BETWEEN 0 AND 20),
  raw_free_throw_total INT NOT NULL DEFAULT 20,
  raw_mid_range_pct INT NOT NULL CHECK (raw_mid_range_pct BETWEEN 0 AND 100),
  raw_three_point_pct INT NOT NULL CHECK (raw_three_point_pct BETWEEN 0 AND 100),
  raw_vertical_jump_cm INT NOT NULL CHECK (raw_vertical_jump_cm BETWEEN 20 AND 130),
  raw_sprint_100m_seconds NUMERIC(4,2) NOT NULL,
  raw_agility_t_test_seconds NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE SOBRECARGA PROGRESIVA (CUERDA Y TROTE)
CREATE TABLE IF NOT EXISTS public.training_overload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
  rope_jumps_today INT NOT NULL DEFAULT 100,
  rope_target INT NOT NULL DEFAULT 1000,
  jogging_minutes_today INT NOT NULL DEFAULT 10,
  jogging_target INT NOT NULL DEFAULT 60,
  schedule_json JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SEGURIDAD: ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_overload ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'coach'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "students_all" ON public.students;
CREATE POLICY "students_all" ON public.students FOR ALL USING (true);

DROP POLICY IF EXISTS "finances_all" ON public.finances;
CREATE POLICY "finances_all" ON public.finances FOR ALL USING (true);

DROP POLICY IF EXISTS "attendance_all" ON public.attendance;
CREATE POLICY "attendance_all" ON public.attendance FOR ALL USING (true);

DROP POLICY IF EXISTS "evaluations_all" ON public.evaluations;
CREATE POLICY "evaluations_all" ON public.evaluations FOR ALL USING (true);

DROP POLICY IF EXISTS "training_overload_all" ON public.training_overload;
CREATE POLICY "training_overload_all" ON public.training_overload FOR ALL USING (true);

-- 9. ALUMNOS INICIALES (3 ATLETAS CON CUOTA DE $50 MXN)
INSERT INTO public.students (
  id, full_name, email, phone, parent_phone, gender, age, position, 
  allergies, blood_type, emergency_contact, emergency_phone, total_days_trained
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Lucas Morales', 'lucas.morales@wildwolves.academy', '55 1234 5678', '55 9876 5432', 'M', 16, 'Base', 'Ninguna', 'O+', 'Elena Morales (Madre)', '55 9876 5432', 24),
  ('22222222-2222-2222-2222-222222222222', 'Samantha Reyes', 'samantha.reyes@wildwolves.academy', '55 2345 6789', '55 8765 4321', 'F', 17, 'Alero', 'Penicilina', 'A+', 'Roberto Reyes (Padre)', '55 8765 4321', 19),
  ('33333333-3333-3333-3333-333333333333', 'Mateo Guerrero', 'mateo.guerrero@wildwolves.academy', '55 3456 7890', '55 7654 3210', 'M', 15, 'Pívot', 'Asma leve', 'B+', 'Claudia Guerrero (Madre)', '55 7654 3210', 31)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.finances (student_id, cost_per_class, frequency, status, balance_due, last_payment_amount) VALUES
  ('11111111-1111-1111-1111-111111111111', 50.00, 'al_dia', 'al_corriente', 0.00, 50.00),
  ('22222222-2222-2222-2222-222222222222', 50.00, 'semanal', 'pendiente', 150.00, 150.00),
  ('33333333-3333-3333-3333-333333333333', 50.00, 'mensual', 'al_corriente', 0.00, 600.00)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.training_overload (student_id, rope_jumps_today, rope_target, jogging_minutes_today, jogging_target) VALUES
  ('11111111-1111-1111-1111-111111111111', 450, 1000, 25, 60),
  ('22222222-2222-2222-2222-222222222222', 320, 800, 20, 45),
  ('33333333-3333-3333-3333-333333333333', 850, 1200, 40, 60)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO public.evaluations (
  student_id, evaluation_date, coach_name, coach_notes,
  score_free_throw, score_mid_range, score_three_point, score_vertical_jump, score_sprint_100m, score_agility_t_test,
  raw_free_throw_made, raw_mid_range_pct, raw_three_point_pct, raw_vertical_jump_cm, raw_sprint_100m_seconds, raw_agility_t_test_seconds
) VALUES
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'Coach Ricardo', 'Excelente toma de decisiones.', 85, 78, 88, 75, 82, 80, 17, 78, 88, 68, 12.80, 9.40),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'Coach Ricardo', 'Gran verticalidad.', 72, 85, 68, 88, 78, 82, 14, 85, 68, 74, 13.20, 9.60),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'Coach Ricardo', 'Fuerza física dominante.', 65, 70, 55, 92, 70, 75, 13, 70, 55, 78, 14.10, 10.20)
ON CONFLICT DO NOTHING;
