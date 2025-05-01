
import React from "react";
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

export default function Calendar() {
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
          <Select defaultValue="all">
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

          <Button>
            <Plus className="mr-2 h-4 w-4" /> Agendar Atividade
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

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
                  <Select defaultValue="month">
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Dia</SelectItem>
                      <SelectItem value="week">Semana</SelectItem>
                      <SelectItem value="month">Mês</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
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
                    <Button variant="ghost" size="sm">Ver</Button>
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
                    <Button variant="ghost" size="sm">Ver</Button>
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
                  <p className="text-muted-foreground">
                    O registro de presença nas atividades estará disponível em breve.
                  </p>
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
      </Tabs>
    </div>
  );
}
