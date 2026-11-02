-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN DE CONTROL DE CUOTAS Y PLANES PRO
-- Archivo: supabase/migrations_ai_limits_pro_plans_2026.sql
-- Sede: Deportivo Carmen Serdán, CDMX
-- ==============================================================================

-- 1. ACTUALIZAR CHECK CONSTRAINT Y VALORES POR DEFECTO EN ai_usage_limits
ALTER TABLE public.ai_usage_limits 
ALTER COLUMN max_consultations SET DEFAULT 5;

DO $$ 
BEGIN
    ALTER TABLE public.ai_usage_limits 
    DROP CONSTRAINT IF EXISTS ai_usage_limits_plan_type_check;

    ALTER TABLE public.ai_usage_limits 
    ADD CONSTRAINT ai_usage_limits_plan_type_check 
    CHECK (plan_type IN ('free', 'pro', 'standard_99', 'elite_familiar', 'family_199', 'vip_pro'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint de plan_type actualizado o ya existente.';
END $$;

-- 2. TABLA DE FOLIOS Y VOUCHERS DE CANCHA (membership_vouchers)
CREATE TABLE IF NOT EXISTS public.membership_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code TEXT NOT NULL UNIQUE,
    plan_type TEXT NOT NULL DEFAULT 'pro' CHECK (plan_type IN ('pro', 'elite_familiar')),
    max_queries INTEGER NOT NULL DEFAULT 50,
    price_mxn NUMERIC(6,2) NOT NULL DEFAULT 99.00,
    is_redeemed BOOLEAN NOT NULL DEFAULT false,
    redeemed_by_name TEXT,
    redeemed_by_email TEXT,
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 months'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.membership_vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vouchers_read_policy" ON public.membership_vouchers;
CREATE POLICY "vouchers_read_policy" ON public.membership_vouchers
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "vouchers_all_policy" ON public.membership_vouchers;
CREATE POLICY "vouchers_all_policy" ON public.membership_vouchers
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Sembrar folios canónicos iniciales si no existen
INSERT INTO public.membership_vouchers (voucher_code, plan_type, max_queries, price_mxn)
VALUES 
    ('WW-PRO-2026', 'pro', 50, 99.00),
    ('WW-PRO-SERDAN', 'pro', 50, 99.00),
    ('WW-FAM-2026', 'elite_familiar', 100, 149.00),
    ('WW-ELITE-77', 'elite_familiar', 100, 149.00),
    ('CARMEN-SERDAN-PRO', 'pro', 50, 99.00),
    ('CARMEN-SERDAN-ELITE', 'elite_familiar', 100, 149.00)
ON CONFLICT (voucher_code) DO NOTHING;

-- 3. ACTUALIZAR CUOTAS EXISTENTES DEL PLAN FREE (De 3 a 5 consultas)
UPDATE public.ai_usage_limits
SET max_consultations = 5
WHERE plan_type = 'free' AND max_consultations < 5;

UPDATE public.ai_usage_limits
SET max_consultations = 50
WHERE (plan_type = 'pro' OR plan_type = 'standard_99') AND max_consultations != 50;

UPDATE public.ai_usage_limits
SET max_consultations = 100
WHERE (plan_type = 'elite_familiar' OR plan_type = 'family_199') AND max_consultations != 100;

-- 4. FUNCIÓN RPC fn_check_and_consume_ai_quota ACTUALIZADA
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
    -- Determinar límite estricto según plan oficial
    IF p_plan_type = 'vip_pro' THEN
        v_max := 9999;
    ELSIF p_plan_type = 'elite_familiar' OR p_plan_type = 'family_199' THEN
        v_max := 100; -- 100 consultas mensuales compartidas
    ELSIF p_plan_type = 'pro' OR p_plan_type = 'standard_99' THEN
        v_max := 50;  -- 50 consultas mensuales de atleta
    ELSE
        v_max := 5;   -- 5 consultas gratuitas en plan Free / Invitado
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

    -- Verificar si ya pasó la fecha de reseteo mensual
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

    -- Verificar si ya agotó la cuota mensual
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

    -- Incrementar una consulta
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
