
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
import { MedicationPrescription } from "@/lib/types";

interface PrescriptionsListProps {
  prescriptions: MedicationPrescription[];
}

export function PrescriptionsList({ prescriptions }: PrescriptionsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Medicamento</TableHead>
          <TableHead>Posologia</TableHead>
          <TableHead>Frequência</TableHead>
          <TableHead>Período</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prescriptions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              Não há prescrições ativas no momento.
            </TableCell>
          </TableRow>
        ) : (
          prescriptions.map(prescription => (
            <TableRow key={prescription.id}>
              <TableCell>{prescription.patient.name}</TableCell>
              <TableCell>
                {`${prescription.medication.name} ${prescription.medication.dosage}`}
              </TableCell>
              <TableCell>{prescription.dosage}</TableCell>
              <TableCell>{prescription.frequency}</TableCell>
              <TableCell>
                {`${format(new Date(prescription.start_date), 'dd/MM/yyyy')} a ${
                  prescription.end_date 
                    ? format(new Date(prescription.end_date), 'dd/MM/yyyy')
                    : "Indefinido"
                }`}
              </TableCell>
              <TableCell>
                <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                  prescription.status === "Ativa" ? "bg-green-100 text-green-800" :
                  prescription.status === "Finalizada" ? "bg-gray-100 text-gray-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {prescription.status}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  Visualizar
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
