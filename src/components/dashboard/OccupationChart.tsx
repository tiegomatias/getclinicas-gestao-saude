
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bed } from "lucide-react";
import { bedService } from "@/services/bedService";
import { toast } from "sonner";

const OccupationChart = () => {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadBedData = async () => {
      setLoading(true);
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) return;
      
      try {
        const clinic = JSON.parse(clinicDataStr);
        const beds = await bedService.getBedsByClinic(clinic.id);
        
        if (beds.length === 0) {
          setIsEmpty(true);
          setData([{ name: "Disponíveis", value: 0 }]);
        } else {
          const occupied = beds.filter(b => b.status === 'occupied').length;
          const available = beds.filter(b => b.status === 'available').length;
          const maintenance = beds.filter(b => b.status === 'maintenance').length;
          
          const chartData = [];
          if (occupied > 0) chartData.push({ name: "Ocupados", value: occupied });
          if (available > 0) chartData.push({ name: "Disponíveis", value: available });
          if (maintenance > 0) chartData.push({ name: "Manutenção", value: maintenance });
          
          setData(chartData.length > 0 ? chartData : [{ name: "Sem dados", value: 1 }]);
          setIsEmpty(false);
        }
      } catch (error) {
        console.error('Error loading bed data:', error);
        toast.error('Erro ao carregar dados de leitos');
      }
      setLoading(false);
    };
    
    loadBedData();
  }, []);

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
        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : isEmpty ? (
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
