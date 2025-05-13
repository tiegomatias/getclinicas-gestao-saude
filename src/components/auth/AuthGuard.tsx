
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
  const currentClinicId = localStorage.getItem("currentClinicId");
  const location = useLocation();

  // For debugging
  useEffect(() => {
    console.log("AuthGuard rendering with:", { 
      isAuthenticated, 
      isMasterAdmin, 
      currentClinicId,
      path: location.pathname,
      loading,
      isPublicRoute: PUBLIC_ROUTES.includes(location.pathname)
    });
  }, [isAuthenticated, isMasterAdmin, currentClinicId, location.pathname, loading]);
  
  // Se estivermos em uma rota pública, sempre permitir acesso
  if (PUBLIC_ROUTES.includes(location.pathname)) {
    console.log("On public route, proceeding normally");
    return <Outlet />;
  }
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  // Master admin paths don't require clinic ID
  const isMasterAdminPath = location.pathname === "/master" || location.pathname.startsWith("/master/");
  
  // For master admin paths, we only need isAuthenticated and isMasterAdmin
  const canAccessMasterAdmin = isAuthenticated && isMasterAdmin && (role === "master" || isMasterAdminPath);
  
  // For clinic paths, we need both authentication and clinic ID
  const isFullyAuthenticated = isAuthenticated && currentClinicId;

  // If trying to access master admin path without proper credentials
  if (role === "master" && !canAccessMasterAdmin) {
    console.log("Unauthorized master admin access attempt, redirecting to login");
    toast.error("Acesso não autorizado. Você precisa ser um administrador mestre.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not authenticated, redirect to login
  if (!isFullyAuthenticated && !canAccessMasterAdmin) {
    console.log("Not fully authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("Access granted to protected route");
  return <Outlet />;
};

export default AuthGuard;
