import api from "@/lib/api";
interface RolesApiResponse {
  data: Role[];
}

export interface Role {
  role_id: number;
  role_name: string;
}

export const getRolesApi = async (): Promise<RolesApiResponse> => {
  const response = await api.get("/roles");
  return response.data;
};
