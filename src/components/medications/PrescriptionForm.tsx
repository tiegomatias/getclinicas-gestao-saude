
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
import { patientService } from "@/services/patientService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  stock: number;
  category: string;
  status: string;
  active: string;
}

interface Patient {
  id: string;
  name: string;
}

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clinicId: string;
}

export function PrescriptionForm({
  open,
  onOpenChange,
  onSuccess,
  clinicId
}: PrescriptionFormProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    patientId: "",
    medicationId: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    observations: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      if (open && clinicId) {
        try {
          setIsLoading(true);
          
          const [patientsData, medicationsData] = await Promise.all([
            patientService.getClinicPatients(clinicId),
            medicationService.getMedications(clinicId)
          ]);
          
          if (patientsData && Array.isArray(patientsData)) {
            setPatients(patientsData as unknown as Patient[]);
          } else {
            console.error("Formato de dados de pacientes inválido:", patientsData);
            setPatients([]);
          }

          if (medicationsData && Array.isArray(medicationsData)) {
            setMedications(medicationsData as unknown as Medication[]);
          } else {
            console.error("Formato de dados de medicamentos inválido:", medicationsData);
            setMedications([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Erro ao carregar dados");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [open, clinicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If selecting a medication, auto-populate the dosage suggestion
    if (field === "medicationId") {
      const selectedMed = medications.find(med => med.id === value);
      if (selectedMed) {
        setFormData(prev => ({
          ...prev,
          dosage: `1 ${selectedMed.dosage}`
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.medicationId || !formData.dosage || !formData.frequency || !formData.startDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Use the user from context instead of fetching from Supabase directly
      const userId = user?.id;
      
      await medicationService.addPrescription({
        clinic_id: clinicId,
        patient_id: formData.patientId,
        medication_id: formData.medicationId,
        dosage: formData.dosage,
        frequency: formData.frequency,
        start_date: formData.startDate,
        end_date: formData.endDate || undefined,
        observations: formData.observations || undefined,
        created_by: userId
      });
      
      toast.success("Prescrição criada com sucesso");
      
      // Reset form
      setFormData({
        patientId: "",
        medicationId: "",
        dosage: "",
        frequency: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        observations: ""
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error("Erro ao criar prescrição");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-8 text-center">
            <p>Carregando dados...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova prescrição</DialogTitle>
          <DialogDescription>
            Crie uma nova prescrição para um paciente
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="patient" className="text-right">
              Paciente
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.patientId} 
                onValueChange={(value) => handleSelectChange("patientId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.length === 0 ? (
                    <SelectItem value="" disabled>Nenhum paciente encontrado</SelectItem>
                  ) : (
                    patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="medication" className="text-right">
              Medicamento
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.medicationId} 
                onValueChange={(value) => handleSelectChange("medicationId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um medicamento" />
                </SelectTrigger>
                <SelectContent>
                  {medications.length === 0 ? (
                    <SelectItem value="" disabled>Nenhum medicamento encontrado</SelectItem>
                  ) : (
                    medications.map(med => (
                      <SelectItem key={med.id} value={med.id}>
                        {`${med.name} ${med.dosage}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dosage" className="text-right">
              Posologia
            </Label>
            <Input
              id="dosage"
              placeholder="Ex: 1 comprimido"
              className="col-span-3"
              value={formData.dosage}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequência
            </Label>
            <Input
              id="frequency"
              placeholder="Ex: 2x ao dia"
              className="col-span-3"
              value={formData.frequency}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Início
            </Label>
            <Input
              id="startDate"
              type="date"
              className="col-span-3"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Fim
            </Label>
            <Input
              id="endDate"
              type="date"
              className="col-span-3"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="observations" className="text-right">
              Observações
            </Label>
            <Textarea
              id="observations"
              placeholder="Observações adicionais sobre esta prescrição"
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Criar prescrição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
