import { useMutation, UseMutationResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";

export interface ApiErrorResponse {
  status?: {
    code?: number;
    message?: string;
  };
  message?: string;
}

export interface ApiCommonResponse<T> {
  data: T;
  status?: {
    code: number;
    message: string;
  };
}

interface UseResourceOptions<
  TData,
  TPayload,
  TIdKey extends keyof TData,
  TParams = Record<string, unknown>,
> {
  key: string[];
  idField: TIdKey;
  api: {
    getAll: (params?: TParams) => Promise<ApiCommonResponse<TData[]>>;
    create: (data: TPayload) => Promise<ApiCommonResponse<TData>>;
    update: (id: TData[TIdKey], data: Partial<TPayload>) => Promise<ApiCommonResponse<TData>>;
    delete: (id: TData[TIdKey]) => Promise<unknown>;
  };
}

export function useResource<
  TData,
  TPayload,
  TIdKey extends keyof TData,
  TParams = Record<string, unknown>,
>({ key, api, idField }: UseResourceOptions<TData, TPayload, TIdKey, TParams>) {
  const queryClient = useQueryClient();

  // --- UI States ---
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<TData | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TData | null>(null);

  // --- Read (Query) ---
  const {
    data: response,
    isLoading,
    isError, // State error saat fetch
    error, // Object error detail saat fetch
    refetch, // Fungsi untuk mencoba fetch ulang
    isRefetching,
  } = useQuery({
    queryKey: key,
    queryFn: () => api.getAll(),
  });

  const data: TData[] = response?.data || [];

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // --- Write (Upsert Mutation) ---
  const upsertMutation: UseMutationResult<
    ApiCommonResponse<TData>,
    AxiosError<ApiErrorResponse>,
    TPayload
  > = useMutation({
    mutationFn: (payload: TPayload) => {
      if (editingItem) {
        const id = editingItem[idField];
        return api.update(id, payload);
      }
      return api.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(editingItem ? "Data diperbarui" : "Data baru ditambahkan");
      closeForm();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message = error.response?.data?.status?.message || "Gagal menyimpan data.";
      toast.error(message);
    },
  });

  // --- Delete Mutation ---
  const deleteMutation: UseMutationResult<
    unknown,
    AxiosError<ApiErrorResponse>,
    TData[TIdKey]
  > = useMutation({
    mutationFn: (id: TData[TIdKey]) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success("Data berhasil dihapus");
      setItemToDelete(null);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message = error.response?.data?.status?.message || "Gagal menghapus data.";
      toast.error(message);
    },
  });

  // --- Helper Functions ---
  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: TData) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: TData) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const id = itemToDelete[idField];
      deleteMutation.mutate(id);
    }
  };

  return {
    // Data & UI State
    data,
    viewMode,
    setViewMode,
    isFormOpen,
    setIsFormOpen,
    editingItem,
    itemToDelete,
    setItemToDelete,

    // --- State: READ (Fetch) ---
    isLoading, // Loading awal
    isRefetching, // Loading saat refresh manual
    isError, // Boolean: apakah fetch gagal?
    error, // Object error dari axios
    refetch, // Fungsi: refresh data manual

    // --- State: SAVE (Create/Update) ---
    isSaving: upsertMutation.isPending,
    isErrorSaving: upsertMutation.isError,
    errorSaving: upsertMutation.error,

    // --- State: DELETE ---
    isDeleting: deleteMutation.isPending,
    isErrorDeleting: deleteMutation.isError,
    errorDeleting: deleteMutation.error,

    // Actions
    handleCreate,
    handleEdit,
    handleDelete,
    confirmDelete,
    save: upsertMutation.mutate,
    closeForm,

    // Pass setter editingItem agar bisa diset manual dari luar (misal saat prefill form dari URL)
    setEditingItem,
  };
}
