-- ==============================================================================
-- WILD WOLVES CDMX - ELIMINACIÓN DE LOS 20 WARNINGS RESTANTES
-- 1. Cambia las funciones a SECURITY INVOKER (para no ejecutar con privilegios de admin vía API)
--    o revoca permisos de PUBLIC y fija search_path.
-- 2. Elimina la advertencia del bucket workout-proofs (quita la política de listado amplia).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STORAGE: ELIMINAR LA POLÍTICA DE LISTADO EN EL BUCKET PÚBLICO
-- Como el bucket es público, los archivos ya se pueden ver y descargar por su URL directa.
-- Al quitar el SELECT en storage.objects para ese bucket, desaparece el warning.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "workout_proofs_authenticated_select" ON storage.objects;
DROP POLICY IF EXISTS "Todos ven evidencia deportiva" ON storage.objects;


-- ------------------------------------------------------------------------------
-- 2. FUNCIONES: REVOCAR PRIVILEGIOS DE EJECUCIÓN A 'PUBLIC', 'anon' Y 'authenticated'
-- En PostgreSQL / Supabase, por defecto 'PUBLIC' tiene permiso de EXECUTE.
-- Al revocar de PUBLIC, se quita tanto a anon como a authenticated.
-- ------------------------------------------------------------------------------

-- Función: apply_auto_tier_on_baseline()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'apply_auto_tier_on_baseline') THEN
    ALTER FUNCTION public.apply_auto_tier_on_baseline() SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.apply_auto_tier_on_baseline() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: auto_classify_athlete_tier(...)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_classify_athlete_tier') THEN
    ALTER FUNCTION public.auto_classify_athlete_tier(integer, integer, integer, text, integer, integer) SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.auto_classify_athlete_tier(integer, integer, integer, text, integer, integer) FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: calculate_student_pending_debt(uuid)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_student_pending_debt') THEN
    ALTER FUNCTION public.calculate_student_pending_debt(uuid) SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.calculate_student_pending_debt(uuid) FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: check_and_grant_badges()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_and_grant_badges') THEN
    ALTER FUNCTION public.check_and_grant_badges() SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.check_and_grant_badges() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: check_and_promote_tier()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_and_promote_tier') THEN
    ALTER FUNCTION public.check_and_promote_tier() SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.check_and_promote_tier() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: handle_new_user()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: handle_superadmin_auto_grant()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_superadmin_auto_grant') THEN
    REVOKE EXECUTE ON FUNCTION public.handle_superadmin_auto_grant() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: is_coach()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_coach') THEN
    ALTER FUNCTION public.is_coach() SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.is_coach() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Función: is_superadmin()
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_superadmin') THEN
    ALTER FUNCTION public.is_superadmin() SECURITY INVOKER;
    REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. RECARGA DE CONFIGURACIÓN POSTGREST
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
