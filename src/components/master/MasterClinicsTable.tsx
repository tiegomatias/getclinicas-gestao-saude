import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClinicData } from "@/services/masterService";

interface MasterClinicsTableProps {
  clinics: ClinicData[];
  onViewClinic: (clinicId: string) => void;
  onEditClinic: (clinic: ClinicData) => void;
  onDeleteClinic: (clinicId: string) => void;
  onViewDetails: (clinic: ClinicData) => void;
}

export const MasterClinicsTable = ({ clinics, onViewClinic, onEditClinic, onDeleteClinic, onViewDetails }: MasterClinicsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<ClinicData | null>(null);
  const itemsPerPage = 5;
  
  const totalPages = Math.max(1, Math.ceil(clinics.length / itemsPerPage));
  
  const currentItems = clinics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleDeleteClick = (clinic: ClinicData) => {
    setClinicToDelete(clinic);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clinicToDelete) {
      onDeleteClinic(clinicToDelete.id);
      setDeleteDialogOpen(false);
      setClinicToDelete(null);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Clínicas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {clinics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma clínica cadastrada ainda.
            </div>
          ) : (
            <Table className="border rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Data de Registro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((clinic) => {
                  const createdAt = new Date(clinic.created_at);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  const isNew = diffDays < 2;
                  
                  return (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">
                        {clinic.name}
                        {isNew && (
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                            Nova
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{clinic.plan || "Padrão"}</TableCell>
                      <TableCell>{new Date(clinic.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails(clinic)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditClinic(clinic)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(clinic)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {clinics.length > itemsPerPage && (
          <CardFooter className="flex items-center justify-between border-t px-6 py-3">
            <div className="text-sm text-muted-foreground">
              Mostrando <strong>{Math.min(clinics.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, clinics.length)}</strong> de <strong>{clinics.length}</strong> clínicas
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a clínica <strong>{clinicToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita. Todos os dados relacionados (pacientes, profissionais, leitos, etc.) serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
