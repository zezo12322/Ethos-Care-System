"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";
import { AppUser } from "@/types/api";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(() => Boolean(Cookies.get("access_token")));

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      return;
    }

    authService.getMe()
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        Cookies.remove("access_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
