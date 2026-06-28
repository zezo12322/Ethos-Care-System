"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";
import { AppUser } from "@/types/api";

const CACHED_USER_KEY = "ethos-cached-user";

function readCachedUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: AppUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHED_USER_KEY);
  } catch {
    /* ignore storage quota / privacy-mode errors */
  }
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (token: string, user: AppUser) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, login: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(() =>
    Cookies.get("access_token") ? readCachedUser() : null,
  );
  const [loading, setLoading] = useState(() => Boolean(Cookies.get("access_token")));

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      // `loading` already initialises to false when there is no token.
      return;
    }

    authService.getMe()
      .then((data) => {
        setUser(data);
        writeCachedUser(data);
      })
      .catch((error: unknown) => {
        const status = (error as { response?: { status?: number } } | null)
          ?.response?.status;

        if (status === 401 || status === 403) {
          // Genuine auth failure — the token is invalid or expired.
          Cookies.remove("access_token");
          writeCachedUser(null);
          setUser(null);
        } else {
          // Network / offline / server error: keep the session alive and fall back
          // to the cached profile so the app stays usable without a connection.
          const cached = readCachedUser();
          if (cached) setUser(cached);
        }
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
