
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const { isAuthenticated, isMasterAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário já estiver autenticado, verificamos se é admin master
    if (isAuthenticated) {
      if (isMasterAdmin) {
        toast.success("Bem-vindo de volta ao painel administrativo!");
        navigate("/master");
      } else {
        // Verificar se temos uma clínica selecionada
        const currentClinicId = localStorage.getItem("currentClinicId");
        if (currentClinicId) {
          toast.success("Bem-vindo de volta à sua clínica!");
          navigate("/dashboard");
        } else {
          // Se não tiver uma clínica selecionada, ir para a home
          navigate("/login");
        }
      }
    } else {
      // Se não estiver autenticado, mostrar a página inicial
      navigate("/login");
    }
  }, [isAuthenticated, isMasterAdmin, navigate]);

  // Redirecionando temporariamente para Dashboard enquanto o useEffect não termina
  return <Navigate to="/dashboard" replace />;
};

export default Index;
