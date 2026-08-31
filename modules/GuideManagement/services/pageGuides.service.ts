import api from "@/lib/api";
import { PageGuideConfig } from "@/common/constants/pageGuides"; // we will use this interface as base, though we'll adapt it

export interface PageGuideModel extends PageGuideConfig {
  guide_id: number;
  icon_name: string;
  is_active: boolean;
}

export const PageGuidesService = {
  getAll: async (): Promise<PageGuideModel[]> => {
    const response = await api.get("/page-guides");
    return response.data.data;
  },

  getByRoute: async (route: string): Promise<PageGuideModel> => {
    const response = await api.get(`/page-guides/by-route?route=${encodeURIComponent(route)}`);
    return response.data.data;
  },

  update: async (guide_id: number, data: Partial<PageGuideModel>): Promise<PageGuideModel> => {
    const response = await api.put(`/page-guides/${guide_id}`, data);
    return response.data.data;
  },

  create: async (data: Partial<PageGuideModel>): Promise<PageGuideModel> => {
    const response = await api.post(`/page-guides`, data);
    return response.data.data;
  },

  delete: async (guide_id: number): Promise<void> => {
    await api.delete(`/page-guides/${guide_id}`);
  },
};
