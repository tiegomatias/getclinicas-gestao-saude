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
import { AlertTriangle, PillIcon, Plus, Search } from "lucide-react";
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
import { format } from "date-fns";
import { Medication, MedicationPrescription } from "@/lib/types";

// Interface for the patient type
interface Patient {
  id: string;
  name: string;
}

// Interface for the administration type
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

export default function Medications() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<MedicationPrescription[]>([]);
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicId, setClinicId] = useState<string>("");
  const [expiringMedications, setExpiringMedications] = useState<Medication[]>([]);
  const [expiredMedications, setExpiredMedications] = useState<Medication[]>([]);
  
  // States for dialogs
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
        
        console.log("ID da clínica obtido:", id);
        setClinicId(id);

        // Check if clinic has medication data
        const hasMedicationsData = await medicationService.hasClinicData(id);
        console.log("Tem dados de medicamentos?", hasMedicationsData);
        setHasData(hasMedicationsData);
        
        if (hasMedicationsData) {
          await loadAllData(id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading medication data:", error);
        toast.error("Erro ao carregar dados");
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadAllData = async (id: string) => {
    try {
      console.log("Carregando todos os dados para clínica:", id);
      
      const medsData = await medicationService.getMedications(id);
      const patientsData = await patientService.getClinicPatients(id);
      const prescriptionsData = await medicationService.getPrescriptions(id);
      const adminsData = await medicationService.getAdministrations(id, selectedDate);
      const expiringData = await medicationService.getExpiringMedications(id, 30);
      const expiredData = await medicationService.getExpiredMedications(id);

      // Type assertions to match our interface types
      setMedications(medsData as Medication[]);
      setPatients(patientsData as Patient[]);
      setPrescriptions(prescriptionsData as MedicationPrescription[]);
      setAdministrations(adminsData as Administration[]);
      setExpiringMedications(expiringData as Medication[]);
      setExpiredMedications(expiredData as Medication[]);
      
      // Notify about expired medications, if any
      if (expiredData.length > 0) {
        toast.warning(`Atenção! Há ${expiredData.length} medicamentos vencidos no estoque.`);
      }
    } catch (error) {
      console.error("Error loading medication data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add new medication
  const handleAddMedication = () => {
    setNewMedicationDialogOpen(true);
  };

  // Function to open the stock adjustment dialog
  const handleAdjustStock = (medication: Medication) => {
    setSelectedMedication(medication);
    setAdjustStockDialogOpen(true);
  };

  // Function to create new prescription
  const handleNewPrescription = () => {
    setNewPrescriptionDialogOpen(true);
  };

  // Function to register new administration
  const handleRegisterAdministration = () => {
    setNewAdministrationDialogOpen(true);
  };
  
  // Update prescriptions when the selected patient changes
  const handlePatientChange = async (value: string) => {
    setSelectedPatient(value);
    try {
      if (value === "all") {
        const data = await medicationService.getPrescriptions(clinicId);
        setPrescriptions(data as MedicationPrescription[]);
      } else {
        const data = await medicationService.getPrescriptions(clinicId, value);
        setPrescriptions(data as MedicationPrescription[]);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Erro ao carregar prescrições");
    }
  };
  
  // Update administrations when the selected date changes
  const handleDateChange = async (value: string) => {
    setSelectedDate(value);
    try {
      const data = await medicationService.getAdministrations(clinicId, value);
      setAdministrations(data as Administration[]);
    } catch (error) {
      console.error("Error fetching administrations:", error);
      toast.error("Erro ao carregar administrações");
    }
  };
  
  // Refreshing data
  const refreshMedications = async () => {
    try {
      const data = await medicationService.getMedications(clinicId);
      setMedications(data as Medication[]);
      setHasData(data.length > 0);
      
      // Update expiring and expired medications
      const expiringData = await medicationService.getExpiringMedications(clinicId, 30);
      const expiredData = await medicationService.getExpiredMedications(clinicId);
      setExpiringMedications(expiringData as Medication[]);
      setExpiredMedications(expiredData as Medication[]);
    } catch (error) {
      console.error("Error refreshing medications:", error);
      toast.error("Erro ao atualizar dados de medicamentos");
    }
  };
  
  const refreshPrescriptions = async () => {
    try {
      if (selectedPatient === "all") {
        const data = await medicationService.getPrescriptions(clinicId);
        setPrescriptions(data as MedicationPrescription[]);
      } else {
        const data = await medicationService.getPrescriptions(clinicId, selectedPatient);
        setPrescriptions(data as MedicationPrescription[]);
      }
    } catch (error) {
      console.error("Error refreshing prescriptions:", error);
      toast.error("Erro ao atualizar prescrições");
    }
  };
  
  const refreshAdministrations = async () => {
    try {
      const data = await medicationService.getAdministrations(clinicId, selectedDate);
      setAdministrations(data as Administration[]);
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

      {/* Medication alerts */}
      {(expiredMedications.length > 0 || expiringMedications.length > 0) && (
        <div className="flex flex-col gap-3">
          {expiredMedications.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Medicamentos vencidos</p>
                <p className="text-sm text-red-600">
                  Há {expiredMedications.length} medicamento(s) vencido(s) no estoque que precisam ser descartados.
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {expiredMedications.slice(0, 3).map(med => (
                    <span key={med.id} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {med.name} (vencimento: {med.expiration_date ? format(new Date(med.expiration_date), 'dd/MM/yyyy') : 'N/A'})
                    </span>
                  ))}
                  {expiredMedications.length > 3 && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      + {expiredMedications.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {expiringMedications.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Medicamentos próximos ao vencimento</p>
                <p className="text-sm text-yellow-600">
                  Há {expiringMedications.length} medicamento(s) que vencerão nos próximos 30 dias.
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {expiringMedications.slice(0, 3).map(med => (
                    <span key={med.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {med.name} (vencimento: {med.expiration_date ? format(new Date(med.expiration_date), 'dd/MM/yyyy') : 'N/A'})
                    </span>
                  ))}
                  {expiringMedications.length > 3 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      + {expiringMedications.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
      
      {/* Dialog forms */}
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
