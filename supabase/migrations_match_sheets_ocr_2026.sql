-- ==============================================================================
-- WILD WOLVES BASKETBALL ACADEMY OS - MIGRACIÓN OFICIAL PERFILES & HOJAS DE PARTIDO
-- Sede: Deportivo Carmen Serdán | Cdmx 2026
-- ==============================================================================

-- 1. ASEGURAR COLUMNAS OFICIALES Y ROLES EN 'profiles'
DO $$
BEGIN
  -- Asegurar columna role
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'student';
  END IF;

  -- Asegurar columna full_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;

  -- Asegurar columna current_debt_amount
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_debt_amount') THEN
    ALTER TABLE public.profiles ADD COLUMN current_debt_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00;
  END IF;

  -- Asegurar columna financial_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'financial_status') THEN
    ALTER TABLE public.profiles ADD COLUMN financial_status TEXT NOT NULL DEFAULT 'al_corriente';
  END IF;

  -- Asegurar columna current_tier
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_tier') THEN
    ALTER TABLE public.profiles ADD COLUMN current_tier TEXT NOT NULL DEFAULT 'Iniciación';
  END IF;

  -- Asegurar columna jersey_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'jersey_number') THEN
    ALTER TABLE public.profiles ADD COLUMN jersey_number INT DEFAULT 0;
  END IF;

  -- Asegurar columna category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'category') THEN
    ALTER TABLE public.profiles ADD COLUMN category TEXT DEFAULT 'U-17 Competitivo';
  END IF;

  -- Asegurar columna position
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'position') THEN
    ALTER TABLE public.profiles ADD COLUMN position TEXT DEFAULT 'GUARD';
  END IF;

  -- Asegurar columna linked_student_id para tutores
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linked_student_id') THEN
    ALTER TABLE public.profiles ADD COLUMN linked_student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. TABLA PARA HOJAS OFICIALES DE PARTIDO ESCANEADAS POR OCR (match_sheets_scans)
CREATE TABLE IF NOT EXISTS public.match_sheets_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_date DATE NOT NULL DEFAULT CURRENT_DATE,
  opponent_name TEXT DEFAULT 'Rival Duela',
  tournament_name TEXT DEFAULT 'Liga Carmen Serdán',
  document_image_url TEXT,
  raw_ocr_text TEXT,
  points_scored INT NOT NULL DEFAULT 0,
  three_pointers_made INT NOT NULL DEFAULT 0,
  two_pointers_made INT NOT NULL DEFAULT 0,
  free_throws_made INT NOT NULL DEFAULT 0,
  field_goal_percentage NUMERIC(5,2) DEFAULT 0.00,
  free_throw_percentage NUMERIC(5,2) DEFAULT 0.00,
  rebounds INT DEFAULT 0,
  assists INT DEFAULT 0,
  steals INT DEFAULT 0,
  blocks INT DEFAULT 0,
  fouls INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  coach_signature_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para match_sheets_scans
ALTER TABLE public.match_sheets_scans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_sheets_scans' AND policyname = 'match_sheets_read_all') THEN
    CREATE POLICY match_sheets_read_all ON public.match_sheets_scans
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_sheets_scans' AND policyname = 'match_sheets_insert_coach') THEN
    CREATE POLICY match_sheets_insert_coach ON public.match_sheets_scans
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
