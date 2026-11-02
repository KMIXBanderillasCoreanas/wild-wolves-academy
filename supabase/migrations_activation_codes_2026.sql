-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN DE CÓDIGOS DE ACTIVACIÓN Y FOLIOS
-- Archivo: supabase/migrations_activation_codes_2026.sql
-- Sede Oficial: Deportivo Carmen Serdán, CDMX
-- ==============================================================================

-- 1. TABLA DE FOLIOS Y CÓDIGOS DE ACTIVACIÓN (public.activation_codes)
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('PRO_99', 'ELITE_149', 'FREE_15')),
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    used_by_name TEXT,
    used_by_email TEXT,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que la columna notes exista incluso si la tabla fue creada previamente sin ella
ALTER TABLE public.activation_codes 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Asegurar que el CHECK constraint admita folios de bienvenida (FREE_15)
ALTER TABLE public.activation_codes 
DROP CONSTRAINT IF EXISTS activation_codes_plan_type_check;

ALTER TABLE public.activation_codes 
ADD CONSTRAINT activation_codes_plan_type_check 
CHECK (plan_type IN ('PRO_99', 'ELITE_149', 'FREE_15'));

-- Habilitar RLS
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

-- Sembrar códigos canónicos oficiales iniciales
INSERT INTO public.activation_codes (code, plan_type, is_used, notes)
VALUES
    ('WW-PRO-2026', 'PRO_99', false, 'Folio oficial Atleta Lobo Pro 2026 ($99 MXN - 50 consultas)'),
    ('WW-PRO-SERDAN', 'PRO_99', false, 'Folio oficial sede Deportivo Carmen Serdán'),
    ('WW-FAM-2026', 'ELITE_149', false, 'Folio oficial Pack Familiar Élite ($149 MXN - 100 consultas)'),
    ('WW-ELITE-77', 'ELITE_149', false, 'Folio especial para familia y tutor'),
    ('CARMEN-SERDAN-PRO', 'PRO_99', false, 'Folio promocional duela exterior'),
    ('CARMEN-SERDAN-ELITE', 'ELITE_149', false, 'Folio promocional familiar'),
    ('MANADA-2026', 'PRO_99', false, 'Promoción Manada 2026'),
    ('LOBO-TORNEO-2026', 'PRO_99', false, 'Pase especial Combine y Torneo'),
    ('BIENVENIDA-15', 'FREE_15', false, 'Bono de bienvenida 15 consultas IA')
ON CONFLICT (code) DO NOTHING;

-- 2. ASEGURAR COLUMNAS EN ai_usage_limits Y profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'FREE' CHECK (subscription_status IN ('FREE', 'ACTIVE', 'EXPIRED')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'PRO_99', 'ELITE_149', 'FREE_15')),
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS guardian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_independent_minor BOOLEAN DEFAULT false;

ALTER TABLE public.ai_usage_limits
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'FREE' CHECK (subscription_status IN ('FREE', 'ACTIVE', 'EXPIRED')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'PRO_99', 'ELITE_149', 'FREE_15')),
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Notificar recarga de caché de esquema en Supabase PostgREST
NOTIFY pgrst, 'reload schema';
