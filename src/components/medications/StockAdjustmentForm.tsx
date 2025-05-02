
import React, { useState, useEffect } from "react";
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
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  medication: {
    id: string;
    name: string;
    stock: number;
    clinic_id: string;
    expiration_date?: string;
    manufacturer?: string;
    batch_number?: string;
  } | null;
}

export function StockAdjustmentForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  medication 
}: StockAdjustmentFormProps) {
  const [adjustmentType, setAdjustmentType] = useState<"entrada" | "saída">("entrada");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && medication) {
      loadStockHistory();
    } else {
      setShowHistory(false);
      setAdjustmentType("entrada");
      setQuantity("");
      setNotes("");
    }
  }, [open, medication]);

  const loadStockHistory = async () => {
    if (!medication) return;
    
    try {
      const history = await medicationService.getMedicationStockHistory(medication.id);
      setHistoryData(history);
    } catch (error) {
      console.error("Error loading stock history:", error);
    }
  };

  if (!medication) return null;

  const handleSubmit = async () => {
    const quantityValue = parseInt(quantity);
    
    if (isNaN(quantityValue) || quantityValue <= 0) {
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

      await medicationService.adjustStock({
        clinic_id: medication.clinic_id,
        medication_id: medication.id,
        adjustment_type: adjustmentType,
        quantity: quantityValue,
        notes: notes || undefined,
        created_by: userId
      });

      // Show the appropriate message
      toast.success(`${adjustmentType === "entrada" ? "Entrada" : "Saída"} de ${quantityValue} unidades de ${medication.name} registrada`);

      setQuantity("");
      setNotes("");
      setAdjustmentType("entrada");
      loadStockHistory();
      onSuccess();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Erro ao ajustar estoque");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[600px] ${showHistory ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        <DialogHeader>
          <DialogTitle>{showHistory ? "Histórico de estoque" : "Ajuste de estoque"}</DialogTitle>
          <DialogDescription>
            {showHistory 
              ? `Histórico de movimentações de estoque para ${medication.name}`
              : "Informe a quantidade a ser adicionada ou removida do estoque"
            }
          </DialogDescription>
        </DialogHeader>
        
        {!showHistory ? (
          <>
            <div className="py-4">
              <div className="mb-4">
                <p className="font-medium">{medication.name}</p>
                <p className="text-sm text-muted-foreground">
                  Estoque atual: {medication.stock} unidades
                </p>
                {medication.expiration_date && (
                  <p className="text-xs text-muted-foreground">
                    Validade: {format(new Date(medication.expiration_date), 'dd/MM/yyyy')}
                  </p>
                )}
                {medication.manufacturer && (
                  <p className="text-xs text-muted-foreground">
                    Fabricante: {medication.manufacturer}
                  </p>
                )}
                {medication.batch_number && (
                  <p className="text-xs text-muted-foreground">
                    Lote: {medication.batch_number}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adjustment-type" className="text-right">
                  Tipo de Ajuste
                </Label>
                <div className="col-span-3">
                  <Select value={adjustmentType} onValueChange={(value: "entrada" | "saída") => setAdjustmentType(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saída">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mt-4">
                <Label htmlFor="stock-quantity" className="text-right">
                  Quantidade
                </Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  className="col-span-3"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantidade"
                  min="1"
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
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <Button 
                variant="outline" 
                type="button"
                onClick={toggleHistory}
              >
                Ver Histórico
              </Button>
              
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="mr-2"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !quantity}
                >
                  {isSubmitting ? "Processando..." : "Confirmar ajuste"}
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <div className="mb-4 border rounded-md p-4 bg-muted/50">
                <p className="font-medium">{medication.name}</p>
                <p className="text-sm">Estoque atual: {medication.stock} unidades</p>
              </div>
              
              {historyData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left">Data</th>
                        <th className="px-4 py-2 text-left">Tipo</th>
                        <th className="px-4 py-2 text-left">Quantidade</th>
                        <th className="px-4 py-2 text-left">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item) => (
                        <tr key={item.id} className="border-b border-muted">
                          <td className="px-4 py-2">{format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                              item.adjustment_type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.adjustment_type === 'entrada' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">{item.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum histórico de movimentação encontrado
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={toggleHistory}
                className="mr-auto"
              >
                Voltar para Ajuste
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
