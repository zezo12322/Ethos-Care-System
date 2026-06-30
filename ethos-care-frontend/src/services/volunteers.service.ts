import api from "../lib/api";
import { VolunteerRecord, VolunteerAssignmentRecord } from "@/types/api";

export interface VolunteerFilterDto {
  status?: string;
  search?: string;
}

export interface CreateVolunteerDto {
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  preferredArea?: string;
  skills?: string;
  status?: string;
  notes?: string;
  nationalId?: string;
  birthDate?: string;
  education?: string;
  schoolYear?: string;
  center?: string;
  whatsapp?: string;
  address?: string;
}

export interface AssignVolunteerDto {
  operationId: string;
  role?: string;
  attended?: boolean;
  hours?: number;
  notes?: string;
}

export interface UpdateAssignmentDto {
  role?: string;
  attended?: boolean;
  hours?: number;
  notes?: string;
}

export const volunteersService = {
  getAll: async (params?: VolunteerFilterDto) => {
    const response = await api.get<VolunteerRecord[]>("/volunteers", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<VolunteerRecord>(`/volunteers/${id}`);
    return response.data;
  },

  create: async (data: CreateVolunteerDto) => {
    const response = await api.post<VolunteerRecord>("/volunteers", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateVolunteerDto>) => {
    const response = await api.patch<VolunteerRecord>(`/volunteers/${id}`, data);
    return response.data;
  },

  setStatus: async (id: string, status: string) => {
    const response = await api.patch<VolunteerRecord>(`/volunteers/${id}/status`, {
      status,
    });
    return response.data;
  },

  remove: async (id: string) => {
    await api.delete(`/volunteers/${id}`);
  },

  assign: async (id: string, data: AssignVolunteerDto) => {
    const response = await api.post<VolunteerAssignmentRecord>(
      `/volunteers/${id}/assignments`,
      data,
    );
    return response.data;
  },

  updateAssignment: async (assignmentId: string, data: UpdateAssignmentDto) => {
    const response = await api.patch<VolunteerAssignmentRecord>(
      `/volunteers/assignments/${assignmentId}`,
      data,
    );
    return response.data;
  },

  removeAssignment: async (assignmentId: string) => {
    await api.delete(`/volunteers/assignments/${assignmentId}`);
  },
};
