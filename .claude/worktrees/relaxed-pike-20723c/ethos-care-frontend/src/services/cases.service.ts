import api from "../lib/api";
import {
  CaseHistoryRecord,
  CaseIntakeFormData,
  CaseRecord,
} from "@/types/api";

export interface CaseFilterDto {
  status?: string;
  search?: string;
  type?: string;
}

export interface CreateCaseDto {
  applicantName: string;
  nationalId?: string;
  caseType: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  description?: string;
  formData?: CaseIntakeFormData;
  familyId?: string;
  location?: string;
}

export const casesService = {
  getAll: async (params?: CaseFilterDto) => {
    const response = await api.get<CaseRecord[]>("/cases", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<CaseRecord>(`/cases/${id}`);
    return response.data;
  },

  getHistory: async (id: string) => {
    const response = await api.get<CaseHistoryRecord[]>(`/cases/${id}/history`);
    return response.data;
  },

  getPdf: async (id: string) => {
    const response = await api.get<Blob>(`/cases/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  create: async (data: CreateCaseDto) => {
    const response = await api.post<CaseRecord>("/cases", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCaseDto>) => {
    const response = await api.patch<CaseRecord>(`/cases/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<CaseRecord>(`/cases/${id}`);
    return response.data;
  },

  transition: async (id: string, action: string, reason?: string) => {
    const response = await api.post<CaseRecord>(`/cases/${id}/transitions/${action}`, { reason });
    return response.data;
  }
};
