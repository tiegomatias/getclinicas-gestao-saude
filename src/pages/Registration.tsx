
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate API call to create clinic and admin account
    setTimeout(() => {
      // Generate a unique ID for the clinic
      const clinicId = uuidv4();
      
      // Create clinic object with initial empty state
      const clinic = {
        id: clinicId,
        clinicName,
        adminName,
        adminEmail,
        plan: selectedPlan,
        createdAt: new Date().toISOString(),
        bedsCapacity: "30", // Default value
        hasBedsData: false,  // Initially no bed data
        occupiedBeds: "0",
        availableBeds: "30",
        maintenanceBeds: "0",
        // Initialize with empty data for a clean dashboard
        patients: [],
        professionals: [],
        activities: [],
        admissions: [],
        hasInitialData: false
      };
      
      // Add the clinic to local storage (In real app, this would be a server API call)
      const allClinics = JSON.parse(localStorage.getItem("allClinics") || "[]");
      allClinics.push(clinic);
      localStorage.setItem("allClinics", JSON.stringify(allClinics));
      
      // Create a simple admin user (In real app, this would be a proper auth system)
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentClinicId", clinicId);
      localStorage.setItem("clinicData", JSON.stringify(clinic));
      
      toast.success("Clínica registrada com sucesso!");
      navigate("/dashboard");
      
      setLoading(false);
    }, 1500);
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
