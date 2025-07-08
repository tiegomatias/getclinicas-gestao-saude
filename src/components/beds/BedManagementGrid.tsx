
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { bedService } from "@/services/bedService";
import BedManagementModal from "./BedManagementModal";

interface BedManagementGridProps {
  filterStatus?: string;
  onViewDetails?: () => void;
  onRefresh?: () => void;
}

interface Bed {
  id: string;
  clinic_id: string;
  bed_number: string;
  bed_type: string;
  status: string;
  patient_id?: string;
  created_at: string;
}

interface PatientInfo {
  id: string;
  name: string;
  admission_date: string;
}

interface BedGroup {
  id: string;
  name: string;
  beds: Array<{
    id: string;
    number: string;
    status: string;
    patient?: string;
    patient_id?: string;
    bed_type?: string;
    admissionDate?: string;
    expectedDischarge?: string;
  }>;
}

export default function BedManagementGrid({ filterStatus = "all", onViewDetails, onRefresh }: BedManagementGridProps) {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientInfo>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [showBedModal, setShowBedModal] = useState(false);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        setBeds([]);
        setLoading(false);
        return;
      }

      const clinicData = JSON.parse(clinicDataStr);
      const bedsData = await bedService.getBedsByClinic(clinicData.id);
      setBeds(bedsData);

      // Fetch patient information for occupied beds
      const occupiedBeds = bedsData.filter(bed => bed.status === 'occupied' && bed.patient_id);
      if (occupiedBeds.length > 0) {
        const patientIds = occupiedBeds.map(bed => bed.patient_id!);
        const patientsData = await bedService.getPatientInfo(patientIds);
        setPatients(patientsData);
      }
    } catch (error) {
      console.error("Erro ao carregar leitos:", error);
      toast.error("Erro ao carregar leitos");
    } finally {
      setLoading(false);
    }
  };

  const groupBedsByType = (beds: Bed[]): BedGroup[] => {
    const groups: Record<string, BedGroup> = {};

    beds.forEach(bed => {
      if (!groups[bed.bed_type]) {
        groups[bed.bed_type] = {
          id: bed.bed_type.toLowerCase().replace(/\s+/g, '-'),
          name: bed.bed_type,
          beds: []
        };
      }

      const patient = bed.patient_id && patients[bed.patient_id];
      groups[bed.bed_type].beds.push({
        id: bed.id,
        number: bed.bed_number,
        status: bed.status,
        patient: patient?.name,
        patient_id: bed.patient_id,
        bed_type: bed.bed_type,
        admissionDate: patient ? new Date(patient.admission_date).toLocaleDateString('pt-BR') : undefined,
      });
    });

    return Object.values(groups);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-getclinicas-primary text-white";
      case "available":
        return "bg-getclinicas-accent text-white";
      case "maintenance":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Ocupado";
      case "available":
        return "Disponível";
      case "maintenance":
        return "Manutenção";
      default:
        return "Desconhecido";
    }
  };

  const handleBedClick = (bed: any) => {
    setSelectedBed(bed);
    setShowBedModal(true);
  };

  const handleBedUpdate = () => {
    fetchBeds();
    if (onRefresh) onRefresh();
  };

  // Group beds by type and filter by status
  const groupedBeds = groupBedsByType(beds);
  const filteredRooms = groupedBeds.map(room => ({
    ...room,
    beds: filterStatus === "all" 
      ? room.beds 
      : room.beds.filter(bed => bed.status === filterStatus)
  }));

  if (loading) {
    return <div className="flex justify-center py-4">Carregando leitos...</div>;
  }

  if (beds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum leito cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredRooms.map((room) => (
        <Card key={room.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>
                  {room.beds.filter((bed) => bed.status === "occupied").length} /{" "}
                  {room.beds.length} leitos ocupados
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                Ver detalhes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {room.beds.map((bed) => (
                <TooltipProvider key={bed.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex h-[100px] cursor-pointer flex-col rounded-md border p-3 transition-all hover:border-primary ${
                          bed.status === "occupied"
                            ? "border-getclinicas-primary/30 bg-getclinicas-primary/5"
                            : ""
                        }`}
                        onClick={() => handleBedClick(bed)}
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`${getStatusColor(bed.status)} px-2 py-0.5`}
                          >
                            {bed.number}
                          </Badge>
                          {bed.status === "occupied" && (
                            <UserIcon className="h-4 w-4 text-getclinicas-primary" />
                          )}
                        </div>
                        <div className="mt-2 text-xs">
                          <span className="block font-medium">
                            {bed.status === "occupied"
                              ? bed.patient
                              : getStatusText(bed.status)}
                          </span>
                          {bed.status === "occupied" && (
                            <span className="mt-1 block text-muted-foreground">
                              Desde: {bed.admissionDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    {bed.status === "occupied" && (
                      <TooltipContent side="bottom" className="w-60 p-0">
                        <div className="p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{bed.patient}</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p>
                              <span className="font-medium">Internação:</span>{" "}
                              {bed.admissionDate}
                            </p>
                            <p>
                              <span className="font-medium">
                                Previsão de Alta:
                              </span>{" "}
                              {bed.expectedDischarge}
                            </p>
                          </div>
                          <div className="mt-2 flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info("Prontuário do paciente");
                              }}
                            >
                              Prontuário
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBedClick(bed);
                              }}
                            >
                              Gerenciar
                            </Button>
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-getclinicas-primary"></div>
          <span className="text-sm">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-getclinicas-accent"></div>
          <span className="text-sm">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500"></div>
          <span className="text-sm">Manutenção</span>
        </div>
      </div>

      <BedManagementModal
        open={showBedModal}
        onOpenChange={setShowBedModal}
        bed={selectedBed}
        onUpdate={handleBedUpdate}
      />
    </div>
  );
}
