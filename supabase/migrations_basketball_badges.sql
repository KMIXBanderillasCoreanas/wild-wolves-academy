-- ==============================================================================
-- WILD WOLVES CDMX - EXPENSIÓN DE PRUEBAS DE BALONCESTO & MEDALLERO OFICIAL
-- Agrega soporte para el circuito de 25 tiros (5 spots), habilidades especiales
-- y la tabla de medallas ganadas (student_earned_badges).
-- ==============================================================================

-- 1. AGREGAR COLUMNAS EN basketball_skills_logs (SI NO EXISTEN)
ALTER TABLE public.basketball_skills_logs
  ADD COLUMN IF NOT EXISTS spot_corner_left INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spot_wing_left INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spot_top_key INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spot_wing_right INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spot_corner_right INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spots_total_made INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mechanics_suspension_height INT DEFAULT 7,
  ADD COLUMN IF NOT EXISTS mechanics_arc_parabola INT DEFAULT 8,
  ADD COLUMN IF NOT EXISTS mechanics_follow_through INT DEFAULT 8,
  ADD COLUMN IF NOT EXISTS mechanics_overall_score NUMERIC(4,2) DEFAULT 7.5,
  ADD COLUMN IF NOT EXISTS ankle_breaker_done BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS behind_back_done BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mid_air_switch_done BOOLEAN DEFAULT FALSE;

-- 2. TABLA DE MEDALLAS OFICIALES (student_earned_badges)
CREATE TABLE IF NOT EXISTS public.student_earned_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL, 
  -- Claves: 'francotirador_alfa', 'crossover_mortal', 'gravedad_cero', 'pilar_inamovible', 'lobo_de_hierro'
  badge_title TEXT NOT NULL,
  badge_icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(student_id, badge_key)
);

-- RLS PARA student_earned_badges
ALTER TABLE public.student_earned_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos ven medallas" ON public.student_earned_badges;
CREATE POLICY "Todos ven medallas" ON public.student_earned_badges 
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Staff inserta o actualiza medallas" ON public.student_earned_badges;
CREATE POLICY "Staff inserta o actualiza medallas" ON public.student_earned_badges 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
    )
  );
