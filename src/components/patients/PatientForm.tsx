
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PatientFormProps {
  onComplete?: () => void;
}

// Componente de formulário para cadastro de pacientes
const PatientForm = ({ onComplete }: PatientFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Estados para campos do formulário
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [responsible, setResponsible] = useState('');
  const [responsiblePhone, setResponsiblePhone] = useState('');
  const [healthInsurance, setHealthInsurance] = useState('');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [observations, setObservations] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validação básica
      if (!name || !birthDate || !gender) {
        toast.error("Por favor, preencha os campos obrigatórios.");
        setLoading(false);
        return;
      }
      
      // Obter ID da clínica atual
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        toast.error("Dados da clínica não encontrados.");
        setLoading(false);
        return;
      }
      
      const clinicData = JSON.parse(clinicDataStr);
      
      // Criar objeto do paciente
      const patientData = {
        name,
        birth_date: birthDate,
        gender,
        cpf,
        rg,
        phone,
        email,
        address,
        responsible_name: responsible,
        responsible_phone: responsiblePhone,
        health_insurance: healthInsurance,
        insurance_number: insuranceNumber,
        observations,
        clinic_id: clinicData.id,
        created_by: user?.id,
        admission_type: 'registration', // Required field
        status: 'active' // Required field
      };
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select();
      
      if (error) {
        console.error('Erro ao cadastrar paciente:', error);
        toast.error(`Erro ao cadastrar paciente: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success("Paciente cadastrado com sucesso!");
      
      // Limpar formulário
      setName('');
      setBirthDate('');
      setGender('');
      setCpf('');
      setRg('');
      setPhone('');
      setEmail('');
      setAddress('');
      setResponsible('');
      setResponsiblePhone('');
      setHealthInsurance('');
      setInsuranceNumber('');
      setObservations('');
      
      // Chamar callback de conclusão se existir
      if (onComplete) onComplete();
      
    } catch (error: any) {
      console.error('Erro ao cadastrar paciente:', error);
      toast.error(`Erro ao cadastrar paciente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input 
            id="name" 
            placeholder="Nome do paciente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de Nascimento *</Label>
          <Input 
            id="birthDate" 
            type="date" 
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gênero *</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Feminino</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input 
            id="cpf" 
            placeholder="000.000.000-00" 
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input 
            id="rg" 
            placeholder="00.000.000-0" 
            value={rg}
            onChange={(e) => setRg(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input 
            id="phone" 
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input 
            id="address" 
            placeholder="Rua, número, bairro, cidade, UF"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="responsible">Responsável</Label>
          <Input 
            id="responsible" 
            placeholder="Nome do responsável"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="responsiblePhone">Telefone do Responsável</Label>
          <Input 
            id="responsiblePhone" 
            placeholder="(00) 00000-0000"
            value={responsiblePhone}
            onChange={(e) => setResponsiblePhone(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="healthInsurance">Convênio</Label>
          <Input 
            id="healthInsurance" 
            placeholder="Nome do convênio"
            value={healthInsurance}
            onChange={(e) => setHealthInsurance(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="insuranceNumber">Número do Convênio</Label>
          <Input 
            id="insuranceNumber" 
            placeholder="Número/Matrícula"
            value={insuranceNumber}
            onChange={(e) => setInsuranceNumber(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea 
          id="observations" 
          placeholder="Informações adicionais sobre o paciente"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={() => {
          if (onComplete) onComplete();
        }}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Paciente"}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;
