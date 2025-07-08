
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { professionalService } from "@/services/professionalService";

const ProfessionalForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Estados para campos do formulário
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [hasSystemAccess, setHasSystemAccess] = useState(false);
  const [observations, setObservations] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validação básica
      if (!name || !role) {
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
      
      // Criar objeto do profissional
      const professionalData = {
        name,
        profession: role,
        specialization,
        license_number: licenseNumber,
        email,
        phone,
        birth_date: birthDate,
        has_system_access: hasSystemAccess,
        observations,
        clinic_id: clinicData.id,
        created_by: user?.id,
      };
      
      // Salvar no Supabase
      const newProfessional = await professionalService.createProfessional(professionalData);
      
      // Criar permissões padrão se tem acesso ao sistema
      if (hasSystemAccess) {
        await professionalService.createDefaultPermissions(clinicData.id, newProfessional.id);
      }
      
      toast.success("Profissional cadastrado com sucesso!");
      
      // Limpar formulário
      setName('');
      setRole('');
      setSpecialization('');
      setLicenseNumber('');
      setEmail('');
      setPhone('');
      setBirthDate('');
      setHasSystemAccess(false);
      setObservations('');
      
    } catch (error: any) {
      toast.error(`Erro ao cadastrar profissional: ${error.message}`);
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
            placeholder="Nome do profissional"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Função/Cargo *</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doctor">Médico(a)</SelectItem>
              <SelectItem value="psychologist">Psicólogo(a)</SelectItem>
              <SelectItem value="nurse">Enfermeiro(a)</SelectItem>
              <SelectItem value="therapist">Terapeuta</SelectItem>
              <SelectItem value="social_worker">Assistente Social</SelectItem>
              <SelectItem value="admin">Administrativo</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="specialization">Especialidade/Área</Label>
          <Input 
            id="specialization" 
            placeholder="Especialização"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">Registro Profissional</Label>
          <Input 
            id="licenseNumber" 
            placeholder="CRM, CRP, COREN, etc."
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
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
          <Label htmlFor="phone">Telefone</Label>
          <Input 
            id="phone" 
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de Nascimento</Label>
          <Input 
            id="birthDate" 
            type="date" 
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-between space-y-0 pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="systemAccess">Acesso ao Sistema</Label>
            <p className="text-sm text-muted-foreground">
              Permitir que este profissional acesse o sistema
            </p>
          </div>
          <Switch 
            id="systemAccess" 
            checked={hasSystemAccess}
            onCheckedChange={setHasSystemAccess}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea 
          id="observations" 
          placeholder="Informações adicionais sobre o profissional"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={() => {
          toast.info("Operação cancelada");
        }}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Profissional"}
        </Button>
      </div>
    </form>
  );
};

export default ProfessionalForm;
