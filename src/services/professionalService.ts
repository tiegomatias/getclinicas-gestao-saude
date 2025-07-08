
import { supabase } from "@/integrations/supabase/client";
import type { Professional } from "@/lib/types";

export interface ProfessionalData {
  name: string;
  profession: string;
  specialization?: string;
  license_number?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  has_system_access: boolean;
  observations?: string;
  clinic_id: string;
  created_by?: string;
}

export interface ProfessionalPermission {
  id?: string;
  clinic_id: string;
  professional_id: string;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}

export const professionalService = {
  async createProfessional(data: ProfessionalData) {
    const { data: professional, error } = await supabase
      .from('professionals')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return professional;
  },

  async getProfessionalsByClinic(clinicId: string) {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateProfessional(id: string, data: Partial<ProfessionalData>) {
    const { data: professional, error } = await supabase
      .from('professionals')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return professional;
  },

  async deleteProfessional(id: string) {
    const { error } = await supabase
      .from('professionals')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
  },

  async getProfessionalsWithSystemAccess(clinicId: string) {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('has_system_access', true)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getPermissions(clinicId: string, professionalId: string) {
    const { data, error } = await supabase
      .from('professional_permissions')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('professional_id', professionalId);

    if (error) throw error;
    return data || [];
  },

  async updatePermissions(permissions: ProfessionalPermission[]) {
    const { error } = await supabase
      .from('professional_permissions')
      .upsert(permissions);

    if (error) throw error;
  },

  async createDefaultPermissions(clinicId: string, professionalId: string) {
    const modules = [
      'patients', 'beds', 'calendar', 'medications', 
      'documents', 'contracts', 'reports', 'settings'
    ];

    const defaultPermissions = modules.map(module => ({
      clinic_id: clinicId,
      professional_id: professionalId,
      module_name: module,
      can_read: true,
      can_write: false,
      can_delete: false
    }));

    const { error } = await supabase
      .from('professional_permissions')
      .insert(defaultPermissions);

    if (error) throw error;
  }
};
