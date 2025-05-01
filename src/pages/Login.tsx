
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for specific credentials - now accepting both email and username
    const validEmail = "tiegomatias@gmail.com";
    const validUsername = "tiegomatias";
    const validPassword = "@Orecic1717";
    
    if ((usernameOrEmail === validEmail || usernameOrEmail === validUsername) && password === validPassword) {
      // Store authentication status in local storage
      localStorage.setItem("isAuthenticated", "true");
      if (rememberMe) {
        localStorage.setItem("rememberedUsernameOrEmail", usernameOrEmail);
      } else {
        localStorage.removeItem("rememberedUsernameOrEmail");
      }
      
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      toast.error("Credenciais inválidas. Por favor, verifique seu email/usuário e senha.");
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Funcionalidade em desenvolvimento");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  // Check for remembered email/username on component mount
  React.useEffect(() => {
    const remembered = localStorage.getItem("rememberedUsernameOrEmail");
    if (remembered) {
      setUsernameOrEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="h-10 w-10 mr-2" />
            <h1 className="text-2xl font-bold text-getclinicas-dark">GetClinics</h1>
          </div>
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bem-vindo ao GetClinics</CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usernameOrEmail">Email ou Nome de Usuário</Label>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="email@clinica.com ou nome de usuário"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a 
                    href="#" 
                    onClick={handleForgotPassword}
                    className="text-sm text-getclinicas-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => {
                    if (typeof checked === "boolean") {
                      setRememberMe(checked);
                    }
                  }}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Lembrar meus dados
                </label>
              </div>
              <Button type="submit" className="w-full bg-getclinicas-primary hover:bg-getclinicas-dark">
                Entrar
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleBackToHome}
              >
                Voltar para Página Inicial
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Sistema de gerenciamento para clínicas de recuperação
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
