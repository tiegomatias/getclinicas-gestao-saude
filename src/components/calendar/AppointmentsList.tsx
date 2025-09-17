
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

// No demo data - appointments will come from real database

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
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center">
              Nenhuma atividade agendada. Adicione compromissos através da agenda.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
