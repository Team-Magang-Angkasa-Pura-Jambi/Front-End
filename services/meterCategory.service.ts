import api from "@/lib/api";

export interface MeterCategoryType {
  category_id: number; // Tambahkan ID untuk identifikasi
  name: string;
}
interface MeterCategoryApiResponse {
  data: MeterCategoryType[];
}

export const getMeterCategoriesApi =
  async (): Promise<MeterCategoryApiResponse> => {
    const url = "/meters-category";

    const response = await api.get<MeterCategoryApiResponse>(url);
    return response.data;
  };
