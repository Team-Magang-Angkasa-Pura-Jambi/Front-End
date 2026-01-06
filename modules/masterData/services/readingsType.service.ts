import api from "@/lib/api";
import { readingTypeFormValues } from "../schemas/readingType.schema";
import { ReadingType } from "@/common/types/readingTypes";

export interface ReadingTypesApiResponse {
  data: ReadingType[];
}

export const getReadingTypesApi = async (
  energyTypeId?: number
): Promise<ReadingTypesApiResponse> => {
  const response = await api.get<ReadingTypesApiResponse>("/reading-types", {
    params: {
      energy_type_id: energyTypeId,
    },
  });
  return response.data;
};

export const getReadingTypesApibyMeterId = async (
  meterId: number
): Promise<ReadingTypesApiResponse> => {
  const response = await api.get<ReadingTypesApiResponse>(
    "/reading-types/meter",
    {
      params: {
        meterId: meterId,
      },
    }
  );
  return response.data;
};

export const updateReadingTypeApi = async (
  id: number,
  data: readingTypeFormValues
): Promise<ReadingType> => {
  const response = await api.patch<ReadingType>(`/reading-types/${id}`, data);

  return response.data;
};
export const createReadingTypeApi = async (
  data: readingTypeFormValues
): Promise<ReadingType> => {
  const response = await api.post<ReadingType>("/reading-types", data);

  return response.data;
};
export const deleteReadingTypeApi = async (
  id: number
): Promise<ReadingType> => {
  const response = await api.delete<ReadingType>(`/reading-types/${id}`);

  return response.data;
};
