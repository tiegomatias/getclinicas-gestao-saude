
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  role?: "master";
}

const AuthGuard = ({ role }: AuthGuardProps) => {
  const { isAuthenticated, isMasterAdmin, loading } = useAuth();
  const currentClinicId = localStorage.getItem("currentClinicId");
  const location = useLocation();

  // Master admin paths don't require clinic ID
  const isMasterAdminPath = location.pathname === "/master" || location.pathname.startsWith("/master/");
  
  // For master admin paths, we only need isAuthenticated and isMasterAdmin
  const canAccessMasterAdmin = isAuthenticated && isMasterAdmin && (role === "master" || isMasterAdminPath);
  
  // For clinic paths, we need both authentication and clinic ID
  const isFullyAuthenticated = isAuthenticated && currentClinicId;

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Se estamos nas páginas públicas, não precisamos redirecionar
  if (location.pathname === "/" || 
      location.pathname === "/login" || 
      location.pathname === "/registro" || 
      location.pathname === "/checkout" ||
      location.pathname === "/home") {
    return <Outlet />;
  }

  // If trying to access master admin path without proper credentials
  if (role === "master" && !canAccessMasterAdmin) {
    toast.error("Acesso não autorizado. Você precisa ser um administrador mestre.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not authenticated, redirect to login
  if (!isFullyAuthenticated && !canAccessMasterAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
