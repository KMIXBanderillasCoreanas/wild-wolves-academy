-- ==============================================================================
-- HOOPPERFORMANCE OS (v0.3.0) - POSTGRESQL & ROW LEVEL SECURITY (RLS) SCHEMA
-- Wild Wolves Basketball Academy
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('coach', 'alumno');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'unpaid');
CREATE TYPE player_position AS ENUM (
  'Point Guard (PG)', 
  'Shooting Guard (SG)', 
  'Small Forward (SF)', 
  'Power Forward (PF)', 
  'Center (C)'
);

-- 2. Profiles Table (RBAC Core)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'alumno',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Athletes Table
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  jersey_number INT NOT NULL,
  position player_position NOT NULL,
  age INT NOT NULL,
  height TEXT NOT NULL,
  weight TEXT NOT NULL,
  category TEXT NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'Elite Wolf Pack',
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Test Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id),
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  coach_notes TEXT,
  personal_record_achieved BOOLEAN DEFAULT FALSE,
  -- Biomechanical Radar Scores (0 - 100)
  shooting INT NOT NULL CHECK (shooting BETWEEN 0 AND 100),
  ball_handling INT NOT NULL CHECK (ball_handling BETWEEN 0 AND 100),
  vertical_jump INT NOT NULL CHECK (vertical_jump BETWEEN 0 AND 100),
  agility_speed INT NOT NULL CHECK (agility_speed BETWEEN 0 AND 100),
  defensive_iq INT NOT NULL CHECK (defensive_iq BETWEEN 0 AND 100),
  stamina_fitness INT NOT NULL CHECK (stamina_fitness BETWEEN 0 AND 100),
  -- Raw athletic combine recordings
  vertical_jump_inches NUMERIC(4, 1),
  three_point_pct NUMERIC(4, 1),
  free_throw_pct NUMERIC(4, 1),
  lane_agility_seconds NUMERIC(4, 2),
  beep_test_level NUMERIC(4, 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if current user is Coach
CREATE OR REPLACE FUNCTION is_coach() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'coach'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Users can read their own profile" 
ON profiles FOR SELECT USING (auth.uid() = id OR is_coach());

CREATE POLICY "Users can update their own profile info" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS POLICIES FOR ATHLETES
CREATE POLICY "Athletes and Coaches can view athlete records" 
ON athletes FOR SELECT USING (true);

CREATE POLICY "Only Coaches can insert or update athletes" 
ON athletes FOR ALL USING (is_coach());

-- RLS POLICIES FOR EVALUATIONS (STRICT RBAC ENFORCEMENT)
-- READ: Anyone authenticated (or public scouts if link shared) can view evaluations
CREATE POLICY "Athletes and coaches can view test evaluations" 
ON evaluations FOR SELECT USING (true);

-- WRITE / UPDATE / DELETE: STRICTLY restricted to Coaches
CREATE POLICY "Only Coaches can record evaluations" 
ON evaluations FOR INSERT WITH CHECK (is_coach());

CREATE POLICY "Only Coaches can update evaluations" 
ON evaluations FOR UPDATE USING (is_coach());

CREATE POLICY "Only Coaches can delete evaluations" 
ON evaluations FOR DELETE USING (is_coach());
