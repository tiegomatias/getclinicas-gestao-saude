-- Add missing fields to the patients table for complete patient registration data
ALTER TABLE public.patients 
ADD COLUMN birth_date DATE,
ADD COLUMN gender TEXT,
ADD COLUMN cpf TEXT,
ADD COLUMN rg TEXT,
ADD COLUMN email TEXT,
ADD COLUMN address TEXT,
ADD COLUMN responsible_name TEXT,
ADD COLUMN responsible_phone TEXT,
ADD COLUMN health_insurance TEXT,
ADD COLUMN insurance_number TEXT,
ADD COLUMN observations TEXT,
ADD COLUMN created_by UUID;

-- Add indexes for better performance
CREATE INDEX idx_patients_birth_date ON public.patients(birth_date);
CREATE INDEX idx_patients_gender ON public.patients(gender);
CREATE INDEX idx_patients_cpf ON public.patients(cpf);
CREATE INDEX idx_patients_created_by ON public.patients(created_by);