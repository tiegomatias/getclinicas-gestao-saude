-- Atualiza a função is_master_admin para verificar o novo email do master
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND name = 'tiego@getclinicas.com'
  );
$$;