import api from "@/lib/api";
import { PartnerRecord } from "@/types/api";

export interface CreatePartnerPayload {
  name: string;
  type?: string;
  contact?: string;
  email?: string;
  status?: string;
  image?: string;
}

export const partnersService = {
  getAll: async () => {
    const response = await api.get<PartnerRecord[]>("/partners");
    return response.data;
  },

  create: async (payload: CreatePartnerPayload) => {
    const response = await api.post<PartnerRecord>("/partners", payload);
    return response.data;
  },

  update: async (id: string, payload: CreatePartnerPayload) => {
    const response = await api.patch<PartnerRecord>(`/partners/${id}`, payload);
    return response.data;
  },

  remove: async (id: string) => {
    await api.delete(`/partners/${id}`);
  },
};
