-- Criar bucket para apostilas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apostilas',
  'apostilas',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf']::text[]
);

-- Criar tabela para gerenciar apostilas
CREATE TABLE IF NOT EXISTS public.apostilas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  category TEXT NOT NULL DEFAULT 'Geral',
  is_active BOOLEAN DEFAULT true,
  upload_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies para apostilas
ALTER TABLE public.apostilas ENABLE ROW LEVEL SECURITY;

-- Todos usuários autenticados podem visualizar apostilas ativas
CREATE POLICY "Authenticated users can view active apostilas"
  ON public.apostilas
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Apenas master admin pode gerenciar apostilas
CREATE POLICY "Master admins can manage apostilas"
  ON public.apostilas
  FOR ALL
  USING (is_master_admin());

-- RLS Policies para o bucket de apostilas
CREATE POLICY "Anyone authenticated can view apostilas files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'apostilas' AND auth.uid() IS NOT NULL);

CREATE POLICY "Master admins can upload apostilas"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'apostilas' AND is_master_admin());

CREATE POLICY "Master admins can update apostilas"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'apostilas' AND is_master_admin());

CREATE POLICY "Master admins can delete apostilas"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'apostilas' AND is_master_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_apostilas_updated_at
  BEFORE UPDATE ON public.apostilas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
