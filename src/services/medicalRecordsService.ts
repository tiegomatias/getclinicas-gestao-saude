import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MedicalRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id?: string;
  record_type: string;
  title: string;
  content: string;
  diagnosis?: string;
  treatment_plan?: string;
  vital_signs?: any;
  attachments?: string[];
  is_confidential?: boolean;
  record_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateMedicalRecordData {
  patient_id: string;
  professional_id?: string;
  record_type: string;
  title: string;
  content: string;
  diagnosis?: string;
  treatment_plan?: string;
  vital_signs?: any;
  is_confidential?: boolean;
  record_date?: string;
}

export const medicalRecordsService = {
  async getRecords(clinicId: string, recordType?: string): Promise<MedicalRecord[]> {
    try {
      let query = supabase
        .from("medical_records")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (recordType) {
        query = query.eq("record_type", recordType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching medical records:", error);
      toast.error("Erro ao carregar registros médicos");
      return [];
    }
  },

  async getRecordsByPatient(clinicId: string, patientId: string, recordType?: string): Promise<MedicalRecord[]> {
    try {
      let query = supabase
        .from("medical_records")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (recordType) {
        query = query.eq("record_type", recordType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching patient records:", error);
      toast.error("Erro ao carregar registros do paciente");
      return [];
    }
  },

  async createRecord(clinicId: string, data: CreateMedicalRecordData): Promise<MedicalRecord | null> {
    try {
      const { data: record, error } = await supabase
        .from("medical_records")
        .insert({
          ...data,
          clinic_id: clinicId,
          record_date: data.record_date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Registro criado com sucesso!");
      return record;
    } catch (error: any) {
      console.error("Error creating medical record:", error);
      toast.error("Erro ao criar registro");
      return null;
    }
  },

  async updateRecord(id: string, data: Partial<CreateMedicalRecordData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("medical_records")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast.success("Registro atualizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error updating medical record:", error);
      toast.error("Erro ao atualizar registro");
      return false;
    }
  },

  async deleteRecord(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Registro excluído com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error deleting medical record:", error);
      toast.error("Erro ao excluir registro");
      return false;
    }
  },
};
