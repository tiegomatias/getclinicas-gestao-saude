-- Create storage buckets for documents and medical records
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('medical-records', 'medical-records', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);

-- RLS policies for documents bucket
CREATE POLICY "Clinic users can view their clinic documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);

CREATE POLICY "Clinic users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);

CREATE POLICY "Clinic users can update their clinic documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);

CREATE POLICY "Clinic users can delete their clinic documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);

-- RLS policies for medical-records bucket
CREATE POLICY "Clinic users can view their clinic medical records"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-records' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);

CREATE POLICY "Clinic users can upload medical records"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-records' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);

CREATE POLICY "Clinic users can update their clinic medical records"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'medical-records' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);

CREATE POLICY "Clinic users can delete their clinic medical records"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-records' AND
  EXISTS (
    SELECT 1 FROM clinic_users
    WHERE clinic_users.clinic_id::text = (storage.foldername(name))[1]
    AND clinic_users.user_id = auth.uid()
  )
);