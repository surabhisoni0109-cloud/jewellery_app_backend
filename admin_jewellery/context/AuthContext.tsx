"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateAdmin: (updated: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("admin_token");
      const savedAdmin = localStorage.getItem("admin_user");
      if (savedToken && savedAdmin) {
        setToken(savedToken);
        setAdmin(JSON.parse(savedAdmin));
      }
    } catch (e) {
      console.error("Failed to load auth from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/admin/auth/login", { email, password });
      const { access_token, admin: adminData } = res.data.data;

      setToken(access_token);
      setAdmin(adminData);
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(adminData));
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  const updateAdmin = (updated: Partial<AdminUser>) => {
    setAdmin((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem("admin_user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, login, logout, updateAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
