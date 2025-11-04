-- Corrigir função is_master_admin para verificar pelo email correto
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users
    WHERE id = auth.uid()
    AND email = 'tiego@getclinicas.com'
  );
$$;