import { supabase } from "@/integrations/supabase/client";
import { financeService } from "./financeService";
import { activityService } from "./activityService";
import { patientService } from "./patientService";

export interface OccupationReport {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  occupationRate: number;
  trend: string;
}

export interface FinancialReport {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export interface ActivitiesReport {
  period: string;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  averageParticipants: number;
  completionRate: number;
}

export interface PatientsReport {
  totalActive: number;
  totalAdmissions: number;
  totalDischarges: number;
  averageStay: number;
  byAdmissionType: Record<string, number>;
}

export const reportService = {
  async getOccupationReport(clinicId: string): Promise<OccupationReport> {
    try {
      const { data: clinic, error } = await supabase
        .from("clinics")
        .select("beds_capacity, occupied_beds, available_beds, maintenance_beds")
        .eq("id", clinicId)
        .single();

      if (error) throw error;

      const occupationRate = clinic.beds_capacity > 0
        ? (clinic.occupied_beds / clinic.beds_capacity) * 100
        : 0;

      return {
        totalBeds: clinic.beds_capacity || 0,
        occupiedBeds: clinic.occupied_beds || 0,
        availableBeds: clinic.available_beds || 0,
        maintenanceBeds: clinic.maintenance_beds || 0,
        occupationRate: Number(occupationRate.toFixed(1)),
        trend: occupationRate > 80 ? "high" : occupationRate > 50 ? "medium" : "low",
      };
    } catch (error: any) {
      console.error("Error generating occupation report:", error);
      return {
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        maintenanceBeds: 0,
        occupationRate: 0,
        trend: "low",
      };
    }
  },

  async getFinancialReport(clinicId: string, startDate: string, endDate: string): Promise<FinancialReport> {
    try {
      const finances = await financeService.getFinancesByDateRange(clinicId, startDate, endDate);

      const totalIncome = finances
        .filter(f => f.type === "income")
        .reduce((sum, f) => sum + Number(f.amount), 0);

      const totalExpenses = finances
        .filter(f => f.type === "expense")
        .reduce((sum, f) => sum + Number(f.amount), 0);

      const incomeByCategory: Record<string, number> = {};
      const expensesByCategory: Record<string, number> = {};

      finances.forEach(f => {
        const category = f.category || "Outros";
        const amount = Number(f.amount);

        if (f.type === "income") {
          incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
        } else {
          expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
        }
      });

      return {
        period: `${startDate} - ${endDate}`,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        incomeByCategory,
        expensesByCategory,
      };
    } catch (error: any) {
      console.error("Error generating financial report:", error);
      return {
        period: "",
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeByCategory: {},
        expensesByCategory: {},
      };
    }
  },

  async getActivitiesReport(clinicId: string, startDate: string, endDate: string): Promise<ActivitiesReport> {
    try {
      const activities = await activityService.getActivitiesByDateRange(clinicId, startDate, endDate);

      const activitiesByType: Record<string, number> = {};
      let totalParticipants = 0;

      activities.forEach(activity => {
        activitiesByType[activity.activity_type] = (activitiesByType[activity.activity_type] || 0) + 1;
        totalParticipants += activity.participants?.length || 0;
      });

      const averageParticipants = activities.length > 0
        ? totalParticipants / activities.length
        : 0;

      return {
        period: `${startDate} - ${endDate}`,
        totalActivities: activities.length,
        activitiesByType,
        averageParticipants: Number(averageParticipants.toFixed(1)),
        completionRate: 100, // TODO: Calculate based on actual completion
      };
    } catch (error: any) {
      console.error("Error generating activities report:", error);
      return {
        period: "",
        totalActivities: 0,
        activitiesByType: {},
        averageParticipants: 0,
        completionRate: 0,
      };
    }
  },

  async getPatientsReport(clinicId: string): Promise<PatientsReport> {
    try {
      const patients = await patientService.getClinicPatients(clinicId);

      const byAdmissionType: Record<string, number> = {};

      patients.forEach(patient => {
        if (patient.admission_type) {
          byAdmissionType[patient.admission_type] = (byAdmissionType[patient.admission_type] || 0) + 1;
        }
      });

      const activePatients = patients.filter(p => p.status === "active").length;

      return {
        totalActive: activePatients,
        totalAdmissions: patients.length,
        totalDischarges: patients.filter(p => p.status === "discharged").length,
        averageStay: 0, // TODO: Calculate based on admission dates
        byAdmissionType,
      };
    } catch (error: any) {
      console.error("Error generating patients report:", error);
      return {
        totalActive: 0,
        totalAdmissions: 0,
        totalDischarges: 0,
        averageStay: 0,
        byAdmissionType: {},
      };
    }
  },
};
