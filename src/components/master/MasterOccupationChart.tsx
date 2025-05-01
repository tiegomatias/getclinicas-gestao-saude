
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MasterOccupationChartProps {
  clinics: any[];
}

export const MasterOccupationChart = ({ clinics }: MasterOccupationChartProps) => {
  // Calculate the total beds and occupation across all clinics
  const calculateOccupationData = () => {
    let totalOccupied = 0;
    let totalAvailable = 0;
    let totalMaintenance = 0;

    clinics.forEach((clinic) => {
      // Use some default values if the clinic doesn't have bed data yet
      if (clinic.hasBedsData) {
        totalOccupied += clinic.occupiedBeds ? parseInt(clinic.occupiedBeds) : 0;
        totalAvailable += clinic.availableBeds ? parseInt(clinic.availableBeds) : 0;
        totalMaintenance += clinic.maintenanceBeds ? parseInt(clinic.maintenanceBeds) : 0;
      } else {
        // Default to all beds available for new clinics (assume 30 beds per clinic without data)
        totalAvailable += clinic.bedsCapacity ? parseInt(clinic.bedsCapacity) : 30;
      }
    });

    return [
      { name: "Ocupados", value: totalOccupied },
      { name: "Disponíveis", value: totalAvailable },
      { name: "Manutenção", value: totalMaintenance },
    ];
  };

  const data = calculateOccupationData();
  const COLORS = ["#2A6F97", "#40A850", "#E6AB49"];
  
  // Check if we have any data to display
  const totalBeds = data.reduce((sum, item) => sum + item.value, 0);
  const hasData = totalBeds > 0;

  // Calculate percentages for display
  const occupationPercentage = hasData ? 
    Math.round((data[0].value / totalBeds) * 100) : 0;
  
  const availablePercentage = hasData ? 
    Math.round((data[1].value / totalBeds) * 100) : 0;
  
  const maintenancePercentage = hasData ? 
    Math.round((data[2].value / totalBeds) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocupação Total de Leitos</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} leitos`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
              <div className="p-2 rounded-md bg-blue-50">
                <div className="font-medium text-blue-700">Ocupados</div>
                <div className="text-blue-900">{data[0].value} ({occupationPercentage}%)</div>
              </div>
              <div className="p-2 rounded-md bg-green-50">
                <div className="font-medium text-green-700">Disponíveis</div>
                <div className="text-green-900">{data[1].value} ({availablePercentage}%)</div>
              </div>
              <div className="p-2 rounded-md bg-amber-50">
                <div className="font-medium text-amber-700">Manutenção</div>
                <div className="text-amber-900">{data[2].value} ({maintenancePercentage}%)</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <p className="text-muted-foreground">Não há dados de ocupação disponíveis.</p>
            <p className="text-sm text-muted-foreground mt-2">Adicione clínicas ao sistema para visualizar estatísticas.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
