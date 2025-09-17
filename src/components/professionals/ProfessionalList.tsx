
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { professionalService } from "@/services/professionalService";

interface Professional {
  id: string;
  name: string;
  profession: string;
  specialization?: string;
  license_number?: string;
  email?: string;
  phone?: string;
  has_system_access: boolean;
  status: string;
}

const ProfessionalList = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) {
          setLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        const data = await professionalService.getProfessionalsByClinic(clinicData.id);
        setProfessionals(data);
      } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
        toast.error("Erro ao carregar profissionais");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfessionals();
  }, []);

  // Traduzir função/cargo
  const translateRole = (role: string) => {
    switch (role) {
      case "doctor": return "Médico";
      case "psychologist": return "Psicólogo";
      case "nurse": return "Enfermeiro";
      case "therapist": return "Terapeuta";
      case "social_worker": return "Assistente Social";
      case "admin": return "Administrativo";
      case "other": return "Outro";
      default: return role;
    }
  };

  const handleViewProfessional = (name: string) => {
    toast.info(`Visualizando dados de ${name}`);
  };

  const handleEditProfessional = (name: string) => {
    toast.info(`Editando dados de ${name}`);
  };

  const handleDeleteProfessional = async (professionalId: string, name: string) => {
    try {
      await professionalService.deleteProfessional(professionalId);
      setProfessionals(professionals.filter(prof => prof.id !== professionalId));
      toast.success(`Profissional ${name} removido com sucesso`);
    } catch (error) {
      toast.error("Erro ao remover profissional");
    }
  };

  const handleManageAccess = async (professionalId: string, name: string, hasAccess: boolean) => {
    try {
      await professionalService.updateProfessional(professionalId, { 
        has_system_access: !hasAccess 
      });
      
      setProfessionals(professionals.map(prof => 
        prof.id === professionalId 
          ? { ...prof, has_system_access: !hasAccess }
          : prof
      ));
      
      toast.success(`Acesso ${!hasAccess ? "concedido" : "revogado"} para ${name}`);
    } catch (error) {
      toast.error("Erro ao atualizar acesso");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-4">Carregando profissionais...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {professionals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum profissional cadastrado.</p>
          </div>
        ) : (
          professionals.map((professional, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">{professional.name}</h3>
                <Badge variant={professional.has_system_access ? "default" : "outline"}>
                  {professional.has_system_access ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Função</p>
                  <p className="font-medium">{translateRole(professional.profession)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Especialidade</p>
                  <p className="font-medium">{professional.specialization || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registro</p>
                  <p className="font-medium">{professional.license_number || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{professional.phone || "-"}</p>
                </div>
              </div>
              
              {professional.email && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{professional.email}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-1 pt-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleViewProfessional(professional.name)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleEditProfessional(professional.name)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleManageAccess(professional.id, professional.name, professional.has_system_access)}
                >
                  <Key className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deseja realmente excluir este profissional?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O profissional "{professional.name}" será removido permanentemente do sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                      <AlertDialogCancel className="w-full sm:w-auto">Não</AlertDialogCancel>
                      <AlertDialogAction 
                        className="w-full sm:w-auto"
                        onClick={() => handleDeleteProfessional(professional.id, professional.name)}
                      >
                        Sim
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhum profissional cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              professionals.map((professional, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{professional.name}</TableCell>
                  <TableCell>{translateRole(professional.profession)}</TableCell>
                  <TableCell>{professional.specialization || "-"}</TableCell>
                  <TableCell>{professional.license_number || "-"}</TableCell>
                  <TableCell>
                    {professional.email}<br/>
                    <span className="text-sm text-muted-foreground">{professional.phone || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={professional.has_system_access ? "default" : "outline"}>
                      {professional.has_system_access ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewProfessional(professional.name)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditProfessional(professional.name)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleManageAccess(professional.id, professional.name, professional.has_system_access)}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deseja realmente excluir este profissional?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O profissional "{professional.name}" será removido permanentemente do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Não</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProfessional(professional.id, professional.name)}>
                            Sim
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProfessionalList;
