
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
import { useAuth } from "@/contexts/AuthContext";
import { MedicationPrescription } from "@/lib/types";

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
  status?: string;
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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
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
        setError(null);
        console.log("Buscando prescrições para clínica:", clinicId);
        
        if (!clinicId) {
          console.log("ID da clínica não encontrado em AdministrationForm");
          setError("ID da clínica não encontrado. Por favor, verifique se você está logado corretamente.");
          setIsLoading(false);
          return;
        }
        
        // Verify if the user is authenticated using the context
        if (!user) {
          console.log("Usuário não autenticado");
          setError("Usuário não autenticado. Por favor, faça login novamente.");
          setIsLoading(false);
          return;
        }
        
        // We removed the direct check to clinic_users to avoid infinite recursion
        // With the RLS policies configured correctly, the call below will only return data 
        // if the user has access to the clinic
        
        const result = await medicationService.getPrescriptions(clinicId);
        console.log("Prescrições recebidas:", result.length);
        
        if (result && Array.isArray(result)) {
          // Use type assertion to convert to our Prescription type
          const data = result as unknown as MedicationPrescription[];
          
          // Only get active prescriptions - using safe property access
          const activePrescriptions = data.filter(p => 
            p && typeof p === 'object' && p.status === 'Ativa'
          );
          
          console.log("Prescrições ativas:", activePrescriptions.length);
          setPrescriptions(activePrescriptions);
        } else {
          console.error("Formato de dados inválido retornado pela API:", result);
          setError("Formato de dados inválido retornado pela API");
          setPrescriptions([]);
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setError("Erro ao carregar prescrições. Tente novamente mais tarde.");
        toast.error("Erro ao carregar prescrições");
      } finally {
        setIsLoading(false);
      }
    };

    if (open && clinicId) {
      fetchPrescriptions();
    }
  }, [open, clinicId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePrescriptionChange = (value: string) => {
    console.log("Prescrição selecionada:", value);
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
      setError(null);
      
      console.log("Registrando administração para prescrição:", formData.prescriptionId);
      
      // Get the user ID from the authentication context
      const userId = user?.id;
      console.log("User ID atual:", userId);
      
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      if (!clinicId) {
        throw new Error("ID da clínica não encontrado");
      }
      
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
    } catch (error: any) {
      console.error("Error registering administration:", error);
      setError(`Erro ao registrar administração: ${error.message || "Tente novamente"}`);
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
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
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
                    <SelectItem value="no-prescriptions" disabled>Nenhuma prescrição ativa encontrada</SelectItem>
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
