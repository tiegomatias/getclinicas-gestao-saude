
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        const clinicDataStr = localStorage.getItem("clinicData");
        if (clinicDataStr) {
          const clinicData = JSON.parse(clinicDataStr);
          if (clinicData && clinicData.id) {
            // Use either clinicName or clinic_name property to account for both formats
            const clinicName = clinicData.clinicName || clinicData.clinic_name || "sua clínica";
            toast.success(`Bem-vindo de volta à ${clinicName}!`);
            navigate("/dashboard");
          } else {
            // Se não tiver uma clínica válida, ir para o login
            navigate("/login");
          }
        } else {
          // Se não tiver dados de clínica, ir para o login
          navigate("/login");
        }
      }
    } else {
      // Se não estiver autenticado, ir para o login
      navigate("/login");
    }
  }, [isAuthenticated, isMasterAdmin, navigate]);

  // Este componente não renderiza nada visualmente,
  // apenas redireciona com base na autenticação
  return null;
};

export default Index;
