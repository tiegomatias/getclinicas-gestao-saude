import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Document {
  id: string;
  clinic_id: string;
  patient_id?: string;
  document_type: string;
  title: string;
  file_url?: string;
  created_by?: string;
  created_at: string;
}

export interface CreateDocumentData {
  patient_id?: string;
  document_type: string;
  title: string;
  file_url?: string;
}

export const documentService = {
  async getDocuments(clinicId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error("Erro ao carregar documentos");
      return [];
    }
  },

  async createDocument(clinicId: string, data: CreateDocumentData): Promise<Document | null> {
    try {
      const { data: document, error } = await supabase
        .from("documents")
        .insert({
          ...data,
          clinic_id: clinicId,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Documento criado com sucesso!");
      return document;
    } catch (error: any) {
      console.error("Error creating document:", error);
      toast.error("Erro ao criar documento");
      return null;
    }
  },

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Documento excluído com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Erro ao excluir documento");
      return false;
    }
  },
};
