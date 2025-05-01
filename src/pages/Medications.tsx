
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";

export default function Medications() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        setHasData(hasMedicationsData);
      } catch (error) {
        console.error("Erro ao verificar dados de medicamentos:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  const handleAddMedication = () => {
    // Aqui você pode abrir um formulário ou modal para adicionar medicamentos
    console.log("Adicionar medicamento");
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
            <Input type="search" placeholder="Buscar medicamento..." className="pl-8 w-[250px]" />
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
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                      {[
                        {
                          name: "Fluoxetina",
                          active: "Cloridrato de fluoxetina",
                          category: "Antidepressivo",
                          dosage: "20mg",
                          stock: 87,
                          status: "Adequado",
                        },
                        {
                          name: "Clonazepam",
                          active: "Clonazepam",
                          category: "Ansiolítico",
                          dosage: "2mg",
                          stock: 45,
                          status: "Adequado",
                        },
                        {
                          name: "Risperidona",
                          active: "Risperidona",
                          category: "Antipsicótico",
                          dosage: "3mg",
                          stock: 12,
                          status: "Baixo",
                        },
                        {
                          name: "Topiramato",
                          active: "Topiramato",
                          category: "Anticonvulsivante",
                          dosage: "100mg",
                          stock: 56,
                          status: "Adequado",
                        },
                        {
                          name: "Naltrexona",
                          active: "Naltrexona",
                          category: "Antagonista opioide",
                          dosage: "50mg",
                          stock: 8,
                          status: "Crítico",
                        },
                      ].map((med, i) => (
                        <TableRow key={i}>
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
                            <Button variant="ghost" size="sm">Ajustar</Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                  <p className="text-muted-foreground text-sm">
                    Selecione um paciente para visualizar suas prescrições ou crie uma nova prescrição.
                  </p>
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
                  <p className="text-muted-foreground text-sm">
                    Selecione um período ou paciente para visualizar o histórico de administrações.
                  </p>
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
    </div>
  );
}
