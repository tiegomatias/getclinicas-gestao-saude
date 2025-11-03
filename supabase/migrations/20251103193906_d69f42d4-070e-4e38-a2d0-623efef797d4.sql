-- Corrigir função cleanup_old_audit_logs para incluir search_path
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs();

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$;