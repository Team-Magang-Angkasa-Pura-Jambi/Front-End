// src/types/roles.types.ts

import api from "@/lib/api";

export interface Role {
  role_id: number;
  role_name: string;
  created_at: string;
  updated_at: string; // Sebaiknya ditambahkan
}

// Tipe untuk membuat role baru, tidak perlu id dan timestamps
export type CreateRolePayload = Omit<
  Role,
  "role_id" | "created_at" | "updated_at"
>;

// Tipe untuk update, semua field bersifat opsional
export type UpdateRolePayload = Partial<CreateRolePayload>;
// Ganti tipe 'any' dengan tipe respons API Anda yang sebenarnya jika ada
// contoh: { data: Role[], message: string, ... }

export const getRolesApi = async () => {
  const response = await api.get<{ data: Role[] }>("/roles");
  return response.data;
};

export const createRoleApi = async (payload: CreateRolePayload) => {
  const response = await api.post("/roles", payload);
  return response.data;
};

export const updateRoleApi = async (
  roleId: number,
  payload: UpdateRolePayload
) => {
  const response = await api.put(`/roles/${roleId}`, payload);
  return response.data;
};

export const deleteRoleApi = async (roleId: number) => {
  const response = await api.delete(`/roles/${roleId}`);
  return response.data;
};
