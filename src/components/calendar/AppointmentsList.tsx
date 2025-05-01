
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock appointments data
const mockAppointments = [
  {
    id: 1,
    title: "Consulta Médica - Avaliação",
    type: "medical",
    typeLabel: "Consulta Médica",
    date: "05/05/2025",
    time: "09:00 - 09:30",
    location: "Consultório 02",
    professional: "Dr. Carlos Oliveira",
    patient: "João Silva",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Terapia em Grupo - Dependência Química",
    type: "group",
    typeLabel: "Terapia em Grupo",
    date: "05/05/2025",
    time: "10:00 - 11:30",
    location: "Sala de Reuniões",
    professional: "Dra. Ana Souza",
    patient: "Múltiplos",
    status: "scheduled",
  },
  {
    id: 3,
    title: "Terapia Individual",
    type: "therapy",
    typeLabel: "Terapia Individual",
    date: "05/05/2025",
    time: "13:00 - 14:00",
    location: "Consultório 03",
    professional: "Fernando Santos",
    patient: "Maria Oliveira",
    status: "completed",
  },
  {
    id: 4,
    title: "Atividade de Arteterapia",
    type: "activity",
    typeLabel: "Atividade",
    date: "06/05/2025",
    time: "15:00 - 16:30",
    location: "Sala de Atividades",
    professional: "Mariana Lima",
    patient: "Múltiplos",
    status: "scheduled",
  },
  {
    id: 5,
    title: "Consulta Psiquiátrica - Retorno",
    type: "medical",
    typeLabel: "Consulta Médica",
    date: "07/05/2025",
    time: "08:30 - 09:00",
    location: "Consultório 01",
    professional: "Dr. Carlos Oliveira",
    patient: "Pedro Santos",
    status: "scheduled",
  },
];

export default function AppointmentsList() {
  const handleEditAppointment = (id: number) => {
    toast.info(`Editando atividade #${id}`);
  };
  
  const handleCancelAppointment = (id: number) => {
    toast.warning(`Atividade #${id} cancelada`);
  };
  
  const handleMarkComplete = (id: number) => {
    toast.success(`Atividade #${id} marcada como concluída`);
  };
  
  const handleMarkAbsent = (id: number) => {
    toast.error(`Registrada falta na atividade #${id}`);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atividade</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead className="hidden md:table-cell">Local</TableHead>
            <TableHead className="hidden lg:table-cell">Profissional</TableHead>
            <TableHead className="hidden xl:table-cell">Paciente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">{appointment.title}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`
                    ${appointment.type === "medical" && "bg-blue-50 text-blue-700 border-blue-300"}
                    ${appointment.type === "therapy" && "bg-purple-50 text-purple-700 border-purple-300"}
                    ${appointment.type === "group" && "bg-green-50 text-green-700 border-green-300"}
                    ${appointment.type === "activity" && "bg-amber-50 text-amber-700 border-amber-300"}
                  `}
                >
                  {appointment.typeLabel}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{appointment.date}</div>
                  <div className="text-sm text-muted-foreground">{appointment.time}</div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{appointment.location}</TableCell>
              <TableCell className="hidden lg:table-cell">{appointment.professional}</TableCell>
              <TableCell className="hidden xl:table-cell">{appointment.patient}</TableCell>
              <TableCell>
                {appointment.status === "completed" ? (
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-sm">Concluída</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="mr-1 h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm">Agendada</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditAppointment(appointment.id)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCancelAppointment(appointment.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleMarkComplete(appointment.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Marcar como concluída
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkAbsent(appointment.id)}>
                      <XCircle className="mr-2 h-4 w-4" /> Marcar falta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
