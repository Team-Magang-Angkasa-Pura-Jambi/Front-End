import api from "@/lib/api";

export interface ReadingTypesApiResponse {
  data: readingTypes[];
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
