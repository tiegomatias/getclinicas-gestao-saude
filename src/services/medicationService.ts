
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const medicationService = {
  // Get all medications for a clinic
  async getMedications(clinicId: string) {
    try {
      const { data, error } = await supabase
        .from("medication_inventory")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("name");

      if (error) {
        console.error("Error fetching medications:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getMedications:", error);
      throw error;
    }
  },

  // Add a new medication
  async addMedication(medication: {
    clinic_id: string;
    name: string;
    active: string;
    category: string;
    dosage: string;
    stock: number;
  }) {
    try {
      const stock = Number(medication.stock);
      let status = "Adequado";
      if (stock <= 10) {
        status = "Crítico";
      } else if (stock <= 20) {
        status = "Baixo";
      }

      // Direct insert without checking clinic user policy
      const { data, error } = await supabase
        .from("medication_inventory")
        .insert({
          clinic_id: medication.clinic_id,
          name: medication.name,
          active: medication.active,
          category: medication.category,
          dosage: medication.dosage,
          stock,
          status,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding medication:", error);
        throw error;
      }

      // Record the initial stock as an entry in the history
      if (stock > 0) {
        await this.adjustStock({
          clinic_id: medication.clinic_id,
          medication_id: data.id,
          adjustment_type: "entrada",
          quantity: stock,
          notes: "Estoque inicial",
        });
      }

      return data;
    } catch (error) {
      console.error("Error in addMedication:", error);
      throw error;
    }
  },

  // Adjust medication stock
  async adjustStock(adjustment: {
    clinic_id: string;
    medication_id: string;
    adjustment_type: "entrada" | "saída";
    quantity: number;
    notes?: string;
  }) {
    try {
      // First add to history
      const { error: historyError } = await supabase
        .from("medication_stock_history")
        .insert(adjustment);

      if (historyError) {
        console.error("Error recording stock history:", historyError);
        throw historyError;
      }

      // Then update the inventory
      const quantityChange = adjustment.adjustment_type === "entrada" 
        ? adjustment.quantity 
        : -adjustment.quantity;

      // Get current medication data
      const { data: medicationData, error: fetchError } = await supabase
        .from("medication_inventory")
        .select("stock")
        .eq("id", adjustment.medication_id)
        .single();

      if (fetchError) {
        console.error("Error fetching medication:", fetchError);
        throw fetchError;
      }

      const newStock = Math.max(0, medicationData.stock + quantityChange);
      
      // Determine status based on new stock level
      let newStatus = "Adequado";
      if (newStock <= 10) {
        newStatus = "Crítico";
      } else if (newStock <= 20) {
        newStatus = "Baixo";
      }

      // Update medication stock
      const { data, error } = await supabase
        .from("medication_inventory")
        .update({ 
          stock: newStock, 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", adjustment.medication_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating medication stock:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in adjustStock:", error);
      throw error;
    }
  },

  // Delete a medication
  async deleteMedication(medicationId: string) {
    try {
      const { error } = await supabase
        .from("medication_inventory")
        .delete()
        .eq("id", medicationId);

      if (error) {
        console.error("Error deleting medication:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteMedication:", error);
      throw error;
    }
  },

  // Get prescriptions
  async getPrescriptions(clinicId: string, patientId?: string) {
    try {
      let query = supabase
        .from("medication_prescriptions")
        .select(`
          *,
          patient:patients(id, name),
          medication:medication_inventory(id, name, dosage)
        `)
        .eq("clinic_id", clinicId);

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prescriptions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPrescriptions:", error);
      throw error;
    }
  },

  // Add prescription
  async addPrescription(prescription: {
    clinic_id: string;
    patient_id: string;
    medication_id: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    observations?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from("medication_prescriptions")
        .insert(prescription)
        .select()
        .single();

      if (error) {
        console.error("Error adding prescription:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in addPrescription:", error);
      throw error;
    }
  },

  // Get administrations
  async getAdministrations(clinicId: string, date?: string) {
    try {
      let query = supabase
        .from("medication_administrations")
        .select(`
          *,
          patient:patients(id, name),
          medication:medication_inventory(id, name, dosage),
          prescription:medication_prescriptions(id)
        `)
        .eq("clinic_id", clinicId);

      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        query = query
          .gte("administered_at", startDate.toISOString())
          .lte("administered_at", endDate.toISOString());
      }

      const { data, error } = await query.order("administered_at", { ascending: false });

      if (error) {
        console.error("Error fetching administrations:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAdministrations:", error);
      throw error;
    }
  },

  // Add administration
  async addAdministration(administration: {
    clinic_id: string;
    prescription_id: string;
    patient_id: string;
    medication_id: string;
    dosage: string;
    administered_by: string;
    administered_at: string;
    observations?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from("medication_administrations")
        .insert(administration)
        .select()
        .single();

      if (error) {
        console.error("Error adding administration:", error);
        throw error;
      }

      // Also update the medication stock
      try {
        await this.adjustStock({
          clinic_id: administration.clinic_id,
          medication_id: administration.medication_id,
          adjustment_type: "saída",
          quantity: 1, // Assuming 1 unit per administration
          notes: `Administração para paciente`
        });
      } catch (stockError) {
        console.error("Error updating stock after administration:", stockError);
        // Continue, we still want to record the administration even if stock update fails
      }

      return data;
    } catch (error) {
      console.error("Error in addAdministration:", error);
      throw error;
    }
  },
  
  // Check if clinic has medications data
  async hasClinicData(clinicId: string) {
    try {
      // Use count option to check if any data exists
      const { count, error } = await supabase
        .from("medication_inventory")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId);

      if (error) {
        console.error("Error checking medication data:", error);
        throw error;
      }

      return count !== null && count > 0;
    } catch (error) {
      console.error("Error in hasClinicData:", error);
      return false;
    }
  }
};
