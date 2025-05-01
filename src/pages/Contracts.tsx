
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Search, FilePdf } from "lucide-react";
import { Input } from "@/components/ui/input";
import ContractForm from "@/components/contracts/ContractForm";
import ContractPreview from "@/components/contracts/ContractPreview";

interface ContractData {
  responsavelNome: string;
  responsavelRg: string;
  responsavelCpf: string;
  responsavelEndereco: string;
  responsavelCidade: string;
  responsavelEstado: string;
  responsavelCep: string;
  pacienteNome: string;
  pacienteIdade: string;
  pacienteDataNascimento: string;
  dataEntrada: string;
  tempoInternacao: string;
  valorTratamento: string;
  formaPagamento: string;
  clinicaNome: string;
  dataAssinatura: string;
}

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("new");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);

  const handleNewContract = () => {
    setActiveTab("new");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleContractSubmit = (data: ContractData) => {
    setContractData(data);
    setPreviewOpen(true);
  };

  // Lista de contratos de exemplo
  const mockContracts = [
    { id: 1, paciente: "João Silva", responsavel: "Maria Silva", data: "2023-05-10", status: "Ativo" },
    { id: 2, paciente: "Pedro Souza", responsavel: "Carlos Souza", data: "2023-04-22", status: "Ativo" },
    { id: 3, paciente: "Ana Oliveira", responsavel: "Roberto Oliveira", data: "2023-03-15", status: "Finalizado" },
    { id: 4, paciente: "Lucas Santos", responsavel: "Júlia Santos", data: "2023-02-28", status: "Ativo" },
    { id: 5, paciente: "Mariana Costa", responsavel: "José Costa", data: "2023-01-12", status: "Finalizado" },
  ];

  // Filtrar contratos pela busca
  const filteredContracts = mockContracts.filter(
    (contract) =>
      contract.paciente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.responsavel.toLowerCase().includes(searchQuery.toLowerCase())
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
              onChange={handleSearch}
            />
          </div>
          <Button onClick={handleNewContract}>
            <Plus className="mr-2 h-4 w-4" /> Novo Contrato
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Contratos Existentes</TabsTrigger>
          <TabsTrigger value="new">Novo Contrato</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-2 text-left">ID</th>
                      <th className="py-3 px-2 text-left">Paciente</th>
                      <th className="py-3 px-2 text-left">Responsável</th>
                      <th className="py-3 px-2 text-left">Data</th>
                      <th className="py-3 px-2 text-left">Status</th>
                      <th className="py-3 px-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.length > 0 ? (
                      filteredContracts.map((contract) => (
                        <tr key={contract.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">{contract.id}</td>
                          <td className="py-3 px-2">{contract.paciente}</td>
                          <td className="py-3 px-2">{contract.responsavel}</td>
                          <td className="py-3 px-2">{new Date(contract.data).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                contract.status === "Ativo"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {contract.status}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <FilePdf className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Nenhum contrato encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Geração de Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractForm onSubmit={handleContractSubmit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {contractData && (
        <ContractPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          contractData={contractData}
        />
      )}
    </div>
  );
}
