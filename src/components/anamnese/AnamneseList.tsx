import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { MedicalRecord } from "@/services/medicalRecordsService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnamneseListProps {
  records: MedicalRecord[];
  onEdit: (record: MedicalRecord) => void;
  onDelete: (id: string) => void;
}

export default function AnamneseList({ records, onEdit, onDelete }: AnamneseListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Diagnóstico</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.title}</TableCell>
              <TableCell>
                {format(new Date(record.record_date), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {record.diagnosis || "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{record.title}</DialogTitle>
                        <DialogDescription>
                          {format(new Date(record.record_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4 pr-4">
                          <div>
                            <h4 className="font-semibold mb-1">Conteúdo</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {record.content}
                            </p>
                          </div>
                          {record.diagnosis && (
                            <div>
                              <h4 className="font-semibold mb-1">Diagnóstico</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {record.diagnosis}
                              </p>
                            </div>
                          )}
                          {record.treatment_plan && (
                            <div>
                              <h4 className="font-semibold mb-1">Plano de Tratamento</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {record.treatment_plan}
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(record)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(record.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
