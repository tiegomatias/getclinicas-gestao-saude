import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EmptyState from "@/components/shared/EmptyState";
import AnamneseList from "@/components/anamnese/AnamneseList";
import AnamneseForm from "@/components/anamnese/AnamneseForm";
import { medicalRecordsService, MedicalRecord } from "@/services/medicalRecordsService";

export default function Anamnese() {
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadClinicId();
  }, [user]);

  useEffect(() => {
    if (clinicId) {
      loadRecords();
    }
  }, [clinicId]);

  const loadClinicId = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("clinic_users")
      .select("clinic_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setClinicId(data.clinic_id);
    }
  };

  const loadRecords = async () => {
    if (!clinicId) return;
    
    setLoading(true);
    const data = await medicalRecordsService.getRecords(clinicId, "anamnese");
    setRecords(data);
    setLoading(false);
  };

  const handleNewAnamnese = () => {
    setSelectedRecord(null);
    setActiveTab("new");
  };

  const handleEditAnamnese = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setActiveTab("new");
  };

  const handleDeleteAnamnese = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta anamnese?")) {
      const success = await medicalRecordsService.deleteRecord(id);
      if (success) {
        loadRecords();
      }
    }
  };

  const handleSaveSuccess = () => {
    loadRecords();
    setActiveTab("list");
    setSelectedRecord(null);
  };

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!clinicId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anamnese</h1>
          <p className="text-muted-foreground">
            Gerencie as fichas de anamnese dos pacientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar anamnese..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleNewAnamnese}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Anamnese
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Listagem</TabsTrigger>
          <TabsTrigger value="new">
            {selectedRecord ? "Editar Anamnese" : "Nova Anamnese"}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              title="Nenhuma anamnese encontrada"
              description={
                searchQuery
                  ? "Tente ajustar sua busca"
                  : "Clique no botão acima para criar uma nova anamnese"
              }
              icon="file"
            />
          ) : (
            <AnamneseList
              records={filteredRecords}
              onEdit={handleEditAnamnese}
              onDelete={handleDeleteAnamnese}
            />
          )}
        </TabsContent>
        <TabsContent value="new" className="mt-4">
          <AnamneseForm
            clinicId={clinicId}
            record={selectedRecord}
            onSuccess={handleSaveSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
