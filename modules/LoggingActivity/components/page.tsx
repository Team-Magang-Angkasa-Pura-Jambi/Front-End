"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AlertTriangle, BookLock, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

import { ApiErrorResponse } from "@/common/types/api";
import {
  deleteReadingSessionApi,
  getReadingSessionsApi,
  ReadingHistory,
} from "@/modules/EnterData/services";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";

import { deletePaxApi, getPaxApi } from "../services/pax.service";
import { HistoryFilters } from "../types";

import { createColumns } from "./ColumnTable";
import { RecapHeader } from "./Header";
import { ManagementDialog } from "./ManagementDialog";
import { DailyPaxData, PaxDailyTable } from "./PaxDailyTable";
import { PaxEditForm } from "./PaxEditForm";
import { ReadingForm } from "./readingForm";
import { DataTable } from "./Table";
import { FileSpreadsheet } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ImportMeterModal } from "./ImportMeterModal";


export const Page = () => {
  const queryClient = useQueryClient();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const STORAGE_KEY = "history_filters_state";

  const [filters, setFilters] = useState<
    Omit<HistoryFilters, "meter_id"> & {
      meter_id?: number;
      type?: string;
      energy_type_id?: number;
    }
  >(() => {
    if (typeof window === "undefined") {
      return {
        date: { from: firstDayOfMonth, to: firstDayOfNextMonth },
        meter_id: undefined,
        type: "Energy",
      };
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          meter_id: parsed.meter_id ? Number(parsed.meter_id) : undefined,
          type: parsed.type || "Energy",
          energy_type_id: parsed.energy_type_id ? Number(parsed.energy_type_id) : undefined,
          date: {
            from: parsed.date?.from ? new Date(parsed.date.from) : firstDayOfMonth,
            to: parsed.date?.to ? new Date(parsed.date.to) : firstDayOfNextMonth,
          },
        };
      } catch (e) {
        console.error("Gagal membaca filter dari storage", e);
      }
    }

    return {
      date: { from: firstDayOfMonth, to: firstDayOfNextMonth },
      meter_id: undefined,
      type: "Energy",
    };
  });

  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReadingHistory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ReadingHistory | null>(null);


  const [isPaxModalOpen, setIsPaxModalOpen] = useState(false);
  const [editingPaxData, setEditingPaxData] = useState<DailyPaxData | null>(null);
  const [paxToDelete, setPaxToDelete] = useState<DailyPaxData | null>(null);

  const { date, meter_id, type: activeType } = filters;
  const isPaxTab = activeType === "Pax";

  const { data: typesEnergies } = useQuery({
    queryKey: ["typesEnergies"],
    queryFn: () => getEnergyTypesApi(),
  });

  useEffect(() => {
    if (typesEnergies?.data && typesEnergies.data.length > 0 && !filters.meter_id && !isPaxTab) {
      const firstEnergy = typesEnergies.data[0];
      setFilters((prev) => ({
        ...prev,
        energy_type_id: prev.energy_type_id || firstEnergy.energy_type_id,
      }));
    }
  }, [typesEnergies, filters.meter_id, isPaxTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  // QUERY READING HISTORY (Aktif saat Tab Energy)
  const {
    data: readingQueryData,
    isLoading: isLoadingReading,
    isFetching: isFetchingReading,
    isError: isErrorReading,
  } = useQuery({
    queryKey: ["readingHistory", date?.from?.toISOString(), date?.to?.toISOString(), meter_id],
    queryFn: () =>
      getReadingSessionsApi({
        from_date: date?.from ? format(date?.from, "yyyy-MM-dd") : "",
        to_date: date?.to ? format(date?.to, "yyyy-MM-dd") : "",
        meter_id: meter_id as number,
      }),
    enabled: !isPaxTab && !!date?.from && !!date?.to && !!meter_id,
    refetchOnWindowFocus: false,
  });

  // QUERY PAX (Aktif saat Tab Pax)
  const {
    data: paxQueryData,
    isLoading: isLoadingPax,
    isError: isErrorPax,
  } = useQuery({
    queryKey: ["paxHistory", date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: () =>
      getPaxApi({
        start_date: date?.from ? format(date?.from, "yyyy-MM-dd") : "",
        end_date: date?.to ? format(date?.to, "yyyy-MM-dd") : "",
      }),
    enabled: isPaxTab && !!date?.from && !!date?.to,
    refetchOnWindowFocus: false,
  });

  const historyData = useMemo(() => {
    const data = readingQueryData?.data;
    return Array.isArray(data) ? data : [];
  }, [readingQueryData?.data]);

  // PERBAIKAN: Penanganan ekstraksi response data Pax yang fleksibel & aman
  const paxData = useMemo(() => {
    if (!paxQueryData) return [];

    // Kasus 1: paxQueryData.data.pax_data (Standar response API wrapper)
    const nestedPaxData = (paxQueryData as { data?: { pax_data?: DailyPaxData[] } })?.data
      ?.pax_data;
    if (Array.isArray(nestedPaxData)) return nestedPaxData;

    // Kasus 2: paxQueryData.pax_data
    const directPaxData = (paxQueryData as { pax_data?: DailyPaxData[] })?.pax_data;
    if (Array.isArray(directPaxData)) return directPaxData;

    // Kasus 3: paxQueryData.data
    const rawData = (paxQueryData as { data?: DailyPaxData[] })?.data;
    if (Array.isArray(rawData)) return rawData;

    return [];
  }, [paxQueryData]);

  const columns = useMemo(() => {
    const handleOpenEdit = (item: ReadingHistory) => {
      setEditingItem(item);
      setIsModalOpen(true);
    };

    const handleDelete = (item: ReadingHistory) => {
      setItemToDelete(item);
    };

    return createColumns(handleOpenEdit, handleDelete);
  }, []);

  const { mutate: deleteSession, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => deleteReadingSessionApi(id),
    onSuccess: () => {
      toast.success("Data pencatatan berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.status?.message || "Gagal menghapus data.");
    },
  });

  // PERBAIKAN: Memasang pemicu hapus Pax dengan pax_id
  const { mutate: deletePax, isPending: isDeletingPax } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    DailyPaxData
  >({
    mutationFn: (item) => deletePaxApi(item.pax_id),
    onSuccess: () => {
      toast.success("Data Pax berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["paxHistory"] });
      setPaxToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.status?.message || "Gagal menghapus data Pax.");
    },
  });

  const handleOpenPaxEdit = useCallback((paxData: DailyPaxData) => {
    setEditingPaxData(paxData);
    setIsPaxModalOpen(true);
  }, []);

  const handleDeletePax = useCallback((paxData: DailyPaxData) => {
    setPaxToDelete(paxData);
  }, []);

  const renderContent = () => {
    const activeIsLoading = isPaxTab ? isLoadingPax : isLoadingReading;
    const activeIsError = isPaxTab ? isErrorPax : isErrorReading;
    const activeDataLength = isPaxTab ? paxData.length : historyData.length;

    if (activeIsLoading) {
      return (
        <Card className="flex h-96 flex-col items-center justify-center border-dashed text-center">
          <CardContent className="p-6">
            <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
            <h3 className="mt-4 text-lg font-semibold">Memuat Data...</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Mengambil riwayat {isPaxTab ? "penumpang" : "pencatatan"} terbaru.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (activeIsError) {
      return (
        <Card className="bg-destructive/5 border-destructive/20 flex h-96 flex-col items-center justify-center text-center">
          <CardContent className="p-6">
            <AlertTriangle className="text-destructive mx-auto h-12 w-12" />
            <h3 className="text-destructive mt-4 text-lg font-bold">Gagal Mengambil Data</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Terjadi kesalahan koneksi. Silakan coba lagi.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: [isPaxTab ? "paxHistory" : "readingHistory"],
                })
              }
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (activeDataLength === 0) {
      return (
        <Card className="bg-muted/20 flex h-96 flex-col items-center justify-center border-dashed text-center">
          <CardContent className="p-6">
            <BookLock className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Data Tidak Ditemukan</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm">
              Tidak ada riwayat {isPaxTab ? "penumpang" : "pencatatan"} untuk periode yang Anda
              pilih.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (isPaxTab) {
      return <PaxDailyTable data={paxData} onEdit={handleOpenPaxEdit} onDelete={handleDeletePax} />;
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tabel Riwayat Pencatatan</CardTitle>
              <CardDescription>Menampilkan detail angka stand meteran.</CardDescription>
            </div>
            {user?.role === "SUPER_ADMIN" && (
              <Button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-slate-800 hover:from-indigo-700 hover:to-slate-900 text-white font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Import Data Meteran
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={historyData} isLoading={isFetchingReading} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <RecapHeader
        filters={filters}
        setFilters={setFilters}
        typesEnergies={typesEnergies?.data || []}
      />

      {renderContent()}

      <ManagementDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title="Edit Data Meteran"
      >
        <ReadingForm initialData={editingItem} onSuccess={() => setIsModalOpen(false)} />
      </ManagementDialog>

      {editingPaxData && (
        <ManagementDialog
          isOpen={isPaxModalOpen}
          onClose={() => {
            setIsPaxModalOpen(false);
            setEditingPaxData(null);
          }}
          title="Update Jumlah Pax Harian"
        >
          <PaxEditForm initialData={editingPaxData} onSuccess={() => setIsPaxModalOpen(false)} />
        </ManagementDialog>
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pencatatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus data meteran{" "}
              <span className="text-foreground font-bold">
                {itemToDelete?.meter?.meter_code || `ID ${itemToDelete?.meter_id}`}
              </span>{" "}
              tanggal{" "}
              <span className="text-foreground font-bold">
                {itemToDelete
                  ? format(new Date(itemToDelete.reading_date), "dd MMM yyyy", { locale: id })
                  : "-"}
              </span>
              .
              <br />
              Data yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => itemToDelete && deleteSession(itemToDelete.session_id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!paxToDelete} onOpenChange={(open) => !open && setPaxToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pax?</AlertDialogTitle>
            <AlertDialogDescription>
              Menghapus data jumlah penumpang tanggal{" "}
              <span className="text-foreground font-bold">
                {paxToDelete
                  ? format(new Date(paxToDelete.date), "dd MMM yyyy", { locale: id })
                  : "-"}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => paxToDelete && deletePax(paxToDelete)}
              disabled={isDeletingPax}
            >
              {isDeletingPax ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportMeterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
        }}
        typesEnergies={typesEnergies?.data || []}
      />
    </div>
  );
};

