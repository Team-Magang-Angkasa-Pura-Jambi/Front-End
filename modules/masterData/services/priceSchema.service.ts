import { PriceSchemeType } from "@/common/types/schemaPrice";
import api from "@/lib/api";
import { SchemaFormValues } from "../schemas/schemaPrice.schema";

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
  const response = await api.get("/price-schemes", {
    params: params,
  });
  return response.data;
};

export const getPriceSchemeByIdApi = async (id: number): Promise<PriceSchemeDetailApiResponse> => {
  const response = await api.get(`/price-schemes/${id}`);
  return response.data;
};

export const createPriceSchemeApi = async (
  data: SchemaFormValues
): Promise<PriceSchemeDetailApiResponse> => {
  const response = await api.post("/price-schemes", data);
  return response.data;
};

export const updatePriceSchemeApi = async (
  id: number,
  data: Partial<SchemaFormValues>
): Promise<PriceSchemeDetailApiResponse> => {
  const response = await api.patch(`/price-schemes/${id}`, data);
  return response.data;
};

export const deletePriceSchemeApi = async (id: number): Promise<void> => {
  await api.delete(`/price-schemes/${id}`);
};
