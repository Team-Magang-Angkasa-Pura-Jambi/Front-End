import { ApiResponse } from "@/common/types/api";
import { Location } from "@/common/types/location"; // Pastikan path benar
import { useQuery } from "@tanstack/react-query";
import { getLocationsApi } from "../services/location.service";

export const useLocations = () => {
  return useQuery<ApiResponse<Location[]>, Error, Location[]>({
    queryKey: ["locations"],
    queryFn: getLocationsApi,
    // Mengambil array dari properti .data di response API
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
};
