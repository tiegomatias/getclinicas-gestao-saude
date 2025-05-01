
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { signUp } = useAuth();
  
  // Form values
  const [clinicName, setClinicName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    // Get the plan from the URL query parameter
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    
    if (plan && (plan === "Mensal" || plan === "Semestral" || plan === "Anual")) {
      setSelectedPlan(plan);
    } else {
      // If no plan is selected, redirect to checkout page
      toast.error("Por favor, selecione um plano antes de continuar");
      navigate("/checkout");
    }
  }, [location.search, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!clinicName || !adminName || !adminEmail || !password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Primeiro registramos o usuário (sem aguardar a confirmação por email)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password,
        options: {
          data: {
            name: adminName,
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (!signUpData.user) {
        throw new Error("Não foi possível criar o usuário");
      }
      
      // 2. Criamos a clínica associada ao usuário
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .insert([
          {
            name: clinicName,
            admin_id: signUpData.user.id,
            admin_email: adminEmail,
            plan: selectedPlan
          }
        ])
        .select();
      
      if (clinicError) throw clinicError;
      
      if (!clinic || clinic.length === 0) {
        throw new Error("Erro ao criar clínica");
      }
      
      // 3. Inserção direta na tabela user_roles usando service_role key (isso é feito no backend em produção)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: signUpData.user.id,
            role: 'clinic_admin'
          }
        ]);
      
      if (roleError) {
        console.error("Erro ao definir função do usuário:", roleError);
        // Continuamos mesmo se houver erro aqui, pois o administrador poderá corrigir manualmente
      }
      
      // 4. Adicionar o usuário como admin da clínica
      const { error: clinicUserError } = await supabase
        .from('clinic_users')
        .insert([
          {
            clinic_id: clinic[0].id,
            user_id: signUpData.user.id,
            role: 'clinic_admin'
          }
        ]);
      
      if (clinicUserError) {
        console.error("Erro ao associar usuário à clínica:", clinicUserError);
        // Continuamos mesmo com erro, administrador poderá corrigir manualmente
      }
      
      // Salvar dados da clínica no localStorage
      localStorage.setItem("currentClinicId", clinic[0].id);
      localStorage.setItem("clinicData", JSON.stringify(clinic[0]));
      
      // 5. Fazer login automaticamente
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password
      });
      
      if (loginError) {
        throw loginError;
      }
      
      toast.success("Clínica registrada com sucesso!");
      navigate("/dashboard");
      
    } catch (error: any) {
      toast.error(`Erro ao registrar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registre sua Clínica</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedPlan ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">É necessário selecionar um plano antes de continuar</p>
              <Button onClick={() => navigate("/checkout")}>
                Selecionar um Plano
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md mb-6 text-center">
                <p className="text-sm text-blue-600">Plano selecionado: <strong>{selectedPlan}</strong></p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input
                  id="clinicName"
                  placeholder="Ex: Centro de Recuperação São Lucas"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminName">Nome do Administrador</Label>
                <Input
                  id="adminName"
                  placeholder="Seu nome completo"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email do Administrador</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Crie uma senha forte"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme sua Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !selectedPlan}
              >
                {loading ? "Registrando..." : "Registrar Clínica"}
              </Button>
              
              <p className="text-sm text-center text-gray-500 mt-4">
                Já tem conta?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Faça login
                </a>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;
