import api from "../lib/api";
import { OperationRecord } from "@/types/api";

export interface OperationFilterDto {
  status?: string;
  search?: string;
  type?: string;
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

interface OperationsApiRecord {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  date?: string;
  target?: number;
  targetFamilies?: number;
  achieved?: number;
  status?: string;
  progress?: number;
  volunteers?: number;
  budget?: string | null;
  location?: string | null;
  cases?: OperationRecord["cases"];
}

const normalizeOperation = (operation: OperationsApiRecord): OperationRecord => ({
  id: operation.id,
  name: operation.name || operation.title || "بدون اسم",
  type: operation.type || "غير محدد",
  date: operation.date || new Date().toISOString(),
  target: operation.target ?? operation.targetFamilies ?? 0,
  achieved: operation.achieved ?? 0,
  status: operation.status || "تجهيز",
  progress: operation.progress ?? 0,
  volunteers: operation.volunteers ?? 0,
  budget: operation.budget ?? null,
  location: operation.location ?? null,
  cases: operation.cases,
});

export const operationsService = {
  getAll: async (params?: OperationFilterDto) => {
    const response = await api.get<OperationsApiRecord[]>("/operations", { params });
    return response.data.map(normalizeOperation);
  },

  getById: async (id: string) => {
    const response = await api.get<OperationsApiRecord>(`/operations/${id}`);
    return normalizeOperation(response.data);
  },

  create: async (data: CreateOperationDto) => {
    const response = await api.post<OperationsApiRecord>("/operations", data);
    return normalizeOperation(response.data);
  },

  complete: async (id: string) => {
    const response = await api.post<OperationsApiRecord>(`/operations/${id}/complete`);
    return normalizeOperation(response.data);
  },
};
