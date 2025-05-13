
export interface Clinic {
  id: string;
  clinic_name: string;
  admin_name: string;
  admin_email: string;
  plan: string;
  beds_capacity: number;
  occupied_beds: number;
  available_beds: number;
  maintenance_beds: number;
  created_at: string;
  has_beds_data: boolean;
  has_initial_data: boolean;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  admission_date: string;
  admission_type: string;
  status: string;
  phone?: string;
  medical_record?: string;
  emergency_contact?: string;
  created_at: string;
}

export interface Professional {
  id: string;
  clinic_id: string;
  name: string;
  profession: string;
  license?: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
}

export interface Bed {
  id: string;
  clinic_id: string;
  bed_number: string;
  bed_type: string;
  status: string;
  patient_id?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  clinic_id: string;
  title: string;
  description?: string;
  activity_type: string;
  start_time: string;
  end_time: string;
  professional_id?: string;
  created_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  patient_id: string;
  attendance_status: string;
  created_at: string;
}

export interface Admission {
  id: string;
  clinic_id: string;
  patient_id: string;
  bed_id?: string;
  admission_date: string;
  expected_discharge_date?: string;
  actual_discharge_date?: string;
  discharge_reason?: string;
  created_at: string;
}

export interface Document {
  id: string;
  clinic_id: string;
  patient_id: string;
  document_type: string;
  title: string;
  file_url?: string;
  created_by?: string;
  created_at: string;
}

export interface ClinicUser {
  id: string;
  clinic_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface StockHistoryEntry {
  id: string;
  medication_id: string;
  adjustment_type: string;
  quantity: number;
  notes?: string;
  created_at: string;
  created_by?: string;
  clinic_id: string;
}

export interface MedicationPrescription {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient: {
    id: string;
    name: string;
  };
  medication_id: string;
  medication: {
    id: string;
    name: string;
    dosage: string;
  };
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  status: string;
  observations?: string | null;
}

// Define a type for the user_roles table structure
export interface UserRole {
  id: string;
  user_id: string;
  role: 'master_admin' | 'clinic_admin' | 'user';
}

// Define type for Medication that aligns with database structure
export interface Medication {
  id: string;
  clinic_id: string;
  name: string;
  active: string;
  category: string;
  dosage: string;
  stock: number;
  status: string;
  manufacturer?: string;
  expiration_date?: string;
  batch_number?: string;
  observations?: string;
  created_at?: string;
  updated_at?: string;
}

// Define a utility type for type assertions with Supabase
export type SupabaseDataResponse<T> = T[] | null;
