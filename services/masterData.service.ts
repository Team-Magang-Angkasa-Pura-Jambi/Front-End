import { MeterType } from "@/common/types/meters";
import api from "@/lib/api";

const createApiMethods = <T>(endpoint: string) => {
  return {
    getAll: async (): Promise<T[]> => {
      const response = await api.get<T[]>(`/${endpoint}`);

      return response.data;
    },

    getByEnergyType: async (id: number): Promise<T[]> => {
      const response = await api.get<T[]>(`/${endpoint}?energyTypeId=${id}`);
      return response.data;
    },

    create: async (data: Partial<T>): Promise<T> => {
      const response = await api.post<T>(`/${endpoint}`, data);
      return response.data;
    },

    update: async (id: number, data: Partial<T>): Promise<T> => {
      const response = await api.patch<T>(`/${endpoint}/${id}`, data);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/${endpoint}/${id}`);
    },
  };
};

export const masterData = {
  category: createApiMethods("meters-category"),
  energyType: createApiMethods("energy-types"),
  tax: createApiMethods("tax"),
  meter: createApiMethods<MeterType>("meters"),
  readingType: createApiMethods("reading-types"),
  tariffGroup: createApiMethods("tariff-groups"),
  priceScheme: createApiMethods("price-schemes"),
  efficiencyTarget: createApiMethods("efficiency-targets"),
};
