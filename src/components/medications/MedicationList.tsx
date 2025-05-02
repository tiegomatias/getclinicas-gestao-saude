
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { medicationService } from "@/services/medicationService";
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

interface Medication {
  id: string;
  name: string;
  active: string;
  category: string;
  dosage: string;
  stock: number;
  status: string;
  clinic_id: string;
}

interface MedicationListProps {
  medications: Medication[];
  onAdjustStock: (medication: Medication) => void;
  onMedicationsChanged: () => void;
  searchQuery: string;
}

export function MedicationList({ 
  medications, 
  onAdjustStock, 
  onMedicationsChanged,
  searchQuery 
}: MedicationListProps) {
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter medications based on search query
  const filteredMedications = searchQuery 
    ? medications.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.active.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : medications;

  // Function to toggle all medications selection
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedMedications([]);
    } else {
      setSelectedMedications(filteredMedications.map(med => med.id));
    }
    setSelectAll(!selectAll);
  };

  // Function to toggle individual medication selection
  const toggleMedicationSelection = (medicationId: string) => {
    setSelectedMedications(prev => {
      if (prev.includes(medicationId)) {
        return prev.filter(id => id !== medicationId);
      } else {
        return [...prev, medicationId];
      }
    });
  };

  // Function to download selected medications as CSV
  const handleDownloadSelected = () => {
    if (selectedMedications.length === 0) {
      toast.error("Nenhum medicamento selecionado para download");
      return;
    }
    
    // Get the selected medications
    const medicationsToExport = medications.filter(med => 
      selectedMedications.includes(med.id)
    );
    
    // Convert to CSV
    let csvContent = "ID,Nome,Princípio Ativo,Categoria,Dosagem,Estoque,Status\n";
    medicationsToExport.forEach(med => {
      csvContent += `${med.id},"${med.name}","${med.active}","${med.category}","${med.dosage}",${med.stock},"${med.status}"\n`;
    });
    
    // Create blob and link for download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    // Create temporary URL
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "medicamentos.csv");
    
    // Simulate click to download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Download iniciado");
  };

  // Delete selected medications
  const confirmDelete = async () => {
    if (selectedMedications.length === 0) {
      toast.error("Nenhum medicamento selecionado para exclusão");
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete each medication
      for (const id of selectedMedications) {
        await medicationService.deleteMedication(id);
      }
      
      toast.success(`${selectedMedications.length} medicamento(s) excluído(s) com sucesso`);
      
      // Reset selections
      setSelectedMedications([]);
      setSelectAll(false);
      setDeleteDialogOpen(false);
      
      // Refresh the medications list
      onMedicationsChanged();
    } catch (error) {
      console.error("Error deleting medications:", error);
      toast.error("Erro ao excluir medicamentos");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="select-all" 
            checked={selectAll} 
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Selecionar todos
          </label>
        </div>
        
        <div className="ml-auto flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadSelected}
            disabled={selectedMedications.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar selecionados
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={selectedMedications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir selecionados
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Princípio Ativo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Dosagem</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMedications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Nenhum medicamento encontrado para esta pesquisa.
              </TableCell>
            </TableRow>
          ) : (
            filteredMedications.map((med) => (
              <TableRow key={med.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    id={`select-${med.id}`}
                    checked={selectedMedications.includes(med.id)}
                    onChange={() => toggleMedicationSelection(med.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </TableCell>
                <TableCell className="font-medium">{med.name}</TableCell>
                <TableCell>{med.active}</TableCell>
                <TableCell>{med.category}</TableCell>
                <TableCell>{med.dosage}</TableCell>
                <TableCell>{med.stock} unidades</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    med.status === "Adequado" ? "bg-green-100 text-green-800" :
                    med.status === "Baixo" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {med.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onAdjustStock(med)}
                  >
                    Ajustar estoque
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedMedications.length} medicamento(s)?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
