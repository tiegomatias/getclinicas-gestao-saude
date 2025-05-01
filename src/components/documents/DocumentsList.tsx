
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
import { MoreHorizontal, Download, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data para documentos
const mockDocuments = [
  {
    id: 1,
    name: "Contrato de Internação - João Silva",
    type: "contract",
    typeLabel: "Contrato",
    date: "05/05/2025",
    size: "245 KB",
    author: "Dr. Carlos Oliveira",
    patient: "João Silva",
    status: "signed",
  },
  {
    id: 2,
    name: "Termo de Consentimento - Maria Oliveira",
    type: "consent",
    typeLabel: "Termo",
    date: "03/05/2025",
    size: "189 KB",
    author: "Dra. Ana Souza",
    patient: "Maria Oliveira",
    status: "pending",
  },
  {
    id: 3,
    name: "Laudo Médico - Pedro Santos",
    type: "report",
    typeLabel: "Laudo",
    date: "01/05/2025",
    size: "320 KB",
    author: "Dr. Roberto Costa",
    patient: "Pedro Santos",
    status: "signed",
  },
  {
    id: 4,
    name: "Resultado de Exames - Carla Mendes",
    type: "exam",
    typeLabel: "Exame",
    date: "29/04/2025",
    size: "1.2 MB",
    author: "Lab Central",
    patient: "Carla Mendes",
    status: "pending",
  },
  {
    id: 5,
    name: "Prontuário Inicial - Paulo Ferreira",
    type: "record",
    typeLabel: "Prontuário",
    date: "28/04/2025",
    size: "156 KB",
    author: "Dra. Ana Souza",
    patient: "Paulo Ferreira",
    status: "signed",
  },
];

interface DocumentsListProps {
  searchQuery?: string;
}

export default function DocumentsList({ searchQuery = "" }: DocumentsListProps) {
  const filteredDocuments = searchQuery
    ? mockDocuments.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockDocuments;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox id="select-all" />
        <label
          htmlFor="select-all"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Selecionar todos
        </label>
        
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Baixar selecionados
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir selecionados
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Data</TableHead>
            <TableHead className="hidden lg:table-cell">Tamanho</TableHead>
            <TableHead className="hidden xl:table-cell">Autor</TableHead>
            <TableHead className="hidden xl:table-cell">Paciente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <Checkbox id={`select-${doc.id}`} />
              </TableCell>
              <TableCell className="font-medium">{doc.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`
                    ${doc.type === "contract" && "bg-blue-50 text-blue-700 border-blue-300"}
                    ${doc.type === "consent" && "bg-purple-50 text-purple-700 border-purple-300"}
                    ${doc.type === "report" && "bg-green-50 text-green-700 border-green-300"}
                    ${doc.type === "exam" && "bg-amber-50 text-amber-700 border-amber-300"}
                    ${doc.type === "record" && "bg-indigo-50 text-indigo-700 border-indigo-300"}
                  `}
                >
                  {doc.typeLabel}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{doc.date}</TableCell>
              <TableCell className="hidden lg:table-cell">{doc.size}</TableCell>
              <TableCell className="hidden xl:table-cell">{doc.author}</TableCell>
              <TableCell className="hidden xl:table-cell">{doc.patient}</TableCell>
              <TableCell>
                {doc.status === "signed" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    Assinado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    Pendente
                  </Badge>
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
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" /> Baixar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
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
