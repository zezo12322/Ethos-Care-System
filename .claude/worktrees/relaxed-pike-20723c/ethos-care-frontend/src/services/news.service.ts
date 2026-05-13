import api from "@/lib/api";
import { NewsRecord } from "@/types/api";

export interface CreateNewsPayload {
  title: string;
  content: string;
  category: string;
  image?: string;
  published: boolean;
}

export const newsService = {
  getPublished: async () => {
    const response = await api.get<NewsRecord[]>("/news");
    return response.data;
  },

  getAllForAdmin: async () => {
    const response = await api.get<NewsRecord[]>("/news/admin/all");
    return response.data;
  },

  create: async (payload: CreateNewsPayload) => {
    const response = await api.post<NewsRecord>("/news", payload);
    return response.data;
  },

  update: async (id: string, payload: CreateNewsPayload) => {
    const response = await api.patch<NewsRecord>(`/news/${id}`, payload);
    return response.data;
  },

  remove: async (id: string) => {
    await api.delete(`/news/${id}`);
  },
};
