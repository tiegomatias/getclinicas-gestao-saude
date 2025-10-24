import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FoodItem {
  id: string;
  clinic_id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minimum_stock: number;
  expiration_date?: string;
  cost_per_unit?: number;
  supplier?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFoodItemData {
  name: string;
  category: string;
  stock: number;
  unit: string;
  minimum_stock: number;
  expiration_date?: string;
  cost_per_unit?: number;
  supplier?: string;
  notes?: string;
}

export const foodInventoryService = {
  async getFoodItems(clinicId: string): Promise<FoodItem[]> {
    try {
      const { data, error } = await supabase
        .from("food_inventory")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching food items:", error);
      toast.error("Erro ao carregar itens da dispensa");
      return [];
    }
  },

  async createFoodItem(clinicId: string, data: CreateFoodItemData): Promise<FoodItem | null> {
    try {
      const { data: item, error } = await supabase
        .from("food_inventory")
        .insert({
          ...data,
          clinic_id: clinicId,
          status: "available",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Item adicionado com sucesso!");
      return item;
    } catch (error: any) {
      console.error("Error creating food item:", error);
      toast.error("Erro ao adicionar item");
      return null;
    }
  },

  async updateFoodItem(id: string, data: Partial<CreateFoodItemData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("food_inventory")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast.success("Item atualizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error updating food item:", error);
      toast.error("Erro ao atualizar item");
      return false;
    }
  },

  async deleteFoodItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("food_inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Item excluído com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error deleting food item:", error);
      toast.error("Erro ao excluir item");
      return false;
    }
  },

  async adjustStock(id: string, quantity: number): Promise<boolean> {
    try {
      const { data: item, error: fetchError } = await supabase
        .from("food_inventory")
        .select("stock")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const newStock = Number(item.stock) + quantity;

      const { error: updateError } = await supabase
        .from("food_inventory")
        .update({ stock: newStock })
        .eq("id", id);

      if (updateError) throw updateError;

      toast.success("Estoque ajustado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error adjusting stock:", error);
      toast.error("Erro ao ajustar estoque");
      return false;
    }
  },
};
