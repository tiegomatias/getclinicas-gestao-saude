
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface StockAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  medication: {
    id: string;
    name: string;
    stock: number;
    clinic_id: string;
  } | null;
}

export function StockAdjustmentForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  medication 
}: StockAdjustmentFormProps) {
  const [adjustment, setAdjustment] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  if (!medication) return null;

  const handleSubmit = async () => {
    const adjustmentValue = parseInt(adjustment);
    
    if (isNaN(adjustmentValue)) {
      toast.error("Informe um valor válido para o ajuste de estoque");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userId = user?.id;
      if (!userId) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      const adjustmentType = adjustmentValue > 0 ? "entrada" : "saída";
      const quantity = Math.abs(adjustmentValue);

      await medicationService.adjustStock({
        clinic_id: medication.clinic_id,
        medication_id: medication.id,
        adjustment_type: adjustmentType,
        quantity,
        notes: notes || undefined,
        created_by: userId
      });

      // Show the appropriate message
      if (adjustmentValue > 0) {
        toast.success(`Entrada de ${quantity} unidades de ${medication.name} registrada`);
      } else if (adjustmentValue < 0) {
        toast.success(`Saída de ${quantity} unidades de ${medication.name} registrada`);
      }

      setAdjustment("");
      setNotes("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Erro ao ajustar estoque");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajuste de estoque</DialogTitle>
          <DialogDescription>
            Informe a quantidade a ser adicionada ou removida do estoque
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <p className="font-medium">{medication.name}</p>
            <p className="text-sm text-muted-foreground">
              Estoque atual: {medication.stock} unidades
            </p>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock-adjustment" className="text-right">
              Ajuste
            </Label>
            <Input
              id="stock-adjustment"
              type="number"
              className="col-span-3"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              placeholder="Use número positivo para entrada ou negativo para saída"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <Label htmlFor="adjustment-notes" className="text-right">
              Notas
            </Label>
            <Input
              id="adjustment-notes"
              className="col-span-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações opcionais"
            />
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Use valores positivos para entrada de estoque (ex: 10) ou negativos para saída (ex: -5)
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !adjustment}
          >
            {isSubmitting ? "Processando..." : "Confirmar ajuste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
