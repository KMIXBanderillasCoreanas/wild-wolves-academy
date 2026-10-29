-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN MAESTRA DE IA, BIOMECÁNICA Y PRE-HAB
-- Archivo: supabase/migrations_ai_biomechanics_prehab_2026.sql
-- ==============================================================================

-- 1. TABLA DE CONTROL DE USO DE IA (ai_usage_limits)
CREATE TABLE IF NOT EXISTS public.ai_usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'standard_99', 'family_199', 'vip_pro')),
    consultations_used INTEGER NOT NULL DEFAULT 0,
    max_consultations INTEGER NOT NULL DEFAULT 3,
    reset_date TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
    last_consultation_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_ai_plan UNIQUE (user_id)
);

-- RLS para ai_usage_limits
ALTER TABLE public.ai_usage_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_limits_select_policy" ON public.ai_usage_limits;
CREATE POLICY "ai_limits_select_policy" ON public.ai_usage_limits
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "ai_limits_upsert_policy" ON public.ai_usage_limits;
CREATE POLICY "ai_limits_upsert_policy" ON public.ai_usage_limits
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 2. AMPLIACIÓN DE VARIABLES CINEMÁTICAS EN DETAILED_TEST_RECORDS
ALTER TABLE public.detailed_test_records
ADD COLUMN IF NOT EXISTS shot_type TEXT DEFAULT 'jump_shot_apex',
ADD COLUMN IF NOT EXISTS reaction_time_ms INTEGER DEFAULT 280,
ADD COLUMN IF NOT EXISTS gathering_time_ms INTEGER DEFAULT 420,
ADD COLUMN IF NOT EXISTS release_time_ms INTEGER DEFAULT 360,
ADD COLUMN IF NOT EXISTS jump_apex_height_cm NUMERIC(5,2) DEFAULT 48.5,
ADD COLUMN IF NOT EXISTS defensive_stance_score NUMERIC(4,1) DEFAULT 75.0,
ADD COLUMN IF NOT EXISTS hip_tracking_awareness NUMERIC(4,1) DEFAULT 80.0,
ADD COLUMN IF NOT EXISTS leg_angle_degrees NUMERIC(4,1) DEFAULT 105.0;

-- 3. AMPLIACIÓN DE VARIABLES EN BASKETBALL_SKILLS_LOGS
ALTER TABLE public.basketball_skills_logs
ADD COLUMN IF NOT EXISTS shot_type TEXT DEFAULT 'jump_shot_apex',
ADD COLUMN IF NOT EXISTS reaction_time_ms INTEGER DEFAULT 280,
ADD COLUMN IF NOT EXISTS gathering_time_ms INTEGER DEFAULT 420,
ADD COLUMN IF NOT EXISTS release_time_ms INTEGER DEFAULT 360,
ADD COLUMN IF NOT EXISTS jump_apex_height_cm NUMERIC(5,2) DEFAULT 48.5,
ADD COLUMN IF NOT EXISTS defensive_stance_score NUMERIC(4,1) DEFAULT 75.0,
ADD COLUMN IF NOT EXISTS hip_tracking_awareness NUMERIC(4,1) DEFAULT 80.0;

-- 4. BASE DE DATOS DE SALUD ARTICULAR Y PREVENCIÓN (injury_prevention_protocols)
CREATE TABLE IF NOT EXISTS public.injury_prevention_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    target_area TEXT NOT NULL, -- 'ankle', 'patellar_tendon', 'posterior_chain', 'lumbar', 'shoulder'
    phase TEXT NOT NULL DEFAULT 'pre_hab' CHECK (phase IN ('pre_hab', 'dynamic_warmup', 'cool_down', 'recovery')),
    risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    recommended_reps TEXT NOT NULL,
    chiropractic_notes TEXT,
    bioimpedance_trigger_condition JSONB DEFAULT '{}'::jsonb, -- ej: {"fat_percent_min": 22, "water_percent_max": 50}
    video_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para injury_prevention_protocols
ALTER TABLE public.injury_prevention_protocols ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "protocols_select_all" ON public.injury_prevention_protocols;
CREATE POLICY "protocols_select_all" ON public.injury_prevention_protocols
    FOR SELECT TO authenticated, anon
    USING (true);

