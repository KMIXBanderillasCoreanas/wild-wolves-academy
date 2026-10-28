-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN MAESTRA DE PRODUCCIÓN
-- Módulo: Triggers Automáticos de Ascenso de Tier, Concesión de Insignias y RLS
-- Sede: Deportivo Carmen Serdán, CDMX • Head Coach Ricardo
-- ==============================================================================

-- 1. HABILITAR EXTENSIÓN CRIPTOGRÁFICA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. FUNCIÓN Y TRIGGER PL/PGSQL: ASCENSO AUTOMÁTICO DE TIER & DESBLOQUEO DE INSIGNIAS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_evaluate_student_tier_and_badges()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_id UUID;
  v_free_throws INT;
  v_mid_range INT;
  v_triples INT;
  v_rope INT;
  v_overall_ovr INT;
  v_calculated_tier TEXT;
  v_total_shots_made INT;
BEGIN
  v_student_id := NEW.student_id;
  
  -- Consolidar métricas tolerantes a nombres de columnas
  v_free_throws := COALESCE(NEW.short_range_shots_made, NEW.free_throws_made, 0);
  v_mid_range := COALESCE(NEW.mid_range_shots_made, NEW.mid_range_made, 0);
  v_triples := COALESCE(NEW.three_point_shots_made, NEW.three_point_made, 0);
  v_rope := COALESCE(NEW.jump_rope_count, 0);
  v_overall_ovr := COALESCE(NEW.overall_ovr, 70);
  v_total_shots_made := v_free_throws + v_mid_range + v_triples;

  -- Reglas oficiales del escalafón Wild Wolves
  IF v_overall_ovr >= 85 OR (v_free_throws >= 9 AND v_triples >= 15 AND v_rope >= 500) THEN
    v_calculated_tier := 'competitivo_elite';
  ELSIF v_overall_ovr >= 75 OR (v_free_throws >= 7 AND v_triples >= 10 AND v_rope >= 250) THEN
    v_calculated_tier := 'avanzado';
  ELSIF v_overall_ovr >= 65 OR (v_free_throws >= 5 AND v_rope >= 100) THEN
    v_calculated_tier := 'intermedio';
  ELSE
    v_calculated_tier := 'basico';
  END IF;

  -- 1. Actualizar el perfil del alumno con su nuevo Tier oficial
  UPDATE public.profiles
  SET 
    current_tier = v_calculated_tier,
    updated_at = NOW()
  WHERE id = v_student_id;

  -- 2. Desbloqueo automático de medallas oficiales en student_earned_badges
  
  -- Medalla: Francotirador de Línea Libre (≥ 9/10 Libres)
  IF v_free_throws >= 9 THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_icon, badge_description, earned_date)
    VALUES (
      v_student_id, 
      'Francotirador de Línea Libre', 
      'target', 
      'Efectividad superior al 90% en la línea de tiros libres oficial.', 
      CURRENT_DATE
    )
    ON CONFLICT (student_id, badge_name) DO NOTHING;
  END IF;

  -- Medalla: Amenaza Perimetral (≥ 15/25 Triples)
  IF v_triples >= 15 THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_icon, badge_description, earned_date)
    VALUES (
      v_student_id, 
      'Amenaza Perimetral 5 Spots', 
      'flame', 
      'Dominio en los 5 spots reglamentarios detrás de la línea de tres.', 
      CURRENT_DATE
    )
    ON CONFLICT (student_id, badge_name) DO NOTHING;
  END IF;

  -- Medalla: Cardio de Acero (≥ 500 saltos de cuerda continuos)
  IF v_rope >= 500 THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_icon, badge_description, earned_date)
    VALUES (
      v_student_id, 
      'Motor Alfa Cardio de Acero', 
      'zap', 
      'Capacidad cardiovascular superior con más de 500 saltos de cuerda.', 
      CURRENT_DATE
    )
    ON CONFLICT (student_id, badge_name) DO NOTHING;
  END IF;

  -- Medalla: Lobo Alfa Élite (+85 OVR general)
  IF v_overall_ovr >= 85 THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_icon, badge_description, earned_date)
    VALUES (
      v_student_id, 
      'Insignia de Lobo Alfa', 
      'crown', 
      'Rendimiento físico y táctico en el escalafón más alto de la Academia.', 
      CURRENT_DATE
    )
    ON CONFLICT (student_id, badge_name) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Desasociar trigger si existe y reactivarlo
DROP TRIGGER IF EXISTS trg_evaluate_student_tier ON public.detailed_test_records;

CREATE TRIGGER trg_evaluate_student_tier
AFTER INSERT OR UPDATE ON public.detailed_test_records
FOR EACH ROW
EXECUTE FUNCTION public.fn_evaluate_student_tier_and_badges();

-- ==============================================================================
-- 3. POLÍTICAS ROW LEVEL SECURITY (RLS) ESTRICTAS
-- ==============================================================================

-- A) Tabla: PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Lectura: 
-- SuperAdmin/Coach lee todo.
-- Estudiante lee su propio perfil.
-- Tutor lee su propio perfil y el del alumno vinculado por nombre o email.
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
  auth.role() = 'service_role' OR
  auth.uid() = id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach') OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'guardian' AND
    (
      full_name = (SELECT linked_student_name FROM public.profiles WHERE id = auth.uid()) OR
      id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
    )
  )
);

-- Actualización: SuperAdmin y Coach pueden actualizar, usuario propio actualiza sus datos
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
  auth.role() = 'service_role' OR
  auth.uid() = id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach')
);

-- Inserción: Registro propio o creación por coaches
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role' OR
  auth.uid() = id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach')
);

-- B) Tabla: DETAILED_TEST_RECORDS
ALTER TABLE public.detailed_test_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dtr_select_policy" ON public.detailed_test_records;
DROP POLICY IF EXISTS "dtr_write_policy" ON public.detailed_test_records;

CREATE POLICY "dtr_select_policy" ON public.detailed_test_records
FOR SELECT
USING (
  auth.role() = 'service_role' OR
  student_id = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach') OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'guardian' AND
    student_id IN (
      SELECT id FROM public.profiles 
      WHERE full_name = (SELECT linked_student_name FROM public.profiles WHERE id = auth.uid())
         OR id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
    )
  )
);

CREATE POLICY "dtr_write_policy" ON public.detailed_test_records
FOR ALL
USING (
  auth.role() = 'service_role' OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach')
);

-- C) Tabla: PAYMENT_TRANSACTIONS_HISTORY
CREATE TABLE IF NOT EXISTS public.payment_transactions_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'efectivo_cancha',
  concept TEXT DEFAULT 'Cuota por Clase $50 MXN',
  transaction_date DATE DEFAULT CURRENT_DATE,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_transactions_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pay_history_select_policy" ON public.payment_transactions_history;
DROP POLICY IF EXISTS "pay_history_write_policy" ON public.payment_transactions_history;

CREATE POLICY "pay_history_select_policy" ON public.payment_transactions_history
FOR SELECT
USING (
  auth.role() = 'service_role' OR
  student_id = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach') OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'guardian' AND
    student_id IN (
      SELECT id FROM public.profiles 
      WHERE full_name = (SELECT linked_student_name FROM public.profiles WHERE id = auth.uid())
         OR id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
    )
  )
);

CREATE POLICY "pay_history_write_policy" ON public.payment_transactions_history
FOR ALL
USING (
  auth.role() = 'service_role' OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach')
);
