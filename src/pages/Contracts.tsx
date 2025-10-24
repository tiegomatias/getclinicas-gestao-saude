import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ContractForm from "@/components/contracts/ContractForm";
import ContractPreview from "@/components/contracts/ContractPreview";
import ContractListView from "@/components/contracts/ContractListView";
import EmptyState from "@/components/shared/EmptyState";
import { contractService, Contract } from "@/services/contractService";

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("list");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        setIsLoading(false);
        return;
      }
      
      const clinicData = JSON.parse(clinicDataStr);
      setClinicId(clinicData.id);
      
      const data = await contractService.getContracts(clinicData.id);
      setContracts(data);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewContract = () => {
    setEditingContract(null);
    setActiveTab("new");
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setPreviewOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setActiveTab("new");
  };

  const handleDeleteContract = async (contractId: string) => {
    if (confirm("Tem certeza que deseja excluir este contrato?")) {
      const success = await contractService.deleteContract(contractId);
      if (success) {
        loadContracts();
      }
    }
  };

  const handleContractSaved = () => {
    loadContracts();
    setActiveTab("list");
  };

  const filteredContracts = contracts.filter((contract) =>
    contract.responsible_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <FileText />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Contratos</h1>
            <p className="text-sm text-muted-foreground">
              Geração e gestão de contratos de prestação de serviços
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar contratos..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleNewContract}>
            <Plus className="mr-2 h-4 w-4" /> Novo Contrato
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Listagem</TabsTrigger>
          <TabsTrigger value="new">Novo Contrato</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Contratos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Carregando...</p>
                </div>
              ) : contracts.length > 0 ? (
                <ContractListView
                  contracts={filteredContracts}
                  onView={handleViewContract}
                  onEdit={handleEditContract}
                  onDelete={handleDeleteContract}
                />
              ) : (
                <EmptyState
                  icon={<FileText className="h-10 w-10 text-muted-foreground" />}
                  title="Nenhum contrato cadastrado"
                  description="Crie seu primeiro contrato para começar a gerenciar."
                  actionText="Novo contrato"
                  onAction={handleNewContract}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingContract ? "Editar Contrato" : "Novo Contrato"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContractForm
                clinicId={clinicId}
                contract={editingContract}
                onSuccess={handleContractSaved}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedContract && (
        <ContractPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          contractData={{
            responsavelNome: selectedContract.responsible_name,
            responsavelCpf: selectedContract.responsible_document,
            valorTratamento: selectedContract.value.toString(),
            dataAssinatura: selectedContract.start_date,
            responsavelRg: "",
            responsavelEndereco: "",
            responsavelCidade: "",
            responsavelEstado: "",
            responsavelCep: "",
            pacienteNome: "",
            pacienteIdade: "",
            pacienteDataNascimento: "",
            dataEntrada: selectedContract.start_date,
            tempoInternacao: "",
            formaPagamento: "",
            clinicaNome: "",
          }}
        />
      )}
    </div>
  );
}