-- Insertar fichas base oficiales de básquetbol
INSERT INTO public.injury_prevention_protocols (code, title, target_area, phase, risk_level, description, recommended_reps, chiropractic_notes, bioimpedance_trigger_condition)
VALUES
(
    'PROT-ANKLE-01',
    'Protocolo Anti-Esguince de Tobillo y Propiocepción Fíbular',
    'ankle',
    'pre_hab',
    'high',
    'Movilidad en dorsiflexión contra muro + balance en un pie sobre superficie inestable con ojos cerrados y recepciones de pase con perturbación.',
    '3 series x 45 segundos por tobillo',
    'Alineación del astrágalo y activación del peroneo lateral largo para evitar torsión en caída de rebotes o cortes de cambio de dirección.',
    '{"reason": "Cargas de impacto en salto vertical"}'::jsonb
),
(
    'PROT-KNEE-01',
    'Blindaje de Tendón Rotuliano e Isométricos Cuadricipitales',
    'patellar_tendon',
    'pre_hab',
    'high',
    'Spanish Squat con banda tensa detrás del hueco poplíteo o Wall-sit estricto a 60° con descanso de 2 minutos.',
    '4 series x 40 segundos manteniendo tensión pura sin flexión máxima',
    'Descompresión de la rótula; absorción de fuerza excéntrica en frenadas bruscas (pull-up jumpers) y caídas a dos tiempos.',
    '{"reason": "Prevención de rodilla de saltador"}'::jsonb
),
(
    'PROT-POST-CHAIN-01',
    'Descompresión de Cadena Posterior (Isquiotibiales & Zona Lumbar)',
    'posterior_chain',
    'cool_down',
    'medium',
    'Estiramiento activo de isquiosurales asistido con banda + postura del niño modificada con rotación torácica y respiración diafragmática 4-7-8.',
    '3 series x 60 segundos por pierna',
    'Alivio de la tensión sacroilíaca tras partidos intensos; previene contracturas y lordosis compensatoria en postura de defensa baja.',
    '{"reason": "Recuperación post-juego y drenaje de ácido láctico"}'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    chiropractic_notes = EXCLUDED.chiropractic_notes;

-- 5. FUNCIÓN RPC PARA CONSUMIR Y VERIFICAR USO DE IA
CREATE OR REPLACE FUNCTION public.fn_check_and_consume_ai_quota(
    p_user_id UUID,
    p_plan_type TEXT DEFAULT 'free'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record public.ai_usage_limits%ROWTYPE;
    v_max INT;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Determinar límite según plan
    IF p_plan_type = 'vip_pro' THEN
        v_max := 9999;
    ELSIF p_plan_type = 'family_199' THEN
        v_max := 100;
    ELSIF p_plan_type = 'standard_99' THEN
        v_max := 50;
    ELSE
        v_max := 3; -- Free
    END IF;

    -- Obtener o inicializar registro
    SELECT * INTO v_record FROM public.ai_usage_limits WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        INSERT INTO public.ai_usage_limits (user_id, plan_type, consultations_used, max_consultations, reset_date, last_consultation_at)
        VALUES (p_user_id, p_plan_type, 1, v_max, (date_trunc('month', v_now) + INTERVAL '1 month'), v_now)
        RETURNING * INTO v_record;

        RETURN jsonb_build_object(
            'allowed', true,
            'used', 1,
            'max', v_max,
            'remaining', (v_max - 1),
            'plan_type', p_plan_type
        );
    END IF;

    -- Verificar si ya pasó la fecha de reset
    IF v_now >= v_record.reset_date THEN
        UPDATE public.ai_usage_limits
        SET consultations_used = 1,
            max_consultations = v_max,
            reset_date = (date_trunc('month', v_now) + INTERVAL '1 month'),
            last_consultation_at = v_now,
            updated_at = v_now
        WHERE user_id = p_user_id
        RETURNING * INTO v_record;

        RETURN jsonb_build_object(
            'allowed', true,
            'used', 1,
            'max', v_max,
            'remaining', (v_max - 1),
            'plan_type', p_plan_type
        );
    END IF;

    -- Verificar límite
    IF v_record.consultations_used >= v_record.max_consultations THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'used', v_record.consultations_used,
            'max', v_record.max_consultations,
            'remaining', 0,
            'plan_type', v_record.plan_type,
            'reset_date', v_record.reset_date
        );
    END IF;

    -- Incrementar consulta
    UPDATE public.ai_usage_limits
    SET consultations_used = consultations_used + 1,
        last_consultation_at = v_now,
        updated_at = v_now
    WHERE user_id = p_user_id
    RETURNING * INTO v_record;

    RETURN jsonb_build_object(
        'allowed', true,
        'used', v_record.consultations_used,
        'max', v_record.max_consultations,
        'remaining', (v_record.max_consultations - v_record.consultations_used),
        'plan_type', v_record.plan_type
    );
END;
$$;
