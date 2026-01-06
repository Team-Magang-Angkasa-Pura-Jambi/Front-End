import api from "@/lib/api";
import { LoginCredentials, LoginResponseDTO } from "../types/auth.dto";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponseDTO> => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },
};
