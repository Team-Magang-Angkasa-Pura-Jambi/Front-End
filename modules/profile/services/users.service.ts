import { User } from "@/common/types/user";
import api from "@/lib/api";
import { CreateUserPayload, UpdateUserPayload } from "@/types/users.types";

interface UserApiResponse {
  data: User[];
}
interface SingleUserApiResponse {
  data: User;
}

export const getUsersApi = async (): Promise<UserApiResponse> => {
  const response = await api.get("/users");
  return response.data;
};
export const getUserApi = async (
  id: number
): Promise<SingleUserApiResponse> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserActivitiesApi = async (id: number) => {
  const response = await api.get(`/users/${id}/activities`);
  return response.data;
};

export const createUserApi = async (
  userData: CreateUserPayload
): Promise<SingleUserApiResponse> => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const updateUserApi = async (
  userId: number,
  userData: UpdateUserPayload
): Promise<SingleUserApiResponse> => {
  const response = await api.patch(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUserApi = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}`);
};
