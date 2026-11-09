-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - PROTOCOLO ECC FINANCIERO
-- Migración Oficial: supabase/migrations_ecc_financial_protocol_2026.sql
-- Sede Oficial: Deportivo Carmen Serdán, CDMX
-- ==============================================================================
-- Planes Oficiales ECC:
-- 1. Cuota por Clase Cancha: $50 MXN (cuota_clase_50)
-- 2. Plan Individual Pro:     $99 MXN (plan_pro_99)
-- 3. Pack Familiar Élite:     $149 MXN (pack_familiar_elite_149)
-- ==============================================================================

-- 1. ACTUALIZAR O REFORZAR TABLA membership_payments
ALTER TABLE IF EXISTS public.membership_payments 
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'cuota_clase_50',
ADD COLUMN IF NOT EXISTS plan_amount NUMERIC(10,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS receipt_folio TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id);

-- 2. REFORZAR TABLA payment_transactions_history
ALTER TABLE IF EXISTS public.payment_transactions_history
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'cuota_clase_50',
ADD COLUMN IF NOT EXISTS plan_amount NUMERIC(10,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS receipt_folio TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id);

-- 3. ACTUALIZAR RESTRICCIÓN DE CHECK O DOMINIO PARA PLANES DE MEMBRESÍA
DO $$
BEGIN
  -- Normalizar registros previos con tiers válidos
  UPDATE public.payment_transactions_history
  SET membership_tier = CASE 
    WHEN amount_paid = 99 OR LOWER(concept) LIKE '%pro%' THEN 'plan_pro_99'
    WHEN amount_paid = 149 OR LOWER(concept) LIKE '%elite%' OR LOWER(concept) LIKE '%familiar%' THEN 'pack_familiar_elite_149'
    ELSE 'cuota_clase_50'
  END
  WHERE membership_tier IS NULL;

  UPDATE public.membership_payments
  SET membership_tier = CASE 
    WHEN amount = 99 OR LOWER(concept) LIKE '%pro%' THEN 'plan_pro_99'
    WHEN amount = 149 OR LOWER(concept) LIKE '%elite%' OR LOWER(concept) LIKE '%familiar%' THEN 'pack_familiar_elite_149'
    ELSE 'cuota_clase_50'
  END
  WHERE membership_tier IS NULL;
END $$;

-- 4. VISTA DE RESUMEN FINANCIERO MENSUAL (ECC Financial Summary View)
CREATE OR REPLACE VIEW public.v_financial_monthly_summary AS
WITH current_month_payments AS (
  SELECT 
    id,
    student_id,
    amount_paid,
    payment_method,
    membership_tier,
    transaction_date,
    created_at
  FROM public.payment_transactions_history
  WHERE DATE_TRUNC('month', COALESCE(transaction_date::timestamp with time zone, created_at)) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
),
all_students_debt AS (
  SELECT 
    COALESCE(SUM(current_debt_amount), 0) AS total_receivable,
    COUNT(CASE WHEN current_debt_amount > 0 THEN 1 END) AS total_debtors_count
  FROM public.profiles
  WHERE role IN ('student', 'alumno')
)
SELECT 
  DATE_TRUNC('month', CURRENT_TIMESTAMP)::date AS current_month,
  COALESCE(SUM(p.amount_paid), 0) AS total_monthly_revenue,
  COALESCE(SUM(CASE WHEN p.membership_tier = 'cuota_clase_50' THEN p.amount_paid ELSE 0 END), 0) AS revenue_class_50,
  COALESCE(SUM(CASE WHEN p.membership_tier = 'plan_pro_99' THEN p.amount_paid ELSE 0 END), 0) AS revenue_pro_99,
  COALESCE(SUM(CASE WHEN p.membership_tier = 'pack_familiar_elite_149' THEN p.amount_paid ELSE 0 END), 0) AS revenue_family_elite_149,
  COUNT(p.id) AS total_transactions_count,
  d.total_receivable,
  d.total_debtors_count,
  CURRENT_TIMESTAMP AS calculated_at
FROM all_students_debt d
LEFT JOIN current_month_payments p ON true
GROUP BY d.total_receivable, d.total_debtors_count;

