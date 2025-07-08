import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { professionalService, ProfessionalPermission } from "@/services/professionalService";
import { Badge } from "@/components/ui/badge";

interface Professional {
  id: string;
  name: string;
  profession: string;
  has_system_access: boolean;
}

const ProfessionalPermissions = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ProfessionalPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const modules = [
    { name: 'patients', label: 'Pacientes' },
    { name: 'beds', label: 'Leitos' },
    { name: 'calendar', label: 'Agenda' },
    { name: 'medications', label: 'Medicamentos' },
    { name: 'documents', label: 'Documentos' },
    { name: 'contracts', label: 'Contratos' },
    { name: 'reports', label: 'Relatórios' },
    { name: 'settings', label: 'Configurações' }
  ];

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) {
          setLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        const data = await professionalService.getProfessionalsWithSystemAccess(clinicData.id);
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

  const loadPermissions = async (professionalId: string) => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) return;
      
      const clinicData = JSON.parse(clinicDataStr);
      const data = await professionalService.getPermissions(clinicData.id, professionalId);
      setPermissions(data);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      toast.error("Erro ao carregar permissões");
    }
  };

  const handleProfessionalSelect = (professionalId: string) => {
    setSelectedProfessional(professionalId);
    loadPermissions(professionalId);
  };

  const updatePermission = (moduleName: string, field: 'can_read' | 'can_write' | 'can_delete', value: boolean) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.module_name === moduleName);
      if (existing) {
        return prev.map(p => 
          p.module_name === moduleName 
            ? { ...p, [field]: value }
            : p
        );
      } else {
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) return prev;
        const clinicData = JSON.parse(clinicDataStr);
        
        return [...prev, {
          clinic_id: clinicData.id,
          professional_id: selectedProfessional!,
          module_name: moduleName,
          can_read: field === 'can_read' ? value : false,
          can_write: field === 'can_write' ? value : false,
          can_delete: field === 'can_delete' ? value : false,
        }];
      }
    });
  };

  const savePermissions = async () => {
    if (!selectedProfessional) return;
    
    setSaving(true);
    try {
      await professionalService.updatePermissions(permissions);
      toast.success("Permissões atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      toast.error("Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  const getPermissionForModule = (moduleName: string) => {
    return permissions.find(p => p.module_name === moduleName) || {
      can_read: false,
      can_write: false,
      can_delete: false
    };
  };

  if (loading) {
    return <div className="flex justify-center py-4">Carregando profissionais...</div>;
  }

  if (professionals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum profissional com acesso ao sistema encontrado.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Cadastre profissionais e ative o acesso ao sistema para gerenciar permissões.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>
              Selecione um profissional para gerenciar permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {professionals.map((professional) => (
                <Button
                  key={professional.id}
                  variant={selectedProfessional === professional.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleProfessionalSelect(professional.id)}
                >
                  <div className="flex flex-col items-start">
                    <span>{professional.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {professional.profession}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          {selectedProfessional ? (
            <Card>
              <CardHeader>
                <CardTitle>Permissões de Acesso</CardTitle>
                <CardDescription>
                  Configure as permissões para cada módulo do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {modules.map((module) => {
                    const permission = getPermissionForModule(module.name);
                    return (
                      <div key={module.name} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{module.label}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${module.name}-read`}
                              checked={permission.can_read}
                              onCheckedChange={(value) => 
                                updatePermission(module.name, 'can_read', value)
                              }
                            />
                            <Label htmlFor={`${module.name}-read`}>Visualizar</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${module.name}-write`}
                              checked={permission.can_write}
                              onCheckedChange={(value) => 
                                updatePermission(module.name, 'can_write', value)
                              }
                            />
                            <Label htmlFor={`${module.name}-write`}>Editar</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${module.name}-delete`}
                              checked={permission.can_delete}
                              onCheckedChange={(value) => 
                                updatePermission(module.name, 'can_delete', value)
                              }
                            />
                            <Label htmlFor={`${module.name}-delete`}>Excluir</Label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-end">
                    <Button onClick={savePermissions} disabled={saving}>
                      {saving ? "Salvando..." : "Salvar Permissões"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Selecione um profissional para gerenciar suas permissões.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPermissions;