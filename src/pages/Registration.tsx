
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
  const { signUp } = useAuth();
  
  // Form values
  const [clinicName, setClinicName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    // Não é mais necessário validar o plano na URL
    // O plano será escolhido após o registro na página /plans
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
      
      // 1. Register the user using Supabase auth with proper error handling
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
        
        // Log detailed error information for debugging
        console.error("Erro detalhado:", {
          message: signUpError.message || 'Erro desconhecido',
          status: signUpError.status || 'N/A',
          code: signUpError.code || 'N/A'
        });
        
        // Display user-friendly error messages based on the actual error
        let errorMessage = signUpError.message || 'Erro desconhecido';
        
        if (signUpError.message) {
          if (signUpError.message.includes("User already registered") || 
              signUpError.message.includes("already been registered")) {
            errorMessage = "Este email já está cadastrado. Faça login ou use outro email.";
          } else if (signUpError.message.includes("Password should be at least")) {
            errorMessage = "A senha deve ter pelo menos 6 caracteres.";
          } else if (signUpError.message.includes("Invalid email") || 
                     signUpError.message.includes("email")) {
            errorMessage = "Email inválido. Verifique o formato do email.";
          } else if (signUpError.message.includes("signup is disabled")) {
            errorMessage = "Cadastro desabilitado. Entre em contato com o suporte.";
          } else if (signUpError.message.includes("Password is too weak")) {
            errorMessage = "Senha muito fraca. Use uma senha mais forte.";
          } else if (signUpError.message.includes("rate limit")) {
            errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
          }
        }
        
        toast.error(`Erro ao registrar: ${errorMessage}`);
        throw signUpError;
      }
      
      console.log("Usuário criado com sucesso:", signUpData);
      
      if (!signUpData.user) {
        const errorMsg = "Não foi possível criar o usuário";
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // 2. Create the clinic associated with the user
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .insert([
          {
            name: clinicName,
            admin_id: signUpData.user.id,
            admin_email: adminEmail
          }
        ])
        .select();
      
      if (clinicError) {
        console.error("Erro ao criar clínica:", clinicError);
        console.error("Erro detalhado da clínica:", {
          message: clinicError.message || 'Erro desconhecido',
          details: clinicError.details || 'N/A',
          hint: clinicError.hint || 'N/A',
          code: clinicError.code || 'N/A'
        });
        
        let clinicErrorMessage = clinicError.message || 'Erro desconhecido ao criar clínica';
        if (clinicError.message && clinicError.message.includes('duplicate key')) {
          clinicErrorMessage = 'Já existe uma clínica com este nome ou email.';
        }
        
        toast.error(`Erro ao criar clínica: ${clinicErrorMessage}`);
        throw clinicError;
      }
      
      console.log("Clínica criada com sucesso:", clinic);
      
      if (!clinic || clinic.length === 0) {
        const errorMsg = "Erro ao criar clínica";
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
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
        console.error("Erro detalhado da associação:", {
          message: clinicUserError.message || 'Erro desconhecido',
          details: clinicUserError.details || 'N/A',
          hint: clinicUserError.hint || 'N/A',
          code: clinicUserError.code || 'N/A'
        });
        // We continue even with error, administrator will be able to fix manually
        toast.warning("Usuário criado, mas houve um problema na associação à clínica");
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
        console.error("Erro detalhado do login:", {
          message: loginError.message || 'Erro desconhecido',
          status: loginError.status || 'N/A',
          code: loginError.code || 'N/A'
        });
        
        // Even if auto-login fails, user was created successfully
        toast.success("Clínica registrada com sucesso! Faça login para continuar.");
        navigate("/login");
        return;
      }
      
      console.log("Login automático realizado com sucesso");
      toast.success("Clínica registrada com sucesso!");
      
      // Após registro bem-sucedido, redirecionar para página de planos
      setTimeout(() => {
        console.log("Redirecionando para seleção de planos...");
        navigate("/plans");
      }, 500);
      
    } catch (error: any) {
      console.error("Erro completo ao registrar:", error);
      
      // Enhanced error logging to capture all error details
      if (error && typeof error === 'object') {
        console.error("Propriedades do erro:", Object.keys(error));
        console.error("Mensagem do erro:", error.message || 'N/A');
        console.error("Status do erro:", error.status || 'N/A');
        console.error("Código do erro:", error.code || 'N/A');
        console.error("Detalhes do erro:", error.details || 'N/A');
        console.error("Dica do erro:", error.hint || 'N/A');
        
        try {
          console.error("Erro serializado:", JSON.stringify(error, null, 2));
        } catch (serializeError) {
          console.error("Não foi possível serializar o erro:", serializeError);
        }
      }
      
      // Only display error message if it hasn't been displayed already
      if (error && error.message && !error.message.includes("Erro ao")) {
        const displayMessage = error.message === "{}" || error.message === "" 
          ? "Erro desconhecido ao registrar. Verifique os dados e tente novamente."
          : `Erro ao registrar: ${error.message}`;
        toast.error(displayMessage);
      } else if (!error || !error.message) {
        toast.error("Erro desconhecido ao registrar. Tente novamente.");
      }
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={loading}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;
