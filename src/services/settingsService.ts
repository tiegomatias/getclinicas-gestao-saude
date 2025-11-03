import { supabase } from "@/integrations/supabase/client";

export interface ClinicSettings {
  id?: string;
  clinic_id: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  dark_mode?: boolean;
  compact_mode?: boolean;
  notifications_appointments?: boolean;
  notifications_cancellations?: boolean;
  notifications_medicines?: boolean;
  notifications_documents?: boolean;
  notifications_email?: boolean;
  notifications_browser?: boolean;
  notifications_sms?: boolean;
  notifications_reminders?: boolean;
  security_two_factor?: boolean;
  security_session_timeout?: number;
  updated_at?: string;
}

export const settingsService = {
  async getClinicSettings(clinicId: string): Promise<ClinicSettings | null> {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .eq('clinic_id', clinicId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  },

  async upsertClinicSettings(settings: ClinicSettings): Promise<ClinicSettings> {
    const { data, error } = await supabase
      .from('clinic_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getDefaultSettings(clinicId: string): ClinicSettings {
    return {
      clinic_id: clinicId,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      date_format: 'DD/MM/YYYY',
      dark_mode: false,
      compact_mode: false,
      notifications_appointments: true,
      notifications_cancellations: true,
      notifications_medicines: true,
      notifications_documents: true,
      notifications_email: true,
      notifications_browser: true,
      notifications_sms: false,
      notifications_reminders: true,
      security_two_factor: false,
      security_session_timeout: 30
    };
  }
};