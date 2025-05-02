
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PillIcon, Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/shared/EmptyState";
import { medicationService } from "@/services/medicationService";
import { patientService } from "@/services/patientService";
import { toast } from "sonner";
import { MedicationForm } from "@/components/medications/MedicationForm";
import { StockAdjustmentForm } from "@/components/medications/StockAdjustmentForm";
import { MedicationList } from "@/components/medications/MedicationList";
import { PrescriptionForm } from "@/components/medications/PrescriptionForm";
import { PrescriptionsList } from "@/components/medications/PrescriptionsList";
import { AdministrationForm } from "@/components/medications/AdministrationForm";
import { AdministrationsList } from "@/components/medications/AdministrationsList";
import { supabase } from "@/integrations/supabase/client";

// Interface para o tipo de medicamento
interface Medication {
  id: string;
  name: string;
  active: string;
  category: string;
  dosage: string;
  stock: number;
  status: string;
  clinic_id: string;
}

// Interface para o tipo de prescrição
interface Prescription {
  id: string;
  patient_id: string;
  patient: {
    id: string;
    name: string;
  };
  medication_id: string;
  medication: {
    id: string;
    name: string;
    dosage: string;
  };
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  status: string;
  observations: string | null;
}

// Interface para o tipo de administração
interface Administration {
  id: string;
  prescription_id: string;
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
  administered_by: string;
  administered_at: string;
  status: string;
  observations: string | null;
}

// Interface para o tipo de paciente
interface Patient {
  id: string;
  name: string;
}

