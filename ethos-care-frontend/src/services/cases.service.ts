import api from "../lib/api";

export interface CaseFilterDto {
  status?: string;
  search?: string;
}

export const casesService = {
  getAll: async (params?: CaseFilterDto) => {
    const response = await api.get("/cases", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/cases", data);
    return response.data;
  }
};