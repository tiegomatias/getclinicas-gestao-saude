
import { supabase } from "@/integrations/supabase/client";
import type { Clinic } from "@/lib/types";

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
      beds_capacity: item.beds_capacity || 30,
      occupied_beds: item.occupied_beds || 0,
      available_beds: item.available_beds || 30,
      maintenance_beds: item.maintenance_beds || 0,
      created_at: item.created_at || '',
      has_beds_data: item.has_beds_data || false,
      has_initial_data: item.has_initial_data || false
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
      beds_capacity: data.beds_capacity || 30,
      occupied_beds: data.occupied_beds || 0,
      available_beds: data.available_beds || 30,
      maintenance_beds: data.maintenance_beds || 0,
      created_at: data.created_at || '',
      has_beds_data: data.has_beds_data || false,
      has_initial_data: data.has_initial_data || false
    };
  },
  
  // Criar uma nova clínica
  async createClinic(clinicData: Partial<Clinic>): Promise<Clinic> {
    // Transform from our Clinic type to the database schema
    const dbClinicData = {
      name: clinicData.clinic_name || '',
      admin_email: clinicData.admin_email || '',
      admin_id: '', // This should be set to the current user ID
      plan: clinicData.plan || 'basic',
      beds_capacity: clinicData.beds_capacity || 30,
      occupied_beds: 0,
      available_beds: clinicData.beds_capacity || 30,
      maintenance_beds: 0,
      has_beds_data: false,
      has_initial_data: false
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
      beds_capacity: data[0].beds_capacity || 30,
      occupied_beds: data[0].occupied_beds || 0,
      available_beds: data[0].available_beds || 30,
      maintenance_beds: data[0].maintenance_beds || 0,
      created_at: data[0].created_at || '',
      has_beds_data: data[0].has_beds_data || false,
      has_initial_data: data[0].has_initial_data || false
    };
  },
  
  // Atualizar uma clínica existente
  async updateClinic(id: string, clinicData: Partial<Clinic>): Promise<Clinic> {
    // Transform from our Clinic type to the database schema
    const dbClinicData: any = {};
    
    if (clinicData.clinic_name !== undefined) dbClinicData.name = clinicData.clinic_name;
    if (clinicData.admin_email !== undefined) dbClinicData.admin_email = clinicData.admin_email;
    if (clinicData.plan !== undefined) dbClinicData.plan = clinicData.plan;
    if (clinicData.beds_capacity !== undefined) dbClinicData.beds_capacity = clinicData.beds_capacity;
    if (clinicData.has_beds_data !== undefined) dbClinicData.has_beds_data = clinicData.has_beds_data;
    if (clinicData.has_initial_data !== undefined) dbClinicData.has_initial_data = clinicData.has_initial_data;
    
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
      beds_capacity: data[0].beds_capacity || 30,
      occupied_beds: data[0].occupied_beds || 0,
      available_beds: data[0].available_beds || 30,
      maintenance_beds: data[0].maintenance_beds || 0,
      created_at: data[0].created_at || '',
      has_beds_data: data[0].has_beds_data || false,
      has_initial_data: data[0].has_initial_data || false
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
