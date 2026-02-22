import { ApiErrorResponse } from "@/common/types/api";
import { Location } from "@/common/types/location";
import { Tenant } from "@/common/types/tenant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { LocationFormValues } from "../schemas/location.schema";
import { TenantFormValues } from "../schemas/tenant.schema";

import {
  createLocationApi,
  deleteLocationApi,
  getLocationsApi,
  updatetLocationApi,
} from "../services/location.service";
import {
  createTenantApi,
  deleteTenantApi,
  getTenantsApi,
  updateTenantApi,
} from "../services/tenant.service";

type EntityType = "tenant" | "location";
type FormValues = TenantFormValues | LocationFormValues;

export const useEntityManager = <T extends Tenant | Location>(type: EntityType) => {
  const queryClient = useQueryClient();
  const queryKey = [type];

  const [isOpen, setIsOpen] = useState(false);
  const [editingData, setEditingData] = useState<T | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = type === "tenant" ? await getTenantsApi() : await getLocationsApi();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const upsertMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    { id?: number; data: FormValues }
  >({
    mutationFn: async ({ id, data }) => {
      if (type === "tenant") {
        const tenantData = data as TenantFormValues;
        return id ? updateTenantApi(id, tenantData) : createTenantApi(tenantData);
      }
      const locationData = data as LocationFormValues;
      return id ? updatetLocationApi(id, locationData) : createLocationApi(locationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`Data ${type === "tenant" ? "Mitra" : "Lokasi"} berhasil disimpan`);
      setIsOpen(false);
      setEditingData(null);
    },
    onError: (error) => {
      const msg = error.response?.data?.status?.message || "Gagal menyimpan data";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation<unknown, AxiosError<ApiErrorResponse>, number>({
    mutationFn: (id) => (type === "tenant" ? deleteTenantApi(id) : deleteLocationApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Data berhasil dihapus");
      setIsDeletingId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.status?.message || "Gagal menghapus data");
    },
  });

  const handleUpsert = (data: FormValues) => {
    let id: number | undefined;
    if (editingData) {
      if ("tenant_id" in editingData) id = editingData.tenant_id;
      else if ("location_id" in editingData) id = editingData.location_id;
    }
    upsertMutation.mutate({ id, data });
  };

  const handleSetEditingData = (data: T | null) => {
    setEditingData(data);
    if (data) setIsOpen(true);
  };

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isMutating: upsertMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isOpen,
    setIsOpen,
    editingData,
    setEditingData: handleSetEditingData,
    isDeletingId,
    setIsDeletingId,
    handleUpsert,
    executeDelete: () => isDeletingId && deleteMutation.mutate(isDeletingId),
  };
};
