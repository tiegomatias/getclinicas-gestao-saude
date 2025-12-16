import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format, addMonths } from "date-fns";
import { contractService } from "@/services/contractService";
import { patientService } from "@/services/patientService";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  responsavelNome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  responsavelRg: z.string().min(5, "RG inválido"),
  responsavelCpf: z.string().min(11, "CPF inválido").max(14),
  responsavelEndereco: z.string().min(10, "Endereço deve ser completo"),
  responsavelCidade: z.string().min(2, "Informe a cidade"),
  responsavelEstado: z.string().min(2, "Informe o estado"),
  responsavelCep: z.string().min(8, "CEP inválido"),
  pacienteNome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  pacienteIdade: z.string().min(1, "Informe a idade"),
  pacienteDataNascimento: z.string().min(8, "Data de nascimento inválida"),
  dataEntrada: z.string(),
  tempoInternacao: z.string(),
  valorTratamento: z.string(),
  formaPagamento: z.string(),
  clinicaNome: z.string().min(3, "Nome da clínica obrigatório"),
  dataAssinatura: z.string(),
  dataVencimento: z.string().optional(),
  descontoTipo: z.string().optional(),
  descontoValor: z.string().optional(),
});

type ContractFormProps = {
  clinicId: string;
  contract?: any;
  onSuccess: () => void;
};

export default function ContractForm({ clinicId, contract, onSuccess }: ContractFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      responsavelNome: "",
      responsavelRg: "",
      responsavelCpf: "",
      responsavelEndereco: "",
      responsavelCidade: "",
      responsavelEstado: "",
      responsavelCep: "",
      pacienteNome: "",
      pacienteIdade: "",
      pacienteDataNascimento: "",
      dataEntrada: format(new Date(), "yyyy-MM-dd"),
      tempoInternacao: "6",
      valorTratamento: "",
      formaPagamento: "À vista",
      clinicaNome: "Clínica de Recuperação",
      dataAssinatura: format(new Date(), "yyyy-MM-dd"),
      dataVencimento: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
      descontoTipo: "nenhum",
      descontoValor: "0",
    },
  });

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // 1. Criar paciente automaticamente
      const patientData = {
        name: data.pacienteNome,
        birth_date: data.pacienteDataNascimento,
        admission_date: data.dataEntrada,
        admission_type: "internacao",
        status: "active",
        clinic_id: clinicId,
        responsible_name: data.responsavelNome,
        responsible_phone: "",
        address: data.responsavelEndereco,
      };

      const patient = await patientService.createPatient(patientData);
      
      if (!patient) {
        throw new Error("Erro ao criar paciente");
      }

      // 2. Calcular data de término baseado no tempo de internação
      const startDate = new Date(data.dataEntrada);
      const endDate = addMonths(startDate, parseInt(data.tempoInternacao));

      // 3. Calcular valor final com desconto
      let valorFinal = parseFloat(data.valorTratamento.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      const descontoValor = parseFloat(data.descontoValor || "0");
      
      if (data.descontoTipo === "percentual" && descontoValor > 0) {
        valorFinal = valorFinal - (valorFinal * descontoValor / 100);
      } else if (data.descontoTipo === "fixo" && descontoValor > 0) {
        valorFinal = valorFinal - descontoValor;
      }

      // 4. Criar contrato
      const contractData = {
        patient_id: patient.id,
        responsible_name: data.responsavelNome,
        responsible_document: data.responsavelCpf,
        value: valorFinal,
        start_date: data.dataEntrada,
        end_date: format(endDate, "yyyy-MM-dd"),
        payment_method: data.formaPagamento,
        due_date: data.dataVencimento,
        discount_type: data.descontoTipo !== "nenhum" ? data.descontoTipo : null,
        discount_value: descontoValor,
      };

      const createdContract = await contractService.createContract(clinicId, contractData);

      if (createdContract) {
        toast.success("Contrato e paciente criados com sucesso!");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao salvar contrato:", error);
      toast.error("Erro ao salvar contrato: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Responsável Financeiro</CardTitle>
            <CardDescription>
              Informações completas do responsável pelo contrato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="responsavelNome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="responsavelRg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="RG do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavelCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="responsavelEndereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="responsavelCidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavelEstado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="UF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavelCep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="CEP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dados do Paciente</CardTitle>
            <CardDescription>
              Informações do dependente que será internado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pacienteNome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pacienteIdade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Idade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pacienteDataNascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dados do Tratamento</CardTitle>
            <CardDescription>
              Informações sobre o tratamento e pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dataEntrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de entrada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tempoInternacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de internação (meses)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 mês</SelectItem>
                        <SelectItem value="3">3 meses</SelectItem>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="9">9 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="valorTratamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do tratamento (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="Valor em reais" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="formaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="À vista">À vista</SelectItem>
                        <SelectItem value="Parcelado em 2x">Parcelado em 2x</SelectItem>
                        <SelectItem value="Parcelado em 3x">Parcelado em 3x</SelectItem>
                        <SelectItem value="Parcelado em 6x">Parcelado em 6x</SelectItem>
                        <SelectItem value="Parcelado em 12x">Parcelado em 12x</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dataVencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinicaNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da clínica</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="descontoTipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de desconto</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de desconto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nenhum">Nenhum</SelectItem>
                        <SelectItem value="percentual">Percentual (%)</SelectItem>
                        <SelectItem value="fixo">Valor fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="descontoValor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do desconto</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        disabled={form.watch("descontoTipo") === "nenhum"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="dataAssinatura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de assinatura</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Gerar Contrato"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
