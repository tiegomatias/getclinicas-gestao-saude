import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Finance {
  id: string;
  clinic_id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
  date: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface CreateFinanceData {
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
  date: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export const financeService = {
  async getFinances(clinicId: string): Promise<Finance[]> {
    try {
      const { data, error } = await supabase
        .from("finances")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as Finance[];
    } catch (error: any) {
      console.error("Error fetching finances:", error);
      toast.error("Erro ao carregar transações financeiras");
      return [];
    }
  },

  async getFinanceSummary(clinicId: string): Promise<FinanceSummary> {
    try {
      const finances = await this.getFinances(clinicId);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const totalIncome = finances
        .filter(f => f.type === "income")
        .reduce((sum, f) => sum + Number(f.amount), 0);

      const totalExpenses = finances
        .filter(f => f.type === "expense")
        .reduce((sum, f) => sum + Number(f.amount), 0);

      const monthlyIncome = finances
        .filter(f => {
          const date = new Date(f.date);
          return f.type === "income" && 
                 date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear;
        })
        .reduce((sum, f) => sum + Number(f.amount), 0);

      const monthlyExpenses = finances
        .filter(f => {
          const date = new Date(f.date);
          return f.type === "expense" && 
                 date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear;
        })
        .reduce((sum, f) => sum + Number(f.amount), 0);

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
      };
    } catch (error: any) {
      console.error("Error calculating summary:", error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
      };
    }
  },

  async createFinance(clinicId: string, data: CreateFinanceData): Promise<Finance | null> {
    try {
      const { data: finance, error } = await supabase
        .from("finances")
        .insert({
          ...data,
          clinic_id: clinicId,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Transação registrada com sucesso!");
      return finance as Finance;
    } catch (error: any) {
      console.error("Error creating finance:", error);
      toast.error("Erro ao registrar transação");
      return null;
    }
  },

  async updateFinance(id: string, data: Partial<CreateFinanceData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("finances")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast.success("Transação atualizada com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error updating finance:", error);
      toast.error("Erro ao atualizar transação");
      return false;
    }
  },

  async deleteFinance(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("finances")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Transação excluída com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error deleting finance:", error);
      toast.error("Erro ao excluir transação");
      return false;
    }
  },

  async getFinancesByDateRange(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<Finance[]> {
    try {
      const { data, error } = await supabase
        .from("finances")
        .select("*")
        .eq("clinic_id", clinicId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as Finance[];
    } catch (error: any) {
      console.error("Error fetching finances by date range:", error);
      return [];
    }
  },
};
