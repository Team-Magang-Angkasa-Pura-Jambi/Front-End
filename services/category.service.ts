import api from "@/lib/api";

export interface CategoryType {
  category_id: number; // Tambahkan ID untuk identifikasi
  name: string;
}
interface CategoryApiResponse {
  data: CategoryType[];
}

export const getCategoryApi = async (): Promise<CategoryApiResponse> => {
  const url = "/meters-category";

  // Jika energy_type_id diberikan, tambahkan sebagai query parameter

  const response = await api.get(url);
  return response.data;
};
