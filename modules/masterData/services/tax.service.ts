import { ApiResponse } from "@/common/types/api";
import { Taxes } from "@/common/types/taxes";
import api from "@/lib/api";
import { taxFormValue } from "../schemas/taxes.schema";

export const getTaxesApi = (): Promise<ApiResponse<Taxes[]>> =>
  api.get("/taxes").then((r) => r.data);

export const createTaxApi = (data: taxFormValue): Promise<ApiResponse<Taxes>> =>
  api.post("/taxes", data).then((r) => r.data);

export const updateTaxApi = (id: number, data: taxFormValue): Promise<ApiResponse<Taxes>> =>
  api.patch(`/taxes/${id}`, data).then((r) => r.data);

export const deleteTaxApi = (id: number): Promise<ApiResponse<void>> =>
  api.delete(`/taxes/${id}`).then((r) => r.data);
