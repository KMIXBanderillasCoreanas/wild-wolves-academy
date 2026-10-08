-- ==============================================================================
-- WILD WOLVES CDMX - SISTEMA DUAL DE EVALUACIÓN Y LÍNEA BASE (DÍA 1)
-- TABLAS: student_initial_baseline, physical_training_logs, basketball_skills_logs
-- ==============================================================================

-- 1. TABLA DE EVALUACIÓN INICIAL (DÍA 1 / BASELINE)
CREATE TABLE IF NOT EXISTS public.student_initial_baseline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  coach_id UUID REFERENCES public.profiles(id),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  initial_laps_completed INT DEFAULT 0, -- Vueltas que aguantó el primer día
  initial_jump_rope_max INT DEFAULT 0,  -- Saltos continuos logrados
  initial_pushups_form TEXT DEFAULT 'hincado',
  initial_squats_count INT DEFAULT 0,
  initial_posture_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE ENTRENAMIENTO FÍSICO MODULAR (CON HISTORIAL SEMANAL/MENSUAL)
CREATE TABLE IF NOT EXISTS public.physical_training_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.profiles(id),
  training_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INT NOT NULL DEFAULT EXTRACT(WEEK FROM CURRENT_DATE),
  month_number INT NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),

  -- Toggles de activación del Coach para este día
  is_cardio_active BOOLEAN DEFAULT TRUE,
  is_strength_active BOOLEAN DEFAULT TRUE,
  is_isometric_active BOOLEAN DEFAULT FALSE,

  -- Datos de Físico
  court_laps_done INT DEFAULT 0,
  jogging_minutes NUMERIC(5,2) DEFAULT 0,
  jump_rope_count INT DEFAULT 0,
  pushups_variation TEXT,
  pushups_reps INT DEFAULT 0,
  squats_3x25_done BOOLEAN DEFAULT FALSE,
  abs_3x25_done BOOLEAN DEFAULT FALSE,
  wall_sit_seconds INT DEFAULT 0,
  plank_seconds INT DEFAULT 0,
  lunges_laps INT DEFAULT 0,
  has_ankle_weights BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE PRUEBAS DEPORTIVAS DE BALONCESTO (SEPARADA)
CREATE TABLE IF NOT EXISTS public.basketball_skills_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.profiles(id),
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Toggles de activación
  is_shooting_active BOOLEAN DEFAULT TRUE,
  is_speed_lines_active BOOLEAN DEFAULT TRUE,
  is_flight_active BOOLEAN DEFAULT TRUE,

  -- Batería de Tiro
  shooting_base_attempts INT DEFAULT 5 CHECK (shooting_base_attempts IN (5, 10)),
  free_throws_made INT DEFAULT 0,
  mid_range_made INT DEFAULT 0,
  three_point_made INT DEFAULT 0,
  half_court_made INT DEFAULT 0,

  -- Velocidad y Líneas
  sprint_100m_seconds NUMERIC(5,2),
  lines_one_way_seconds NUMERIC(5,2),
  lines_round_trip_seconds NUMERIC(5,2),
  defensive_touch_verified BOOLEAN DEFAULT TRUE,

  -- Salto y Vuelo
  vertical_jump_cm NUMERIC(5,2),
  broad_jump_cm NUMERIC(5,2),
  board_rebound_drill_done BOOLEAN DEFAULT FALSE,

  coach_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.student_initial_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basketball_skills_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona todo" ON public.student_initial_baseline;
CREATE POLICY "Staff gestiona todo" ON public.student_initial_baseline FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin')));

DROP POLICY IF EXISTS "Staff gestiona fisico" ON public.physical_training_logs;
CREATE POLICY "Staff gestiona fisico" ON public.physical_training_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin')));

DROP POLICY IF EXISTS "Staff gestiona basket" ON public.basketball_skills_logs;
CREATE POLICY "Staff gestiona basket" ON public.basketball_skills_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin')));

DROP POLICY IF EXISTS "Alumno ve su linea base" ON public.student_initial_baseline;
CREATE POLICY "Alumno ve su linea base" ON public.student_initial_baseline FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Alumno ve sus logs fisicos" ON public.physical_training_logs;
CREATE POLICY "Alumno ve sus logs fisicos" ON public.physical_training_logs FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Alumno ve sus logs basket" ON public.basketball_skills_logs;
CREATE POLICY "Alumno ve sus logs basket" ON public.basketball_skills_logs FOR SELECT USING (auth.uid() = student_id);