-- 5. FUNCIÓN RPC: rpc_get_academy_monthly_balance
-- Función de alto rendimiento segura para la UX de Fintech Deportiva
CREATE OR REPLACE FUNCTION public.rpc_get_academy_monthly_balance(
  p_month_offset INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_target_date DATE := (CURRENT_DATE + (p_month_offset || ' month')::INTERVAL)::DATE;
  v_start_month TIMESTAMPTZ := DATE_TRUNC('month', v_target_date);
  v_end_month TIMESTAMPTZ := (DATE_TRUNC('month', v_target_date) + INTERVAL '1 month');
  v_total_revenue NUMERIC(12,2) := 0;
  v_rev_class_50 NUMERIC(12,2) := 0;
  v_rev_pro_99 NUMERIC(12,2) := 0;
  v_rev_elite_149 NUMERIC(12,2) := 0;
  v_total_tx INTEGER := 0;
  v_total_receivable NUMERIC(12,2) := 0;
  v_debtors_count INTEGER := 0;
  v_today_revenue NUMERIC(12,2) := 0;
  v_cash_in_hand NUMERIC(12,2) := 0;
  v_digital_transfers NUMERIC(12,2) := 0;
BEGIN
  -- Verificación de Seguridad ECC: Solo SuperAdmin y Head Coach pueden invocar el balance total
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  
  IF auth.role() <> 'service_role' AND (v_caller_role IS NULL OR v_caller_role NOT IN ('superadmin', 'coach', 'head_coach')) THEN
    RAISE EXCEPTION 'ACCESO DENEGADO (ECC-FINANCE-403): Solo SuperAdmin y Head Coach pueden consultar el balance global de la academia.';
  END IF;

  -- 1. Calcular Ingresos del Mes en Curso filtrados por Tiers
  SELECT 
    COALESCE(SUM(amount_paid), 0),
    COALESCE(SUM(CASE WHEN membership_tier = 'cuota_clase_50' OR amount_paid = 50 THEN amount_paid ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN membership_tier = 'plan_pro_99' OR amount_paid = 99 THEN amount_paid ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN membership_tier = 'pack_familiar_elite_149' OR amount_paid = 149 THEN amount_paid ELSE 0 END), 0),
    COUNT(id),
    COALESCE(SUM(CASE WHEN payment_method IN ('efectivo', 'efectivo_cancha') THEN amount_paid ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_method NOT IN ('efectivo', 'efectivo_cancha') THEN amount_paid ELSE 0 END), 0)
  INTO 
    v_total_revenue,
    v_rev_class_50,
    v_rev_pro_99,
    v_rev_elite_149,
    v_total_tx,
    v_cash_in_hand,
    v_digital_transfers
  FROM public.payment_transactions_history
  WHERE (COALESCE(transaction_date::timestamp with time zone, created_at) >= v_start_month)
    AND (COALESCE(transaction_date::timestamp with time zone, created_at) < v_end_month);

  -- 2. Ingresos de hoy
  SELECT COALESCE(SUM(amount_paid), 0)
  INTO v_today_revenue
  FROM public.payment_transactions_history
  WHERE (COALESCE(transaction_date::timestamp with time zone, created_at)::date = CURRENT_DATE);

  -- 3. Cuentas por Cobrar Totales (Adeudos de alumnos activos)
  SELECT 
    COALESCE(SUM(current_debt_amount), 0),
    COUNT(CASE WHEN current_debt_amount > 0 THEN 1 END)
  INTO 
    v_total_receivable,
    v_debtors_count
  FROM public.profiles
  WHERE role IN ('student', 'alumno');

  RETURN jsonb_build_object(
    'period', to_char(v_target_date, 'YYYY-MM'),
    'period_label', to_char(v_target_date, 'TMMonth YYYY'),
    'total_monthly_revenue', v_total_revenue,
    'today_revenue', v_today_revenue,
    'total_receivable', v_total_receivable,
    'debtors_count', v_debtors_count,
    'transactions_count', v_total_tx,
    'breakdown_by_tier', jsonb_build_object(
      'cuota_clase_50', v_rev_class_50,
      'plan_pro_99', v_rev_pro_99,
      'pack_familiar_elite_149', v_rev_elite_149
    ),
    'breakdown_by_method', jsonb_build_object(
      'cash_in_hand', v_cash_in_hand,
      'digital_transfers', v_digital_transfers
    ),
    'calculated_at', CURRENT_TIMESTAMP
  );
END;
$$;

-- 6. POLÍTICAS RLS BLINDADAS BAJO EL PROTOCOLO ECC
-- SuperAdmin y Coach tienen control total. Tutor (guardian) solo ve lo de su familia o pupilo. Alumno solo lo propio.
ALTER TABLE public.payment_transactions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas antiguas
DROP POLICY IF EXISTS "pay_history_select_policy" ON public.payment_transactions_history;
DROP POLICY IF EXISTS "pay_history_write_policy" ON public.payment_transactions_history;
DROP POLICY IF EXISTS "payments_select_isolation" ON public.payment_transactions_history;
DROP POLICY IF EXISTS "payments_insert_coach" ON public.payment_transactions_history;
DROP POLICY IF EXISTS "Acceso total a payment_transactions_history" ON public.payment_transactions_history;
DROP POLICY IF EXISTS "ecc_pay_history_select" ON public.payment_transactions_history;
DROP POLICY IF EXISTS "ecc_pay_history_manage" ON public.payment_transactions_history;

-- RLS ECC: Consulta de Transacciones (payment_transactions_history)
CREATE POLICY "ecc_pay_history_select" 
ON public.payment_transactions_history
FOR SELECT
TO authenticated
USING (
  auth.role() = 'service_role'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach', 'head_coach')
  OR student_id = auth.uid()
  OR (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('guardian', 'parent')
    AND student_id IN (
      SELECT id FROM public.profiles 
      WHERE guardian_id = auth.uid() 
         OR linked_student_name = full_name 
         OR (SELECT student_id FROM public.profiles WHERE id = auth.uid()) = id
    )
  )
);

-- RLS ECC: Escritura y Gestión (payment_transactions_history)
CREATE POLICY "ecc_pay_history_manage" 
ON public.payment_transactions_history
FOR ALL
TO authenticated
USING (
  auth.role() = 'service_role'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach', 'head_coach')
)
WITH CHECK (
  auth.role() = 'service_role'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach', 'head_coach')
);

-- Limpieza de políticas en membership_payments
DROP POLICY IF EXISTS "membership_payments_all" ON public.membership_payments;
DROP POLICY IF EXISTS "membership_payments_coach_manage" ON public.membership_payments;
DROP POLICY IF EXISTS "membership_payments_student_select" ON public.membership_payments;
DROP POLICY IF EXISTS "Lectura y registro de membership_payments" ON public.membership_payments;
DROP POLICY IF EXISTS "ecc_membership_payments_select" ON public.membership_payments;
DROP POLICY IF EXISTS "ecc_membership_payments_manage" ON public.membership_payments;

-- RLS ECC: Consulta (membership_payments)
CREATE POLICY "ecc_membership_payments_select" 
ON public.membership_payments
FOR SELECT
TO authenticated
USING (
  auth.role() = 'service_role'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach', 'head_coach')
  OR student_id = auth.uid()
  OR (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('guardian', 'parent')
    AND student_id IN (
      SELECT id FROM public.profiles 
      WHERE guardian_id = auth.uid() 
         OR linked_student_name = full_name 
         OR (SELECT student_id FROM public.profiles WHERE id = auth.uid()) = id
    )
  )
);

-- RLS ECC: Gestión (membership_payments)
CREATE POLICY "ecc_membership_payments_manage" 
ON public.membership_payments
FOR ALL
TO authenticated
USING (
  auth.role() = 'service_role'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach', 'head_coach')
)
WITH CHECK (
  auth.role() = 'service_role'
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'coach', 'head_coach')
);

-- 7. ÍNDICES DE ARQUITECTURA FINTECH ECC
CREATE INDEX IF NOT EXISTS idx_ecc_pay_history_tier ON public.payment_transactions_history(membership_tier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecc_pay_history_date ON public.payment_transactions_history(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_ecc_membership_tier ON public.membership_payments(membership_tier, payment_date DESC);
