
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
import { PillIcon, Plus, Search, Download, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Interface para o tipo de medicamento
interface Medication {
  id: number;
  name: string;
  active: string;
  category: string;
  dosage: string;
  stock: number;
  status: "Adequado" | "Baixo" | "Crítico";
}

// Interface para o tipo de prescrição
interface Prescription {
  id: number;
  patientId: string;
  patientName: string;
  medicationId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  status: "Ativa" | "Finalizada" | "Cancelada";
  observations: string;
}

// Interface para o tipo de administração
interface Administration {
  id: number;
  prescriptionId: number;
  patientName: string;
  medicationName: string;
  dosage: string;
  administeredBy: string;
  administeredAt: string;
  status: "Concluído" | "Cancelado";
  observations: string;
}

export default function Medications() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicationsList, setMedicationsList] = useState<Medication[]>([]);
  const [prescriptionsList, setPrescriptionsList] = useState<Prescription[]>([]);
  const [administrationsList, setAdministrationsList] = useState<Administration[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados para diálogos
  const [newMedicationDialogOpen, setNewMedicationDialogOpen] = useState(false);
  const [adjustStockDialogOpen, setAdjustStockDialogOpen] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<number | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState("");
  const [newPrescriptionDialogOpen, setNewPrescriptionDialogOpen] = useState(false);
  const [newAdministrationDialogOpen, setNewAdministrationDialogOpen] = useState(false);
  
  // Estados para novo medicamento
  const [newMedication, setNewMedication] = useState({
    name: "",
    active: "",
    category: "",
    dosage: "",
    stock: 0
  });

  // Dados de exemplo para pacientes
  const patients = [
    { id: "patient1", name: "Maria Silva" },
    { id: "patient2", name: "João Santos" },
    { id: "patient3", name: "Ana Oliveira" },
    { id: "patient4", name: "Pedro Souza" }
  ];

  useEffect(() => {
    const checkForData = async () => {
      try {
        // Obter o ID da clínica do localStorage
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) {
          setHasData(false);
          setIsLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        const hasMedicationsData = await clinicService.hasClinicData(clinicData.id, "medications");
        
        // Verificar se a clínica já tem dados
        setHasData(hasMedicationsData);
        
        // Inicializar com alguns dados de exemplo se a clínica tiver dados
        if (hasMedicationsData) {
          // Dados de exemplo para medicamentos
          const exampleMedications: Medication[] = [
            { id: 1, name: "Alprazolam", active: "Alprazolam", category: "Ansiolítico", dosage: "0,5mg", stock: 120, status: "Adequado" },
            { id: 2, name: "Fluoxetina", active: "Cloridrato de fluoxetina", category: "Antidepressivo", dosage: "20mg", stock: 85, status: "Adequado" },
            { id: 3, name: "Risperidona", active: "Risperidona", category: "Antipsicótico", dosage: "2mg", stock: 15, status: "Baixo" },
            { id: 4, name: "Clonazepam", active: "Clonazepam", category: "Ansiolítico", dosage: "2mg", stock: 8, status: "Crítico" },
            { id: 5, name: "Sertralina", active: "Cloridrato de sertralina", category: "Antidepressivo", dosage: "50mg", stock: 42, status: "Adequado" }
          ];
          
          // Dados de exemplo para prescrições
          const examplePrescriptions: Prescription[] = [
            { 
              id: 1, 
              patientId: "patient1", 
              patientName: "Maria Silva", 
              medicationId: 1, 
              medicationName: "Alprazolam 0,5mg", 
              dosage: "1 comprimido", 
              frequency: "2x ao dia", 
              startDate: "2025-04-25", 
              endDate: "2025-05-25", 
              status: "Ativa", 
              observations: "Tomar após as refeições" 
            },
            { 
              id: 2, 
              patientId: "patient2", 
              patientName: "João Santos", 
              medicationId: 2, 
              medicationName: "Fluoxetina 20mg", 
              dosage: "1 cápsula", 
              frequency: "1x ao dia", 
              startDate: "2025-04-20", 
              endDate: "2025-07-20", 
              status: "Ativa", 
              observations: "Tomar pela manhã" 
            },
            { 
              id: 3, 
              patientId: "patient3", 
              patientName: "Ana Oliveira", 
              medicationId: 3, 
              medicationName: "Risperidona 2mg", 
              dosage: "1 comprimido", 
              frequency: "1x ao dia", 
              startDate: "2025-04-15", 
              endDate: "2025-05-15", 
              status: "Ativa", 
              observations: "Tomar à noite antes de dormir" 
            }
          ];
          
          // Dados de exemplo para administrações
          const exampleAdministrations: Administration[] = [
            { 
              id: 1, 
              prescriptionId: 1, 
              patientName: "Maria Silva", 
              medicationName: "Alprazolam 0,5mg", 
              dosage: "1 comprimido", 
              administeredBy: "Enf. Carlos Silva", 
              administeredAt: "2025-05-01 08:30", 
              status: "Concluído", 
              observations: "Paciente sem reações adversas" 
            },
            { 
              id: 2, 
              prescriptionId: 1, 
              patientName: "Maria Silva", 
              medicationName: "Alprazolam 0,5mg", 
              dosage: "1 comprimido", 
              administeredBy: "Enf. Carlos Silva", 
              administeredAt: "2025-05-01 20:15", 
              status: "Concluído", 
              observations: "" 
            },
            { 
              id: 3, 
              prescriptionId: 2, 
              patientName: "João Santos", 
              medicationName: "Fluoxetina 20mg", 
              dosage: "1 cápsula", 
              administeredBy: "Enf. Ana Sousa", 
              administeredAt: "2025-05-01 07:45", 
              status: "Concluído", 
              observations: "" 
            }
          ];
          
          setMedicationsList(exampleMedications);
          setPrescriptionsList(examplePrescriptions);
          setAdministrationsList(exampleAdministrations);
        }
      } catch (error) {
        console.error("Erro ao verificar dados de medicamentos:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  // Função para lidar com a seleção individual de medicamentos
  const toggleMedicationSelection = (medicationId: number) => {
    setSelectedMedications(prevSelected => {
      if (prevSelected.includes(medicationId)) {
        return prevSelected.filter(id => id !== medicationId);
      } else {
        return [...prevSelected, medicationId];
      }
    });
  };

  // Função para lidar com a seleção/desseleção de todos os medicamentos
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedMedications([]);
    } else {
      setSelectedMedications(filteredMedications.map(med => med.id));
    }
    setSelectAll(!selectAll);
  };

  // Função para adicionar novo medicamento
  const handleAddMedication = () => {
    setNewMedicationDialogOpen(true);
  };

  // Função para salvar novo medicamento
  const saveNewMedication = () => {
    if (!newMedication.name || !newMedication.active || !newMedication.category || !newMedication.dosage || newMedication.stock <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    // Gerar um ID único
    const newId = Math.max(0, ...medicationsList.map(med => med.id || 0)) + 1;
    
    // Determinar o status com base no estoque
    let status: "Adequado" | "Baixo" | "Crítico" = "Adequado";
    if (newMedication.stock <= 10) {
      status = "Crítico";
    } else if (newMedication.stock <= 20) {
      status = "Baixo";
    }
    
    const medicationToAdd: Medication = {
      id: newId,
      name: newMedication.name,
      active: newMedication.active,
      category: newMedication.category,
      dosage: newMedication.dosage,
      stock: newMedication.stock,
      status: status
    };
    
    setMedicationsList([...medicationsList, medicationToAdd]);
    setHasData(true);
    toast.success("Medicamento adicionado com sucesso!");
    
    // Resetar o formulário e fechar o diálogo
    setNewMedication({
      name: "",
      active: "",
      category: "",
      dosage: "",
      stock: 0
    });
    setNewMedicationDialogOpen(false);
  };

  // Função para abrir o diálogo de ajuste de estoque
  const openAdjustStockDialog = (medicationId: number) => {
    setSelectedMedicationId(medicationId);
    setStockAdjustment("");
    setAdjustStockDialogOpen(true);
  };

  // Função para ajustar o estoque
  const handleAdjustStock = () => {
    if (!selectedMedicationId || !stockAdjustment || isNaN(parseInt(stockAdjustment))) {
      toast.error("Informe um valor válido para o ajuste de estoque");
      return;
    }
    
    const adjustmentValue = parseInt(stockAdjustment);
    
    const updatedMedications = medicationsList.map(med => {
      if (med.id === selectedMedicationId) {
        // Calcular novo estoque (não permitir estoque negativo)
        const newStock = Math.max(0, med.stock + adjustmentValue);
        
        // Determinar o novo status com base no estoque atualizado
        let newStatus: "Adequado" | "Baixo" | "Crítico" = "Adequado";
        if (newStock <= 10) {
          newStatus = "Crítico";
        } else if (newStock <= 20) {
          newStatus = "Baixo";
        }
        
        // Mostrar mensagem adequada baseada no tipo de ajuste
        if (adjustmentValue > 0) {
          toast.success(`Entrada de ${adjustmentValue} unidades de ${med.name} registrada`);
        } else if (adjustmentValue < 0) {
          toast.success(`Saída de ${Math.abs(adjustmentValue)} unidades de ${med.name} registrada`);
        }
        
        return { ...med, stock: newStock, status: newStatus };
      }
      return med;
    });
    
    setMedicationsList(updatedMedications);
    setAdjustStockDialogOpen(false);
  };

  // Função para excluir medicamentos selecionados
  const handleDeleteSelected = () => {
    if (selectedMedications.length === 0) {
      toast.error("Nenhum medicamento selecionado para exclusão");
      return;
    }
    
    // Filtrar para manter apenas os medicamentos não selecionados
    const updatedMedications = medicationsList.filter(med => !selectedMedications.includes(med.id));
    setMedicationsList(updatedMedications);
    
    // Resetar seleções
    setSelectedMedications([]);
    setSelectAll(false);
    
    toast.success(`${selectedMedications.length} medicamento(s) excluído(s) com sucesso`);
  };

  // Função para baixar medicamentos selecionados
  const handleDownloadSelected = () => {
    if (selectedMedications.length === 0) {
      toast.error("Nenhum medicamento selecionado para download");
      return;
    }
    
    // Obter os medicamentos selecionados
    const medicationsToExport = medicationsList.filter(med => selectedMedications.includes(med.id));
    
    // Converter para CSV
    let csvContent = "ID,Nome,Princípio Ativo,Categoria,Dosagem,Estoque,Status\n";
    medicationsToExport.forEach(med => {
      csvContent += `${med.id},"${med.name}","${med.active}","${med.category}","${med.dosage}",${med.stock},"${med.status}"\n`;
    });
    
    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    // Criar URL temporária
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "medicamentos.csv");
    
    // Simular clique para baixar
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Download iniciado");
  };

  // Função para criar nova prescrição
  const handleNewPrescription = () => {
    setNewPrescriptionDialogOpen(true);
  };

  // Função para registrar nova administração
  const handleRegisterAdministration = () => {
    setNewAdministrationDialogOpen(true);
  };

  // Filtrar medicamentos com base na pesquisa
  const filteredMedications = searchQuery 
    ? medicationsList.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.active.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : medicationsList;
    
  // Filtrar prescrições com base no paciente selecionado
  const filteredPrescriptions = selectedPatient === "all"
    ? prescriptionsList
    : prescriptionsList.filter(prescription => prescription.patientId === selectedPatient);
    
  // Filtrar administrações com base na data selecionada
  const filteredAdministrations = administrationsList.filter(
    admin => admin.administeredAt.startsWith(selectedDate)
  );

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
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="select-all" 
                        checked={selectAll} 
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Selecionar todos
                      </label>
                    </div>
                    
                    <div className="ml-auto flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadSelected}
                        disabled={selectedMedications.length === 0}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar selecionados
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={handleDeleteSelected}
                        disabled={selectedMedications.length === 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir selecionados
                      </Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Princípio Ativo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Dosagem</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Nenhum medicamento encontrado para esta pesquisa.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMedications.map((med) => (
                          <TableRow key={med.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                id={`select-${med.id}`}
                                checked={selectedMedications.includes(med.id)}
                                onChange={() => toggleMedicationSelection(med.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{med.name}</TableCell>
                            <TableCell>{med.active}</TableCell>
                            <TableCell>{med.category}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>{med.stock} unidades</TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                med.status === "Adequado" ? "bg-green-100 text-green-800" :
                                med.status === "Baixo" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {med.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openAdjustStockDialog(med.id)}
                              >
                                Ajustar estoque
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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
                      defaultValue="all"
                      value={selectedPatient}
                      onValueChange={setSelectedPatient}
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
                  
                  {filteredPrescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {selectedPatient === "all" 
                          ? "Não há prescrições ativas no momento." 
                          : "Não há prescrições ativas para este paciente."
                        }
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Medicamento</TableHead>
                          <TableHead>Posologia</TableHead>
                          <TableHead>Frequência</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPrescriptions.map(prescription => (
                          <TableRow key={prescription.id}>
                            <TableCell>{prescription.patientName}</TableCell>
                            <TableCell>{prescription.medicationName}</TableCell>
                            <TableCell>{prescription.dosage}</TableCell>
                            <TableCell>{prescription.frequency}</TableCell>
                            <TableCell>{`${prescription.startDate} a ${prescription.endDate}`}</TableCell>
                            <TableCell>
                              <span className="inline-block px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                                {prescription.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Visualizar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
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
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Button onClick={handleRegisterAdministration}>
                      <Plus className="mr-2 h-4 w-4" /> Registrar Administração
                    </Button>
                  </div>
                  
                  {filteredAdministrations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Não há registros de administração para esta data.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Horário</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Medicamento</TableHead>
                          <TableHead>Dosagem</TableHead>
                          <TableHead>Administrado por</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAdministrations.map(admin => (
                          <TableRow key={admin.id}>
                            <TableCell>{admin.administeredAt.split(' ')[1]}</TableCell>
                            <TableCell>{admin.patientName}</TableCell>
                            <TableCell>{admin.medicationName}</TableCell>
                            <TableCell>{admin.dosage}</TableCell>
                            <TableCell>{admin.administeredBy}</TableCell>
                            <TableCell>
                              <span className="inline-block px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                                {admin.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
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
      
      {/* Diálogo para adicionar novo medicamento */}
      <Dialog open={newMedicationDialogOpen} onOpenChange={setNewMedicationDialogOpen}>
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
                onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
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
                onChange={(e) => setNewMedication({...newMedication, active: e.target.value})}
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
                onChange={(e) => setNewMedication({...newMedication, category: e.target.value})}
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
                onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
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
                onChange={(e) => setNewMedication({...newMedication, stock: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewMedicationDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveNewMedication}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para ajuste de estoque */}
      <Dialog open={adjustStockDialogOpen} onOpenChange={setAdjustStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajuste de estoque</DialogTitle>
            <DialogDescription>
              Informe a quantidade a ser adicionada ou removida do estoque
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedicationId && (
            <div className="py-4">
              <div className="mb-4">
                <p className="font-medium">{medicationsList.find(m => m.id === selectedMedicationId)?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Estoque atual: {medicationsList.find(m => m.id === selectedMedicationId)?.stock} unidades
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
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(e.target.value)}
                  placeholder="Use número positivo para entrada ou negativo para saída"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use valores positivos para entrada de estoque (ex: 10) ou negativos para saída (ex: -5)
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAdjustStockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdjustStock}>Confirmar ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para nova prescrição (esqueleto básico) */}
      <Dialog open={newPrescriptionDialogOpen} onOpenChange={setNewPrescriptionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova prescrição</DialogTitle>
            <DialogDescription>
              Crie uma nova prescrição para um paciente
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Formulário de prescrição será implementado aqui.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewPrescriptionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success("Prescrição criada com sucesso!");
              setNewPrescriptionDialogOpen(false);
            }}>
              Criar prescrição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para nova administração (esqueleto básico) */}
      <Dialog open={newAdministrationDialogOpen} onOpenChange={setNewAdministrationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registrar administração</DialogTitle>
            <DialogDescription>
              Registre a administração de um medicamento a um paciente
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Formulário de administração será implementado aqui.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewAdministrationDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success("Administração registrada com sucesso!");
              setNewAdministrationDialogOpen(false);
            }}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
