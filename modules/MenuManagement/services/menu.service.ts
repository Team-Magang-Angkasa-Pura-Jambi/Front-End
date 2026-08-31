import api from "@/lib/api";

export interface MenuModel {
  menu_id: number;
  name: string;
  route: string | null;
  icon_name: string | null;
  allowed_roles: string[] | null;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  parent_id: number | null;
  sort_order: number;
  children?: MenuModel[];
  created_at?: string;
  updated_at?: string;
}

export const MenuService = {
  getAll: async (): Promise<MenuModel[]> => {
    const response = await api.get("/menus");
    return response.data.data;
  },

  create: async (data: Partial<MenuModel>): Promise<MenuModel> => {
    const response = await api.post(`/menus`, data);
    return response.data.data;
  },

  update: async (menu_id: number, data: Partial<MenuModel>): Promise<MenuModel> => {
    const response = await api.put(`/menus/${menu_id}`, data);
    return response.data.data;
  },

  delete: async (menu_id: number): Promise<void> => {
    await api.delete(`/menus/${menu_id}`);
  },
};
