
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
import { CalendarIcon, Plus, Filter, Clock, Users, CheckCircle } from "lucide-react";
import AppointmentCalendar from "@/components/calendar/AppointmentCalendar";
import AppointmentsList from "@/components/calendar/AppointmentsList";
import ActivityForm from "@/components/calendar/ActivityForm";
import ActivityDetailModal from "@/components/calendar/ActivityDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/shared/EmptyState";
import { activityService, Activity } from "@/services/activityService";
import { toast } from "sonner";

export default function Calendar() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("month");
  const [activityType, setActivityType] = useState("all");
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [clinicId, setClinicId] = useState<string>("");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        setIsLoading(false);
        return;
      }
      
      const clinicData = JSON.parse(clinicDataStr);
      setClinicId(clinicData.id);
      
      const data = await activityService.getActivities(clinicData.id);
      setActivities(data);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const handleFilterChange = (value: string) => {
    setActivityType(value);
  };

  const handleViewChange = (value: string) => {
    setViewMode(value);
  };

  const handleShowDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityDetail(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityDetail(false);
    setShowActivityForm(true);
  };

  const handleFormSuccess = () => {
    loadActivities();
  };

  const handleDeleteSuccess = () => {
    loadActivities();
  };

  const filteredActivities = activities.filter(activity => {
    if (activityType === "all") return true;
    return activity.activity_type === activityType;
  });

  const todayActivities = activities.filter(activity => {
    const today = new Date();
    const activityDate = new Date(activity.start_time);
    return (
      activityDate.getDate() === today.getDate() &&
      activityDate.getMonth() === today.getMonth() &&
      activityDate.getFullYear() === today.getFullYear()
    );
  }).slice(0, 2);

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
        ) : activities.length > 0 ? (
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
                    <AppointmentCalendar 
                      activities={filteredActivities}
                      onActivityClick={handleShowDetails}
                    />
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
                    {todayActivities.length > 0 ? (
                      <div className="space-y-3">
                        {todayActivities.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-2 rounded-md border p-3">
                            <div className="rounded-md bg-blue-100 p-2 text-blue-700">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{new Date(activity.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(activity.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                {activity.location && (
                                  <>
                                    <span>•</span>
                                    <span>{activity.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleShowDetails(activity)}
                            >
                              Ver
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma atividade programada para hoje
                      </p>
                    )}
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p>Sistema de presença ativo</p>
                      </div>
                      <p className="text-sm">
                        Para registrar a presença dos participantes, clique em uma atividade no calendário e use os botões de controle de presença individual.
                      </p>
                      <div className="grid gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Presente - Participante confirmou presença</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-destructive"></div>
                          <span>Ausente - Participante não compareceu</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                          <span>Confirmado - Aguardando confirmação</span>
                        </div>
                      </div>
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
                  <AppointmentsList 
                    activities={filteredActivities}
                    onActivityClick={handleShowDetails}
                  />
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

      <ActivityForm
        open={showActivityForm}
        onOpenChange={setShowActivityForm}
        clinicId={clinicId}
        activity={editingActivity}
        onSuccess={handleFormSuccess}
      />

      <ActivityDetailModal
        open={showActivityDetail}
        onOpenChange={setShowActivityDetail}
        activity={selectedActivity}
        onEdit={handleEditActivity}
        onDelete={handleDeleteSuccess}
      />
    </div>
  );
}
