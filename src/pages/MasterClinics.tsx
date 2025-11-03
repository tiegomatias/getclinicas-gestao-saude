
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { masterService, type ClinicData } from "@/services/masterService";

export default function MasterClinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClinics, setFilteredClinics] = useState<ClinicData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await masterService.getAllClinics();
      setClinics(data);
      setFilteredClinics(data);
    } catch (error) {
      console.error("Error loading clinics:", error);
      toast.error("Erro ao carregar clínicas");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClinics(clinics);
    } else {
      const filtered = clinics.filter(clinic => 
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.admin_email.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando clínicas...</p>
        </div>
      </div>
    );
  }

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
                    const createdAt = new Date(clinic.created_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const isNew = diffDays < 2;
                    
                    return (
                      <TableRow key={clinic.id}>
                        <TableCell className="font-medium">
                          {clinic.name}
                          {isNew && (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                              Nova
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{clinic.admin_email || "Não informado"}</TableCell>
                        <TableCell>{clinic.plan || "Padrão"}</TableCell>
                        <TableCell>{new Date(clinic.created_at).toLocaleDateString("pt-BR")}</TableCell>
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
