
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
import { Eye } from "lucide-react";
import { Activity } from "@/services/activityService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentsListProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

const activityTypeLabels: Record<string, string> = {
  medical: "Consulta Médica",
  therapy: "Terapia Individual",
  group: "Terapia em Grupo",
  workshop: "Workshop",
  recreation: "Atividade Recreativa",
  other: "Outro",
};

const activityTypeColors: Record<string, string> = {
  medical: "bg-blue-100 text-blue-800",
  therapy: "bg-purple-100 text-purple-800",
  group: "bg-green-100 text-green-800",
  workshop: "bg-amber-100 text-amber-800",
  recreation: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

export default function AppointmentsList({ activities, onActivityClick }: AppointmentsListProps) {

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
          {activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhuma atividade agendada. Adicione compromissos através da agenda.
              </TableCell>
            </TableRow>
          ) : (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.title}</TableCell>
                <TableCell>
                  <Badge className={activityTypeColors[activity.activity_type] || activityTypeColors.other}>
                    {activityTypeLabels[activity.activity_type] || activity.activity_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(activity.start_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {activity.location || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {activity.professional?.name || "-"}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {activity.participants?.length || 0} participante(s)
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Agendado</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onActivityClick(activity)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
