import api from "../lib/api";
import { OperationRecord } from "@/types/api";

export interface OperationFilterDto {
  status?: string;
  search?: string;
}

export interface CreateOperationDto {
  name?: string;
  operationTitle?: string;
  type?: string;
  operationType?: string;
  target?: number;
  targetFamilies?: number;
  volunteers?: number;
  executionDate?: string;
}

export const operationsService = {
  getAll: async (params?: OperationFilterDto) => {
    const response = await api.get<OperationRecord[]>("/operations", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<OperationRecord>(`/operations/${id}`);
    return response.data;
  },

  create: async (data: CreateOperationDto) => {
    const response = await api.post<OperationRecord>("/operations", data);
    return response.data;
  },
};
