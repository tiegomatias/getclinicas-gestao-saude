
import { supabase } from "@/integrations/supabase/client";
import type { Professional } from "@/lib/types";

export const professionalService = {
  // Buscar todos os profissionais de uma clínica
  async getClinicProfessionals(clinicId: string): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Erro ao buscar profissionais da clínica ${clinicId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  // Buscar um profissional específico
  async getProfessionalById(id: string): Promise<Professional | null> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar profissional com ID ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  // Criar um novo profissional
  async createProfessional(professionalData: Partial<Professional>): Promise<Professional> {
    // Garantir que os campos obrigatórios estejam presentes
    if (!professionalData.name) {
      throw new Error("O nome do profissional é obrigatório");
    }
    
    if (!professionalData.profession) {
      throw new Error("A profissão é obrigatória");
    }
    
    // Definir status padrão se não for fornecido
    if (!professionalData.status) {
      professionalData.status = 'active';
    }
    
    // Criar um objeto que satisfaz os requisitos de tipo do Supabase
    const professionalToInsert = {
      name: professionalData.name,
      profession: professionalData.profession,
      clinic_id: professionalData.clinic_id,
      license: professionalData.license,
      email: professionalData.email,
      phone: professionalData.phone,
      status: professionalData.status
    };
    
    const { data, error } = await supabase
      .from('professionals')
      .insert(professionalToInsert)
      .select();
      
    if (error) {
      console.error("Erro ao criar profissional:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after creating professional");
    }
    
    return data[0];
  },
  
  // Atualizar um profissional existente
  async updateProfessional(id: string, professionalData: Partial<Professional>): Promise<Professional> {
    const { data, error } = await supabase
      .from('professionals')
      .update(professionalData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Erro ao atualizar profissional com ID ${id}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after updating professional");
    }
    
    return data[0];
  },
  
  // Excluir um profissional
  async deleteProfessional(id: string): Promise<void> {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Erro ao excluir profissional com ID ${id}:`, error);
      throw error;
    }
  }
};
