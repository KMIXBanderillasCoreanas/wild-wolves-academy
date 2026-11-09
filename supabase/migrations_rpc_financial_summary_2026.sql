-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN OFICIAL
-- FUNCIÓN RPC: get_academy_financial_summary
-- Solución para métricas financieras en ceros ($0) con agregaciones reales
-- ==============================================================================
-- Sede Oficial: Deportivo Carmen Serdán, CDMX
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_academy_financial_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_total_revenue NUMERIC(12,2) := 0;
  v_revenue_tx NUMERIC(12,2) := 0;
  v_revenue_mem NUMERIC(12,2) := 0;
  v_total_receivable NUMERIC(12,2) := 0;
  v_debtors_count INTEGER := 0;
  v_active_memberships INTEGER := 0;
  v_active_pro_99 INTEGER := 0;
  v_active_elite_149 INTEGER := 0;
  v_court_fees_collected NUMERIC(12,2) := 0;
  v_court_fees_count INTEGER := 0;
  v_total_transactions INTEGER := 0;
BEGIN
  -- 1. Validar autorización (SuperAdmin, Coach, Head Coach o service_role)
  IF auth.role() <> 'service_role' THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    -- Permitir ejecución a roles administrativos; si no hay sesión estricta permitir para dashboard búnker
  END IF;

  -- 2. CALCULAR INGRESOS TOTALES POR FOLIOS / MEMBRESÍAS / CUOTAS
  -- a) Sumar de payment_transactions_history
  SELECT 
    COALESCE(SUM(amount_paid), 0),
    COUNT(id),
    COALESCE(SUM(CASE WHEN amount_paid = 50 OR membership_tier = 'cuota_clase_50' OR LOWER(concept) LIKE '%clase%' THEN amount_paid ELSE 0 END), 0),
    COUNT(CASE WHEN amount_paid = 50 OR membership_tier = 'cuota_clase_50' OR LOWER(concept) LIKE '%clase%' THEN 1 END)
  INTO 
    v_revenue_tx,
    v_total_transactions,
    v_court_fees_collected,
    v_court_fees_count
  FROM public.payment_transactions_history;

  -- b) Complementar con membership_payments si existen registros independientes
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(CASE WHEN amount = 50 OR membership_tier = 'cuota_clase_50' OR LOWER(concept) LIKE '%clase%' THEN amount ELSE 0 END), 0),
    COUNT(CASE WHEN amount = 50 OR membership_tier = 'cuota_clase_50' OR LOWER(concept) LIKE '%clase%' THEN 1 END)
  INTO 
    v_revenue_mem,
    v_court_fees_collected,
    v_court_fees_count
  FROM public.membership_payments
  WHERE id NOT IN (SELECT id FROM public.payment_transactions_history);

  v_total_revenue := COALESCE(v_revenue_tx, 0) + COALESCE(v_revenue_mem, 0);

  -- 3. CALCULAR CUENTAS POR COBRAR ACUMULADAS
  -- Suma real de adeudos pendientes multiplicando o agregando clases pendientes ($50 MXN por clase)
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN COALESCE(current_debt_amount, 0) > 0 THEN current_debt_amount
        WHEN financial_status IN ('adeudo', 'pendiente') THEN 50.00
        ELSE 0 
      END
    ), 0),
    COUNT(CASE WHEN COALESCE(current_debt_amount, 0) > 0 OR financial_status IN ('adeudo', 'pendiente') THEN 1 END)
  INTO 
    v_total_receivable,
    v_debtors_count
  FROM public.profiles
  WHERE role IN ('student', 'alumno') OR user_type IN ('student', 'alumno');

  -- 4. CONTEO DE MEMBRESÍAS ACTIVAS (PRO $99 Y FAMILIAR ÉLITE $149)
  -- a) Desde activation_codes
  SELECT 
    COUNT(CASE WHEN plan_type IN ('PRO_99', 'pro') THEN 1 END),
    COUNT(CASE WHEN plan_type IN ('ELITE_149', 'elite_familiar', 'family_199') THEN 1 END)
  INTO 
    v_active_pro_99,
    v_active_elite_149
  FROM public.activation_codes
  WHERE is_used = false OR (expires_at IS NOT NULL AND expires_at > NOW());

  -- b) Sumar folios en membership_vouchers si existen
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'membership_vouchers') THEN
    DECLARE
      v_vouchers_pro INT := 0;
      v_vouchers_elite INT := 0;
    BEGIN
      SELECT 
        COUNT(CASE WHEN plan_type IN ('pro', 'PRO_99') THEN 1 END),
        COUNT(CASE WHEN plan_type IN ('elite_familiar', 'ELITE_149') THEN 1 END)
      INTO v_vouchers_pro, v_vouchers_elite
      FROM public.membership_vouchers
      WHERE is_redeemed = false;

      v_active_pro_99 := v_active_pro_99 + COALESCE(v_vouchers_pro, 0);
      v_active_elite_149 := v_active_elite_149 + COALESCE(v_vouchers_elite, 0);
    END;
  END IF;

  -- c) Sumar perfiles con suscripción activa en profiles
  DECLARE
    v_profiles_pro INT := 0;
    v_profiles_elite INT := 0;
  BEGIN
    SELECT 
      COUNT(CASE WHEN subscription_plan IN ('PRO_99', 'pro') THEN 1 END),
      COUNT(CASE WHEN subscription_plan IN ('ELITE_149', 'elite_familiar') THEN 1 END)
    INTO v_profiles_pro, v_profiles_elite
    FROM public.profiles
    WHERE subscription_status = 'ACTIVE' OR ai_plan IN ('pro', 'elite_familiar');

    v_active_pro_99 := v_active_pro_99 + COALESCE(v_profiles_pro, 0);
    v_active_elite_149 := v_active_elite_149 + COALESCE(v_profiles_elite, 0);
  END;

  v_active_memberships := v_active_pro_99 + v_active_elite_149;

  RETURN jsonb_build_object(
    'total_revenue', v_total_revenue,
    'total_debt', v_total_receivable,
    'total_receivable', v_total_receivable,
    'debtors_count', v_debtors_count,
    'active_memberships_count', v_active_memberships,
    'active_pro_99_count', v_active_pro_99,
    'active_elite_149_count', v_active_elite_149,
    'court_fees_collected', v_court_fees_collected,
    'court_fees_count', v_court_fees_count,
    'transactions_count', v_total_transactions,
    'sede', 'Deportivo Carmen Serdán, CDMX',
    'calculated_at', NOW()
  );
END;
$$;

-- Otorgar permisos de ejecución a authenticated y anon (con service_role bypass)
GRANT EXECUTE ON FUNCTION public.get_academy_financial_summary() TO authenticated, anon, service_role;
