import api from "../lib/api";
import { FamilyRecord } from "@/types/api";

export interface FamilyFilterDto {
  status?: string;
  search?: string;
}

export interface FamilyMemberInput {
  name: string;
  age?: string;
  relation?: string;
  education?: string;
}

export interface CreateFamilyDto {
  headName: string;
  nationalId?: string;
  phone?: string;
  socialStatus?: string;
  education?: string;
  job?: string;
  income?: string;
  city?: string;
  village?: string;
  addressDetails?: string;
  address?: string;
  membersDetails?: FamilyMemberInput[];
  membersCount?: number;
  status?: string;
  caseType?: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  description?: string;
}

export const familiesService = {
  getAll: async (params?: FamilyFilterDto) => {
    const response = await api.get<FamilyRecord[]>("/families", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<FamilyRecord>(`/families/${id}`);
    return response.data;
  },

  create: async (data: CreateFamilyDto) => {
    const response = await api.post<FamilyRecord>("/families", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateFamilyDto>) => {
    const response = await api.patch<FamilyRecord>(`/families/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<FamilyRecord>(`/families/${id}`);
    return response.data;
  }
};
