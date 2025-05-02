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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { medicationService } from "@/services/medicationService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AdministrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clinicId: string;
}

interface Prescription {
  id: string;
  medication_id: string;
  patient_id: string;
  patient: {
    id: string;
    name: string;
  };
  medication: {
    id: string;
    name: string;
    dosage: string;
  };
  dosage: string;
}

export function AdministrationForm({
  open,
  onOpenChange,
  onSuccess,
  clinicId
}: AdministrationFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  const [formData, setFormData] = useState({
    prescriptionId: "",
    administeredBy: "",
    administeredAt: new Date().toISOString().slice(0, 16), // format: "2025-05-01T08:30"
    observations: ""
  });

  // Selected prescription data
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);
        const data = await medicationService.getPrescriptions(clinicId);
        // Only get active prescriptions
        const activePrescriptions = data.filter(p => p.status === 'Ativa');
        setPrescriptions(activePrescriptions);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast.error("Erro ao carregar prescrições");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPrescriptions();
    }
  }, [open, clinicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePrescriptionChange = (value: string) => {
    const prescription = prescriptions.find(p => p.id === value) || null;
    setSelectedPrescription(prescription);
    setFormData(prev => ({
      ...prev,
      prescriptionId: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.prescriptionId || !formData.administeredBy || !formData.administeredAt || !selectedPrescription) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Obter o user ID atual para rastreamento
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      await medicationService.addAdministration({
        clinic_id: clinicId,
        prescription_id: formData.prescriptionId,
        patient_id: selectedPrescription.patient_id,
        medication_id: selectedPrescription.medication_id,
        dosage: selectedPrescription.dosage,
        administered_by: formData.administeredBy,
        administered_at: formData.administeredAt,
        observations: formData.observations || undefined,
        created_by: userId
      });
      
      toast.success("Administração registrada com sucesso");
      
      // Reset form
      setFormData({
        prescriptionId: "",
        administeredBy: "",
        administeredAt: new Date().toISOString().slice(0, 16),
        observations: ""
      });
      setSelectedPrescription(null);
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error registering administration:", error);
      toast.error("Erro ao registrar administração");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-8 text-center">
            <p>Carregando prescrições...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar administração</DialogTitle>
          <DialogDescription>
            Registre a administração de um medicamento a um paciente
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prescription" className="text-right">
              Prescrição
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.prescriptionId}
                onValueChange={handlePrescriptionChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma prescrição" />
                </SelectTrigger>
                <SelectContent>
                  {prescriptions.length === 0 ? (
                    <SelectItem value="" disabled>Nenhuma prescrição ativa encontrada</SelectItem>
                  ) : (
                    prescriptions.map(prescription => (
                      <SelectItem key={prescription.id} value={prescription.id}>
                        {`${prescription.patient.name} - ${prescription.medication.name}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedPrescription && (
            <div className="bg-muted p-3 rounded-md">
              <p><strong>Paciente:</strong> {selectedPrescription.patient.name}</p>
              <p><strong>Medicamento:</strong> {selectedPrescription.medication.name} {selectedPrescription.medication.dosage}</p>
              <p><strong>Posologia:</strong> {selectedPrescription.dosage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="administeredBy" className="text-right">
              Administrado por
            </Label>
            <Input
              id="administeredBy"
              placeholder="Nome do profissional"
              className="col-span-3"
              value={formData.administeredBy}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="administeredAt" className="text-right">
              Data e hora
            </Label>
            <Input
              id="administeredAt"
              type="datetime-local"
              className="col-span-3"
              value={formData.administeredAt}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="observations" className="text-right">
              Observações
            </Label>
            <Textarea
              id="observations"
              placeholder="Observações adicionais"
              className="col-span-3"
              value={formData.observations}
              onChange={handleChange}
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
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.prescriptionId || !formData.administeredBy}
          >
            {isSubmitting ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
