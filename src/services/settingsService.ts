import { supabase } from "@/integrations/supabase/client";

export interface ClinicSettings {
  id?: string;
  clinic_id: string;
  general_settings?: {
    language?: string;
    timezone?: string;
    date_format?: string;
    dark_mode?: boolean;
    compact_mode?: boolean;
  };
  notification_settings?: {
    appointments?: boolean;
    cancellations?: boolean;
    medicines?: boolean;
    documents?: boolean;
    email?: boolean;
    browser?: boolean;
    sms?: boolean;
    reminders?: boolean;
  };
  security_settings?: {
    two_factor?: boolean;
    session_timeout?: number;
  };
  updated_at?: string;
}

export const settingsService = {
  async getClinicSettings(clinicId: string): Promise<ClinicSettings | null> {
    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .eq('clinic_id', clinicId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      clinic_id: data.clinic_id,
      general_settings: data.general_settings as any,
      notification_settings: data.notification_settings as any,
      security_settings: {} as any,
      updated_at: data.updated_at
    };
  },

  async upsertClinicSettings(settings: ClinicSettings): Promise<ClinicSettings> {
    const { data, error } = await supabase
      .from('clinic_settings')
      .upsert({
        clinic_id: settings.clinic_id,
        general_settings: settings.general_settings || {},
        notification_settings: settings.notification_settings || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      clinic_id: data.clinic_id,
      general_settings: data.general_settings as any,
      notification_settings: data.notification_settings as any,
      security_settings: {} as any,
      updated_at: data.updated_at
    };
  },

  getDefaultSettings(clinicId: string): ClinicSettings {
    return {
      clinic_id: clinicId,
      general_settings: {
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        date_format: 'DD/MM/YYYY',
        dark_mode: false,
        compact_mode: false
      },
      notification_settings: {
        appointments: true,
        cancellations: true,
        medicines: true,
        documents: true,
        email: true,
        browser: true,
        sms: false,
        reminders: true
      },
      security_settings: {
        two_factor: false,
        session_timeout: 30
      }
    };
  }
};