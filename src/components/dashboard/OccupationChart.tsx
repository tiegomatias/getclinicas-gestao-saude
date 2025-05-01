
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const OccupationChart = () => {
  // Check if clinic is newly registered
  const isNewClinic = () => {
    const clinicDataStr = localStorage.getItem("clinicData");
    if (!clinicDataStr) return false;
    
    const clinic = JSON.parse(clinicDataStr);
    const createdAt = new Date(clinic.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();
    const minutesDiff = Math.floor(timeDiff / 60000);
    
    return minutesDiff < 10; // Consider "new" if registered less than 10 minutes ago
  };

  // Data will be different based on whether this is a new clinic
  const data = isNewClinic() 
    ? [{ name: "Disponíveis", value: 27 }]  // All beds available for new clinics
    : [
        { name: "Ocupados", value: 18 },
        { name: "Disponíveis", value: 7 },
        { name: "Manutenção", value: 2 },
      ];

  const COLORS = ["#2A6F97", "#40A850", "#E6AB49"];

  // If it's a new clinic, we'll only show available beds
  const newClinicColors = ["#40A850"];

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <CardTitle>Ocupação de Leitos</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isNewClinic() ? (
          <div className="flex flex-col items-center justify-center h-[250px]">
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={newClinicColors[index % newClinicColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} leitos`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-muted-foreground">
              Todos os leitos estão disponíveis
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
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
        )}
      </CardContent>
    </Card>
  );
};

export default OccupationChart;
