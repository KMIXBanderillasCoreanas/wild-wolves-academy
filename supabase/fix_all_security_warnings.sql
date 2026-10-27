-- ==============================================================================
-- WILD WOLVES CDMX - LIMPIEZA COMPLETA DE WARNINGS (SECURITY ADVISOR)
-- Resuelve:
-- 1. function_search_path_mutable (Fijar SET search_path = public)
-- 2. anon_security_definer_function_executable & authenticated_...
--    (Revocar EXECUTE de anon/authenticated para funciones internas/triggers)
-- 3. rls_policy_always_true (Reemplazar USING(true) WITH CHECK(true) en tablas viejas)
-- 4. public_bucket_allows_listing (Restringir el listado anónimo en workout-proofs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIJAR SEARCH_PATH EN TODAS LAS FUNCIONES Y RESTRINGIR PERMISOS DE EJECUCIÓN
-- ------------------------------------------------------------------------------

-- Función: is_coach()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_coach') THEN
    ALTER FUNCTION public.is_coach() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.is_coach() FROM anon;
  END IF;
END $$;

-- Función: is_superadmin()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_superadmin') THEN
    ALTER FUNCTION public.is_superadmin() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM anon;
  END IF;
END $$;

-- Función: handle_superadmin_auto_grant()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_superadmin_auto_grant') THEN
    ALTER FUNCTION public.handle_superadmin_auto_grant() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.handle_superadmin_auto_grant() FROM anon, authenticated;
  END IF;
END $$;

-- Función: check_and_promote_tier()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_and_promote_tier') THEN
    ALTER FUNCTION public.check_and_promote_tier() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.check_and_promote_tier() FROM anon, authenticated;
  END IF;
END $$;

-- Función: check_and_grant_badges()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_and_grant_badges') THEN
    ALTER FUNCTION public.check_and_grant_badges() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.check_and_grant_badges() FROM anon, authenticated;
  END IF;
END $$;

-- Función: apply_auto_tier_on_baseline()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'apply_auto_tier_on_baseline') THEN
    ALTER FUNCTION public.apply_auto_tier_on_baseline() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.apply_auto_tier_on_baseline() FROM anon, authenticated;
  END IF;
END $$;

-- Función: auto_classify_athlete_tier(...)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_classify_athlete_tier') THEN
    ALTER FUNCTION public.auto_classify_athlete_tier(integer, integer, integer, text, integer, integer) SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.auto_classify_athlete_tier(integer, integer, integer, text, integer, integer) FROM anon;
  END IF;
END $$;

-- Función: calculate_student_pending_debt(uuid)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_student_pending_debt') THEN
    ALTER FUNCTION public.calculate_student_pending_debt(uuid) SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.calculate_student_pending_debt(uuid) FROM anon;
  END IF;
END $$;

-- Función: handle_new_user()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2. CORREGIR POLÍTICAS DEMASIADO PERMISIVAS (rls_policy_always_true)
-- ------------------------------------------------------------------------------

-- TABLA: public.detailed_test_records
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'detailed_test_records') THEN
    DROP POLICY IF EXISTS "Lectura y registro de detailed_test_records" ON public.detailed_test_records;
    DROP POLICY IF EXISTS "detailed_test_records_coach" ON public.detailed_test_records;
    DROP POLICY IF EXISTS "detailed_test_records_student_select" ON public.detailed_test_records;

    CREATE POLICY "detailed_test_records_coach"
    ON public.detailed_test_records FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    );

    CREATE POLICY "detailed_test_records_student_select"
    ON public.detailed_test_records FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());
  END IF;
END $$;

-- TABLA: public.prospect_athletes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prospect_athletes') THEN
    DROP POLICY IF EXISTS "Staff gestiona prospectos" ON public.prospect_athletes;

    CREATE POLICY "prospect_athletes_coach_manage"
    ON public.prospect_athletes FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    );
  END IF;
END $$;

-- TABLA: public.attendance (si existe legacy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'attendance') THEN
    DROP POLICY IF EXISTS "attendance_all" ON public.attendance;

    CREATE POLICY "attendance_coach_manage"
    ON public.attendance FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    );
  END IF;
END $$;

-- TABLA: public.evaluations (si existe legacy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'evaluations') THEN
    DROP POLICY IF EXISTS "evaluations_all" ON public.evaluations;

    CREATE POLICY "evaluations_coach_manage"
    ON public.evaluations FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    );
  END IF;
END $$;

-- TABLA: public.finances (si existe legacy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'finances') THEN
    DROP POLICY IF EXISTS "finances_all" ON public.finances;

    CREATE POLICY "finances_coach_manage"
    ON public.finances FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    );
  END IF;
END $$;

-- TABLA: public.students (si existe legacy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
    DROP POLICY IF EXISTS "students_all" ON public.students;

    CREATE POLICY "students_coach_manage"
    ON public.students FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    );
  END IF;
END $$;

-- TABLA: public.training_overload (si existe legacy)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'training_overload') THEN
    DROP POLICY IF EXISTS "training_overload_all" ON public.training_overload;

    CREATE POLICY "training_overload_coach_manage"
    ON public.training_overload FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
    );
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 3. STORAGE: RESTRINGIR LISTADO DE BUCKET PÚBLICO (public_bucket_allows_listing)
-- ------------------------------------------------------------------------------
-- En lugar de permitir listado abierto a cualquiera, solo usuarios autenticados
-- pueden listar archivos, mientras que la URL directa de descarga sigue funcionando
-- si el bucket es público.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
    DROP POLICY IF EXISTS "Todos ven evidencia deportiva" ON storage.objects;
    
    CREATE POLICY "workout_proofs_authenticated_select"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'workout-proofs');
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. RECARGA DE CONFIGURACIÓN Y CACHÉ
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
