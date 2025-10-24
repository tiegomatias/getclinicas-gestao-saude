import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Contract {
  id: string;
  clinic_id: string;
  patient_id: string;
  responsible_name: string;
  responsible_document: string;
  value: number;
  start_date: string;
  end_date?: string;
  status: string;
  file_url?: string;
  created_at: string;
}

export interface CreateContractData {
  patient_id: string;
  responsible_name: string;
  responsible_document: string;
  value: number;
  start_date: string;
  end_date?: string;
}

export const contractService = {
  async getContracts(clinicId: string): Promise<Contract[]> {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching contracts:", error);
      toast.error("Erro ao carregar contratos");
      return [];
    }
  },

  async createContract(clinicId: string, data: CreateContractData): Promise<Contract | null> {
    try {
      const { data: contract, error } = await supabase
        .from("contracts")
        .insert({
          ...data,
          clinic_id: clinicId,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Contrato criado com sucesso!");
      return contract;
    } catch (error: any) {
      console.error("Error creating contract:", error);
      toast.error("Erro ao criar contrato");
      return null;
    }
  },

  async updateContract(id: string, data: Partial<CreateContractData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("contracts")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast.success("Contrato atualizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error updating contract:", error);
      toast.error("Erro ao atualizar contrato");
      return false;
    }
  },

  async deleteContract(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Contrato excluído com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error deleting contract:", error);
      toast.error("Erro ao excluir contrato");
      return false;
    }
  },
};
