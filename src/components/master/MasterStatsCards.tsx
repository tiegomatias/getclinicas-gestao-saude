
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Bed, BarChart2, Calendar } from "lucide-react";

interface MasterStatsCardsProps {
  totalClinics: number;
  totalBeds: number;
  averageOccupation: number;
}

export const MasterStatsCards = ({
  totalClinics,
  totalBeds,
  averageOccupation,
}: MasterStatsCardsProps) => {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Clínicas Cadastradas</p>
            <p className="text-3xl font-bold">{totalClinics}</p>
            <p className="text-xs text-muted-foreground mt-1">Última atualização: {currentDate}</p>
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Building className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Total de Leitos</p>
            <p className="text-3xl font-bold">{totalBeds}</p>
            <p className="text-xs text-muted-foreground mt-1">Todas as clínicas</p>
          </div>
          <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Bed className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Ocupação Média</p>
            <p className="text-3xl font-bold">{averageOccupation}%</p>
            <p className="text-xs text-muted-foreground mt-1">De todos os leitos</p>
          </div>
          <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
            <BarChart2 className="h-6 w-6 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Data de Hoje</p>
            <p className="text-3xl font-bold">{currentDate}</p>
            <p className="text-xs text-muted-foreground mt-1">Dados atualizados</p>
          </div>
          <div className="h-12 w-12 bg-orange-500/10 rounded-full flex items-center justify-center">
            <Calendar className="h-6 w-6 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
