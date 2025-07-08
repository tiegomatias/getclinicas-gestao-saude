import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BedFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BedForm = ({ open, onOpenChange, onSuccess }: BedFormProps) => {
  const [formData, setFormData] = useState({
    bed_number: "",
    bed_type: "",
    status: "available",
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      bed_number: "",
      bed_type: "",
      status: "available",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bed_number || !formData.bed_type) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      // Get clinic data from localStorage
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        toast.error("Dados da clínica não encontrados.");
        return;
      }

      const clinicData = JSON.parse(clinicDataStr);

      // Insert bed into Supabase
      const { error } = await supabase.from("beds").insert({
        clinic_id: clinicData.id,
        bed_number: formData.bed_number,
        bed_type: formData.bed_type,
        status: formData.status,
      });

      if (error) {
        console.error("Erro ao cadastrar leito:", error);
        toast.error(`Erro ao cadastrar leito: ${error.message}`);
        return;
      }

      toast.success("Leito cadastrado com sucesso!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao cadastrar leito:", error);
      toast.error(`Erro ao cadastrar leito: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Leito</DialogTitle>
          <DialogDescription>
            Preencha as informações do leito que será cadastrado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bed_number">Número do Leito *</Label>
            <Input
              id="bed_number"
              placeholder="Ex: A01, B02"
              value={formData.bed_number}
              onChange={(e) => handleChange("bed_number", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bed_type">Tipo/Ala *</Label>
            <Input
              id="bed_type"
              placeholder="Ex: Ala A - Masculino, Ala B - Feminino"
              value={formData.bed_type}
              onChange={(e) => handleChange("bed_type", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="occupied">Ocupado</SelectItem>
                <SelectItem value="maintenance">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BedForm;