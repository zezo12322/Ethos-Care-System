import api from "@/lib/api";
import { AppRole, AppUser } from "@/types/api";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: AppRole;
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

  remove: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};
