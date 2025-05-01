
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bed } from "lucide-react";

const OccupationChart = () => {
  const [isNewClinic, setIsNewClinic] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if clinic is newly registered
    const clinicDataStr = localStorage.getItem("clinicData");
    if (!clinicDataStr) return;
    
    const clinic = JSON.parse(clinicDataStr);
    const createdAt = new Date(clinic.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();
    const minutesDiff = Math.floor(timeDiff / 60000);
    
    setIsNewClinic(minutesDiff < 10 || !clinic.hasBedsData);
  }, []);

  // Data will be different based on whether this is a new clinic
  const data = isNewClinic 
    ? [{ name: "Disponíveis", value: 27 }]  // All beds available for new clinics
    : [
        { name: "Ocupados", value: 18 },
        { name: "Disponíveis", value: 7 },
        { name: "Manutenção", value: 2 },
      ];

  const COLORS = ["#2A6F97", "#40A850", "#E6AB49"];

  // If it's a new clinic, we'll only show available beds
  const newClinicColors = ["#40A850"];
  
  const handleNavigateToBeds = () => {
    navigate("/leitos");
  };

  return (
    <Card className="h-[360px]">
      <CardHeader>
        <CardTitle>Ocupação de Leitos</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isNewClinic ? (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <ResponsiveContainer width="100%" height={180}>
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
            <p className="text-center text-muted-foreground mb-2">
              Todos os leitos estão disponíveis
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNavigateToBeds} 
              className="mt-2"
            >
              <Bed className="mr-2 h-4 w-4" />
              Configurar Leitos
            </Button>
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
