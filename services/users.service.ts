import api from "@/lib/api";
import {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/types/users.types";

// Tipe untuk respons API generik yang berisi data pengguna
interface UserApiResponse {
  data: User[];
}
interface SingleUserApiResponse {
  data: User;
}

/**
 * Mengambil semua pengguna dari API.
 */
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

/**
 * Membuat pengguna baru.
 * @param userData - Data pengguna baru.
 */
export const createUserApi = async (
  userData: CreateUserPayload
): Promise<SingleUserApiResponse> => {
  const response = await api.post("/users", userData);
  return response.data;
};

/**
 * Memperbarui data pengguna yang ada.
 * @param userId - ID pengguna yang akan diperbarui.
 * @param userData - Data pengguna yang diperbarui.
 */
export const updateUserApi = async (
  userId: number,
  userData: UpdateUserPayload
): Promise<SingleUserApiResponse> => {
  const response = await api.patch(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Menghapus seorang pengguna.
 * @param userId - ID pengguna yang akan dihapus.
 */
export const deleteUserApi = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}`);
};
