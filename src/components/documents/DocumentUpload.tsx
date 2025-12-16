import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Upload, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { documentService } from "@/services/documentService";

interface DocumentUploadProps {
  clinicId: string;
  onComplete?: () => void;
}

interface Patient {
  id: string;
  name: string;
}

export default function DocumentUpload({ clinicId, onComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const form = useForm({
    defaultValues: {
      documentType: "",
      patientId: "",
      docTitle: "",
      description: "",
    },
  });

  useEffect(() => {
    loadPatients();
  }, [clinicId]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validar tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo permitido: 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo para upload");
      return;
    }

    if (!data.documentType) {
      toast.error("Por favor, selecione o tipo de documento");
      return;
    }

    if (!data.docTitle) {
      toast.error("Por favor, informe o título do documento");
      return;
    }

    setIsUploading(true);
    
    try {
      // 1. Fazer upload do arquivo para o Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${clinicId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // 2. Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // 3. Salvar metadados no banco de dados
      const documentData = {
        document_type: data.documentType,
        title: data.docTitle,
        patient_id: data.patientId || undefined,
        file_url: urlData.publicUrl,
      };

      const createdDocument = await documentService.createDocument(clinicId, documentData);

      if (createdDocument) {
        form.reset();
        setSelectedFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('dropzone-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      toast.error(error.message || 'Erro ao enviar documento');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="contract">Contrato</SelectItem>
                      <SelectItem value="consent">Termo de Consentimento</SelectItem>
                      <SelectItem value="report">Laudo</SelectItem>
                      <SelectItem value="exam">Resultado de Exame</SelectItem>
                      <SelectItem value="record">Prontuário</SelectItem>
                      <SelectItem value="anamnese">Anamnese</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente (opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingPatients}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingPatients ? "Carregando..." : "Selecione o paciente"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Nenhum paciente ativo cadastrado
                        </div>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="docTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Documento</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o título do documento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione uma breve descrição do documento"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Arquivo</FormLabel>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 border-muted-foreground/25 hover:bg-muted/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, JPG, PNG (máx. 10MB)
                  </p>
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Documento
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
