import api from "../lib/api";

export interface OperationFilterDto {
  status?: string;
  search?: string;
}

export const operationsService = {
  getAll: async (params?: OperationFilterDto) => {
    const response = await api.get("/operations", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/operations/${id}`);
    return response.data;
  },
};
