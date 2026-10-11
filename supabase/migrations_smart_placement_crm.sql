-- ==============================================================================
-- WILD WOLVES CDMX - MOTOR AUTÓNOMO DE COLOCACIÓN Y CRM DEPORTIVO
-- Sede Oficial: Deportivo Carmen Serdán
-- ==============================================================================

-- 1. EXTENDER TABLA PROFILES CON CAMPOS CRM Y TIERS
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS current_tier TEXT DEFAULT 'principiante',
ADD COLUMN IF NOT EXISTS crm_status TEXT DEFAULT 'activo', -- 'prospecto', 'activo', 'inactivo_retorno', 'en_riesgo'
ADD COLUMN IF NOT EXISTS days_inactive INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attended_at DATE DEFAULT CURRENT_DATE;

-- 2. FUNCIÓN DE CÁLCULO DE TIER BASADO EN BASELINE DE DÍA 1 / RETORNO
CREATE OR REPLACE FUNCTION public.calculate_student_tier(
  p_laps INT,
  p_rope INT,
  p_pushups INT,
  p_form TEXT
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_tier TEXT := 'principiante';
BEGIN
  -- Lógica de los 9 Niveles Biológicos Wild Wolves:
  -- Tier 9: Ultra Instinto (20+ vueltas, 800+ cuerda, 50+ lagartijas pie sobre pie)
  IF (p_laps >= 20 AND p_rope >= 800 AND p_pushups >= 50 AND p_form = 'pie_sobre_pie') THEN
    v_tier := 'ultra_instinto';
  -- Tier 8: Titán Wolf
  ELSIF (p_laps >= 15 AND p_rope >= 600 AND p_pushups >= 40) THEN
    v_tier := 'titan_wolf';
  -- Tier 7: Bestia Alfa
  ELSIF (p_laps >= 12 AND p_rope >= 400 AND p_pushups >= 30) THEN
    v_tier := 'bestia_alfa';
  -- Tier 6: Élite
  ELSIF (p_laps >= 10 AND p_rope >= 300 AND p_pushups >= 25) THEN
    v_tier := 'elite';
  -- Tier 5: Militar
  ELSIF (p_laps >= 8 AND p_rope >= 200 AND p_pushups >= 20) THEN
    v_tier := 'militar';
  -- Tier 4: Avanzado
  ELSIF (p_laps >= 6 AND p_rope >= 100 AND p_pushups >= 15) THEN
    v_tier := 'avanzado';
  -- Tier 3: Intermedio
  ELSIF (p_laps >= 4 AND p_rope >= 60 AND p_pushups >= 12) THEN
    v_tier := 'intermedio';
  -- Tier 2: Básico
  ELSIF (p_laps >= 3 OR p_rope >= 40 OR p_pushups >= 8) THEN
    v_tier := 'basico';
  -- Tier 1: Principiante
  ELSE
    v_tier := 'principiante';
  END IF;

  RETURN v_tier;
END;
$$;

-- 3. TRIGGER AUTOMÁTICO EN STUDENT_INITIAL_BASELINE
CREATE OR REPLACE FUNCTION public.handle_baseline_tier_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_tier TEXT;
BEGIN
  v_new_tier := public.calculate_student_tier(
    COALESCE(NEW.initial_laps_completed, 0),
    COALESCE(NEW.initial_jump_rope_max, 0),
    COALESCE(NEW.initial_squats_count, 0),
    COALESCE(NEW.initial_pushups_form, 'hincado')
  );

  UPDATE public.profiles
  SET 
    current_tier = v_new_tier,
    crm_status = 'activo',
    days_inactive = 0,
    last_attended_at = CURRENT_DATE
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_baseline_tier_update ON public.student_initial_baseline;
CREATE TRIGGER trg_baseline_tier_update
AFTER INSERT OR UPDATE ON public.student_initial_baseline
FOR EACH ROW
EXECUTE FUNCTION public.handle_baseline_tier_update();
