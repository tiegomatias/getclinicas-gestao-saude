
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Professional {
  name: string;
  role: string;
  specialization: string;
  license_number: string;
  email: string;
  phone: string;
  has_system_access: boolean;
}

const ProfessionalList = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter profissionais da localStorage
    const fetchProfessionals = () => {
      const savedProfessionals = localStorage.getItem("professionals");
      if (savedProfessionals) {
        try {
          const parsedProfessionals = JSON.parse(savedProfessionals);
          setProfessionals(parsedProfessionals);
        } catch (error) {
          console.error("Erro ao carregar profissionais:", error);
          setProfessionals([]);
        }
      } else {
        // Dados de exemplo
        const sampleProfessionals = [
          {
            name: "Dr. Rodrigo Almeida",
            role: "doctor",
            specialization: "Psiquiatria",
            license_number: "CRM 54321/SP",
            email: "dr.rodrigo@clinica.com",
            phone: "(11) 98765-4321",
            has_system_access: true
          },
          {
            name: "Dra. Carla Rocha",
            role: "psychologist",
            specialization: "Terapia Cognitivo-Comportamental",
            license_number: "CRP 12345/SP",
            email: "carla.psi@clinica.com",
            phone: "(11) 91234-5678",
            has_system_access: true
          },
          {
            name: "Enfermeira Lúcia Santos",
            role: "nurse",
            specialization: "Saúde Mental",
            license_number: "COREN 98765/SP",
            email: "lucia.enf@clinica.com",
            phone: "(11) 99876-5432",
            has_system_access: false
          }
        ];
        setProfessionals(sampleProfessionals);
        localStorage.setItem("professionals", JSON.stringify(sampleProfessionals));
      }
      setLoading(false);
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

  const handleDeleteProfessional = (name: string) => {
    // Remover profissional da lista
    const updatedProfessionals = professionals.filter(prof => prof.name !== name);
    setProfessionals(updatedProfessionals);
    localStorage.setItem("professionals", JSON.stringify(updatedProfessionals));
    toast.success(`Profissional ${name} removido com sucesso`);
  };

  const handleManageAccess = (name: string, hasAccess: boolean) => {
    // Atualizar acesso do profissional
    const updatedProfessionals = professionals.map(prof => {
      if (prof.name === name) {
        return { ...prof, has_system_access: !hasAccess };
      }
      return prof;
    });
    
    setProfessionals(updatedProfessionals);
    localStorage.setItem("professionals", JSON.stringify(updatedProfessionals));
    toast.success(`Acesso ${!hasAccess ? "concedido" : "revogado"} para ${name}`);
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
              <TableCell>{translateRole(professional.role)}</TableCell>
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
                  onClick={() => handleManageAccess(professional.name, professional.has_system_access)}
                >
                  <Key className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteProfessional(professional.name)}
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
