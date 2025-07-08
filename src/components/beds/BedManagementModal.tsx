import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { UserIcon, Settings, Trash2 } from "lucide-react";
import { bedService } from "@/services/bedService";
import { patientService } from "@/services/patientService";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
}

interface BedManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bed: {
    id: string;
    number: string;
    status: string;
    patient?: string;
    patient_id?: string;
    bed_type: string;
  } | null;
  onUpdate: () => void;
}

const BedManagementModal = ({ open, onOpenChange, bed, onUpdate }: BedManagementModalProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"assign" | "status" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    if (open && bed) {
      setSelectedStatus(bed.status);
      setSelectedPatient(bed.patient_id || "");
      fetchPatients();
    }
  }, [open, bed]);

  const fetchPatients = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) return;
      
      const clinicData = JSON.parse(clinicDataStr);
      const allPatients = await patientService.getClinicPatients(clinicData.id);
      setPatients(allPatients);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    }
  };

  const handleAssignPatient = async () => {
    if (!bed) return;
    
    setIsLoading(true);
    try {
      const patientId = selectedPatient === "none" ? null : selectedPatient;
      const updates: any = { patient_id: patientId };
      
      // If assigning a patient, set status to occupied
      if (patientId) {
        updates.status = "occupied";
      } else if (bed.status === "occupied") {
        // If removing patient and bed was occupied, set to available
        updates.status = "available";
      }

      await bedService.updateBed(bed.id, updates);
      toast.success("Paciente atribuído com sucesso!");
      onUpdate();
      onOpenChange(false);
      setSelectedAction(null);
    } catch (error) {
      console.error("Erro ao atribuir paciente:", error);
      toast.error("Erro ao atribuir paciente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!bed) return;
    
    setIsLoading(true);
    try {
      const updates: any = { status: selectedStatus };
      
      // If changing from occupied to available/maintenance, remove patient
      if (bed.status === "occupied" && selectedStatus !== "occupied") {
        updates.patient_id = null;
      }

      await bedService.updateBed(bed.id, updates);
      toast.success("Status do leito atualizado!");
      onUpdate();
      onOpenChange(false);
      setSelectedAction(null);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do leito");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBed = async () => {
    if (!bed) return;
    
    setIsLoading(true);
    try {
      await bedService.deleteBed(bed.id);
      toast.success("Leito removido com sucesso!");
      onUpdate();
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao remover leito:", error);
      toast.error("Erro ao remover leito");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied": return "Ocupado";
      case "available": return "Disponível";
      case "maintenance": return "Em Manutenção";
      default: return "Desconhecido";
    }
  };

  if (!bed) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Leito {bed.number}</DialogTitle>
            <DialogDescription>
              {bed.bed_type} - Status: {getStatusText(bed.status)}
              {bed.patient && (
                <span className="block mt-1 text-sm font-medium">
                  Paciente: {bed.patient}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {!selectedAction && (
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setSelectedAction("assign")}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                {bed.patient ? "Alterar paciente" : "Atribuir paciente"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setSelectedAction("status")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Alterar status
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover leito
              </Button>
            </div>
          )}

          {selectedAction === "assign" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum paciente</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAction(null)}>
                  Voltar
                </Button>
                <Button onClick={handleAssignPatient} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </div>
          )}

          {selectedAction === "status" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAction(null)}>
                  Voltar
                </Button>
                <Button onClick={handleStatusChange} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja remover o leito {bed.number}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBed} disabled={isLoading}>
              {isLoading ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BedManagementModal;