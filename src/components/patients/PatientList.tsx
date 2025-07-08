
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  phone: string;
  responsible_name: string;
  health_insurance: string;
  created_at: string;
  clinic_id: string;
}

interface PatientListProps {
  searchQuery?: string;
}

const PatientList = ({ searchQuery = "" }: PatientListProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Obter ID da clínica atual
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) {
          console.error("Dados da clínica não encontrados");
          setPatients([]);
          setLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        
        // Buscar pacientes no Supabase
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('clinic_id', clinicData.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Erro ao carregar pacientes:", error);
          setPatients([]);
        } else {
          setPatients(data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
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

  const handleDeletePatient = async (patientId: string, name: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);
      
      if (error) {
        console.error("Erro ao remover paciente:", error);
        toast.error(`Erro ao remover paciente: ${error.message}`);
        return;
      }
      
      // Remover da lista local
      const updatedPatients = patients.filter(patient => patient.id !== patientId);
      setPatients(updatedPatients);
      toast.success(`Paciente ${name} removido com sucesso`);
    } catch (error: any) {
      console.error("Erro ao remover paciente:", error);
      toast.error(`Erro ao remover paciente: ${error.message}`);
    }
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
          filteredPatients.map((patient) => (
            <TableRow key={patient.id}>
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
                  onClick={() => handleDeletePatient(patient.id, patient.name)}
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
