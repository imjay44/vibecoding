import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <span className="text-xs text-slate-500 font-medium">Verifying authorization...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to user's actual designated dashboard
    if (role === "SUPER_ADMIN") return <Navigate to="/admin" replace />;
    if (role === "SERVICE_PROVIDER") return <Navigate to="/provider" replace />;
    if (role === "TECHNICIAN") return <Navigate to="/technician" replace />;
    return <Navigate to="/customer" replace />;
  }

  return <Outlet />;
};
