
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
import { 
  Download,
  Trash2,
  Clock,
  History,
  AlarmClock,
  AlertTriangle
} from "lucide-react";
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
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Medication {
  id: string;
  name: string;
  active: string;
  category: string;
  dosage: string;
  stock: number;
  status: string;
  clinic_id: string;
  manufacturer?: string;
  expiration_date?: string;
  batch_number?: string;
  observations?: string;
}

interface MedicationListProps {
  medications: Medication[];
  onAdjustStock: (medication: Medication) => void;
  onMedicationsChanged: () => void;
  searchQuery: string;
}

interface StockHistoryEntry {
  id: string;
  medication_id: string;
  adjustment_type: string; // Alterado de "entrada" | "saída" para string
  quantity: number;
  notes?: string;
  created_at: string;
  created_by?: string;
  clinic_id: string; // Adicionado para compatibilidade com o retorno da API
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
  const [viewHistoryDialogOpen, setViewHistoryDialogOpen] = useState(false);
  const [selectedMedicationForHistory, setSelectedMedicationForHistory] = useState<Medication | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Filter medications based on search query
  const filteredMedications = searchQuery 
    ? medications.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.active.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (med.manufacturer && med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()))
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
    let csvContent = "ID,Nome,Princípio Ativo,Categoria,Dosagem,Estoque,Status,Fabricante,Lote,Data Validade,Observações\n";
    medicationsToExport.forEach(med => {
      csvContent += `${med.id},"${med.name}","${med.active}","${med.category}","${med.dosage}",${med.stock},"${med.status}","${med.manufacturer || ''}","${med.batch_number || ''}","${med.expiration_date || ''}","${med.observations?.replace(/"/g, '""') || ''}"\n`;
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

  // View stock history
  const handleViewHistory = async (medication: Medication) => {
    setSelectedMedicationForHistory(medication);
    setIsLoadingHistory(true);
    try {
      const history = await medicationService.getMedicationStockHistory(medication.id);
      setStockHistory(history);
      setViewHistoryDialogOpen(true);
    } catch (error) {
      console.error("Error fetching stock history:", error);
      toast.error("Erro ao buscar histórico de estoque");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Calculate if medication is expiring soon
  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const days30FromNow = new Date();
    days30FromNow.setDate(today.getDate() + 30);
    
    return expDate <= days30FromNow && expDate > today;
  };

  // Calculate if medication is expired
  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    
    return expDate < today;
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
            <TableHead>Fabricante/Lote</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMedications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                Nenhum medicamento encontrado para esta pesquisa.
              </TableCell>
            </TableRow>
          ) : (
            filteredMedications.map((med) => (
              <TableRow key={med.id} className={isExpired(med.expiration_date) ? "bg-red-50" : isExpiringSoon(med.expiration_date) ? "bg-yellow-50" : ""}>
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
                <TableCell>
                  {med.manufacturer && <div>{med.manufacturer}</div>}
                  {med.batch_number && <div className="text-xs text-muted-foreground">Lote: {med.batch_number}</div>}
                </TableCell>
                <TableCell>
                  {med.expiration_date ? (
                    <div className="flex items-center gap-1">
                      {isExpired(med.expiration_date) ? (
                        <AlertTriangle size={16} className="text-red-500" />
                      ) : isExpiringSoon(med.expiration_date) ? (
                        <AlarmClock size={16} className="text-amber-500" />
                      ) : (
                        <Clock size={16} className="text-green-500" />
                      )}
                      {format(new Date(med.expiration_date), 'dd/MM/yyyy')}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Não informada</span>
                  )}
                </TableCell>
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
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onAdjustStock(med)}
                    >
                      Ajustar estoque
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewHistory(med)}
                    >
                      <History size={16} />
                    </Button>
                  </div>
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

      {/* View stock history dialog */}
      <Dialog open={viewHistoryDialogOpen} onOpenChange={setViewHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Histórico de Estoque: {selectedMedicationForHistory?.name}
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingHistory ? (
            <div className="py-8 text-center">
              <p>Carregando histórico...</p>
            </div>
          ) : stockHistory.length === 0 ? (
            <div className="py-8 text-center">
              <p>Nenhum registro de movimentação encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockHistory.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                        entry.adjustment_type === "entrada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {entry.adjustment_type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{entry.quantity} unidades</TableCell>
                    <TableCell>{entry.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
