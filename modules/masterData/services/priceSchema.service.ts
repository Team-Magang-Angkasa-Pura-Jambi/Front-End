import { PriceSchemeType } from "@/common/types/schemaPrice";
import api from "@/lib/api";

export interface PriceSchemePayload {
  scheme_name: string;
  effective_date: Date;
  tariff_group_id: number;
  description?: string | null; // Opsional sesuai schema
  is_active: boolean;

  rates: {
    reading_type_id: number;
    value: number;
  }[];

  tax_ids?: number[];
}

export interface PriceSchemeQueryParams {
  search?: string;
  is_active?: boolean;
}

interface PriceSchemesApiResponse {
  data: PriceSchemeType[];
}

interface PriceSchemeDetailApiResponse {
  data: PriceSchemeType;
}

export const getPriceSchemesApi = async (
  params?: PriceSchemeQueryParams
): Promise<PriceSchemesApiResponse> => {
  const response = await api.get<PriceSchemesApiResponse>("/price-schemes", {
    params: params,
  });
  return response.data;
};

export const getPriceSchemeByIdApi = async (
  id: number
): Promise<PriceSchemeDetailApiResponse> => {
  const response = await api.get<PriceSchemeDetailApiResponse>(
    `/price-schemes/${id}`
  );
  return response.data;
};

export const createPriceSchemeApi = async (
  data: PriceSchemePayload
): Promise<PriceSchemeDetailApiResponse> => {
  const response = await api.post<PriceSchemeDetailApiResponse>(
    "/price-schemes",
    data
  );
  return response.data;
};

export const updatePriceSchemeApi = async (
  id: number,
  data: PriceSchemePayload
): Promise<PriceSchemeDetailApiResponse> => {
  const response = await api.put<PriceSchemeDetailApiResponse>(
    `/price-schemes/${id}`,
    data
  );
  return response.data;
};

export const deletePriceSchemeApi = async (id: number): Promise<void> => {
  await api.delete(`/price-schemes/${id}`);
};

export const togglePriceSchemeStatusApi = async (
  id: number,
  isActive: boolean
): Promise<PriceSchemeDetailApiResponse> => {
  const response = await api.patch<PriceSchemeDetailApiResponse>(
    `/price-schemes/${id}/status`,
    { is_active: isActive }
  );
  return response.data;
};
