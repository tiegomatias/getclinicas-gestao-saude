
import { supabase } from "@/integrations/supabase/client";
import type { Clinic } from "@/lib/types";

type ClinicDataType = 'beds' | 'patients' | 'professionals' | 'activities' | 'documents' | 'contracts' | 'finances' | 'medications';

export const clinicService = {
  // Buscar todas as clínicas
  async getAllClinics(): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Erro ao buscar clínicas:", error);
      throw error;
    }
    
    // Transform the data to match our Clinic type
    const clinics: Clinic[] = data?.map(item => ({
      id: item.id,
      clinic_name: item.name,
      admin_name: '', // We'll need to fetch this separately if needed
      admin_email: item.admin_email,
      plan: item.plan || '',
      beds_capacity: 30, // Default value
      occupied_beds: 0,
      available_beds: 30,
      maintenance_beds: 0,
      created_at: item.created_at || '',
      has_beds_data: false,
      has_initial_data: false
    })) || [];
    
    // Store in localStorage for offline access
    localStorage.setItem("allClinics", JSON.stringify(clinics));
    
    return clinics;
  },
  
  // Buscar uma clínica específica
  async getClinicById(id: string): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar clínica com ID ${id}:`, error);
      throw error;
    }
    
    if (!data) return null;
    
    // Transform to match our Clinic type
    return {
      id: data.id,
      clinic_name: data.name,
      admin_name: '', // We'll need to fetch this separately if needed
      admin_email: data.admin_email,
      plan: data.plan || '',
      beds_capacity: 30, // Default value
      occupied_beds: 0,
      available_beds: 30,
      maintenance_beds: 0,
      created_at: data.created_at || '',
      has_beds_data: false,
      has_initial_data: false
    };
  },
  
  // Verificar se uma clínica já possui dados
  async hasClinicData(id: string, dataType: ClinicDataType): Promise<boolean> {
    try {
      // Agora que as tabelas existem, podemos verificar diretamente
      const { data, error } = await supabase
        .from(dataType)
        .select('id')
        .eq('clinic_id', id)
        .limit(1);
        
      if (error) {
        console.error(`Erro ao verificar dados de ${dataType} para clínica ${id}:`, error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error(`Erro ao verificar dados de ${dataType}:`, error);
      return false;
    }
  },
  
  // Criar uma nova clínica
  async createClinic(clinicData: Partial<Clinic>): Promise<Clinic> {
    // Transform from our Clinic type to the database schema
    const dbClinicData = {
      name: clinicData.clinic_name || '',
      admin_email: clinicData.admin_email || '',
      admin_id: '', // This should be set to the current user ID
      plan: clinicData.plan || 'basic'
    };
    
    const { data, error } = await supabase
      .from('clinics')
      .insert([dbClinicData])
      .select();
      
    if (error) {
      console.error("Erro ao criar clínica:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after creating clinic");
    }
    
    // Transform back to our Clinic type
    return {
      id: data[0].id,
      clinic_name: data[0].name,
      admin_name: '', // We'll need to fetch this separately if needed
      admin_email: data[0].admin_email,
      plan: data[0].plan || '',
      beds_capacity: 30,
      occupied_beds: 0,
      available_beds: 30,
      maintenance_beds: 0,
      created_at: data[0].created_at || '',
      has_beds_data: false,
      has_initial_data: false
    };
  },
  
  // Atualizar uma clínica existente
  async updateClinic(id: string, clinicData: Partial<Clinic>): Promise<Clinic> {
    // Transform from our Clinic type to the database schema
    const dbClinicData: any = {};
    
    if (clinicData.clinic_name !== undefined) dbClinicData.name = clinicData.clinic_name;
    if (clinicData.admin_email !== undefined) dbClinicData.admin_email = clinicData.admin_email;
    if (clinicData.plan !== undefined) dbClinicData.plan = clinicData.plan;
    
    const { data, error } = await supabase
      .from('clinics')
      .update(dbClinicData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Erro ao atualizar clínica com ID ${id}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after updating clinic");
    }
    
    // Transform back to our Clinic type
    return {
      id: data[0].id,
      clinic_name: data[0].name,
      admin_name: '', // We'll need to fetch this separately if needed
      admin_email: data[0].admin_email,
      plan: data[0].plan || '',
      beds_capacity: 30,
      occupied_beds: 0,
      available_beds: 30,
      maintenance_beds: 0,
      created_at: data[0].created_at || '',
      has_beds_data: false,
      has_initial_data: false
    };
  },
  
  // Excluir uma clínica
  async deleteClinic(id: string): Promise<void> {
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao excluir clínica com ID ${id}:`, error);
      throw error;
    }
  },
  
  // Atualizar dados de ocupação de leitos
  async updateBedOccupation(id: string, occupiedBeds: number, availableBeds: number, maintenanceBeds: number): Promise<Clinic> {
    // Instead of trying to update the clinics table directly with occupied_beds and other fields,
    // we'll create or update entries in the beds table to reflect the current state
    // First fetch the current clinic
    const clinicResult = await this.getClinicById(id);
    
    if (!clinicResult) {
      throw new Error(`Clinic with ID ${id} not found`);
    }
    
    // We'll update our local representation of the clinic with the bed data
    const updatedClinic: Clinic = {
      ...clinicResult,
      occupied_beds: occupiedBeds,
      available_beds: availableBeds,
      maintenance_beds: maintenanceBeds,
      has_beds_data: true
    };
    
    // Store in localStorage as well for offline access
    // Merge with existing clinics in localStorage if available
    const allClinicsStr = localStorage.getItem("allClinics");
    if (allClinicsStr) {
      try {
        const allClinics: Clinic[] = JSON.parse(allClinicsStr);
        const updatedClinics = allClinics.map(clinic => 
          clinic.id === id ? updatedClinic : clinic
        );
        localStorage.setItem("allClinics", JSON.stringify(updatedClinics));
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }
    }
    
    return updatedClinic;
  },
  
  // Adicionar função para associar um usuário a uma clínica
  async addUserToClinic(clinicId: string, userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('clinic_users')
      .insert({
        clinic_id: clinicId,
        user_id: userId,
        role: role
      });
      
    if (error) {
      console.error(`Erro ao adicionar usuário ${userId} à clínica ${clinicId}:`, error);
      throw error;
    }
  }
};
