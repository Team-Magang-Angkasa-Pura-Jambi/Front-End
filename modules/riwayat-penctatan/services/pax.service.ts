import api from "@/lib/api";

export const updatePaxApi = async (
  paxId: number,
  payload: {
    total_pax: number;
  }
): Promise<{ message: string }> => {
  const response = await api.patch(`/pax/${paxId}`, payload);
  return response.data;
};

export const deletePaxApi = async (
  paxId: number
): Promise<{ message: string }> => {
  const response = await api.delete(`/pax/${paxId}`);
  return response.data;
};
