
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const currentClinicId = localStorage.getItem("currentClinicId");
  const isMasterAdmin = localStorage.getItem("isMasterAdmin") === "true";
  const location = useLocation();

  // Master admin paths don't require clinic ID
  const isMasterAdminPath = location.pathname === "/master" || location.pathname.startsWith("/master/");

  // For master admin paths, we only need isAuthenticated and isMasterAdmin
  const canAccessMasterAdmin = isAuthenticated && isMasterAdmin && isMasterAdminPath;
  
  // For clinic paths, we need both authentication and clinic ID
  const isFullyAuthenticated = isAuthenticated && currentClinicId;

  useEffect(() => {
    // Only check clinic data if we're not on a master admin path
    if (isFullyAuthenticated && !isMasterAdminPath) {
      const allClinics = JSON.parse(localStorage.getItem("allClinics") || "[]");
      const clinicExists = allClinics.some((clinic: any) => clinic.id === currentClinicId);
      
      if (!clinicExists) {
        // If clinic doesn't exist in our records, log the user out
        localStorage.removeItem("isAuthenticated");
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
  }, [isFullyAuthenticated, currentClinicId, isMasterAdminPath]);

  // If trying to access master admin path without proper credentials
  if (isMasterAdminPath && !canAccessMasterAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not authenticated and not already on login page, redirect to login
  if (!isFullyAuthenticated && !canAccessMasterAdmin && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if ((isFullyAuthenticated || canAccessMasterAdmin) && location.pathname === "/login") {
    return <Navigate to={isMasterAdmin ? "/master" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
