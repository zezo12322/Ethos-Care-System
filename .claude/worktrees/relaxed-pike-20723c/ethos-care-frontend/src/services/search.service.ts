import api from "@/lib/api";
import { SearchResults } from "@/types/api";

export const searchService = {
  search: async (query: string) => {
    const response = await api.get<SearchResults>("/search", {
      params: { q: query },
    });
    return response.data;
  },
};
