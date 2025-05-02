
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { medicationService } from "@/services/medicationService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface MedicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clinicId: string;
}

export function MedicationForm({ open, onOpenChange, onSuccess, clinicId }: MedicationFormProps) {
  const [newMedication, setNewMedication] = useState({
    name: "",
    active: "",
    category: "",
    dosage: "",
    stock: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [id.replace('med-', '')]: id === 'med-stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    if (!newMedication.name || !newMedication.active || !newMedication.category || !newMedication.dosage || newMedication.stock < 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userId = user?.id;
      
      await medicationService.addMedication({
        clinic_id: clinicId,
        name: newMedication.name,
        active: newMedication.active,
        category: newMedication.category,
        dosage: newMedication.dosage,
        stock: newMedication.stock,
        created_by: userId
      });
      
      toast.success("Medicamento adicionado com sucesso");
      setNewMedication({
        name: "",
        active: "",
        category: "",
        dosage: "",
        stock: 0
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding medication:", error);
      
      // Fornecer mensagem de erro mais amigável
      toast.error("Erro ao adicionar medicamento. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar novo medicamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do medicamento a ser adicionado ao estoque
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-name" className="text-right">
              Nome
            </Label>
            <Input
              id="med-name"
              className="col-span-3"
              value={newMedication.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-active" className="text-right">
              Princípio Ativo
            </Label>
            <Input
              id="med-active"
              className="col-span-3"
              value={newMedication.active}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-category" className="text-right">
              Categoria
            </Label>
            <Input
              id="med-category"
              className="col-span-3"
              value={newMedication.category}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-dosage" className="text-right">
              Dosagem
            </Label>
            <Input
              id="med-dosage"
              className="col-span-3"
              value={newMedication.dosage}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-stock" className="text-right">
              Estoque Inicial
            </Label>
            <Input
              id="med-stock"
              type="number"
              className="col-span-3"
              value={newMedication.stock.toString()}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
