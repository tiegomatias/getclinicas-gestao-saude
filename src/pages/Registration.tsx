
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
      console.log("Registrando usuário e clínica...");
      
      // 1. Register the user using Supabase auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password,
        options: {
          data: {
            name: adminName,
          }
        }
      });
      
      if (signUpError) {
        console.error("Erro ao registrar usuário:", signUpError);
        throw signUpError;
      }
      
      console.log("Usuário criado com sucesso:", signUpData);
      
      if (!signUpData.user) {
        throw new Error("Não foi possível criar o usuário");
      }
      
      // 2. Create the clinic associated with the user
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
      
      if (clinicError) {
        console.error("Erro ao criar clínica:", clinicError);
        throw clinicError;
      }
      
      console.log("Clínica criada com sucesso:", clinic);
      
      if (!clinic || clinic.length === 0) {
        throw new Error("Erro ao criar clínica");
      }
      
      // 3. Add the user as an admin of the clinic in the clinic_users table
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
        // We continue even with error, administrator will be able to fix manually
      } else {
        console.log("Usuário associado à clínica com sucesso");
      }
      
      // 4. Save clinic data in localStorage
      localStorage.setItem("currentClinicId", clinic[0].id);
      localStorage.setItem("clinicData", JSON.stringify({
        id: clinic[0].id,
        clinicName: clinic[0].name,
        plan: clinic[0].plan,
        createdAt: clinic[0].created_at || new Date().toISOString(),
        hasInitialData: false
      }));
      
      // 5. Auto-login
      console.log("Tentando fazer login automático...");
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password
      });
      
      if (loginError) {
        console.error("Erro ao fazer login automático:", loginError);
        throw loginError;
      }
      
      console.log("Login automático realizado com sucesso");
      toast.success("Clínica registrada com sucesso!");
      
      // Adding a small delay before redirecting to ensure localStorage is set
      setTimeout(() => {
        console.log("Redirecionando para o dashboard...");
        navigate("/dashboard");
      }, 500);
      
    } catch (error: any) {
      console.error("Erro completo ao registrar:", error);
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
