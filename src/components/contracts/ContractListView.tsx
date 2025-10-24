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
import { Eye, Edit, Trash2 } from "lucide-react";
import { Contract } from "@/services/contractService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContractListViewProps {
  contracts: Contract[];
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contractId: string) => void;
}

export default function ContractListView({
  contracts,
  onView,
  onEdit,
  onDelete,
}: ContractListViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Responsável</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Data Início</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              Nenhum contrato encontrado.
            </TableCell>
          </TableRow>
        ) : (
          contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">
                {contract.responsible_name}
              </TableCell>
              <TableCell>{contract.responsible_document}</TableCell>
              <TableCell>
                {format(new Date(contract.start_date), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>{formatCurrency(Number(contract.value))}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    contract.status === "active" ? "default" : "secondary"
                  }
                >
                  {contract.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(contract)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(contract)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(contract.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
