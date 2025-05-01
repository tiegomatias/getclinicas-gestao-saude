
import { supabase } from "@/integrations/supabase/client";
import type { Clinic } from "@/lib/types";
import { clinicService } from "./clinicService";

type ClinicDataType = 'beds' | 'patients' | 'professionals' | 'activities' | 'documents' | 'contracts' | 'finances' | 'medications';

export const bedService = {
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
