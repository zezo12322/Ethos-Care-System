import api from "@/lib/api";
import { AppRole, AppUser } from "@/types/api";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: AppRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: AppRole;
}

export interface UpdateProfilePayload {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const usersService = {
  getAll: async () => {
    const response = await api.get<AppUser[]>("/users");
    return response.data;
  },

  create: async (payload: CreateUserPayload) => {
    const response = await api.post<AppUser>("/users", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateUserPayload) => {
    const response = await api.patch<AppUser>(`/users/${id}`, payload);
    return response.data;
  },

  remove: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  getMe: async () => {
    const response = await api.get<AppUser>("/users/me");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await api.patch<AppUser>("/users/me", payload);
    return response.data;
  },
};
