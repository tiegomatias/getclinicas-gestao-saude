
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
import { CalendarIcon, Plus, Filter, Clock, Users } from "lucide-react";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import AppointmentsList from "@/components/calendar/AppointmentsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";
import { toast } from "sonner";

export default function Calendar() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("month");
  const [activityType, setActivityType] = useState("all");

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
        const hasActivitiesData = await clinicService.hasClinicData(clinicData.id, "activities");
        setHasData(hasActivitiesData);
      } catch (error) {
        console.error("Erro ao verificar dados de atividades:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  const handleAddActivity = () => {
    // Simular adição de atividade
    setHasData(true);
    toast.success("Nova atividade agendada com sucesso!");
  };

  const handleFilterChange = (value: string) => {
    setActivityType(value);
    toast.info(`Filtro aplicado: ${value === "all" ? "Todas atividades" : value}`);
  };

  const handleViewChange = (value: string) => {
    setViewMode(value);
    toast.info(`Visualização alterada para: ${value}`);
  };

  const handleViewPatientRecord = () => {
    toast.info("Abrindo prontuário do paciente");
  };

  const handleShowDetails = () => {
    toast.info("Visualizando detalhes da atividade");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <CalendarIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie atividades, consultas e eventos
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select 
            defaultValue="all" 
            value={activityType}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas atividades</SelectItem>
              <SelectItem value="medical">Consultas médicas</SelectItem>
              <SelectItem value="therapy">Terapias</SelectItem>
              <SelectItem value="group">Atividades em grupo</SelectItem>
              <SelectItem value="other">Outros eventos</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleAddActivity}>
            <Plus className="mr-2 h-4 w-4" /> Agendar Atividade
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Carregando...</p>
          </div>
        ) : hasData ? (
          <>
            <TabsContent value="calendar" className="space-y-4">
              <Card className="bg-muted/40">
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Calendário de Atividades</CardTitle>
                      <CardDescription>
                        Visualize consultas, terapias e eventos
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select 
                        defaultValue="month"
                        value={viewMode}
                        onValueChange={handleViewChange}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Dia</SelectItem>
                          <SelectItem value="week">Semana</SelectItem>
                          <SelectItem value="month">Mês</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => toast.info("Filtros aplicados")}>
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-background p-4">
                    <AppointmentCalendar />
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximas Atividades</CardTitle>
                    <CardDescription>
                      Atividades programadas para hoje
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 rounded-md border p-3">
                        <div className="rounded-md bg-blue-100 p-2 text-blue-700">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Consulta Médica - Dr. Carlos</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>14:00 - 14:30</span>
                            <span>•</span>
                            <span>Sala 03</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleShowDetails}
                        >
                          Ver
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 rounded-md border p-3">
                        <div className="rounded-md bg-green-100 p-2 text-green-700">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Terapia em Grupo</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>15:00 - 16:30</span>
                            <span>•</span>
                            <span>Salão Principal</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleShowDetails}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Presença nas Atividades</CardTitle>
                    <CardDescription>
                      Registro de participação dos pacientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <p className="text-muted-foreground mb-4">
                        O registro de presença nas atividades estará disponível em breve.
                      </p>
                      <Button onClick={() => toast.success("Recurso será disponibilizado em breve!")}>
                        Ativar Registro de Presença
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Atividades</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todas as atividades agendadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentsList />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <EmptyState
                icon={<CalendarIcon className="h-10 w-10 text-muted-foreground" />}
                title="Nenhuma atividade agendada"
                description="Crie sua primeira atividade ou consulta para começar a gerenciar a agenda da clínica."
                actionText="Agendar atividade"
                onAction={handleAddActivity}
              />
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
