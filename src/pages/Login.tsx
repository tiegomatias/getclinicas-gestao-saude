
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

// Custom Logo SVG Component
const GetClinicsLogo = () => (
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
  const { signIn, isAuthenticated, loading: authLoading, isMasterAdmin } = useAuth();
  
  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log("User already authenticated, redirecting");
      const isProfessional = localStorage.getItem('isProfessional') === 'true';
      
      if (isMasterAdmin) {
        navigate("/master", { replace: true });
      } else if (isProfessional) {
        navigate("/professional-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, authLoading, isMasterAdmin]);
  
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
            <GetClinicsLogo />
          </div>
          <h1 className="text-2xl font-bold">GetClinics</h1>
          <p className="text-gray-600">Acesse sua conta</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
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
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Esqueceu a senha?
                </a>
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
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{" "}
              <a 
                href="/registro" 
                className="text-blue-600 hover:underline"
              >
                Registrar
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
