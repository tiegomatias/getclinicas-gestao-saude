
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Define master admin credentials
  const masterAdminEmails = ["tiegomatias@gmail.comm", "tiegomatias@gmail.com", "tiegomatias"];
  const masterAdminPassword = "@Orecic1717";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Check if this is a master admin login
    const isMasterAdmin = masterAdminEmails.includes(email.toLowerCase()) && password === masterAdminPassword;
    
    if (isMasterAdmin) {
      // Handle master admin login
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("isMasterAdmin", "true");
      localStorage.setItem("userEmail", email);
      
      toast.success("Login realizado com sucesso como administrador master!");
      
      // Redirect to master dashboard
      navigate("/master");
    } else {
      // Handle regular clinic login
      // In a real app, you would validate against a database
      const allClinics = JSON.parse(localStorage.getItem("allClinics") || "[]");
      const clinic = allClinics.find((c: any) => c.adminEmail === email);
      
      if (clinic) {
        // Simple password check (in a real app this would be more secure)
        // Here we're assuming the password is valid for demo purposes
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentClinicId", clinic.id);
        localStorage.setItem("clinicData", JSON.stringify(clinic));
        localStorage.setItem("userEmail", email);
        localStorage.removeItem("isMasterAdmin");
        
        toast.success("Login realizado com sucesso!");
        
        // Redirect to clinic dashboard or last visited page
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
      } else {
        toast.error("Email ou senha incorretos");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img src="/placeholder.svg" alt="Logo" className="h-12 w-12" />
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
