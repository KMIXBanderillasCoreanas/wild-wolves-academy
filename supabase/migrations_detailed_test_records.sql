-- ==============================================================================
-- WILD WOLVES CDMX - MIGRACIÓN OFICIAL: TEST DAY DINÁMICO POR NIVEL
-- TABLA: detailed_test_records Y CAMPO athletic_level EN PROFILES
-- ==============================================================================
-- Copia y pega este bloque COMPLETO en tu SQL Editor de Supabase y presiona "RUN"

-- 1. AGREGAR NIVEL DE DESARROLLO MOTOR EN PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS athletic_level TEXT DEFAULT 'iniciacion_adaptacion';

-- Garantizar constraint de niveles permitidos si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_athletic_level_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_athletic_level_check 
    CHECK (athletic_level IN ('iniciacion_adaptacion', 'formativo_desarrollo', 'competitivo_elite'));
  END IF;
END $$;

-- 2. CREAR TABLA DE EVALUACIONES DETALLADAS (detailed_test_records)
CREATE TABLE IF NOT EXISTS public.detailed_test_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  athletic_level_assessed TEXT NOT NULL DEFAULT 'iniciacion_adaptacion' 
    CHECK (athletic_level_assessed IN ('iniciacion_adaptacion', 'formativo_desarrollo', 'competitivo_elite')),

  -- MÉTRICAS NIVEL 1: INICIACIÓN & ADAPTACIÓN MOTRIZ
  court_laps_count INT DEFAULT 0,                 -- Vueltas a la cancha continuas (2 a 20)
  squats_count INT DEFAULT 0,                     -- Sentadillas al aire (postura neutral)
  pushups_count INT DEFAULT 0,                    -- Flexiones en suelo o inclinadas
  plank_seconds INT DEFAULT 0,                    -- Plancha estática (15 a 60 seg)
  jump_rope_count INT DEFAULT 0,                  -- Salto de cuerda suave (20 a 50 saltos)
  short_range_shots_made INT DEFAULT 0,           -- Aciertos en tiros cortos (base 5)

  -- MÉTRICAS NIVEL 2: FORMATIVO & DESARROLLO FÍSICO
  jogging_minutes INT DEFAULT 0,                  -- Trote continuo (10 a 30 min)
  stairs_jumps_count INT DEFAULT 0,               -- Saltos en escaleras altas (5 a 10)
  jump_rope_series_count INT DEFAULT 0,           -- Protocolo cuerda (100 a 400 saltos)
  mid_range_shots_made INT DEFAULT 0,             -- Tiro libre y suspensión (5 a 10)

  -- MÉTRICAS NIVEL 3: COMPETITIVO / ÉLITE
  elite_jogging_minutes INT DEFAULT 0,            -- Trote continuo máximo (0 a 60 min)
  elite_plank_seconds INT DEFAULT 0,              -- Plancha isométrica pro (0 a 300 seg)
  elite_jump_rope_count INT DEFAULT 0,            -- Cuerda alto volumen (hasta 1,000)
  plyometric_circuit_minutes INT DEFAULT 0,       -- Circuito pliométrico (0 a 5 min)
  three_point_shots_made INT DEFAULT 0,           -- Triples perimetrales
  half_court_shots_made INT DEFAULT 0,            -- Tiros de media cancha

  -- RESUMEN GLOBAL & OVERALL RATING (OVR)
  overall_ovr INT NOT NULL DEFAULT 70,
  coach_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT unique_student_test_record_date UNIQUE(student_id, evaluation_date)
);

-- Si la tabla ya existía previamente con menos columnas, asegurar que todas existan:
ALTER TABLE public.detailed_test_records
ADD COLUMN IF NOT EXISTS court_laps_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS athletic_level_assessed TEXT DEFAULT 'iniciacion_adaptacion',
ADD COLUMN IF NOT EXISTS squats_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pushups_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS plank_seconds INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS jump_rope_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS short_range_shots_made INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS jogging_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS stairs_jumps_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS jump_rope_series_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS mid_range_shots_made INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS elite_jogging_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS elite_plank_seconds INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS elite_jump_rope_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS plyometric_circuit_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS three_point_shots_made INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS half_court_shots_made INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_ovr INT DEFAULT 70,
ADD COLUMN IF NOT EXISTS coach_feedback TEXT;

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.detailed_test_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura y registro de detailed_test_records" ON public.detailed_test_records;
CREATE POLICY "Lectura y registro de detailed_test_records"
ON public.detailed_test_records FOR ALL
USING (true)
WITH CHECK (true);

-- 4. ÍNDICES DE RENDIMIENTO PARA CONSULTAS RÁPIDAS EN CANCHA
CREATE INDEX IF NOT EXISTS idx_detailed_test_records_student 
ON public.detailed_test_records(student_id);

CREATE INDEX IF NOT EXISTS idx_detailed_test_records_date 
ON public.detailed_test_records(evaluation_date DESC);
