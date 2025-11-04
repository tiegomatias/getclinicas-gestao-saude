import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import { apostilasService, type Apostila } from "@/services/apostilasService";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Apostilas() {
  const [apostilas, setApostilas] = useState<Apostila[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApostila, setSelectedApostila] = useState<Apostila | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [processingPdf, setProcessingPdf] = useState(false);

  useEffect(() => {
    loadApostilas();
  }, []);

  const loadApostilas = async () => {
    try {
      setLoading(true);
      const data = await apostilasService.getApostilas();
      setApostilas(data);
    } catch (error) {
      console.error('Erro ao carregar apostilas:', error);
      toast.error('Erro ao carregar apostilas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApostila = async (apostila: Apostila) => {
    try {
      setProcessingPdf(true);
      setSelectedApostila(apostila);
      
      // Buscar URL do PDF
      const url = apostilasService.getPdfUrl(apostila.file_path);
      
      // Adicionar marca d'água
      const watermarkedPdf = await apostilasService.addWatermarkToPdf(url, 'GetClinicas');
      
      // Criar blob URL para o PDF com marca d'água - forçar tipo para evitar erro TypeScript
      const blob = new Blob([watermarkedPdf as any], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      setPdfUrl(blobUrl);
      setPageNumber(1);
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      toast.error('Erro ao processar apostila');
    } finally {
      setProcessingPdf(false);
    }
  };

  const handleDownloadApostila = async (apostila: Apostila) => {
    try {
      toast.info('Preparando download...');
      
      const url = apostilasService.getPdfUrl(apostila.file_path);
      const watermarkedPdf = await apostilasService.addWatermarkToPdf(url, 'GetClinicas');
      
      // Criar download - forçar tipo para evitar erro TypeScript
      const blob = new Blob([watermarkedPdf as any], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${apostila.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Erro ao baixar apostila:', error);
      toast.error('Erro ao baixar apostila');
    }
  };

  const handlePrintApostila = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      printWindow?.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const handleCloseDialog = () => {
    setSelectedApostila(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setNumPages(0);
    setPageNumber(1);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const groupedApostilas = apostilas.reduce((acc, apostila) => {
    if (!acc[apostila.category]) {
      acc[apostila.category] = [];
    }
    acc[apostila.category].push(apostila);
    return acc;
  }, {} as Record<string, Apostila[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando apostilas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Apostilas</h1>
          </div>
          <p className="text-muted-foreground">
            Material de apoio e treinamento para sua clínica
          </p>
        </div>
      </div>

      {apostilas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma apostila disponível no momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedApostilas).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((apostila) => (
                  <Card key={apostila.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <Badge variant="outline">{apostila.category}</Badge>
                      </div>
                      <CardTitle className="mt-4">{apostila.title}</CardTitle>
                      {apostila.description && (
                        <CardDescription>{apostila.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewApostila(apostila)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadApostila(apostila)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de visualização do PDF */}
      <Dialog open={!!selectedApostila} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedApostila?.title}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintApostila}
                  disabled={!pdfUrl}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedApostila && handleDownloadApostila(selectedApostila)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {processingPdf ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Processando apostila...</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="flex flex-col items-center">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    width={Math.min(window.innerWidth * 0.8, 800)}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>

                <div className="flex items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                    disabled={pageNumber <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {pageNumber} de {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber((prev) => Math.min(numPages, prev + 1))}
                    disabled={pageNumber >= numPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
