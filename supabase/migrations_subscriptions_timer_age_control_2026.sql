-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN DE SUSCRIPCIONES, TEMPORIZADOR Y CONTROL DE EDAD
-- Archivo: supabase/migrations_subscriptions_timer_age_control_2026.sql
-- Sede Oficial: Deportivo Carmen Serdán, CDMX
-- ==============================================================================

-- 1. ACTUALIZAR COLUMNAS EN PROFILES PARA SUSCRIPCIÓN, CONTROL DE EDAD Y TUTORES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'FREE' CHECK (subscription_status IN ('FREE', 'ACTIVE', 'EXPIRED')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'PRO_99', 'ELITE_149')),
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS guardian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_independent_minor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_year INTEGER;

-- 2. ACTUALIZAR COLUMNAS EN ai_usage_limits
ALTER TABLE public.ai_usage_limits
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'FREE' CHECK (subscription_status IN ('FREE', 'ACTIVE', 'EXPIRED')),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'PRO_99', 'ELITE_149')),
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 3. PROCEDIMIENTO ALMACENADO PARA ACTIVAR SUSCRIPCIÓN (TEMPORIZADOR AUTOMÁTICO DE 30 DÍAS)
CREATE OR REPLACE FUNCTION public.fn_activate_subscription(
    p_user_id UUID,
    p_plan TEXT DEFAULT 'PRO_99',
    p_days INT DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    v_expires TIMESTAMPTZ;
    v_max INT;
    v_plan_clean TEXT;
BEGIN
    v_expires := v_now + (p_days || ' days')::INTERVAL;
    
    -- Normalizar nombre del plan
    IF UPPER(p_plan) IN ('ELITE_149', 'ELITE_FAMILIAR', 'FAMILY_199') THEN
        v_plan_clean := 'ELITE_149';
        v_max := 100;
    ELSIF UPPER(p_plan) IN ('PRO_99', 'PRO', 'STANDARD_99') THEN
        v_plan_clean := 'PRO_99';
        v_max := 50;
    ELSE
        v_plan_clean := 'FREE';
        v_max := 5;
    END IF;

    -- 1. Actualizar perfil
    UPDATE public.profiles
    SET subscription_status = 'ACTIVE',
        subscription_plan = v_plan_clean,
        activated_at = v_now,
        expires_at = v_expires,
        ai_plan = CASE WHEN v_plan_clean = 'ELITE_149' THEN 'elite_familiar' ELSE 'pro' END,
        ai_queries_used = 0,
        updated_at = v_now
    WHERE id = p_user_id;

    -- 2. Actualizar o insertar en ai_usage_limits
    INSERT INTO public.ai_usage_limits (
        user_id,
        plan_type,
        subscription_status,
        subscription_plan,
        consultations_used,
        max_consultations,
        activated_at,
        expires_at,
        reset_date,
        last_consultation_at,
        updated_at
    )
    VALUES (
        p_user_id,
        CASE WHEN v_plan_clean = 'ELITE_149' THEN 'elite_familiar' ELSE 'pro' END,
        'ACTIVE',
        v_plan_clean,
        0,
        v_max,
        v_now,
        v_expires,
        v_expires,
        v_now,
        v_now
    )
    ON CONFLICT (user_id) DO UPDATE
    SET subscription_status = 'ACTIVE',
        subscription_plan = v_plan_clean,
        plan_type = CASE WHEN v_plan_clean = 'ELITE_149' THEN 'elite_familiar' ELSE 'pro' END,
        consultations_used = 0,
        max_consultations = v_max,
        activated_at = v_now,
        expires_at = v_expires,
        reset_date = v_expires,
        updated_at = v_now;

    RETURN jsonb_build_object(
        'success', true,
        'plan', v_plan_clean,
        'max_consultations', v_max,
        'activated_at', v_now,
        'expires_at', v_expires,
        'days_granted', p_days
    );
END;
$$;

-- 4. PROCEDIMIENTO PARA EVALUAR EXPIRACIÓN DE SUSCRIPCIÓN TRAS 30 DÍAS
CREATE OR REPLACE FUNCTION public.fn_check_and_expire_subscriptions()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INT := 0;
BEGIN
    -- Marcar expirados en profiles
    UPDATE public.profiles
    SET subscription_status = 'EXPIRED',
        updated_at = NOW()
    WHERE subscription_status = 'ACTIVE' 
      AND expires_at IS NOT NULL 
      AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Marcar expirados en ai_usage_limits y reajustar a Free (5 consultas)
    UPDATE public.ai_usage_limits
    SET subscription_status = 'EXPIRED',
        plan_type = 'free',
        max_consultations = 5,
        updated_at = NOW()
    WHERE subscription_status = 'ACTIVE' 
      AND expires_at IS NOT NULL 
      AND expires_at < NOW();

    RETURN v_count;
END;
$$;

-- 5. TABLA DINÁMICA DE BASE DE CONOCIMIENTO (MANUALES Y LIBROS OFICIALES)
CREATE TABLE IF NOT EXISTS public.academy_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('preparacion_fisica', 'nutricion_hidratacion', 'tactica_fiba', 'reglamento_seguridad')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academy_knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_base_select_policy" ON public.academy_knowledge_base;
CREATE POLICY "knowledge_base_select_policy" ON public.academy_knowledge_base
    FOR SELECT TO authenticated, anon
    USING (true);

-- Sembrado inicial de manuales dinámicos
INSERT INTO public.academy_knowledge_base (manual_key, title, category, content, metadata)
VALUES
(
    'manual_preparacion_fisica_2026',
    'Manual de Preparación Física - Wild Wolves CDMX',
    'preparacion_fisica',
    'Sede Carmen Serdán. Equipamiento: peso corporal, mancuernas 2kg, poleas 2kg. Protocolos: Wall-sits isométricos a 90° para tendón rotuliano, walking lunges unilaterales para entradas a canasta, elevaciones de pantorrilla para salto vertical, series 3x25 sentadillas y abdomen.',
    '{"author": "Coach Ricardo", "version": "2026.1", "tags": ["calistenia", "salto_vertical", "duela"]}'::jsonb
),
(
    'guia_nutricion_hidratacion_2026',
    'Guía de Nutrición e Hidratación para Atletas Wild Wolves',
    'nutricion_hidratacion',
    'Agua natural como base obligatoria. Electrolitos caseros (agua, sal marina, limón, miel) para evitar calambres en duela exterior. Snacks 45 min antes: plátano, avena ligera. Ventana anabólica 30-60 min post entreno con proteína de alto valor biológico y carbohidratos complejos.',
    '{"author": "Cuerpo Técnico Wild Wolves", "version": "2026.1", "tags": ["hidratacion", "pre_entreno", "recuperacion"]}'::jsonb
),
(
    'tactica_defensas_altas_fiba',
    'Táctica y Biomecánica frente a Defensores Altos (14-16 años)',
    'tactica_fiba',
    'Lectura de defensores con mayor envergadura: Prohibido penetrar en línea recta bajo aro. Ejecución obligatoria de finta de tiro en suspensión, desaceleración brusca a 45°, flotadora con arco alto a 55° y paso lateral step-back con salida explosiva.',
    '{"author": "Head Coach Ricardo", "version": "2026.1", "tags": ["fiba", "tiro", "biomecanica", "step_back"]}'::jsonb
)
ON CONFLICT (manual_key) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = NOW();
