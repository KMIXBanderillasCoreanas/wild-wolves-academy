-- supabase/20261104_create_security_audit_logs.sql
-- Wild Wolves OS: Lobo Centinela AI Security Guardian Audit Log Table

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT DEFAULT 'anon',
    user_role TEXT DEFAULT 'guest',
    ip_address TEXT DEFAULT 'unknown',
    threat_reason TEXT NOT NULL,
    threat_level TEXT DEFAULT 'ELEVATED', -- 'LOW', 'MEDIUM', 'ELEVATED', 'CRITICAL'
    action_target TEXT DEFAULT 'general',
    payload_sample TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexación para consultas de alto rendimiento en el Búnker SuperAdmin
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_threat_level ON public.security_audit_logs (threat_level);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_ip ON public.security_audit_logs (ip_address);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Política 1: Solo directores y SuperAdmins pueden consultar los logs de auditoría
DROP POLICY IF EXISTS "Superadmin audit read" ON public.security_audit_logs;
CREATE POLICY "Superadmin audit read" ON public.security_audit_logs
    FOR SELECT
    USING (
      auth.jwt() ->> 'email' IN ('wildwolvescdmx@gmail.com', 'ricardo@wildwolves.mx', 'director@wildwolves.mx', 'carlos@wildwolves.mx')
      OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
      )
    );

-- Política 2: Service Role y llamadas backend autorizadas pueden insertar eventos
DROP POLICY IF EXISTS "Service and backend insert audit logs" ON public.security_audit_logs;
CREATE POLICY "Service and backend insert audit logs" ON public.security_audit_logs
    FOR INSERT
    WITH CHECK (true);
