
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const currentClinicId = localStorage.getItem("currentClinicId");
  const location = useLocation();

  // Make sure both authentication and clinic ID are present
  const isFullyAuthenticated = isAuthenticated && currentClinicId;

  // If not authenticated and not already on login page, redirect to login
  if (!isFullyAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (isFullyAuthenticated && location.pathname === "/login") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
