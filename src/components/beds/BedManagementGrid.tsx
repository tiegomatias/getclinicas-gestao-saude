
import React from "react";
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

interface BedManagementGridProps {
  filterStatus?: string;
  onViewDetails?: () => void;
}

const roomTypes = [
  {
    id: "a",
    name: "Ala A - Masculino",
    beds: [
      {
        id: "a1",
        number: "A01",
        status: "occupied",
        patient: "Ricardo Santos",
        admissionDate: "01/06/2025",
        expectedDischarge: "01/07/2025",
      },
      {
        id: "a2",
        number: "A02",
        status: "occupied",
        patient: "João Ferreira",
        admissionDate: "28/05/2025",
        expectedDischarge: "25/06/2025",
      },
      {
        id: "a3",
        number: "A03",
        status: "available",
      },
      {
        id: "a4",
        number: "A04",
        status: "occupied",
        patient: "Pedro Alves",
        admissionDate: "15/05/2025",
        expectedDischarge: "15/06/2025",
      },
      {
        id: "a5",
        number: "A05",
        status: "maintenance",
      },
      {
        id: "a6",
        number: "A06",
        status: "occupied",
        patient: "Carlos Martins",
        admissionDate: "10/05/2025",
        expectedDischarge: "10/06/2025",
      },
    ],
  },
  {
    id: "b",
    name: "Ala B - Feminino",
    beds: [
      {
        id: "b1",
        number: "B01",
        status: "occupied",
        patient: "Márcia Oliveira",
        admissionDate: "30/05/2025",
        expectedDischarge: "30/06/2025",
      },
      {
        id: "b2",
        number: "B02",
        status: "available",
      },
      {
        id: "b3",
        number: "B03",
        status: "occupied",
        patient: "Ana Carolina",
        admissionDate: "20/05/2025",
        expectedDischarge: "20/06/2025",
      },
      {
        id: "b4",
        number: "B04",
        status: "available",
      },
      {
        id: "b5",
        number: "B05",
        status: "occupied",
        patient: "Juliana Costa",
        admissionDate: "18/05/2025",
        expectedDischarge: "18/06/2025",
      },
      {
        id: "b6",
        number: "B06",
        status: "maintenance",
      },
    ],
  },
];

export default function BedManagementGrid({ filterStatus = "all", onViewDetails }: BedManagementGridProps) {
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

  const handleViewPatientRecord = () => {
    toast.info("Abrindo prontuário do paciente");
  };

  const handleManageBed = () => {
    toast.info("Gerenciando leito");
  };

  // Filtrar leitos com base no status selecionado
  const filteredRooms = roomTypes.map(room => ({
    ...room,
    beds: filterStatus === "all" 
      ? room.beds 
      : room.beds.filter(bed => bed.status === filterStatus)
  }));

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
                        onClick={() => {
                          if (bed.status === "occupied") {
                            toast.info(`Detalhes do leito ${bed.number} - Paciente: ${bed.patient}`);
                          } else {
                            toast.info(`Detalhes do leito ${bed.number} - Status: ${getStatusText(bed.status)}`);
                          }
                        }}
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
                              onClick={handleViewPatientRecord}
                            >
                              Prontuário
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-7"
                              onClick={handleManageBed}
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
    </div>
  );
}
