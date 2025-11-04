import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileText, Image as ImageIcon } from "lucide-react";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export function DocumentPreview({ isOpen, onClose, fileUrl, fileName, fileType }: DocumentPreviewProps) {
  const isPDF = fileType === "application/pdf" || fileName.toLowerCase().endsWith('.pdf');
  const isImage = fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isDoc = /\.(doc|docx)$/i.test(fileName);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isPDF ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
              {fileName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden rounded-md border bg-muted/50">
          {isPDF && (
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={fileName}
            />
          )}
          
          {isImage && (
            <div className="flex items-center justify-center h-full p-4">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          
          {isDoc && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Preview não disponível</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Documentos Word (.doc, .docx) não podem ser visualizados diretamente.
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Documento
              </Button>
            </div>
          )}
          
          {!isPDF && !isImage && !isDoc && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Preview não disponível</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este tipo de arquivo não pode ser visualizado diretamente.
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
