
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Administration {
  id: string;
  patient: { id: string; name: string };
  medication: { id: string; name: string; dosage: string };
  dosage: string;
  administered_by: string;
  administered_at: string;
  status: string;
  observations: string | null;
}

interface AdministrationsListProps {
  administrations: Administration[];
}

export function AdministrationsList({ administrations }: AdministrationsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Horário</TableHead>
          <TableHead>Paciente</TableHead>
          <TableHead>Medicamento</TableHead>
          <TableHead>Dosagem</TableHead>
          <TableHead>Administrado por</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {administrations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              Não há registros de administração para esta data.
            </TableCell>
          </TableRow>
        ) : (
          administrations.map(admin => (
            <TableRow key={admin.id}>
              <TableCell>
                {format(new Date(admin.administered_at), 'HH:mm')}
              </TableCell>
              <TableCell>{admin.patient.name}</TableCell>
              <TableCell>
                {`${admin.medication.name} ${admin.medication.dosage}`}
              </TableCell>
              <TableCell>{admin.dosage}</TableCell>
              <TableCell>{admin.administered_by}</TableCell>
              <TableCell>
                <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                  admin.status === "Concluído" ? "bg-green-100 text-green-800" : 
                  "bg-red-100 text-red-800"
                }`}>
                  {admin.status}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" title={admin.observations || ""}>
                  Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
