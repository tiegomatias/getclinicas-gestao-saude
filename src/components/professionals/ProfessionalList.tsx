
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

// Mock data for professionals
const mockProfessionals = [
  {
    id: 1,
    name: "Dr. Carlos Oliveira",
    role: "doctor",
    roleLabel: "Médico",
    register: "CRM 45678",
    specialization: "Psiquiatria",
    email: "carlos.oliveira@getclinicas.com",
    phone: "(11) 98765-4321",
  },
  {
    id: 2,
    name: "Dra. Ana Souza",
    role: "psychologist",
    roleLabel: "Psicóloga",
    register: "CRP 12345",
    specialization: "Terapia Cognitivo-Comportamental",
    email: "ana.souza@getclinicas.com",
    phone: "(11) 91234-5678",
  },
  {
    id: 3,
    name: "Fernando Santos",
    role: "nurse",
    roleLabel: "Enfermeiro",
    register: "COREN 56789",
    specialization: "Saúde Mental",
    email: "fernando.santos@getclinicas.com",
    phone: "(11) 92345-6789",
  },
  {
    id: 4,
    name: "Mariana Lima",
    role: "therapist",
    roleLabel: "Terapeuta",
    register: "CRTH 34567",
    specialization: "Dependência Química",
    email: "mariana.lima@getclinicas.com",
    phone: "(11) 93456-7890",
  },
  {
    id: 5,
    name: "Juliana Costa",
    role: "reception",
    roleLabel: "Recepção",
    register: "-",
    specialization: "Atendimento ao Cliente",
    email: "juliana.costa@getclinicas.com",
    phone: "(11) 94567-8901",
  },
];

export default function ProfessionalList() {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="hidden md:table-cell">Registro</TableHead>
            <TableHead className="hidden md:table-cell">Especialização</TableHead>
            <TableHead className="hidden lg:table-cell">Contato</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockProfessionals.map((professional) => (
            <TableRow key={professional.id}>
              <TableCell className="font-medium">{professional.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`
                    ${professional.role === "doctor" && "bg-blue-50 text-blue-700 border-blue-300"}
                    ${professional.role === "psychologist" && "bg-purple-50 text-purple-700 border-purple-300"}
                    ${professional.role === "nurse" && "bg-green-50 text-green-700 border-green-300"}
                    ${professional.role === "therapist" && "bg-amber-50 text-amber-700 border-amber-300"}
                    ${professional.role === "reception" && "bg-gray-50 text-gray-700 border-gray-300"}
                  `}
                >
                  {professional.roleLabel}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{professional.register}</TableCell>
              <TableCell className="hidden md:table-cell">{professional.specialization}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="text-sm">
                  <div>{professional.email}</div>
                  <div className="text-muted-foreground">{professional.phone}</div>
                </div>
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
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="mr-2 h-4 w-4" /> Remover
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
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
