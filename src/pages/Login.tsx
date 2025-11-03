
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Custom Logo SVG Component
const GetClinicasLogo = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-getclinicas-primary"
  >
    <path
      d="M12 2L4 6V12C4 17.55 7.84 22.74 12 24C16.16 22.74 20 17.55 20 12V6L12 2Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M12 2L4 6V12C4 17.55 7.84 22.74 12 24C16.16 22.74 20 17.55 20 12V6L12 2ZM18 12C18 16.5 14.87 20.74 12 21.82C9.13 20.74 6 16.5 6 12V7.4L12 4.66L18 7.4V12Z"
      fill="currentColor"
    />
    <text
      x="12"
      y="15"
      fontSize="10"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      G
    </text>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, resetPassword, isAuthenticated, loading: authLoading, isMasterAdmin } = useAuth();
  
  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log("User already authenticated, redirecting");
      
      // Verificar se há parâmetros de redirecionamento
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect');
      const planParam = params.get('plan');
      
      // Se há redirect para checkout, redirecionar com o plano
      if (redirectPath === '/checkout' && planParam) {
        console.log("Redirecting to checkout with plan:", planParam);
        navigate(`/checkout?plan=${planParam}`, { replace: true });
        return;
      }
      
      // Check localStorage to determine user type more reliably
      const isProfessionalFlag = localStorage.getItem('isProfessional') === 'true';
      const currentClinicId = localStorage.getItem('currentClinicId');
      const allClinics = localStorage.getItem('allClinics');
      
      console.log("Redirect check:", { 
        isMasterAdmin, 
        isProfessionalFlag, 
        currentClinicId, 
        hasAllClinics: !!allClinics 
      });
      
      if (isMasterAdmin) {
        console.log("Redirecting master admin to /master");
        navigate("/master", { replace: true });
      } else if (isProfessionalFlag) {
        console.log("Redirecting professional to /professional-dashboard");
        navigate("/professional-dashboard", { replace: true });
      } else if (currentClinicId || allClinics) {
        console.log("Redirecting clinic admin - checking subscription");
        // Redirecionar para checkout se não tiver assinatura
        navigate("/dashboard", { replace: true });
      } else {
        console.log("No clinic data found, staying on login");
        // Don't redirect if no clinic data is found
      }
    }
  }, [isAuthenticated, navigate, authLoading, isMasterAdmin, location.search]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || authLoading) return;
    
    setLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetLoading) return;
    
    if (!resetEmail) {
      toast.error("Por favor, insira seu email");
      return;
    }
    
    setResetLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setShowResetPassword(false);
      setResetEmail("");
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setResetLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-getclinicas-primary mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white flex flex-col items-center pt-4 md:pt-0 md:justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 ml-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="flex items-center gap-1 p-0 h-auto hover:bg-transparent"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Button>
        </div>
        
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-2">
            <GetClinicasLogo />
          </div>
          <h1 className="text-2xl font-bold">GetClinicas</h1>
          <p className="text-gray-600">Acesse sua conta</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {showResetPassword ? (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Recuperar Senha</h2>
                <p className="text-sm text-gray-600">
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmail("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Enviando..." : "Enviar Link"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{" "}
              <button 
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  const redirectPath = params.get('redirect');
                  const planParam = params.get('plan');
                  
                  if (redirectPath && planParam) {
                    navigate(`/registro?redirect=${redirectPath}&plan=${planParam}`);
                  } else {
                    navigate("/registro");
                  }
                }}
                className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Registrar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
