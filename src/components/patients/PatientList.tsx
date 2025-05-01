
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
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Mock data for patients
const mockPatients = [
  {
    id: 1,
    name: "João Silva",
    admissionDate: "27/04/2025",
    admissionType: "voluntary",
    admissionTypeLabel: "Voluntária",
    status: "active",
    statusLabel: "Internado",
    phone: "(11) 99876-5432",
  },
  {
    id: 2,
    name: "Maria Oliveira",
    admissionDate: "15/04/2025",
    admissionType: "involuntary",
    admissionTypeLabel: "Involuntária",
    status: "active",
    statusLabel: "Internado",
    phone: "(11) 98765-4321",
  },
  {
    id: 3,
    name: "Carlos Santos",
    admissionDate: "03/03/2025",
    admissionType: "compulsory",
    admissionTypeLabel: "Compulsória",
    status: "discharged",
    statusLabel: "Alta",
    phone: "(11) 97654-3210",
  },
  {
    id: 4,
    name: "Fernanda Lima",
    admissionDate: "21/02/2025",
    admissionType: "voluntary",
    admissionTypeLabel: "Voluntária",
    status: "discharged",
    statusLabel: "Alta",
    phone: "(11) 96543-2109",
  },
  {
    id: 5,
    name: "Roberto Almeida",
    admissionDate: "10/04/2025",
    admissionType: "involuntary",
    admissionTypeLabel: "Involuntária",
    status: "active",
    statusLabel: "Internado",
    phone: "(11) 95432-1098",
  },
];

interface PatientListProps {
  searchQuery: string;
}

export default function PatientList({ searchQuery }: PatientListProps) {
  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  const handleEdit = (id: number) => {
    toast.info(`Editar paciente ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    toast.success(`Paciente ID: ${id} removido com sucesso`);
  };

  const handleViewDetails = (id: number) => {
    toast.info(`Visualizando detalhes do paciente ID: ${id}`);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data de Admissão</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Telefone</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.admissionDate}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant="outline"
                    className={`
                      ${patient.admissionType === "voluntary" && "bg-green-50 text-green-700 border-green-300"}
                      ${patient.admissionType === "involuntary" && "bg-amber-50 text-amber-700 border-amber-300"}
                      ${patient.admissionType === "compulsory" && "bg-red-50 text-red-700 border-red-300"}
                    `}
                  >
                    {patient.admissionTypeLabel}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant="outline"
                    className={`
                      ${patient.status === "active" && "bg-blue-50 text-blue-700 border-blue-300"}
                      ${patient.status === "discharged" && "bg-gray-50 text-gray-700 border-gray-300"}
                    `}
                  >
                    {patient.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{patient.phone}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(patient.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remover
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Tem certeza que deseja remover este paciente?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(patient.id)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewDetails(patient.id)}>
                        Ver detalhes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum paciente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
