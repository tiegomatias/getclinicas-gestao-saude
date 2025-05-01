
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, ShieldCheck, UserPlus, Check, Info } from "lucide-react";
import { toast } from "sonner";

// Schema validation for the form
const formSchema = z.object({
  // Clinic Information
  clinicName: z.string().min(3, "Nome da clínica deve ter no mínimo 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  
  // Address
  cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  street: z.string().min(3, "Endereço deve ter no mínimo 3 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, "Bairro deve ter no mínimo 3 caracteres"),
  city: z.string().min(3, "Cidade deve ter no mínimo 3 caracteres"),
  state: z.string().min(2, "Estado inválido").max(2, "Use a sigla do estado"),
  
  // Responsible Person
  responsibleName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  responsibleCPF: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  responsiblePhone: z.string().min(10, "Telefone inválido"),
  responsibleEmail: z.string().email("Email inválido"),
  
  // Clinic Details
  bedsCapacity: z.string().min(1, "Informe a capacidade de leitos"),
  specialties: z.string().min(3, "Informe ao menos uma especialidade"),
  description: z.string().optional(),
  
  // Access Information
  username: z.string().min(5, "Usuário deve ter no mínimo 5 caracteres"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  passwordConfirm: z.string().min(8, "Confirme sua senha"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não conferem",
  path: ["passwordConfirm"],
});

type FormData = z.infer<typeof formSchema>;

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clinicName: "",
      cnpj: "",
      phone: "",
      email: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      responsibleName: "",
      responsibleCPF: "",
      responsiblePhone: "",
      responsibleEmail: "",
      bedsCapacity: "",
      specialties: "",
      description: "",
      username: "",
      password: "",
      passwordConfirm: "",
    },
  });

  useEffect(() => {
    // Get the plan from the URL query parameter
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    
    if (plan) {
      setSelectedPlan(plan);
    } else {
      toast.error("Plano não encontrado");
      navigate("/checkout");
    }
  }, [location, navigate]);

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    // Create a clinic object with all the registration data
    const clinicData = {
      ...data,
      id: crypto.randomUUID(),
      plan: selectedPlan,
      createdAt: new Date().toISOString(),
      active: true
    };
    
    // Simulate API call to register clinic
    setTimeout(() => {
      console.log("Form data:", data);
      console.log("Selected plan:", selectedPlan);
      
      // Store clinic data in localStorage (in a real app this would be stored in a database)
      localStorage.setItem("clinicData", JSON.stringify(clinicData));
      localStorage.setItem("currentClinicId", clinicData.id);
      localStorage.setItem("isAuthenticated", "true");
      
      toast.success("Cadastro realizado com sucesso! Bem-vindo ao GetClinics.");
      // Redirect to dashboard after successful registration
      navigate("/dashboard");
      setIsSubmitting(false);
    }, 2000);
  };

  const handleBackToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="h-10 w-10 mr-2" />
            <h1 className="text-2xl font-bold text-getclinicas-dark">GetClinics</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl mb-16">
        <Button 
          variant="ghost" 
          onClick={handleBackToCheckout} 
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para checkout</span>
        </Button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Cadastro da Clínica</h2>
          <p className="text-gray-600">
            Preencha os dados abaixo para finalizar seu cadastro e começar a usar o GetClinics
          </p>
          {selectedPlan && (
            <div className="mt-2 inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <Check className="h-4 w-4 mr-1" />
              Plano selecionado: <span className="font-semibold ml-1">{selectedPlan}</span>
            </div>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Clinic Information Section */}
            <Card>
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-getclinicas-primary" />
                  <CardTitle>Informações da Clínica</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clinicName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome da Clínica</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da clínica" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email da Clínica</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@clinica.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Address Section */}
            <Card>
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-getclinicas-primary" />
                  <CardTitle>Endereço</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-1">
                  {/* Empty space to keep the grid layout */}
                </div>
                
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Opcional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Responsible Person Section */}
            <Card>
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-getclinicas-primary" />
                  <CardTitle>Responsável Legal</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responsibleName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="responsibleCPF"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="responsiblePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="responsibleEmail"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email do Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="responsavel@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Clinic Details Section */}
            <Card>
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-getclinicas-primary" />
                  <CardTitle>Detalhes da Clínica</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedsCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade de Leitos</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 30" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidades</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Dependência Química, Psiquiatria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição da Clínica</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva brevemente a sua clínica..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Access Information */}
            <Card>
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-getclinicas-primary" />
                  <CardTitle>Dados de Acesso</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="Escolha um nome de usuário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-1">
                  {/* Empty space to keep the grid layout */}
                </div>
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Escolha uma senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirme a Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite a senha novamente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
                </p>
              </CardFooter>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg"
                className="bg-getclinicas-primary hover:bg-getclinicas-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
      
      <footer className="bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/placeholder.svg" alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">GetClinics</span>
            </div>
            <div className="text-gray-600">
              &copy; {new Date().getFullYear()} GetClinics. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Registration;
