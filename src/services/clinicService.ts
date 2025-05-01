
import { supabase, isMockSupabase } from "@/lib/supabase";
import type { Clinic } from "@/lib/types";

export const clinicService = {
  // Buscar todas as clínicas
  async getAllClinics(): Promise<Clinic[]> {
    if (isMockSupabase) {
      // Return mock data from localStorage for local development
      const allClinics = JSON.parse(localStorage.getItem("allClinics") || "[]");
      return allClinics as Clinic[];
    }
    
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Erro ao buscar clínicas:", error);
      throw error;
    }
    
    return data as Clinic[];
  },
  
  // Buscar uma clínica específica
  async getClinicById(id: string): Promise<Clinic | null> {
    if (isMockSupabase) {
      // Return mock data from localStorage for local development
      const allClinics = JSON.parse(localStorage.getItem("allClinics") || "[]");
      return allClinics.find((clinic: Clinic) => clinic.id === id) || null;
    }
    
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar clínica com ID ${id}:`, error);
      throw error;
    }
    
    return data as Clinic;
  },
  
  // Verificar se uma clínica já possui dados
  async hasClinicData(id: string, dataType: string): Promise<boolean> {
    try {
      if (isMockSupabase) {
        // For local development, check localStorage
        const clinicData = JSON.parse(localStorage.getItem("clinicData") || "{}");
        
        // Check if the clinic has data for the specified type
        if (dataType === "beds" && clinicData.hasBedsData) return true;
        if (dataType === "professionals" && clinicData.professionals?.length) return true;
        if (dataType === "patients" && clinicData.patients?.length) return true;
        if (dataType === "activities" && clinicData.activities?.length) return true;
        if (dataType === "documents" && clinicData.documents?.length) return true;
        if (dataType === "contracts" && clinicData.contracts?.length) return true;
        
        return false;
      }
      
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
    const { data, error } = await supabase
      .from('clinics')
      .insert([{
        ...clinicData,
        beds_capacity: clinicData.beds_capacity || 30,
        occupied_beds: 0,
        available_beds: clinicData.beds_capacity || 30,
        maintenance_beds: 0,
        has_beds_data: false,
        has_initial_data: false
      }])
      .select();
      
    if (error) {
      console.error("Erro ao criar clínica:", error);
      throw error;
    }
    
    return data[0] as Clinic;
  },
  
  // Atualizar uma clínica existente
  async updateClinic(id: string, clinicData: Partial<Clinic>): Promise<Clinic> {
    const { data, error } = await supabase
      .from('clinics')
      .update(clinicData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Erro ao atualizar clínica com ID ${id}:`, error);
      throw error;
    }
    
    return data[0] as Clinic;
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
    
    return data[0] as Clinic;
  }
};
