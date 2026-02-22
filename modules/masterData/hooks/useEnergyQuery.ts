"use client";

import { ApiErrorResponse } from "@/common/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { EnergyTypeFormValues } from "../schemas/energyType.schema";
import {
  createEnergyTypeApi,
  deleteEnergyTypeApi,
  getEnergyWithReadingTypeTypesApi,
  updateEnergyTypeApi,
} from "../services/energyType.service";

export const useEnergyQuery = () => {
  const queryClient = useQueryClient();

  const useGetEnergiesWithReadings = () => {
    return useQuery({
      queryKey: ["energyTypes"],
      queryFn: getEnergyWithReadingTypeTypesApi,
      staleTime: 1000 * 60 * 5,
    });
  };

  const useUpsertEnergy = (id?: number) => {
    return useMutation<unknown, AxiosError<ApiErrorResponse>, EnergyTypeFormValues>({
      mutationFn: (data: EnergyTypeFormValues) =>
        id ? updateEnergyTypeApi(id, data) : createEnergyTypeApi(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
      },
    });
  };

  const useDeleteEnergy = () => {
    return useMutation<unknown, AxiosError<ApiErrorResponse>, number>({
      mutationFn: (id: number) => deleteEnergyTypeApi(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
      },
    });
  };

  return { useGetEnergiesWithReadings, useUpsertEnergy, useDeleteEnergy };
};
