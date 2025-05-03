
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const { isAuthenticated, isMasterAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index page loaded, auth status:", { isAuthenticated, isMasterAdmin, loading });
    
    // Wait for loading to finish before redirecting
    if (loading) {
      console.log("Auth is still loading, waiting...");
      return;
    }
    
    // Check if user is authenticated
    if (isAuthenticated) {
      if (isMasterAdmin) {
        console.log("User is master admin, redirecting to /master");
        toast.success("Bem-vindo de volta ao painel administrativo!");
        navigate("/master");
      } else {
        // Check if we have a selected clinic
        const clinicDataStr = localStorage.getItem("clinicData");
        if (clinicDataStr) {
          try {
            const clinicData = JSON.parse(clinicDataStr);
            if (clinicData && clinicData.id) {
              // Use either clinicName property
              const clinicName = clinicData.clinicName || clinicData.name || (clinicData as any).clinic_name || 'sua clínica';
              console.log("User has clinic data, redirecting to /dashboard");
              toast.success(`Bem-vindo de volta à ${clinicName}!`);
              navigate("/dashboard");
            } else {
              console.log("No valid clinic ID found, redirecting to /login");
              navigate("/login");
            }
          } catch (error) {
            console.error("Error parsing clinicData:", error);
            navigate("/login");
          }
        } else {
          console.log("No clinic data found, redirecting to /home");
          navigate("/home");
        }
      }
    } else {
      console.log("User not authenticated, redirecting to home");
      // If not authenticated, show the homepage
      navigate("/home");
    }
  }, [isAuthenticated, isMasterAdmin, navigate, loading]);

  // This component doesn't render anything visually,
  // it just redirects based on authentication
  return <div className="flex items-center justify-center min-h-screen">Redirecionando...</div>;
};

export default Index;
