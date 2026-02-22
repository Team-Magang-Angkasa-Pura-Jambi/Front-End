"use client";

import { ApiErrorResponse } from "@/common/types/api";
import { AxiosError } from "axios";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { MeterFormValues } from "../schemas/meter.schema";
import { useMeterQuery } from "./useMeterQuery";

export const useMeterManagement = () => {
  const { useGetMeters, useDeleteMeter, useUpsertMeter } = useMeterQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);

  const { data: metersResponse, isLoading } = useGetMeters();

  const metersData = useMemo(() => metersResponse?.data?.meter || [], [metersResponse]);

  // --- TAMBAHKAN INI: Mencari data lengkap untuk di-edit ---
  const editingData = useMemo(() => {
    if (!selectedMeterId) return null;
    return metersData.find((m) => m.meter_id === selectedMeterId) || null;
  }, [metersData, selectedMeterId]);

  const filteredMeters = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return metersData;

    return metersData.filter(
      (meter) =>
        meter.name?.toLowerCase().includes(trimmedQuery) ||
        meter.meter_code.toLowerCase().includes(trimmedQuery)
    );
  }, [metersData, searchQuery]);

  const { mutate: upsertMutate, isPending: isMutating } = useUpsertMeter(selectedMeterId);
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteMeter();

  const handleOpenDetail = useCallback((id: number) => {
    setSelectedMeterId(id);
    setIsDetailOpen(true);
  }, []);

  const handleOpenEdit = useCallback((id: number) => {
    setSelectedMeterId(id);
    setIsFormOpen(true);
  }, []);

  const handleOpenDelete = useCallback((id: number) => {
    setSelectedMeterId(id);
    setIsDeleteOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    // Beri sedikit delay sebelum null-kan ID agar transisi modal mulus
    setTimeout(() => setSelectedMeterId(null), 200);
  }, []);

  const handleUpsert = useCallback(
    (data: MeterFormValues) => {
      upsertMutate(data, {
        onSuccess: () => {
          toast.success(selectedMeterId ? "Data meter diperbarui" : "Meter baru ditambahkan");
          handleCloseForm();
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
          toast.error(error.response?.data?.status?.message || "Gagal menyimpan data.");
        },
      });
    },
    [upsertMutate, selectedMeterId, handleCloseForm]
  );

  const handleConfirmDelete = useCallback(() => {
    if (selectedMeterId) {
      deleteMutate(selectedMeterId, {
        onSuccess: () => {
          toast.success("Meter berhasil dihapus");
          setIsDeleteOpen(false);
          setSelectedMeterId(null);
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
          toast.error(error.response?.data?.status?.message || "Gagal menghapus data.");
        },
      });
    }
  }, [deleteMutate, selectedMeterId]);

  return {
    searchQuery,
    setSearchQuery,
    isFormOpen,
    setIsFormOpen,
    isDetailOpen,
    setIsDetailOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    selectedMeterId,
    setSelectedMeterId,

    // --- EXPOSE INI ---
    editingData,

    isLoading,
    filteredMeters,
    isMutating,
    isDeleting,

    handleOpenDetail,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleUpsert,
    handleConfirmDelete,
  };
};
