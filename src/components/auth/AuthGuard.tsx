
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  role?: "master";
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/registro", "/checkout", "/home", "/demo"];

const AuthGuard = ({ role }: AuthGuardProps) => {
  const { isAuthenticated, isMasterAdmin, loading } = useAuth();
  const location = useLocation();

  // For debugging
  useEffect(() => {
    const currentClinicId = localStorage.getItem("currentClinicId");
    const isProfessional = localStorage.getItem("isProfessional") === 'true';
    
    console.log("AuthGuard rendering with:", { 
      isAuthenticated, 
      isMasterAdmin, 
      currentClinicId,
      isProfessional,
      path: location.pathname,
      loading,
      isPublicRoute: PUBLIC_ROUTES.includes(location.pathname)
    });
  }, [isAuthenticated, isMasterAdmin, location.pathname, loading]);
  
  // Master admin paths don't require clinic ID
  const isMasterAdminPath = location.pathname === "/master" || location.pathname.startsWith("/master/");
  
  // For master admin paths, we only need isAuthenticated and isMasterAdmin
  const canAccessMasterAdmin = isAuthenticated && isMasterAdmin && (role === "master" || isMasterAdminPath);
  
  // For clinic paths, we need authentication and either clinic ID or professional status
  const currentClinicId = localStorage.getItem("currentClinicId");
  const isProfessional = localStorage.getItem("isProfessional") === 'true';
  const isFullyAuthenticated = isAuthenticated && (currentClinicId || isProfessional || isMasterAdmin);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // If we're on public pages, no need to redirect
  if (PUBLIC_ROUTES.includes(location.pathname)) {
    console.log("On public route, proceeding normally");
    return <Outlet />;
  }

  // If trying to access master admin path without proper credentials
  if (role === "master" && !canAccessMasterAdmin) {
    console.log("Unauthorized master admin access attempt, redirecting to login");
    toast.error("Acesso não autorizado. Você precisa ser um administrador mestre.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not authenticated, redirect to login
  if (!isFullyAuthenticated && !canAccessMasterAdmin) {
    console.log("Not fully authenticated, redirecting to login. Details:", {
      isAuthenticated,
      currentClinicId,
      isProfessional,
      isMasterAdmin
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("Access granted to protected route");
  return <Outlet />;
};

export default AuthGuard;
