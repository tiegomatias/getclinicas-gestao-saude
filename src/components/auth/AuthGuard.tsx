
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isMasterAdmin, loading, session } = useAuth();
  const currentClinicId = localStorage.getItem("currentClinicId");
  const location = useLocation();

  // Master admin paths don't require clinic ID
  const isMasterAdminPath = location.pathname === "/master" || location.pathname.startsWith("/master/");
  
  // For master admin paths, we only need isAuthenticated and isMasterAdmin
  const canAccessMasterAdmin = isAuthenticated && isMasterAdmin && isMasterAdminPath;
  
  // For clinic paths, we need both authentication and clinic ID
  const isFullyAuthenticated = isAuthenticated && currentClinicId;

  useEffect(() => {
    // Verificar se temos um token de sessão válido
    if (session?.access_token && !isAuthenticated) {
      console.log("Sessão existe mas isAuthenticated é false, recarregando auth state");
    }
    
    // Only check clinic data if we're not on a master admin path
    if (isFullyAuthenticated && !isMasterAdminPath) {
      const allClinics = JSON.parse(localStorage.getItem("allClinics") || "[]");
      const clinicData = JSON.parse(localStorage.getItem("clinicData") || "{}");
      
      console.log("Auth check: ", { 
        isAuthenticated, 
        currentClinicId, 
        clinicDataExists: !!clinicData.id,
        allClinics: allClinics.length 
      });
      
      const clinicExists = allClinics.some((clinic: any) => clinic.id === currentClinicId);
      
      if (!clinicExists && allClinics.length > 0) {
        // If clinic doesn't exist in our records, log the user out
        localStorage.removeItem("currentClinicId");
        localStorage.removeItem("clinicData");
        toast.error("Sessão inválida. Por favor, faça login novamente.");
      } else {
        // Load the correct clinic data for the current session
        const currentClinic = allClinics.find((clinic: any) => clinic.id === currentClinicId);
        if (currentClinic) {
          localStorage.setItem("clinicData", JSON.stringify(currentClinic));
        }
      }
    }
  }, [isFullyAuthenticated, currentClinicId, isMasterAdminPath, isAuthenticated, session]);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Se estamos nas páginas públicas, não precisamos redirecionar
  if (location.pathname === "/" || 
      location.pathname === "/login" || 
      location.pathname === "/registro" || 
      location.pathname === "/checkout") {
    return <>{children}</>;
  }

  // If trying to access master admin path without proper credentials
  if (isMasterAdminPath && !canAccessMasterAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not authenticated, redirect to login
  if (!isFullyAuthenticated && !canAccessMasterAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if ((isFullyAuthenticated || canAccessMasterAdmin) && location.pathname === "/login") {
    return <Navigate to={isMasterAdmin ? "/master" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
