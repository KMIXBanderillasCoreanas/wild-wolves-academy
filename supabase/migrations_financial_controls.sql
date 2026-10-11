-- ==============================================================================
-- WILD WOLVES CDMX - MIGRACIÓN: FINANCIAL CONTROLS, PARTIAL PAYMENTS & USER ROLES
-- Sede Oficial: Deportivo Carmen Serdán
-- ==============================================================================

-- 1. EXTENDER TABLA PROFILES
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS financial_status TEXT DEFAULT 'al_corriente',
ADD COLUMN IF NOT EXISTS current_debt_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS training_days TEXT DEFAULT 'Lun-Mié-Vie',
ADD COLUMN IF NOT EXISTS training_schedule TEXT DEFAULT 'Vespertino: 17:00 - 19:00',
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'alumno';

-- 2. TABLA DE HISTORIAL DE TRANSACCIONES Y ARQUEO DE CAJA
CREATE TABLE IF NOT EXISTS public.payment_transactions_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  previous_debt NUMERIC NOT NULL DEFAULT 0,
  remaining_debt NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'efectivo', -- 'efectivo' | 'spei' | 'condonacion'
  transaction_type TEXT NOT NULL DEFAULT 'abono',  -- 'pago_completo' | 'abono' | 'perdon_adeudo'
  notes TEXT,
  venue TEXT NOT NULL DEFAULT 'Deportivo Carmen Serdán',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en payment_transactions_history
ALTER TABLE public.payment_transactions_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a payment_transactions_history" ON public.payment_transactions_history;
CREATE POLICY "Acceso total a payment_transactions_history"
ON public.payment_transactions_history FOR ALL
USING (true)
WITH CHECK (true);

-- 3. ÍNDICES DE ARQUEO
CREATE INDEX IF NOT EXISTS idx_trans_student_created
ON public.payment_transactions_history(student_id, created_at DESC);
