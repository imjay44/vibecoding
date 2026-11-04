import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/allServices";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("homeserve_token") || null);
  const [role, setRole] = useState(localStorage.getItem("homeserve_role") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("homeserve_token");
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.data);
          setRole(res.data.role);
          localStorage.setItem("homeserve_role", res.data.role);
        } catch (err) {
          console.error("Session restore failed", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { access_token, refresh_token, role: userRole, user: userData } = res.data;

    localStorage.setItem("homeserve_token", access_token);
    localStorage.setItem("homeserve_refresh_token", refresh_token);
    localStorage.setItem("homeserve_role", userRole);

    setToken(access_token);
    setRole(userRole);
    setUser(userData);

    return { role: userRole, user: userData };
  };

  const registerCustomer = async (data) => {
    return await authService.registerCustomer(data);
  };

  const registerProvider = async (data) => {
    return await authService.registerProvider(data);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("homeserve_refresh_token");
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (e) {
        // Ignore logout network error
      }
    }
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data);
      setRole(res.data.role);
      localStorage.setItem("homeserve_role", res.data.role);
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    registerCustomer,
    registerProvider,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
