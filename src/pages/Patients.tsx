
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PatientForm from "@/components/patients/PatientForm";
import { toast } from "sonner";
import PatientList from "@/components/patients/PatientList";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("list");

  const handleNewPatient = () => {
    setActiveTab("register");
    toast.info("Formulário de novo paciente aberto");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <UserIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento de pacientes e prontuários
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar pacientes..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button onClick={handleNewPatient}>
            <Plus className="mr-2 h-4 w-4" /> Novo Paciente
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Listagem</TabsTrigger>
          <TabsTrigger value="register">Cadastro</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientList searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientForm onComplete={() => {
                setActiveTab("list");
                toast.success("Paciente cadastrado com sucesso!");
              }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
