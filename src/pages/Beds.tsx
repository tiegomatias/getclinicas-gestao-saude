
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bed, Plus } from "lucide-react";
import BedManagementGrid from "@/components/beds/BedManagementGrid";
import BedForm from "@/components/beds/BedForm";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";
import { bedService } from "@/services/bedService";
import { toast } from "sonner";

export default function Beds() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBedForm, setShowBedForm] = useState(false);

  useEffect(() => {
    const checkForData = async () => {
      try {
        // Obter o ID da clínica do localStorage
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) {
          setHasData(false);
          setIsLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        
        // Verificar se a clínica tem dados de leitos
        if (clinicData.has_beds_data) {
          setHasData(true);
        } else {
          const hasBedsData = await clinicService.hasClinicData(clinicData.id, "beds");
          setHasData(hasBedsData);
        }
      } catch (error) {
        console.error("Erro ao verificar dados de leitos:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  const handleAddBeds = () => {
    setShowBedForm(true);
  };

  const handleBedFormSuccess = () => {
    setHasData(true);
    // Update localStorage to reflect that beds data exists
    const clinicDataStr = localStorage.getItem("clinicData");
    if (clinicDataStr) {
      const clinicData = JSON.parse(clinicDataStr);
      clinicData.has_beds_data = true;
      localStorage.setItem("clinicData", JSON.stringify(clinicData));
    }
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    toast.info(`Filtro aplicado: ${value === "all" ? "Todos os leitos" : value}`);
  };

  const handleViewDetails = () => {
    toast.info("Visualizando detalhes da ala");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Bed />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Gestão de Leitos
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualize e administre a ocupação de leitos
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select 
            defaultValue="all" 
            value={statusFilter}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os leitos</SelectItem>
              <SelectItem value="occupied">Ocupados</SelectItem>
              <SelectItem value="available">Disponíveis</SelectItem>
              <SelectItem value="maintenance">Em manutenção</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleAddBeds}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Leito
          </Button>
        </div>
      </div>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Mapa de Ocupação</CardTitle>
          <CardDescription>
            Visualize a ocupação atual de leitos por ala
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-background p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Carregando...</p>
              </div>
            ) : hasData ? (
              <BedManagementGrid filterStatus={statusFilter} onViewDetails={handleViewDetails} onRefresh={() => {}} />
            ) : (
              <EmptyState
                icon={<Bed className="h-10 w-10 text-muted-foreground" />}
                title="Nenhum leito cadastrado"
                description="Configure os leitos da sua clínica para visualizar o mapa de ocupação e gerenciar internações."
                actionText="Configurar leitos"
                onAction={handleAddBeds}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <BedForm 
        open={showBedForm} 
        onOpenChange={setShowBedForm}
        onSuccess={handleBedFormSuccess}
      />
    </div>
  );
}
