import { supabase } from '@/integrations/supabase/client';

export interface ClinicData {
  id: string;
  name: string;
  admin_email: string;
  plan: string;
  created_at: string;
  beds_capacity: number;
  occupied_beds: number;
  available_beds: number;
  maintenance_beds: number;
  has_beds_data: boolean;
}

export interface ClinicStats {
  totalClinics: number;
  totalBeds: number;
  totalOccupiedBeds: number;
  averageOccupation: number;
  totalRevenue: number;
}

export interface PlanRevenue {
  plan: string;
  count: number;
  monthlyRevenue: number;
  color: string;
}

const PLAN_PRICING: Record<string, number> = {
  'Básico': 299,
  'Mensal': 299,
  'Padrão': 499,
  'Semestral': 499,
  'Premium': 999,
  'Anual': 999,
  'Enterprise': 1999
};

const PLAN_COLORS: Record<string, string> = {
  'Básico': '#3b82f6',
  'Mensal': '#3b82f6',
  'Padrão': '#10b981',
  'Semestral': '#10b981',
  'Premium': '#8b5cf6',
  'Anual': '#8b5cf6',
  'Enterprise': '#f59e0b',
  'default': '#6b7280'
};

export const masterService = {
  /**
   * Busca todas as clínicas do sistema
   */
  async getAllClinics(): Promise<ClinicData[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clinics:', error);
      throw error;
    }

    return data.map(clinic => ({
      id: clinic.id,
      name: clinic.name,
      admin_email: clinic.admin_email,
      plan: clinic.plan || 'Básico',
      created_at: clinic.created_at,
      beds_capacity: clinic.beds_capacity || 30,
      occupied_beds: clinic.occupied_beds || 0,
      available_beds: clinic.available_beds || 30,
      maintenance_beds: clinic.maintenance_beds || 0,
      has_beds_data: clinic.has_beds_data || false
    }));
  },

  /**
   * Calcula estatísticas gerais das clínicas
   */
  calculateStats(clinics: ClinicData[]): ClinicStats {
    const totalClinics = clinics.length;
    let totalBeds = 0;
    let totalOccupiedBeds = 0;
    let totalRevenue = 0;

    clinics.forEach(clinic => {
      // Só contar leitos de clínicas que realmente configuraram seus leitos
      if (clinic.has_beds_data) {
        const realBeds = clinic.occupied_beds + clinic.available_beds + clinic.maintenance_beds;
        totalBeds += realBeds;
        totalOccupiedBeds += clinic.occupied_beds;
      }
      
      const planPrice = PLAN_PRICING[clinic.plan] || PLAN_PRICING['Básico'];
      totalRevenue += planPrice;
    });

    const averageOccupation = totalBeds > 0 
      ? Math.round((totalOccupiedBeds / totalBeds) * 100) 
      : 0;

    return {
      totalClinics,
      totalBeds,
      totalOccupiedBeds,
      averageOccupation,
      totalRevenue
    };
  },

  /**
   * Calcula receita por plano
   */
  calculatePlanRevenue(clinics: ClinicData[]): PlanRevenue[] {
    const planCounts: Record<string, number> = {};

    clinics.forEach(clinic => {
      const plan = clinic.plan || 'Básico';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    const revenueData = Object.keys(planCounts).map(plan => {
      const count = planCounts[plan];
      const planPrice = PLAN_PRICING[plan] || PLAN_PRICING['Básico'];
      const monthlyRevenue = count * planPrice;
      const color = PLAN_COLORS[plan] || PLAN_COLORS['default'];

      return {
        plan,
        count,
        monthlyRevenue,
        color
      };
    });

    // Ordenar por receita (maior primeiro)
    revenueData.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    return revenueData;
  },

  /**
   * Busca clínica por ID
   */
  async getClinicById(clinicId: string): Promise<ClinicData | null> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single();

    if (error) {
      console.error('Error fetching clinic:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      admin_email: data.admin_email,
      plan: data.plan || 'Básico',
      created_at: data.created_at,
      beds_capacity: data.beds_capacity || 30,
      occupied_beds: data.occupied_beds || 0,
      available_beds: data.available_beds || 30,
      maintenance_beds: data.maintenance_beds || 0,
      has_beds_data: data.has_beds_data || false
    };
  },

  /**
   * Atualiza uma clínica
   */
  async updateClinic(clinicId: string, updates: Partial<ClinicData>): Promise<ClinicData> {
    const { data, error } = await supabase
      .from('clinics')
      .update({
        name: updates.name,
        admin_email: updates.admin_email,
        plan: updates.plan,
        beds_capacity: updates.beds_capacity
      })
      .eq('id', clinicId)
      .select()
      .single();

    if (error) {
      console.error('Error updating clinic:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      admin_email: data.admin_email,
      plan: data.plan || 'Básico',
      created_at: data.created_at,
      beds_capacity: data.beds_capacity || 30,
      occupied_beds: data.occupied_beds || 0,
      available_beds: data.available_beds || 30,
      maintenance_beds: data.maintenance_beds || 0,
      has_beds_data: data.has_beds_data || false
    };
  },

  /**
   * Deleta uma clínica
   */
  async deleteClinic(clinicId: string): Promise<void> {
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', clinicId);

    if (error) {
      console.error('Error deleting clinic:', error);
      throw error;
    }
  },

  /**
   * Busca dados de ocupação atual de todas as clínicas
   */
  async getOccupationData() {
    const clinics = await this.getAllClinics();
    
    // Retorna dados reais agregados apenas de clínicas que configuraram leitos
    let totalOccupied = 0;
    let totalAvailable = 0;
    let totalMaintenance = 0;

    clinics.forEach(clinic => {
      // Só contar leitos de clínicas que realmente configuraram
      if (clinic.has_beds_data) {
        totalOccupied += clinic.occupied_beds;
        totalAvailable += clinic.available_beds;
        totalMaintenance += clinic.maintenance_beds;
      }
    });
    
    return {
      ocupados: totalOccupied,
      disponíveis: totalAvailable,
      manutenção: totalMaintenance
    };
  }
};