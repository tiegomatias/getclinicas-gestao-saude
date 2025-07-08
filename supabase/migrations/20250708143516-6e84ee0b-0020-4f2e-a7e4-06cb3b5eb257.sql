-- Tables for Food Management (Alimentação module)
CREATE TABLE public.food_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  expiration_date TIMESTAMP WITH TIME ZONE,
  supplier TEXT,
  cost_per_unit DECIMAL(10,2),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'expired', 'low_stock', 'out_of_stock')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  purchase_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  food_item_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  purchased BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table for Calendar module
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id),
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('consultation', 'therapy', 'medical_exam', 'procedure', 'follow_up', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  location TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clinic Settings table
CREATE TABLE public.clinic_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL UNIQUE,
  business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "sunday": {"closed": true}}',
  notification_settings JSONB DEFAULT '{"email_notifications": true, "sms_notifications": false, "appointment_reminders": true}',
  medication_settings JSONB DEFAULT '{"auto_reorder": false, "low_stock_threshold": 10, "expiry_alert_days": 30}',
  general_settings JSONB DEFAULT '{"timezone": "America/Sao_Paulo", "language": "pt-BR", "currency": "BRL"}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical Records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('admission', 'consultation', 'therapy_session', 'medical_procedure', 'discharge', 'emergency', 'other')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  vital_signs JSONB,
  diagnosis TEXT,
  treatment_plan TEXT,
  attachments TEXT[], -- Array of file URLs
  is_confidential BOOLEAN DEFAULT false,
  record_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Food Consumption table (for tracking patient meals)
CREATE TABLE public.food_consumption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items JSONB NOT NULL, -- {"items": [{"name": "Rice", "quantity": "100g"}, {"name": "Beans", "quantity": "50g"}]}
  consumption_date DATE NOT NULL DEFAULT CURRENT_DATE,
  consumption_time TIME NOT NULL DEFAULT CURRENT_TIME,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.food_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_consumption ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Food Inventory
CREATE POLICY "Clinic users can manage food inventory"
ON public.food_inventory
FOR ALL
USING (is_clinic_member(clinic_id) OR is_master_admin());

-- RLS Policies for Shopping Lists
CREATE POLICY "Clinic users can manage shopping lists"
ON public.shopping_lists
FOR ALL
USING (is_clinic_member(clinic_id) OR is_master_admin());

CREATE POLICY "Clinic users can manage shopping list items"
ON public.shopping_list_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists sl
    WHERE sl.id = shopping_list_items.shopping_list_id
    AND (is_clinic_member(sl.clinic_id) OR is_master_admin())
  )
);

-- RLS Policies for Appointments
CREATE POLICY "Clinic users can manage appointments"
ON public.appointments
FOR ALL
USING (is_clinic_member(clinic_id) OR is_master_admin());

-- RLS Policies for Clinic Settings
CREATE POLICY "Clinic users can manage their clinic settings"
ON public.clinic_settings
FOR ALL
USING (is_clinic_member(clinic_id) OR is_master_admin());

-- RLS Policies for Medical Records
CREATE POLICY "Clinic users can manage medical records"
ON public.medical_records
FOR ALL
USING (is_clinic_member(clinic_id) OR is_master_admin());

-- RLS Policies for Food Consumption
CREATE POLICY "Clinic users can manage food consumption"
ON public.food_consumption
FOR ALL
USING (is_clinic_member(clinic_id) OR is_master_admin());

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_food_inventory_updated_at
  BEFORE UPDATE ON public.food_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_settings_updated_at
  BEFORE UPDATE ON public.clinic_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default clinic settings for existing clinics
INSERT INTO public.clinic_settings (clinic_id)
SELECT id FROM public.clinics
WHERE id NOT IN (SELECT clinic_id FROM public.clinic_settings);

-- Add indexes for better performance
CREATE INDEX idx_food_inventory_clinic_id ON public.food_inventory(clinic_id);
CREATE INDEX idx_food_inventory_category ON public.food_inventory(category);
CREATE INDEX idx_food_inventory_status ON public.food_inventory(status);

CREATE INDEX idx_shopping_lists_clinic_id ON public.shopping_lists(clinic_id);
CREATE INDEX idx_shopping_lists_status ON public.shopping_lists(status);

CREATE INDEX idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);

CREATE INDEX idx_medical_records_clinic_id ON public.medical_records(clinic_id);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_record_date ON public.medical_records(record_date);

CREATE INDEX idx_food_consumption_clinic_id ON public.food_consumption(clinic_id);
CREATE INDEX idx_food_consumption_patient_id ON public.food_consumption(patient_id);
CREATE INDEX idx_food_consumption_date ON public.food_consumption(consumption_date);