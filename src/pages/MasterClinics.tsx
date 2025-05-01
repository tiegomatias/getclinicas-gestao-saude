
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Search } from "lucide-react";
import { toast } from "sonner";

export default function MasterClinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClinics, setFilteredClinics] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch clinics data from localStorage
    const allClinicsStr = localStorage.getItem("allClinics");
    if (allClinicsStr) {
      const allClinics = JSON.parse(allClinicsStr);
      setClinics(allClinics);
      setFilteredClinics(allClinics);
    }
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClinics(clinics);
    } else {
      const filtered = clinics.filter(clinic => 
        clinic.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClinics(filtered);
    }
  }, [searchQuery, clinics]);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };
  
  const handleViewClinic = (clinicId: string) => {
    // Set the current clinic ID in localStorage
    localStorage.setItem("currentClinicId", clinicId);
    
    // Navigate to the dashboard
    navigate("/dashboard");
  };
  
  const handleCreateClinic = () => {
    navigate("/registro");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Clínicas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as clínicas cadastradas no sistema
          </p>
        </div>
        <Button onClick={handleCreateClinic}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Clínica
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Clínicas Cadastradas</CardTitle>
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar clínica..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </CardHeader>
        <CardContent>
          {filteredClinics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Nenhuma clínica encontrada para esta pesquisa." : "Nenhuma clínica cadastrada ainda."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Clínica</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Data de Registro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClinics.map((clinic) => {
                    // Check if the clinic was created in the last 48 hours
                    const createdAt = new Date(clinic.createdAt);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const isNew = diffDays < 2;
                    
                    return (
                      <TableRow key={clinic.id}>
                        <TableCell className="font-medium">
                          {clinic.clinicName}
                          {isNew && (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                              Nova
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{clinic.adminEmail || "Não informado"}</TableCell>
                        <TableCell>{clinic.plan || "Padrão"}</TableCell>
                        <TableCell>{new Date(clinic.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Ativo
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewClinic(clinic.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Acessar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
