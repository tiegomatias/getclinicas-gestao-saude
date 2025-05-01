
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import DocumentsList from "@/components/documents/DocumentsList";
import DocumentUpload from "@/components/documents/DocumentUpload";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    const checkForData = async () => {
      try {
        // Obter o ID da clínica do localStorage
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) {
          setHasData(false);
          setIsLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        const hasDocumentsData = await clinicService.hasClinicData(clinicData.id, "documents");
        setHasData(hasDocumentsData);
      } catch (error) {
        console.error("Erro ao verificar dados de documentos:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  const handleNewDocument = () => {
    setActiveTab("upload");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <FileText />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documentos</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento de documentos e arquivos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar documentos..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleNewDocument}>
            <Upload className="mr-2 h-4 w-4" /> Novo Documento
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Listagem</TabsTrigger>
          <TabsTrigger value="upload">Enviar Documento</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Carregando...</p>
                </div>
              ) : hasData ? (
                <DocumentsList searchQuery={searchQuery} />
              ) : (
                <EmptyState
                  icon={<FileText className="h-10 w-10 text-muted-foreground" />}
                  title="Nenhum documento disponível"
                  description="Envie documentos para começar a organizar e gerenciar arquivos da clínica."
                  actionText="Enviar documento"
                  onAction={handleNewDocument}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Novo Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload onComplete={() => {
                setActiveTab("list");
                setHasData(true);
              }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
