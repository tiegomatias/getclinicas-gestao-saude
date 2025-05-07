import { Database } from '@/integrations/supabase/types';
import { PostgrestError } from '@supabase/supabase-js';

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

// Define a more precise type for the user_roles table structure
// These will be used for type assertion when interacting with Supabase
export type DbUUID = string;
export type DbRole = Database['public']['Enums']['app_role'];

// Define a type for the user_roles table structure
export interface UserRole {
  id?: string;
  user_id: DbUUID;
  role: DbRole;
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

// Define type for Prescription specifically for form use
export interface Prescription {
  id: string;
  medication_id: string;
  patient_id: string;
  patient: {
    id: string;
    name: string;
  };
  medication: {
    id: string;
    name: string;
    dosage: string;
  };
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string | null; // Changed from required to optional to match MedicationPrescription
  status: string;
  observations?: string | null;
}

// Helper function to safely parse database response data to specific types
export function parseDbResult<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data as T[];
  }
  return [];
}

// Helper function to safely cast database objects to application types
export function safelyParseObject<T>(obj: any): T | null {
  if (!obj) return null;
  if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null && !('error' in obj)) {
    return obj as T;
  }
  return null;
}

// Helper function to safely parse arrays from database responses
export function safelyParseArray<T>(arr: any): T[] {
  if (!arr) return [];
  if (Array.isArray(arr)) {
    return arr.filter(item => typeof item === 'object' && !('error' in item)) as T[];
  }
  return [];
}

// Type guard to check if an object is a Supabase error
export function isSupabaseError(obj: any): boolean {
  return obj && typeof obj === 'object' && 'error' in obj;
}

// Function to check if a result is a PostgrestError
export function isPostgrestError(result: any): result is PostgrestError {
  return result && typeof result === 'object' && 'code' in result && 'message' in result;
}

// Define specific types for Supabase data filtering
export type SupabaseDataResponse<T> = T[] | null;

// RLS Policy helpers - to help with casting string to DB native types
export const asDbUUID = (id: string): unknown => id as unknown as DbUUID;
export const asDbRole = (role: string): unknown => role as unknown as DbRole;

// Enhanced helper function for database operations with proper type casting
export function castDbInsert<T>(data: Record<string, unknown>): any {
  return data as any;
}
