import { ApiResponse } from "@/common/types/api";
import { ReadingType } from "@/common/types/readingTypes";
import api from "@/lib/api";

export const getReadingTypesApi = async (): Promise<ApiResponse<ReadingType[]>> => {
  const response = await api.get("/reading-types");
  return response.data;
};

export const getReadingTypesDetailApi = async (
  energyTypeId?: number
): Promise<ApiResponse<ReadingType>> => {
  const response = await api.get(`/reading-types/${energyTypeId}`);
  return response.data;
};

// export const getReadingTypesApibyMeterId = async (
//   meterId: number
// ): Promise<ReadingTypesApiResponse> => {
//   const response = await api.get<ReadingTypesApiResponse>("/reading-types/meter", {
//     params: {
//       meterId: meterId,
//     },
//   });
//   return response.data;
// };

export const updateReadingTypeApi = async (
  id: number,
  data: { type_name: string; unit: string; energyId: number }
): Promise<ReadingType> => {
  const response = await api.patch<ReadingType>(`/reading-types/${id}`, data);

  return response.data;
};
export const createReadingTypeApi = async (data: {
  type_name: string;
  unit: string;
  energyId: number;
}): Promise<ReadingType> => {
  const response = await api.post<ReadingType>("/reading-types", data);

  return response.data;
};
export const deleteReadingTypeApi = async (id: number): Promise<ReadingType> => {
  const response = await api.delete<ReadingType>(`/reading-types/${id}`);

  return response.data;
};
