
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
        totalAvailable += 30;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocupação Total de Leitos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} leitos`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
