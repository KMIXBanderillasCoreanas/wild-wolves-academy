-- ==============================================================================
-- WILD WOLVES CDMX - FIX DEFINITIVO PARA SUPABASE SECURITY ADVISOR
-- Resuelve los 3 errores exactamente con los nombres de políticas y vista detectados:
-- 1. policy_exists_rls_disabled (public.profiles)
-- 2. security_definer_view (public.active_court_students)
-- 3. rls_disabled_in_public (public.profiles)
-- ==============================================================================

-- 1. SOLUCIÓN ERROR 2: Eliminar la propiedad SECURITY DEFINER de 'public.active_court_students'
-- En Postgres, cambiarla a security_invoker = true o recrearla sin security definer:
DROP VIEW IF EXISTS public.active_court_students CASCADE;

-- Si la vista no es requerida por frontend, al dropearla se elimina el error de raíz.
-- En caso de que se necesite, se crea segura con SECURITY INVOKER (por defecto en Postgres):
CREATE OR REPLACE VIEW public.active_court_students 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  role,
  status,
  created_at
FROM public.profiles
WHERE status = 'active';


-- 2. SOLUCIÓN ERROR 1 Y 3: Limpiar las políticas viejas mencionadas en el reporte:
-- {"Permitir lectura de perfiles a usuarios autenticados y publico","Privacidad de perfiles","Usuarios editan su propio perfil completo","Usuarios pueden actualizar su propio perfil"}
DROP POLICY IF EXISTS "Permitir lectura de perfiles a usuarios autenticados y publico" ON public.profiles;
DROP POLICY IF EXISTS "Privacidad de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios editan su propio perfil completo" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;

-- Y cualquier otra variante previa:
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_coach_full_access" ON public.profiles;


-- 3. ACTIVAR FORZOSAMENTE ROW LEVEL SECURITY (RLS) EN PUBLIC.PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;


-- 4. CREAR POLÍTICAS LIMPIAS Y SEGURAS EN PUBLIC.PROFILES
-- Política A: Lectura permitida a usuarios autenticados
CREATE POLICY "profiles_authenticated_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Política B: Usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_own_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política C: Permitir inserción durante registro de usuario
CREATE POLICY "profiles_user_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política D: Acceso administrativo para Coaches y Superadmins
CREATE POLICY "profiles_staff_manage"
ON public.profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('coach', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('coach', 'superadmin')
  )
);

-- 5. RECARGAR METADATOS DEL SERVIDOR POSTGREST
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