export default function Medications() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicId, setClinicId] = useState<string>("");
  
  // Estados para diálogos
  const [newMedicationDialogOpen, setNewMedicationDialogOpen] = useState(false);
  const [adjustStockDialogOpen, setAdjustStockDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [newPrescriptionDialogOpen, setNewPrescriptionDialogOpen] = useState(false);
  const [newAdministrationDialogOpen, setNewAdministrationDialogOpen] = useState(false);
  
  useEffect(() => {
    const getClinicId = () => {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) return "";
      
      try {
        const clinicData = JSON.parse(clinicDataStr);
        return clinicData.id || "";
      } catch (e) {
        console.error("Error parsing clinic data:", e);
        return "";
      }
    };

    const loadData = async () => {
      try {
        setIsLoading(true);
        const id = getClinicId();
        
        if (!id) {
          toast.error("ID da clínica não encontrado");
          setIsLoading(false);
          return;
        }
        
        setClinicId(id);

        // Check if clinic has medication data
        const hasMedicationsData = await medicationService.hasClinicData(id);
        setHasData(hasMedicationsData);
        
        if (hasMedicationsData) {
          await loadAllData(id);
        }
      } catch (error) {
        console.error("Error loading medication data:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadAllData = async (id: string) => {
    try {
      const [medsData, patientsData, prescriptionsData, adminsData] = await Promise.all([
        medicationService.getMedications(id),
        patientService.getPatients(id),
        medicationService.getPrescriptions(id),
        medicationService.getAdministrations(id, selectedDate)
      ]);

      setMedications(medsData);
      setPatients(patientsData);
      setPrescriptions(prescriptionsData);
      setAdministrations(adminsData);
    } catch (error) {
      console.error("Error loading medication data:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  // Função para adicionar novo medicamento
  const handleAddMedication = () => {
    setNewMedicationDialogOpen(true);
  };

  // Função para abrir o diálogo de ajuste de estoque
  const handleAdjustStock = (medication: Medication) => {
    setSelectedMedication(medication);
    setAdjustStockDialogOpen(true);
  };

  // Função para criar nova prescrição
  const handleNewPrescription = () => {
    setNewPrescriptionDialogOpen(true);
  };

  // Função para registrar nova administração
  const handleRegisterAdministration = () => {
    setNewAdministrationDialogOpen(true);
  };
  
  // Atualizar prescrições quando o paciente selecionado mudar
  const handlePatientChange = async (value: string) => {
    setSelectedPatient(value);
    try {
      if (value === "all") {
        const data = await medicationService.getPrescriptions(clinicId);
        setPrescriptions(data);
      } else {
        const data = await medicationService.getPrescriptions(clinicId, value);
        setPrescriptions(data);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Erro ao carregar prescrições");
    }
  };
  
  // Atualizar administrações quando a data selecionada mudar
  const handleDateChange = async (value: string) => {
    setSelectedDate(value);
    try {
      const data = await medicationService.getAdministrations(clinicId, value);
      setAdministrations(data);
    } catch (error) {
      console.error("Error fetching administrations:", error);
      toast.error("Erro ao carregar administrações");
    }
  };
  
  // Refreshing data
  const refreshMedications = async () => {
    try {
      const data = await medicationService.getMedications(clinicId);
      setMedications(data);
      setHasData(data.length > 0);
    } catch (error) {
      console.error("Error refreshing medications:", error);
      toast.error("Erro ao atualizar dados de medicamentos");
    }
  };
  
  const refreshPrescriptions = async () => {
    try {
      if (selectedPatient === "all") {
        const data = await medicationService.getPrescriptions(clinicId);
        setPrescriptions(data);
      } else {
        const data = await medicationService.getPrescriptions(clinicId, selectedPatient);
        setPrescriptions(data);
      }
    } catch (error) {
      console.error("Error refreshing prescriptions:", error);
      toast.error("Erro ao atualizar prescrições");
    }
  };
  
  const refreshAdministrations = async () => {
    try {
      const data = await medicationService.getAdministrations(clinicId, selectedDate);
      setAdministrations(data);
    } catch (error) {
      console.error("Error refreshing administrations:", error);
      toast.error("Erro ao atualizar administrações");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <PillIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Controle de Medicamentos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie prescrições, estoque e medicações
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar medicamento..." 
              className="pl-8 w-[250px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddMedication}>
            <Plus className="mr-2 h-4 w-4" /> Novo Medicamento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
          <TabsTrigger value="administered">Medicações Aplicadas</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center py-8 mt-4">
            <p>Carregando...</p>
          </div>
        ) : hasData ? (
          <>
            <TabsContent value="inventory" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Estoque de Medicamentos</CardTitle>
                  <CardDescription>
                    Visualize o inventário completo e monitore os níveis de estoque
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MedicationList 
                    medications={medications} 
                    onAdjustStock={handleAdjustStock}
                    onMedicationsChanged={refreshMedications}
                    searchQuery={searchQuery}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prescrições Ativas</CardTitle>
                  <CardDescription>
                    Visualize e gerencie prescrições médicas ativas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <Select 
                      value={selectedPatient}
                      onValueChange={handlePatientChange}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os pacientes</SelectItem>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleNewPrescription}>
                      <Plus className="mr-2 h-4 w-4" /> Nova Prescrição
                    </Button>
                  </div>
                  
                  <PrescriptionsList prescriptions={prescriptions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="administered" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Administração</CardTitle>
                  <CardDescription>
                    Medicações administradas aos pacientes pela equipe de enfermagem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <Input
                      type="date"
                      className="w-[200px]"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                    />
                    <Button onClick={handleRegisterAdministration}>
                      <Plus className="mr-2 h-4 w-4" /> Registrar Administração
                    </Button>
                  </div>
                  
                  <AdministrationsList administrations={administrations} />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <EmptyState
                icon={<PillIcon className="h-10 w-10 text-muted-foreground" />}
                title="Nenhum medicamento cadastrado"
                description="Adicione medicamentos ao estoque para começar a gerenciar prescrições e administrações."
                actionText="Adicionar medicamento"
                onAction={handleAddMedication}
              />
            </CardContent>
          </Card>
        )}
      </Tabs>
      
      {/* Formulários em diálogos */}
      <MedicationForm 
        open={newMedicationDialogOpen} 
        onOpenChange={setNewMedicationDialogOpen}
        onSuccess={refreshMedications}
        clinicId={clinicId}
      />
      
      <StockAdjustmentForm 
        open={adjustStockDialogOpen} 
        onOpenChange={setAdjustStockDialogOpen}
        onSuccess={refreshMedications}
        medication={selectedMedication}
      />
      
      <PrescriptionForm 
        open={newPrescriptionDialogOpen} 
        onOpenChange={setNewPrescriptionDialogOpen}
        onSuccess={refreshPrescriptions}
        clinicId={clinicId}
      />
      
      <AdministrationForm 
        open={newAdministrationDialogOpen} 
        onOpenChange={setNewAdministrationDialogOpen}
        onSuccess={refreshAdministrations}
        clinicId={clinicId}
      />
    </div>
  );
}
