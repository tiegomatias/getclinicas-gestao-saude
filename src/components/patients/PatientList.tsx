
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  name: string;
  birth_date: string;
  gender: string;
  phone: string;
  responsible_name: string;
  health_insurance: string;
  created_at: string;
}

interface PatientListProps {
  searchQuery?: string;
}

const PatientList = ({ searchQuery = "" }: PatientListProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter pacientes da localStorage
    const fetchPatients = () => {
      const savedPatients = localStorage.getItem("patients");
      if (savedPatients) {
        try {
          const parsedPatients = JSON.parse(savedPatients);
          setPatients(parsedPatients);
        } catch (error) {
          console.error("Erro ao carregar pacientes:", error);
          setPatients([]);
        }
      } else {
        // Dados de exemplo
        const samplePatients = [
          {
            name: "Maria Silva",
            birth_date: "1985-05-15",
            gender: "female",
            phone: "(11) 98765-4321",
            responsible_name: "João Silva",
            health_insurance: "Amil",
            created_at: "2025-04-20T14:30:00Z"
          },
          {
            name: "Carlos Santos",
            birth_date: "1990-10-23",
            gender: "male",
            phone: "(11) 91234-5678",
            responsible_name: "Ana Santos",
            health_insurance: "Unimed",
            created_at: "2025-04-25T09:15:00Z"
          },
          {
            name: "Luísa Oliveira",
            birth_date: "1978-03-07",
            gender: "female",
            phone: "(11) 99876-5432",
            responsible_name: "Pedro Oliveira",
            health_insurance: "SulAmérica",
            created_at: "2025-05-01T11:45:00Z"
          }
        ];
        setPatients(samplePatients);
        localStorage.setItem("patients", JSON.stringify(samplePatients));
      }
      setLoading(false);
    };
    
    fetchPatients();
  }, []);

  // Formatar data no formato brasileiro
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    
    // Se é uma string ISO, pegar apenas a data
    if (dateStr.includes("T")) {
      dateStr = dateStr.split("T")[0];
    }
    
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Traduzir gênero
  const translateGender = (gender: string) => {
    switch (gender) {
      case "male": return "Masculino";
      case "female": return "Feminino";
      case "other": return "Outro";
      default: return gender;
    }
  };

  // Filtrar pacientes com base na pesquisa
  const filteredPatients = searchQuery
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.responsible_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.health_insurance?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  const handleViewPatient = (name: string) => {
    toast.info(`Visualizando prontuário de ${name}`);
  };

  const handleEditPatient = (name: string) => {
    toast.info(`Editando dados de ${name}`);
  };

  const handleDeletePatient = (name: string) => {
    // Remover paciente da lista
    const updatedPatients = patients.filter(patient => patient.name !== name);
    setPatients(updatedPatients);
    localStorage.setItem("patients", JSON.stringify(updatedPatients));
    toast.success(`Paciente ${name} removido com sucesso`);
  };

  if (loading) {
    return <div className="flex justify-center py-4">Carregando pacientes...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Data Nasc.</TableHead>
          <TableHead>Gênero</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Convênio</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPatients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              {searchQuery ? "Nenhum paciente encontrado para esta pesquisa." : "Nenhum paciente cadastrado."}
            </TableCell>
          </TableRow>
        ) : (
          filteredPatients.map((patient, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{formatDate(patient.birth_date)}</TableCell>
              <TableCell>{translateGender(patient.gender)}</TableCell>
              <TableCell>{patient.phone || "-"}</TableCell>
              <TableCell>{patient.responsible_name || "-"}</TableCell>
              <TableCell>{patient.health_insurance || "-"}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleViewPatient(patient.name)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleEditPatient(patient.name)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeletePatient(patient.name)}
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

export default PatientList;
