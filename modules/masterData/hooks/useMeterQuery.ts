import { ApiErrorResponse } from "@/common/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MeterFormValues } from "../schemas/meter.schema";
import {
  createMeterApi,
  deleteMeterApi,
  getMeterByIdApi,
  getMetersApi,
  updateMeterApi,
} from "../services/meter.service";

export const useMeterQuery = () => {
  const queryClient = useQueryClient();

  const useGetMeters = (typeName?: string) =>
    useQuery({
      queryKey: ["meters", typeName],
      queryFn: () => getMetersApi(typeName),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  const useGetMeterDetail = (id: number | null) =>
    useQuery({
      queryKey: ["meter-detail", id],
      queryFn: () => getMeterByIdApi(id!),
      enabled: !!id,
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    });

  const useDeleteMeter = () =>
    useMutation<unknown, AxiosError<ApiErrorResponse>, number>({
      mutationFn: (id: number) => deleteMeterApi(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["meters"], exact: false });
      },
    });

  const useUpsertMeter = (id: number | null) =>
    useMutation<unknown, AxiosError<ApiErrorResponse>, MeterFormValues>({
      mutationFn: (data: MeterFormValues) => (id ? updateMeterApi(id, data) : createMeterApi(data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["meters"], exact: false });
        if (id) queryClient.invalidateQueries({ queryKey: ["meter-detail", id], exact: false });
      },
    });

  return {
    useGetMeters,
    useGetMeterDetail,
    useDeleteMeter,
    useUpsertMeter,
  };
};
