
import { supabase } from "@/integrations/supabase/client";
import type { Clinic } from "@/lib/types";
import { clinicService } from "./clinicService";

interface Bed {
  id: string;
  clinic_id: string;
  bed_number: string;
  bed_type: string;
  status: string;
  patient_id?: string;
  created_at: string;
}

interface PatientInfo {
  id: string;
  name: string;
  admission_date: string;
}

export const bedService = {
  // Buscar todos os leitos de uma clínica
  async getBedsByClinic(clinicId: string): Promise<Bed[]> {
    const { data, error } = await supabase
      .from('beds')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('bed_number', { ascending: true });

    if (error) {
      console.error(`Erro ao buscar leitos da clínica ${clinicId}:`, error);
      throw error;
    }

    return data || [];
  },

  // Buscar informações de pacientes para leitos ocupados
  async getPatientInfo(patientIds: string[]): Promise<Record<string, PatientInfo>> {
    if (patientIds.length === 0) return {};

    const { data, error } = await supabase
      .from('patients')
      .select('id, name, admission_date')
      .in('id', patientIds);

    if (error) {
      console.error('Erro ao buscar informações dos pacientes:', error);
      throw error;
    }

    const patientMap: Record<string, PatientInfo> = {};
    data?.forEach(patient => {
      patientMap[patient.id] = patient;
    });

    return patientMap;
  },

  // Criar um novo leito
  async createBed(bedData: Omit<Bed, 'id' | 'created_at'>): Promise<Bed> {
    const { data, error } = await supabase
      .from('beds')
      .insert(bedData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar leito:', error);
      throw error;
    }

    return data;
  },

  // Atualizar um leito
  async updateBed(bedId: string, updates: Partial<Bed>): Promise<Bed> {
    const { data, error } = await supabase
      .from('beds')
      .update(updates)
      .eq('id', bedId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar leito:', error);
      throw error;
    }

    return data;
  },

  // Deletar um leito
  async deleteBed(bedId: string): Promise<void> {
    const { error } = await supabase
      .from('beds')
      .delete()
      .eq('id', bedId);

    if (error) {
      console.error('Erro ao deletar leito:', error);
      throw error;
    }
  },

  // Atualizar dados de ocupação de leitos
  async updateBedOccupation(id: string, occupiedBeds: number, availableBeds: number, maintenanceBeds: number): Promise<Clinic> {
    // Agora podemos atualizar diretamente na tabela de clínicas
    const { data, error } = await supabase
      .from('clinics')
      .update({
        occupied_beds: occupiedBeds,
        available_beds: availableBeds,
        maintenance_beds: maintenanceBeds,
        has_beds_data: true
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Erro ao atualizar ocupação de leitos para clínica ${id}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after updating bed occupation");
    }
    
    // Agora retornamos a clínica atualizada
    return {
      id: data[0].id,
      clinic_name: data[0].name,
      admin_name: '', // We'll need to fetch this separately if needed
      admin_email: data[0].admin_email,
      plan: data[0].plan || '',
      beds_capacity: data[0].beds_capacity || 30,
      occupied_beds: data[0].occupied_beds,
      available_beds: data[0].available_beds,
      maintenance_beds: data[0].maintenance_beds,
      created_at: data[0].created_at || '',
      has_beds_data: data[0].has_beds_data,
      has_initial_data: data[0].has_initial_data || false
    };
  },

  // Recalcular contadores de leitos para uma clínica
  async recalculateBedCounters(clinicId: string): Promise<void> {
    const { error } = await supabase
      .rpc('recalculate_bed_counters', { clinic_uuid: clinicId });
      
    if (error) {
      console.error(`Erro ao recalcular contadores de leitos para clínica ${clinicId}:`, error);
      throw error;
    }
  }
};
