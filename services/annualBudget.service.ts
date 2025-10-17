import api from "@/lib/api";
import { AnnualBudget, AnnualBudgetFormValues } from "@/modules/budget/types"; // Path sudah benar
import { promises } from "dns";

// Tipe respons umum dari API Anda
interface ApiResponse<T> {
  data: T;
  // Anda bisa menambahkan properti lain jika ada, seperti 'meta' untuk paginasi
}

export const annualBudgetApi = {
  getAll: async (): Promise<ApiResponse<AnnualBudget[]>> => {
    const response = await api.get("/annual-budgets");
    return response.data;
  },

  create: async (
    data: AnnualBudgetFormValues
  ): Promise<ApiResponse<AnnualBudget>> => {
    const response = await api.post("/annual-budgets", data);
    return response.data;
  },

  update: async (
    id: string,
    data: AnnualBudgetFormValues
  ): Promise<ApiResponse<AnnualBudget>> => {
    const response = await api.put(`/annual-budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/annual-budgets/${id}`);
  },

  getParents: async (): Promise<void> => {
    const response = await api.get("/annual-budgets/parents");
    return response.data;
  },
};
