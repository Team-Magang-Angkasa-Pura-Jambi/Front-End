import { ApiResponse } from "@/common/types/api";

export interface UserDTO {
  id: number;
  username: string;
  role: string;
}

export interface LoginPayload {
  token: string;
  user: UserDTO;
}
export interface LoginCredentials {
  username: string;
  password: string;
}

export type LoginResponseDTO = ApiResponse<LoginPayload>;
