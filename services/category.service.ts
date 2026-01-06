import api from "@/lib/api";

// Interface untuk satu kategori
export interface CategoryType {
  category_id: number;
  name: string;
}

// Interface untuk payload saat membuat kategori baru (tanpa ID)
export type CreateCategoryPayload = Omit<CategoryType, "category_id">;

// Interface untuk payload saat memperbarui kategori (semua field opsional)
export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// Interface untuk response API yang mengembalikan satu kategori
interface CategoryDetailApiResponse {
  data: CategoryType;
}

// Interface untuk response API yang mengembalikan daftar kategori
interface CategoryListApiResponse {
  data: CategoryType[];
}

// Kumpulan fungsi CRUD untuk manajemen kategori
export const categoryApi = {
  getAll: async (): Promise<CategoryListApiResponse> => {
    const response = await api.get("/meters-category");
    return response.data;
  },

  getById: async (id: number): Promise<CategoryDetailApiResponse> => {
    const response = await api.get(`/meters-category/${id}`);
    return response.data;
  },

  create: async (
    payload: CreateCategoryPayload
  ): Promise<CategoryDetailApiResponse> => {
    const response = await api.post("/meters-category", payload);
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateCategoryPayload
  ): Promise<CategoryDetailApiResponse> => {
    const response = await api.put(`/meters-category/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/meters-category/${id}`);
  },
};
