import api from "../lib/api";

export interface LoginDto {
  nationalId: string;
  password?: string;
}

export const authService = {
  login: async (data: LoginDto) => {
    // Expected to return { access_token: string, user: { id, name, role } }
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: () => {
    import("js-cookie").then((Cookies) => {
      Cookies.default.remove("access_token");
      window.location.href = "/login";
    });
  }
};