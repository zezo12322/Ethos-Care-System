import api from "@/lib/api";
import { LocationRecord } from "@/types/api";

export interface CreateLocationPayload {
  name: string;
  type?: string;
  region?: string;
  status?: string;
}

export const locationsService = {
  getAll: async () => {
    const response = await api.get<LocationRecord[]>("/locations");
    return response.data;
  },

  create: async (payload: CreateLocationPayload) => {
    const response = await api.post<LocationRecord>("/locations", payload);
    return response.data;
  },

  remove: async (id: string) => {
    await api.delete(`/locations/${id}`);
  },
};
