
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProfessionalForm from "@/components/professionals/ProfessionalForm";
import ProfessionalList from "@/components/professionals/ProfessionalList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";
import ProfessionalPermissions from "@/components/professionals/ProfessionalPermissions";

export default function Professionals() {
  const [activeTab, setActiveTab] = useState("list");
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
        const hasProfessionalsData = await clinicService.hasClinicData(clinicData.id, "professionals");
        setHasData(hasProfessionalsData);
      } catch (error) {
        console.error("Erro ao verificar dados de profissionais:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  const handleNewProfessional = () => {
    setActiveTab("register");
  };

  const handleFormComplete = () => {
    setActiveTab("list");
    setHasData(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Users />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Profissionais</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento de equipe e controle de acesso
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar profissionais..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
          <Button onClick={handleNewProfessional}>
            <Plus className="mr-2 h-4 w-4" /> Novo Profissional
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="list">Listagem</TabsTrigger>
          <TabsTrigger value="register">Cadastro</TabsTrigger>
          <TabsTrigger value="access">Permissões</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lista de Profissionais</CardTitle>
                <CardDescription>Gerenciamento da equipe multidisciplinar</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filtrar por cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="doctor">Médicos</SelectItem>
                    <SelectItem value="psychologist">Psicólogos</SelectItem>
                    <SelectItem value="nurse">Enfermeiros</SelectItem>
                    <SelectItem value="therapist">Terapeutas</SelectItem>
                    <SelectItem value="admin">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Carregando...</p>
                </div>
              ) : hasData ? (
                <ProfessionalList />
              ) : (
                <EmptyState
                  icon={<Users className="h-10 w-10 text-muted-foreground" />}
                  title="Nenhum profissional cadastrado"
                  description="Adicione o primeiro profissional à sua equipe para começar a gerenciar a equipe da clínica."
                  actionText="Adicionar profissional"
                  onAction={handleNewProfessional}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Profissional</CardTitle>
              <CardDescription>
                Adicione informações do novo membro da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Removed the onComplete prop that was causing the TypeScript error */}
              <ProfessionalForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="access">
          <ProfessionalPermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
