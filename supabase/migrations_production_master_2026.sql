-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS • MIGRACIÓN MAESTRA DE PRODUCCIÓN
-- Sede: Deportivo Carmen Serdán | Head Coach: Ricardo
-- FASE 1: NÚCLEO SUPABASE & BLINDAJE DE BASE DE DATOS
-- ==============================================================================

-- 1. CONSOLIDACIÓN DE TABLAS LEGACY HACIA detailed_test_records
-- Migrar cualquier registro huérfano de 'evaluations' si existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'evaluations') THEN
    INSERT INTO public.detailed_test_records (
      student_id,
      evaluation_date,
      overall_ovr,
      shooting_percentage,
      vertical_jump_cm,
      coach_feedback,
      created_at
    )
    SELECT
      e.student_id,
      COALESCE(e.created_at::date, CURRENT_DATE),
      COALESCE(e.overall_score, 70),
      COALESCE(e.shooting_percentage, 50),
      COALESCE(e.vertical_jump_cm, 45),
      COALESCE(e.notes, 'Evaluación histórica migrada de base de datos legacy'),
      COALESCE(e.created_at, NOW())
    FROM public.evaluations e
    WHERE e.student_id IS NOT NULL
    ON CONFLICT (student_id, evaluation_date) DO NOTHING;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_evaluations') THEN
    INSERT INTO public.detailed_test_records (
      student_id,
      evaluation_date,
      overall_ovr,
      shooting_percentage,
      coach_feedback,
      created_at
    )
    SELECT
      se.student_id,
      COALESCE(se.evaluation_date::date, CURRENT_DATE),
      COALESCE(se.ovr, 70),
      COALESCE(se.shooting_pct, 50),
      COALESCE(se.feedback, 'Evaluación histórica migrada de student_evaluations'),
      COALESCE(se.created_at, NOW())
    FROM public.student_evaluations se
    WHERE se.student_id IS NOT NULL
    ON CONFLICT (student_id, evaluation_date) DO NOTHING;
  END IF;
END $$;

-- 2. FUNCIÓN PL/pgSQL: EVALUACIÓN AUTOMÁTICA DE NIVEL (current_tier) Y DESBLOQUEO DE MEDALLAS
CREATE OR REPLACE FUNCTION public.fn_evaluate_athlete_tier_and_badges()
RETURNS TRIGGER AS $$
DECLARE
  v_free_throws INT;
  v_mid_range INT;
  v_three_point INT;
  v_vertical_cm NUMERIC;
  v_jump_rope INT;
  v_sprint_100m NUMERIC;
  v_current_tier TEXT;
  v_new_tier TEXT;
