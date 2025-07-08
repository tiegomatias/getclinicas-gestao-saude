
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
            <TableCell colSpan={7} className="text-center py-4">
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteProfessional(professional.id, professional.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ProfessionalList;
