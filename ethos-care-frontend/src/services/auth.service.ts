import api from "../lib/api";
import { AppUser } from "@/types/api";

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const authService = {
  login: async (data: LoginDto) => {
    const response = await api.post<{ access_token: string; user: AppUser }>("/auth/login", data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<AppUser>("/auth/me");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await api.patch<AppUser>("/auth/me", payload);
    return response.data;
  },

  logout: () => {
    import("js-cookie").then((Cookies) => {
      Cookies.default.remove("access_token");
      window.location.href = "/login";
    });
  }
};
