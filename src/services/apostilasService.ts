import { supabase } from '@/integrations/supabase/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface Apostila {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_size?: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const apostilasService = {
  /**
   * Busca todas as apostilas ativas
   */
  async getApostilas(): Promise<Apostila[]> {
    const { data, error } = await supabase
      .from('apostilas')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching apostilas:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Busca uma apostila por ID
   */
  async getApostilaById(id: string): Promise<Apostila | null> {
    const { data, error } = await supabase
      .from('apostilas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching apostila:', error);
      return null;
    }

    return data;
  },

  /**
   * Busca o URL público do arquivo PDF
   */
  getPdfUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('apostilas')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Adiciona marca d'água ao PDF
   */
  async addWatermarkToPdf(pdfUrl: string, watermarkText: string = 'GetClinicas'): Promise<Uint8Array> {
    try {
      // Baixar o PDF
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();

      // Carregar o PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Adicionar marca d'água em cada página
      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = 60;
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = fontSize;

        // Centralizar a marca d'água (sem rotação por incompatibilidade de tipo)
        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - textHeight / 2,
          size: fontSize,
          font: font,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.3,
        });
      }

      // Retornar o PDF modificado
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw error;
    }
  },

  /**
   * Upload de apostila (apenas master admin)
   */
  async uploadApostila(
    file: File,
    title: string,
    description: string,
    category: string
  ): Promise<Apostila> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload do arquivo
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('apostilas')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Criar registro na tabela
      const { data, error } = await supabase
        .from('apostilas')
        .insert({
          title,
          description,
          file_path: fileName,
          file_size: file.size,
          category,
          upload_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error uploading apostila:', error);
      throw error;
    }
  },

  /**
   * Deletar apostila (apenas master admin)
   */
  async deleteApostila(id: string, filePath: string): Promise<void> {
    try {
      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('apostilas')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Deletar registro da tabela
      const { error } = await supabase
        .from('apostilas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting apostila:', error);
      throw error;
    }
  },
};
