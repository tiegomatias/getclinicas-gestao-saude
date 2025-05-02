
import { supabase } from "@/lib/supabase";
import type { Patient } from "@/lib/types";
import { toast } from "sonner";

export const patientService = {
  // Buscar todos os pacientes de uma clínica
  async getClinicPatients(clinicId: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar pacientes da clínica ${clinicId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  // Buscar um paciente específico
  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar paciente com ID ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  // Criar um novo paciente
  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    // Garantir que os campos obrigatórios estejam presentes
    if (!patientData.name) {
      throw new Error("O nome do paciente é obrigatório");
    }
    
    if (!patientData.admission_type) {
      throw new Error("O tipo de admissão é obrigatório");
    }
    
    // Definir status padrão se não for fornecido
    if (!patientData.status) {
      patientData.status = 'active';
    }
    
    // Criar um objeto que satisfaz os requisitos de tipo do Supabase
    const patientToInsert = {
      name: patientData.name,
      admission_type: patientData.admission_type,
      clinic_id: patientData.clinic_id,
      admission_date: patientData.admission_date,
      emergency_contact: patientData.emergency_contact,
      medical_record: patientData.medical_record,
      phone: patientData.phone,
      status: patientData.status,
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert(patientToInsert)
      .select();
      
    if (error) {
      console.error("Erro ao criar paciente:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after creating patient");
    }
    
    return data[0];
  },
  
  // Atualizar um paciente existente
  async updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Erro ao atualizar paciente com ID ${id}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after updating patient");
    }
    
    return data[0];
  },
  
  // Excluir um paciente
  async deletePatient(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao excluir paciente com ID ${id}:`, error);
      throw error;
    }
  }
};
