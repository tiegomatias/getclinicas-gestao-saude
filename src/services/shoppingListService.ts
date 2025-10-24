import { supabase } from "@/integrations/supabase/client";

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  food_item_name: string;
  quantity: number;
  unit: string;
  estimated_cost?: number;
  actual_cost?: number;
  purchased: boolean;
  notes?: string;
  created_at: string;
}

export interface ShoppingList {
  id: string;
  clinic_id: string;
  name: string;
  status: string;
  total_amount?: number;
  purchase_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

class ShoppingListService {
  async getShoppingLists(clinicId: string): Promise<ShoppingList[]> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ShoppingList[];
  }

  async getActiveShoppingList(clinicId: string): Promise<ShoppingList | null> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("clinic_id", clinicId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as ShoppingList | null;
  }

  async createShoppingList(
    clinicId: string,
    name: string
  ): Promise<ShoppingList> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({
        clinic_id: clinicId,
        name: name,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;
    return data as ShoppingList;
  }

  async getShoppingListItems(
    shoppingListId: string
  ): Promise<ShoppingListItem[]> {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select("*")
      .eq("shopping_list_id", shoppingListId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ShoppingListItem[];
  }

  async addShoppingListItem(
    shoppingListId: string,
    item: Partial<ShoppingListItem>
  ): Promise<ShoppingListItem> {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({
        shopping_list_id: shoppingListId,
        food_item_name: item.food_item_name,
        quantity: item.quantity,
        unit: item.unit,
        estimated_cost: item.estimated_cost,
        notes: item.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ShoppingListItem;
  }

  async toggleItemPurchased(
    itemId: string,
    purchased: boolean
  ): Promise<boolean> {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ purchased })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item:", error);
      return false;
    }
    return true;
  }

  async updateShoppingListItem(
    itemId: string,
    updates: Partial<ShoppingListItem>
  ): Promise<boolean> {
    const { error } = await supabase
      .from("shopping_list_items")
      .update(updates)
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item:", error);
      return false;
    }
    return true;
  }

  async deleteShoppingListItem(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error deleting item:", error);
      return false;
    }
    return true;
  }

  async completeShoppingList(
    shoppingListId: string,
    totalAmount: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from("shopping_lists")
      .update({
        status: "completed",
        total_amount: totalAmount,
        purchase_date: new Date().toISOString(),
      })
      .eq("id", shoppingListId);

    if (error) {
      console.error("Error completing shopping list:", error);
      return false;
    }
    return true;
  }
}

export const shoppingListService = new ShoppingListService();
