
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

// No demo data - documents will come from real database

interface DocumentsListProps {
  searchQuery?: string;
}

export default function DocumentsList({ searchQuery = "" }: DocumentsListProps) {
  // No documents available - showing empty state
  const filteredDocuments: any[] = [];

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
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              Nenhum documento encontrado. Faça upload de documentos para começar.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
