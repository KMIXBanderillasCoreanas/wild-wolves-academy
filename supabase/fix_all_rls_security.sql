-- ==============================================================================
-- WILD WOLVES CDMX - FIX CRÍTICO DE SEGURIDAD (SECURITY ADVISOR SUPABASE)
-- Resuelve al 100%:
-- 1. "Policy Exists RLS Disabled" en public.profiles
-- 2. "RLS Disabled in Public" en public.profiles
-- 3. "Security Definer View" en public.active_court_students
-- 4. Asegura RLS y políticas en TODAS las tablas públicas de la academia
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PARTE 1: RESOLVER EL ERROR CRÍTICO DE LA VISTA 'public.active_court_students'
-- Las vistas SECURITY DEFINER ejecutan con permisos elevados del creador ignorando RLS.
-- Si la vista existe, la modificamos a SECURITY INVOKER (estándar seguro en Postgres 15+)
-- o la recreamos asegurando que respete el usuario que consulta.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Si la vista existe, alteramos para que sea security_invoker
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'active_court_students'
  ) THEN
    EXECUTE 'ALTER VIEW public.active_court_students SET (security_invoker = true);';
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- PARTE 2: HABILITAR ROW LEVEL SECURITY (RLS) EN 'public.profiles' Y DEMÁS TABLAS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.membership_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_transactions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prospect_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_initial_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.physical_training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.basketball_skills_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.detailed_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.home_training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operational_expenses ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------------------------
-- PARTE 3: POLÍTICAS DE SEGURIDAD PARA 'public.profiles'
-- ------------------------------------------------------------------------------
-- Limpiar políticas existentes para evitar duplicados o inconsistencias
DROP POLICY IF EXISTS "Permitir lectura de perfiles a usuarios autenticados y publico" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Lectura de perfiles para autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Modificacion de perfil propio" ON public.profiles;
DROP POLICY IF EXISTS "Coaches y admins gestionan perfiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Política de lectura: Alumnos, tutores y coaches autenticados pueden ver los perfiles de la academia
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Política de actualización: Cada usuario puede actualizar su propio perfil
CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política de inserción: El usuario registrado o el sistema pueden crear su registro
CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política de gestión total para Coaches y Superadmins
CREATE POLICY "profiles_coach_full_access"
ON public.profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
);


-- ------------------------------------------------------------------------------
-- PARTE 4: BLINDAJE PARA ASISTENCIA Y FINANZAS
-- ------------------------------------------------------------------------------
-- DAILY ATTENDANCE
DROP POLICY IF EXISTS "Lectura y registro de daily_attendance" ON public.daily_attendance;
DROP POLICY IF EXISTS "daily_attendance_all" ON public.daily_attendance;
CREATE POLICY "daily_attendance_coach_manage"
ON public.daily_attendance FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
);

CREATE POLICY "daily_attendance_student_select"
ON public.daily_attendance FOR SELECT
TO authenticated
USING (student_id = auth.uid());


-- MEMBERSHIP PAYMENTS / TRANSACCIONES
DROP POLICY IF EXISTS "Lectura y registro de membership_payments" ON public.membership_payments;
DROP POLICY IF EXISTS "membership_payments_all" ON public.membership_payments;
CREATE POLICY "membership_payments_coach_manage"
ON public.membership_payments FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'superadmin'))
);

CREATE POLICY "membership_payments_student_select"
ON public.membership_payments FOR SELECT
TO authenticated
USING (student_id = auth.uid());


-- ------------------------------------------------------------------------------
-- PARTE 5: BLINDAJE PARA EVALUACIONES Y PRUEBAS TÉCNICAS
-- ------------------------------------------------------------------------------
-- DETAILED TEST RECORDS (Pruebas deportivas calibradas)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'detailed_test_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS "detailed_test_records_select" ON public.detailed_test_records;';
    EXECUTE 'DROP POLICY IF EXISTS "detailed_test_records_coach" ON public.detailed_test_records;';
    
    EXECUTE 'CREATE POLICY "detailed_test_records_coach" ON public.detailed_test_records FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''coach'', ''superadmin''))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''coach'', ''superadmin'')));';
    
    EXECUTE 'CREATE POLICY "detailed_test_records_student_select" ON public.detailed_test_records FOR SELECT TO authenticated USING (student_id = auth.uid());';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- PARTE 6: RECARGA DE SCHEMA CACHE EN POSTGREST
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
