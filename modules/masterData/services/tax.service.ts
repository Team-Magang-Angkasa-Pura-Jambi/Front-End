import api from "@/lib/api";
import { Taxes } from "@/common/types/taxes";
import { taxFormValue } from "../schemas/taxes.schema";

interface TaxesApiResponse {
  data: Taxes[];
  status?: { code: number; message: string };
}

interface TaxDetailApiResponse {
  data: Taxes;
  status?: { code: number; message: string };
}

const BASE_URL = "/tax";

export const getTaxesApi = async (): Promise<TaxesApiResponse> => {
  const response = await api.get<TaxesApiResponse>(BASE_URL);
  return response.data;
};

export const getTaxByIdApi = async (
  id: number
): Promise<TaxDetailApiResponse> => {
  const response = await api.get<TaxDetailApiResponse>(`${BASE_URL}/${id}`);
  return response.data;
};

export const createTaxApi = async (
  data: taxFormValue
): Promise<TaxDetailApiResponse> => {
  const response = await api.post<TaxDetailApiResponse>(BASE_URL, data);
  return response.data;
};

export const updateTaxApi = async (
  id: number,
  data: taxFormValue
): Promise<TaxDetailApiResponse> => {
  const response = await api.patch<TaxDetailApiResponse>(
    `${BASE_URL}/${id}`,
    data
  );
  return response.data;
};

export const deleteTaxApi = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
