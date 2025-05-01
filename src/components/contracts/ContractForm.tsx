
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
import { Textarea } from "@/components/ui/textarea";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
});

type ContractFormProps = {
  onSubmit: (formData: z.infer<typeof formSchema>) => void;
};

export default function ContractForm({ onSubmit }: ContractFormProps) {
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
    },
  });

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    toast.success("Contrato gerado com sucesso!");
    onSubmit(data);
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
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Gerar Contrato
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
