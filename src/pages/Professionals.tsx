
import React from "react";
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

export default function Professionals() {
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
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Profissional
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list">
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
              <ProfessionalList />
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
              <ProfessionalForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Acesso</CardTitle>
              <CardDescription>
                Gerencie permissões e níveis de acesso para cada tipo de profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-muted-foreground">
                    Defina quais funcionalidades cada tipo de profissional pode acessar no sistema.
                    Configure regras específicas para médicos, psicólogos, enfermeiros e equipe administrativa.
                  </p>
                </div>
                <p className="text-muted-foreground">
                  O controle de permissões estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
