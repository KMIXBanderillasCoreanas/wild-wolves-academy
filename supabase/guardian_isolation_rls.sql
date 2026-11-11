-- ==============================================================================
-- WILD WOLVES CDMX - AISLAMIENTO ESTRICTO DE DATOS POR ROL DE TUTOR / PADRE (RLS)
-- ==============================================================================
-- Este script configura la política Row Level Security (RLS) estricta:
-- 1. Un usuario autenticado con rol 'guardian', 'parent' o 'tutor' SOLO puede
--    consultar perfiles, evaluaciones, asistencias y pagos vinculados a él.
-- 2. Coaches y SuperAdmins mantienen acceso operativo completo.
-- 3. Cualquier intento de consulta a atletas ajenos devuelve 0 registros (vacío).
-- ==============================================================================

-- 1. Habilitar RLS en las tablas clave
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.detailed_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.membership_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.basketball_skills_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.physical_training_logs ENABLE ROW LEVEL SECURITY;

-- 2. Función auxiliar optimizada para verificar parentesco / vínculo familiar
CREATE OR REPLACE FUNCTION public.is_guardian_of_student(target_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (
        linked_student_id = target_student_id
        OR id = target_student_id
        OR role IN ('coach', 'superadmin')
      )
  );
$$;

-- 3. POLÍTICAS DE AISLAMIENTO EN 'public.profiles'
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_guardian_isolation" ON public.profiles;

CREATE POLICY "profiles_guardian_isolation"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- El propio usuario
  id = auth.uid()
  -- O si es Coach / Superadmin
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
  -- O si es el atleta vinculado al tutor
  OR id IN (
    SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
  )
  -- O si el atleta tiene como parent_id / guardian_id a este usuario
  OR (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
        AND (role = 'guardian' OR role = 'parent') 
        AND linked_student_id = profiles.id
    )
  )
);

-- 4. POLÍTICAS DE AISLAMIENTO EN 'public.detailed_test_records'
DROP POLICY IF EXISTS "detailed_test_records_select" ON public.detailed_test_records;
DROP POLICY IF EXISTS "detailed_test_records_isolation" ON public.detailed_test_records;

CREATE POLICY "detailed_test_records_isolation"
ON public.detailed_test_records FOR SELECT
TO authenticated
USING (
  -- Atleta propio
  student_id = auth.uid()
  -- O Coach / SuperAdmin
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
  -- O Tutor formalmente vinculado
  OR student_id IN (
    SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- 5. POLÍTICAS DE AISLAMIENTO EN 'public.daily_attendance'
DROP POLICY IF EXISTS "daily_attendance_select" ON public.daily_attendance;
DROP POLICY IF EXISTS "daily_attendance_isolation" ON public.daily_attendance;

CREATE POLICY "daily_attendance_isolation"
ON public.daily_attendance FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
  OR student_id IN (
    SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- 6. POLÍTICAS DE AISLAMIENTO EN 'public.membership_payments'
DROP POLICY IF EXISTS "membership_payments_select" ON public.membership_payments;
DROP POLICY IF EXISTS "membership_payments_isolation" ON public.membership_payments;

CREATE POLICY "membership_payments_isolation"
ON public.membership_payments FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
  OR student_id IN (
    SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- 7. POLÍTICAS DE AISLAMIENTO EN 'public.basketball_skills_logs'
DROP POLICY IF EXISTS "basketball_skills_logs_isolation" ON public.basketball_skills_logs;
CREATE POLICY "basketball_skills_logs_isolation"
ON public.basketball_skills_logs FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
  OR student_id IN (
    SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()
  )
);
