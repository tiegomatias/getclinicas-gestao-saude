import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FilePenIcon, FileIcon, Printer, Eye } from "lucide-react";
import { toast } from "sonner";

interface ContractData {
  responsavelNome: string;
  responsavelRg: string;
  responsavelCpf: string;
  responsavelEndereco: string;
  responsavelCidade: string;
  responsavelEstado: string;
  responsavelCep: string;
  pacienteNome: string;
  pacienteIdade: string;
  pacienteDataNascimento: string;
  dataEntrada: string;
  tempoInternacao: string;
  valorTratamento: string;
  formaPagamento: string;
  clinicaNome: string;
  dataAssinatura: string;
}

interface ContractPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractData: ContractData;
}

export default function ContractPreview({
  open,
  onOpenChange,
  contractData,
}: ContractPreviewProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const handlePrintPDF = () => {
    toast.success("Contrato gerado em PDF com sucesso!");
    // Em uma implementação real, aqui seria chamada a função para gerar o PDF
  };

  const handleEditContract = () => {
    onOpenChange(false);
    toast.info("Você pode editar os dados do contrato no formulário");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contrato de Prestação de Serviços</DialogTitle>
          <DialogDescription>
            Visualize o contrato antes de imprimir ou gerar o PDF
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">
              <Eye className="mr-2 h-4 w-4" /> Visualizar
            </TabsTrigger>
            <TabsTrigger value="edit">
              <FilePenIcon className="mr-2 h-4 w-4" /> Editar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="p-6 border rounded-md mt-4">
            <div className="space-y-6 font-serif">
              <h1 className="text-2xl font-bold text-center mb-6">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
              
              <p className="text-justify">
                Pelo presente instrumento particular de contrato de prestação de serviços, de um lado <strong>{contractData.clinicaNome}</strong>, 
                doravante denominada CONTRATADA, e de outro lado <strong>{contractData.responsavelNome}</strong>, 
                portador(a) do RG nº <strong>{contractData.responsavelRg}</strong> e CPF nº <strong>{contractData.responsavelCpf}</strong>, 
                residente e domiciliado(a) à <strong>{contractData.responsavelEndereco}, {contractData.responsavelCidade}/{contractData.responsavelEstado}, 
                CEP: {contractData.responsavelCep}</strong>, doravante denominado(a) CONTRATANTE, têm entre si justo e contratado o seguinte:
              </p>

              <h2 className="text-xl font-bold mt-6">CLÁUSULA PRIMEIRA - DO OBJETO</h2>
              <p className="text-justify">
                O presente contrato tem como objeto a prestação de serviços de acolhimento, tratamento e acompanhamento 
                do(a) dependente químico(a) <strong>{contractData.pacienteNome}</strong>, com <strong>{contractData.pacienteIdade} anos</strong>, 
                nascido(a) em <strong>{formatDate(contractData.pacienteDataNascimento)}</strong>, pelo período de <strong>{contractData.tempoInternacao} meses</strong>, 
                com data de entrada em <strong>{formatDate(contractData.dataEntrada)}</strong>.
              </p>

              <h2 className="text-xl font-bold mt-6">CLÁUSULA SEGUNDA - DO PREÇO E FORMA DE PAGAMENTO</h2>
              <p className="text-justify">
                Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {contractData.valorTratamento}</strong>, 
                a ser pago da seguinte forma: <strong>{contractData.formaPagamento}</strong>.
              </p>

              <h2 className="text-xl font-bold mt-6">CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DA CONTRATADA</h2>
              <p className="text-justify">
                A CONTRATADA se obriga a prestar serviços de acolhimento, tratamento e acompanhamento ao dependente químico 
                mencionado na Cláusula Primeira, com todos os recursos técnicos e humanos disponíveis na instituição.
              </p>

              <h2 className="text-xl font-bold mt-6">CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO CONTRATANTE</h2>
              <p className="text-justify">
                O CONTRATANTE se obriga a pagar pontualmente pelos serviços contratados, a fornecer todas as informações 
                necessárias sobre o dependente, bem como a participar, quando solicitado, de reuniões e atividades 
                relacionadas ao tratamento.
              </p>

              <h2 className="text-xl font-bold mt-6">CLÁUSULA QUINTA - DA VIGÊNCIA</h2>
              <p className="text-justify">
                O presente contrato terá vigência de <strong>{contractData.tempoInternacao} meses</strong>, a contar da data de 
                entrada do dependente, podendo ser prorrogado mediante acordo entre as partes.
              </p>

              <h2 className="text-xl font-bold mt-6">CLÁUSULA SEXTA - DA RESCISÃO</h2>
              <p className="text-justify">
                Este contrato poderá ser rescindido por qualquer das partes, mediante notificação por escrito, com 
                antecedência mínima de 15 (quinze) dias, sem direito a restituição de valores já pagos, salvo 
                condições especiais a serem analisadas pela CONTRATADA.
              </p>

              <div className="mt-12 text-center">
                <p><strong>{contractData.responsavelCidade}/{contractData.responsavelEstado}, {formatDate(contractData.dataAssinatura)}</strong></p>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="border-t border-black pt-2">CONTRATANTE</p>
                  <p className="mt-1">{contractData.responsavelNome}</p>
                  <p className="mt-1">CPF: {contractData.responsavelCpf}</p>
                </div>
                <div className="text-center">
                  <p className="border-t border-black pt-2">CONTRATADA</p>
                  <p className="mt-1">{contractData.clinicaNome}</p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-xs text-gray-500">Este documento é gerado automaticamente pelo sistema GetClinicas</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="edit">
            <div className="p-6 border rounded-md mt-4">
              <p>Para editar os dados do contrato, retorne ao formulário e faça as alterações necessárias.</p>
              <Button onClick={handleEditContract} className="mt-4">
                <FilePenIcon className="mr-2 h-4 w-4" />
                Voltar para edição
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="outline" onClick={handlePrintPDF}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handlePrintPDF}>
            <FileIcon className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
