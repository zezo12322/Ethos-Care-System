"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";
import { AppUser } from "@/types/api";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (token: string, user: AppUser) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, login: () => {} });

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

  const login = useCallback((token: string, userData: AppUser) => {
    Cookies.set("access_token", token, { expires: 1 });
    setUser(userData);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
