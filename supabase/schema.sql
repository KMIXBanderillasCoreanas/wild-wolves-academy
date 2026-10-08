-- ==============================================================================
-- WILD WOLVES CDMX BASKETBALL ACADEMY - ESQUEMA OFICIAL SUPABASE (POSTGRESQL)
-- ==============================================================================

-- 1. LIMPIEZA TOTAL: Borrar triggers, funciones y tablas previas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.attendance_commitments CASCADE;
DROP TABLE IF EXISTS public.coach_applications CASCADE;
DROP TABLE IF EXISTS public.athlete_metrics CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABLA MAESTRA DE PERFILES (profiles)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'coach', 'coach_pending', 'superadmin')),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE COMPROMISO DE ENTRENAMIENTO (attendance_commitments)
-- Días: Lunes a Sábado | Turno: Matutino (09:00 - 11:00) o Vespertino (17:00 - 19:00)
CREATE TABLE public.attendance_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  days_selected TEXT[] NOT NULL DEFAULT '{"Lunes","Miércoles","Viernes"}',
  shift TEXT NOT NULL CHECK (shift IN ('matutino_9_11', 'vespertino_5_7')),
  commitment_agreement BOOLEAN NOT NULL DEFAULT true,
  venue TEXT NOT NULL DEFAULT 'Deportivo Carmen Serdán (CDMX)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. FUNCIÓN DISPARADORA AUTOMÁTICA (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role TEXT;
  v_status TEXT;
  v_name TEXT;
BEGIN
  -- Determinar rol desde los metadatos o por defecto 'student'
  v_role := COALESCE(NEW.raw_user_meta_data->>'assigned_role', 'student');
  
  -- Si el aspirante eligió coach_pending, su estatus es estrictamente 'pending'
  IF v_role = 'coach_pending' THEN
    v_status := 'pending';
  ELSE
    v_status := 'active';
  END IF;

  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    'Atleta Wild Wolves'
  );

  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (NEW.id, NEW.email, v_name, v_role, v_status)
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

-- 5. TRIGGER VINCULANTE EN AUTH.USERS
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 6. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_commitments ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles:
CREATE POLICY "Permitir lectura de perfiles a usuarios autenticados y publico"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Políticas para attendance_commitments:
CREATE POLICY "Lectura de compromisos: autor, coaches y administradores"
ON public.attendance_commitments FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coach', 'superadmin')
  )
);

CREATE POLICY "Inserción de compromisos por el propio usuario"
ON public.attendance_commitments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Actualización de compromisos por el propio usuario"
ON public.attendance_commitments FOR UPDATE
USING (auth.uid() = user_id);

-- 7. TABLA DE ASISTENCIA DIARIA EN CANCHA (daily_attendance)
CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  session_date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('matutino_9_11', 'vespertino_5_7')),
  status TEXT NOT NULL CHECK (status IN ('presente', 'falta', 'retardo')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, session_date, shift)
);

ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura y registro de asistencia diaria para coaches y superadmin"
ON public.daily_attendance FOR ALL
USING (true)
WITH CHECK (true);

-- 8. TABLA DE CONTROL DE COBRANZA Y PAGOS (student_payments)
CREATE TABLE IF NOT EXISTS public.student_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT,
  guardian_name TEXT,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Efectivo', 'Transferencia', 'Stripe')),
  status TEXT NOT NULL CHECK (status IN ('Pagado', 'Adeudo')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura y registro de pagos para administradores y coaches"
ON public.student_payments FOR ALL
USING (true)
WITH CHECK (true);

