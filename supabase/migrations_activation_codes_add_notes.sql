-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN ESPECÍFICA: COLUMNA NOTES
-- Archivo: supabase/migrations_activation_codes_add_notes.sql
-- Resuelve: Error de caché de esquema en /master-bunker-hq para public.activation_codes
-- ==============================================================================

-- 1. Asegurar que la columna notes exista en public.activation_codes
ALTER TABLE public.activation_codes 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Asegurar que el CHECK constraint permita folios de bienvenida (FREE_15)
ALTER TABLE public.activation_codes 
DROP CONSTRAINT IF EXISTS activation_codes_plan_type_check;

ALTER TABLE public.activation_codes 
ADD CONSTRAINT activation_codes_plan_type_check 
CHECK (plan_type IN ('PRO_99', 'ELITE_149', 'FREE_15'));

-- 3. Asegurar que las políticas RLS permitan lectura y escritura
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activation_codes_select_policy" ON public.activation_codes;
CREATE POLICY "activation_codes_select_policy" ON public.activation_codes
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "activation_codes_all_policy" ON public.activation_codes;
CREATE POLICY "activation_codes_all_policy" ON public.activation_codes
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 3. Notificar a PostgREST para reconstruir la caché de esquema en caliente
NOTIFY pgrst, 'reload schema';
