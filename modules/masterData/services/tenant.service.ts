import { ApiResponse } from "@/common/types/api";
import { Tenant } from "@/common/types/tenant";
import api from "@/lib/api";
import { TenantFormValues } from "../schemas/tenant.schema";

export const getTenantsApi = async (): Promise<ApiResponse<Tenant[]>> => {
  return (await api.get("/tenants")).data;
};

export const getTenantCategoryApi = async (): Promise<ApiResponse<Tenant[]>> => {
  const response = await api.get("/tenants/categories");
  return response.data;
};

export const createTenantApi = async (data?: TenantFormValues) => {
  const response = await api.post(`/tenants`, data);

  return response.data;
};

export const updateTenantApi = async (id?: number, data?: Partial<TenantFormValues>) => {
  const response = await api.patch(`/tenants/${id}`, data);

  return response.data;
};

export const deleteTenantApi = async (id: number) => {
  const response = await api.delete(`/tenants/${id}`);

  return response.data;
};
