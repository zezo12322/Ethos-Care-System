import api from "../lib/api";

export interface FamilyFilterDto {
  status?: string;
  search?: string;
}

export const familiesService = {
  getAll: async (params?: FamilyFilterDto) => {
    const response = await api.get("/families", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/families/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/families", data);
    return response.data;
  }
};
