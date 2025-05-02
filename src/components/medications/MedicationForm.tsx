
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface MedicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clinicId: string;
}

// Tipos de medicamentos disponíveis
const medicationTypes = [
  "Comprimido",
  "Cápsula",
  "Gotas",
  "Injetável",
  "Xarope",
  "Pomada",
  "Creme",
  "Gel",
  "Spray",
  "Adesivo",
  "Outro"
];

export function MedicationForm({ open, onOpenChange, onSuccess, clinicId }: MedicationFormProps) {
  const [newMedication, setNewMedication] = useState({
    name: "",
    active: "",
    category: "",
    medicationType: "Comprimido", // Tipo de medicamento (novo)
    dosage: "",
    unit: "mg", // Unidade de medida (novo)
    stock: 0,
    expirationDate: "", // Data de validade (novo)
    manufacturer: "", // Laboratório/fabricante (novo)
    batchNumber: "", // Lote (novo)
    observations: "" // Observações (novo)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewMedication(prev => ({
      ...prev,
      [id.replace('med-', '')]: id === 'med-stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setNewMedication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!newMedication.name || !newMedication.active) {
      toast.error("Preencha pelo menos os campos obrigatórios (Nome e Princípio Ativo)");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userId = user?.id;
      
      await medicationService.addMedication({
        clinic_id: clinicId,
        name: newMedication.name,
        active: newMedication.active,
        category: newMedication.category || newMedication.medicationType, // Usar tipo como categoria se não houver categoria
        dosage: `${newMedication.dosage} ${newMedication.unit}`,
        stock: newMedication.stock,
        manufacturer: newMedication.manufacturer,
        expirationDate: newMedication.expirationDate,
        batchNumber: newMedication.batchNumber,
        observations: newMedication.observations,
        created_by: userId
      });
      
      toast.success("Medicamento adicionado com sucesso");
      setNewMedication({
        name: "",
        active: "",
        category: "",
        medicationType: "Comprimido",
        dosage: "",
        unit: "mg",
        stock: 0,
        expirationDate: "",
        manufacturer: "",
        batchNumber: "",
        observations: ""
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding medication:", error);
      
      toast.error("Erro ao adicionar medicamento. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar novo medicamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do medicamento a ser adicionado ao estoque
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Informações básicas */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-name" className="text-right">
              Nome *
            </Label>
            <Input
              id="med-name"
              className="col-span-3"
              value={newMedication.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-active" className="text-right">
              Princípio Ativo *
            </Label>
            <Input
              id="med-active"
              className="col-span-3"
              value={newMedication.active}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-medicationType" className="text-right">
              Tipo
            </Label>
            <div className="col-span-3">
              <Select 
                value={newMedication.medicationType}
                onValueChange={(value) => handleSelectChange('medicationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {medicationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Dosagem e unidade */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-dosage" className="text-right">
              Dosagem
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="med-dosage"
                className="flex-1"
                value={newMedication.dosage}
                onChange={handleChange}
                placeholder="Ex: 500"
              />
              <Select 
                value={newMedication.unit}
                onValueChange={(value) => handleSelectChange('unit', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="mcg">mcg</SelectItem>
                  <SelectItem value="UI">UI</SelectItem>
                  <SelectItem value="cap">cap</SelectItem>
                  <SelectItem value="comp">comp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estoque */}
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

          {/* Informações adicionais */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-expirationDate" className="text-right">
              Data de Validade
            </Label>
            <Input
              id="med-expirationDate"
              type="date"
              className="col-span-3"
              value={newMedication.expirationDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-manufacturer" className="text-right">
              Fabricante
            </Label>
            <Input
              id="med-manufacturer"
              className="col-span-3"
              value={newMedication.manufacturer}
              onChange={handleChange}
              placeholder="Nome do laboratório/fabricante"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-batchNumber" className="text-right">
              Lote
            </Label>
            <Input
              id="med-batchNumber"
              className="col-span-3"
              value={newMedication.batchNumber}
              onChange={handleChange}
              placeholder="Número do lote (opcional)"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-observations" className="text-right">
              Observações
            </Label>
            <Textarea
              id="med-observations"
              className="col-span-3"
              value={newMedication.observations}
              onChange={handleChange}
              placeholder="Observações adicionais sobre o medicamento"
              rows={3}
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
