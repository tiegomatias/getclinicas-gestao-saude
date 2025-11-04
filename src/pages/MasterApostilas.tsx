import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Upload, Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { apostilasService, type Apostila } from "@/services/apostilasService";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MasterApostilas() {
  const [apostilas, setApostilas] = useState<Apostila[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Geral");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        toast.error('Apenas arquivos PDF são permitidos');
        e.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!title || !selectedFile) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setUploading(true);
      await apostilasService.uploadApostila(selectedFile, title, description, category);
      toast.success('Apostila enviada com sucesso!');
      setUploadDialogOpen(false);
      resetForm();
      loadApostilas();
    } catch (error) {
      console.error('Erro ao enviar apostila:', error);
      toast.error('Erro ao enviar apostila');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (apostila: Apostila) => {
    if (!confirm(`Tem certeza que deseja excluir a apostila "${apostila.title}"?`)) {
      return;
    }

    try {
      await apostilasService.deleteApostila(apostila.id, apostila.file_path);
      toast.success('Apostila excluída com sucesso!');
      loadApostilas();
    } catch (error) {
      console.error('Erro ao excluir apostila:', error);
      toast.error('Erro ao excluir apostila');
    }
  };

  const handleDownload = async (apostila: Apostila) => {
    try {
      toast.info('Preparando download...');
      const url = apostilasService.getPdfUrl(apostila.file_path);
      const watermarkedPdf = await apostilasService.addWatermarkToPdf(url, 'GetClinicas');
      
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Geral");
    setSelectedFile(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Apostilas</h1>
          </div>
          <p className="text-muted-foreground">
            Faça upload e gerencie apostilas disponíveis para todas as clínicas
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Nova Apostila
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apostilas Cadastradas</CardTitle>
          <CardDescription>
            {apostilas.length} apostila{apostilas.length !== 1 ? 's' : ''} disponível{apostilas.length !== 1 ? 'eis' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apostilas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma apostila cadastrada ainda
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Data de Upload</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apostilas.map((apostila) => (
                    <TableRow key={apostila.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{apostila.title}</div>
                          {apostila.description && (
                            <div className="text-sm text-muted-foreground">
                              {apostila.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{apostila.category}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(apostila.file_size)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(apostila.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={apostila.is_active ? "default" : "secondary"}>
                          {apostila.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(apostila)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(apostila)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Upload */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Apostila</DialogTitle>
            <DialogDescription>
              Faça upload de uma apostila em formato PDF para disponibilizar às clínicas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Manual de Boas Práticas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição breve da apostila"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Treinamento">Treinamento</SelectItem>
                  <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                  <SelectItem value="Qualidade">Qualidade</SelectItem>
                  <SelectItem value="Regulamentação">Regulamentação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Arquivo PDF *</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 border-muted-foreground/25 hover:bg-muted/50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apenas PDF (máx. 50MB)
                    </p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Arquivo selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Apostila
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