BEGIN
  -- Extraer métricas insertadas o actualizadas
  v_free_throws := COALESCE(NEW.free_throws_made, 0);
  v_mid_range := COALESCE(NEW.mid_range_made, 0);
  v_three_point := COALESCE(NEW.three_point_made, 0);
  v_vertical_cm := COALESCE(NEW.vertical_jump_cm, 0);
  v_jump_rope := COALESCE(NEW.jump_rope_count, 0);
  v_sprint_100m := COALESCE(NEW.sprint_100m_seconds, 99.0);

  -- Obtener el tier actual del atleta en profiles
  SELECT current_tier INTO v_current_tier
  FROM public.profiles
  WHERE id = NEW.student_id;

  v_new_tier := COALESCE(v_current_tier, 'principiante');

  -- REGLAS INNEGOCIABLES DE ASCENSO POR DESEMPEÑO EN DUELA:
  -- Criterio Nivel 3 (Competitivo / Élite):
  -- Tiros Libres >= 8/10, Triples >= 14/25, Cuerda >= 300 saltos, Salto >= 60cm, Sprint <= 13.5s
  IF (v_free_throws >= 8 AND v_three_point >= 14 AND v_jump_rope >= 300 AND v_vertical_cm >= 60 AND v_sprint_100m <= 13.5) THEN
    v_new_tier := 'competitivo_elite';
  -- Criterio Nivel 2 (Formativo / Desarrollo):
  -- Tiros Libres >= 5/10, Media Distancia >= 10/20, Cuerda >= 100 saltos, Sprint <= 15.0s
  ELSIF (v_free_throws >= 5 AND v_mid_range >= 10 AND v_jump_rope >= 100 AND v_sprint_100m <= 15.0) THEN
    -- No degradar si ya era élite
    IF v_new_tier <> 'competitivo_elite' THEN
      v_new_tier := 'formativo_desarrollo';
    END IF;
  ELSE
    -- Se mantiene en iniciacion_adaptacion si no cumple mínimos
    IF v_new_tier NOT IN ('competitivo_elite', 'formativo_desarrollo') THEN
      v_new_tier := 'iniciacion_adaptacion';
    END IF;
  END IF;

  -- Actualizar profiles si hay cambio de tier
  UPDATE public.profiles
  SET current_tier = v_new_tier,
      updated_at = NOW()
  WHERE id = NEW.student_id;

  -- 3. ASIGNACIÓN AUTOMÁTICA DE MEDALLAS EN student_earned_badges
  -- Medalla Francotirador Dorado (3PT >= 16 o >= 65%)
  IF (v_three_point >= 16) THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_tier, date_earned)
    VALUES (NEW.student_id, 'Francotirador de Élite (65% 3PT)', 'oro', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Medalla Racha Implacable de Tiros Libres (10/10)
  IF (v_free_throws >= 10) THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_tier, date_earned)
    VALUES (NEW.student_id, 'Racha Implacable (10/10 Tiros Libres)', 'plata', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Medalla Salto Vertical Resorte (Salto >= 70cm)
  IF (v_vertical_cm >= 70) THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_tier, date_earned)
    VALUES (NEW.student_id, 'Despegue Aéreo (Salto Vertical +70cm)', 'oro', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Medalla Cuerda de Acero (Saltos >= 500)
  IF (v_jump_rope >= 500) THEN
    INSERT INTO public.student_earned_badges (student_id, badge_name, badge_tier, date_earned)
    VALUES (NEW.student_id, 'Cuerda de Acero (500+ Saltos)', 'diamante', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador en detailed_test_records
DROP TRIGGER IF EXISTS trg_evaluate_athlete_tier ON public.detailed_test_records;
CREATE TRIGGER trg_evaluate_athlete_tier
AFTER INSERT OR UPDATE ON public.detailed_test_records
FOR EACH ROW
EXECUTE FUNCTION public.fn_evaluate_athlete_tier_and_badges();

-- 4. TRIGGER FINANCIERO: ACTUALIZACIÓN AUTOMÁTICA DE ADEUDO TRAS PAGO
CREATE OR REPLACE FUNCTION public.fn_sync_debt_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_current_debt NUMERIC;
  v_new_debt NUMERIC;
BEGIN
  SELECT COALESCE(current_debt_amount, 0) INTO v_current_debt
  FROM public.profiles
  WHERE id = NEW.student_id;

  v_new_debt := GREATEST(0, v_current_debt - COALESCE(NEW.amount_paid, 0));

  UPDATE public.profiles
  SET current_debt_amount = v_new_debt,
      financial_status = CASE WHEN v_new_debt = 0 THEN 'al_corriente' ELSE 'adeudo' END,
      updated_at = NOW()
  WHERE id = NEW.student_id;

  -- Actualizar el campo remaining_debt en la misma fila de transacción
  NEW.remaining_debt := v_new_debt;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_debt_on_payment ON public.payment_transactions_history;
CREATE TRIGGER trg_sync_debt_on_payment
BEFORE INSERT ON public.payment_transactions_history
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_debt_on_payment();

-- 5. BLINDAJE DE POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_earned_badges ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  auth.uid() = id 
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('coach', 'superadmin')
  OR (SELECT student_id FROM public.profiles WHERE id = auth.uid()) = id
);

DROP POLICY IF EXISTS "profiles_update_superadmin_coach" ON public.profiles;
CREATE POLICY "profiles_update_superadmin_coach" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('coach', 'superadmin')
);

-- POLÍTICAS: detailed_test_records
DROP POLICY IF EXISTS "test_records_select_isolation" ON public.detailed_test_records;
CREATE POLICY "test_records_select_isolation" ON public.detailed_test_records
FOR SELECT USING (
  student_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('coach', 'superadmin')
  OR student_id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "test_records_insert_coach" ON public.detailed_test_records;
CREATE POLICY "test_records_insert_coach" ON public.detailed_test_records
FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('coach', 'superadmin')
  OR auth.uid() IS NULL -- Permite inserciones autenticadas por service-role API
);

-- POLÍTICAS: payment_transactions_history
DROP POLICY IF EXISTS "payments_select_isolation" ON public.payment_transactions_history;
CREATE POLICY "payments_select_isolation" ON public.payment_transactions_history
FOR SELECT USING (
  student_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('coach', 'superadmin')
  OR student_id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "payments_insert_coach" ON public.payment_transactions_history;
CREATE POLICY "payments_insert_coach" ON public.payment_transactions_history
FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('coach', 'superadmin')
  OR auth.uid() IS NULL
);

-- Fin de migración maestra de producción
