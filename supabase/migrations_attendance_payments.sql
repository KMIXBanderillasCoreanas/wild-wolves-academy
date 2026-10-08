-- ==============================================================================
-- WILD WOLVES CDMX - ACTUALIZACIÓN OFICIAL EN SUPABASE SQL EDITOR
-- ASISTENCIA DIARIA, COMPROMISOS Y REGISTRO DE COBROS DE MEMBRESÍA
-- ==============================================================================
-- Copia y pega este script completo en tu Supabase SQL Editor y presiona "RUN"

-- 1. EXTENSIÓN DE COLUMNAS EN ATTENDANCE_COMMITMENTS
ALTER TABLE IF EXISTS public.attendance_commitments 
ADD COLUMN IF NOT EXISTS frequency_type TEXT DEFAULT 'cada_3er_dia';

-- 2. TABLA DE ASISTENCIA DIARIA (daily_attendance)
CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift TEXT NOT NULL CHECK (shift IN ('matutino_9_11', 'vespertino_5_7')),
  status TEXT NOT NULL CHECK (status IN ('presente', 'falta', 'retardo', 'justificado')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_student_date_shift UNIQUE(student_id, date, shift)
);

-- Si la tabla ya existía previamente con columna 'session_date', normalizar a 'date'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'daily_attendance' AND column_name = 'session_date'
  ) THEN
    ALTER TABLE public.daily_attendance RENAME COLUMN session_date TO date;
  END IF;
END $$;

-- Habilitar RLS en daily_attendance
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura y registro de daily_attendance" ON public.daily_attendance;
CREATE POLICY "Lectura y registro de daily_attendance"
ON public.daily_attendance FOR ALL
USING (true)
WITH CHECK (true);

-- 3. TABLA DE CONTROL DE COBRANZA Y PAGOS (membership_payments)
CREATE TABLE IF NOT EXISTS public.membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 50,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'efectivo',
  concept TEXT NOT NULL DEFAULT 'clase_individual',
  status TEXT NOT NULL DEFAULT 'pagado',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en membership_payments
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura y registro de membership_payments" ON public.membership_payments;
CREATE POLICY "Lectura y registro de membership_payments"
ON public.membership_payments FOR ALL
USING (true)
WITH CHECK (true);

-- 4. ÍNDICES DE RENDIMIENTO EN PRODUCCIÓN
CREATE INDEX IF NOT EXISTS idx_daily_attendance_lookup 
ON public.daily_attendance(student_id, date, shift);

CREATE INDEX IF NOT EXISTS idx_membership_payments_student 
ON public.membership_payments(student_id, payment_date DESC);
