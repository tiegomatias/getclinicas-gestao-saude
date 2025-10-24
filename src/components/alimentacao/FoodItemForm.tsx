import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { foodInventoryService, FoodItem, CreateFoodItemData } from "@/services/foodInventoryService";

interface FoodItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  item?: FoodItem | null;
  onSuccess: () => void;
}

export default function FoodItemForm({
  open,
  onOpenChange,
  clinicId,
  item,
  onSuccess,
}: FoodItemFormProps) {
  const [formData, setFormData] = useState<CreateFoodItemData>({
    name: "",
    category: "graos",
    stock: 0,
    unit: "kg",
    minimum_stock: 0,
    expiration_date: "",
    cost_per_unit: 0,
    supplier: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        stock: Number(item.stock),
        unit: item.unit,
        minimum_stock: Number(item.minimum_stock),
        expiration_date: item.expiration_date?.split("T")[0] || "",
        cost_per_unit: Number(item.cost_per_unit || 0),
        supplier: item.supplier || "",
        notes: item.notes || "",
      });
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "graos",
      stock: 0,
      unit: "kg",
      minimum_stock: 0,
      expiration_date: "",
      cost_per_unit: 0,
      supplier: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await foodInventoryService.updateFoodItem(item.id, formData);
      } else {
        await foodInventoryService.createFoodItem(clinicId, formData);
      }
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving food item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Editar Item" : "Novo Item"}
          </DialogTitle>
          <DialogDescription>
            Adicione ou edite itens da dispensa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graos">Grãos</SelectItem>
                  <SelectItem value="laticinios">Laticínios</SelectItem>
                  <SelectItem value="frutas">Frutas</SelectItem>
                  <SelectItem value="vegetais">Vegetais</SelectItem>
                  <SelectItem value="carnes">Carnes</SelectItem>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="L">Litro (L)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  <SelectItem value="und">Unidade</SelectItem>
                  <SelectItem value="cx">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual *</Label>
              <Input
                id="stock"
                type="number"
                step="0.01"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
              <Input
                id="minimum_stock"
                type="number"
                step="0.01"
                min="0"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date">Data de Validade</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Custo por Unidade</Label>
              <Input
                id="cost_per_unit"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : item ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
