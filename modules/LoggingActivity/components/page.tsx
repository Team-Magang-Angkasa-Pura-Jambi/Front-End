"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, AlertTriangle, BookLock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { createColumns } from "./ColumnTable";
import { RecapHeader } from "./Header";
import { HistoryFilters } from "../types";
import { ReadingForm } from "./readingForm";
import {
  deleteReadingSessionApi,
  getReadingSessionsApi,
  ReadingHistory,
} from "../services/reading.service";
import { deletePaxApi } from "../services/pax.service";

import { DataTable } from "./Table";
import { PaxDailyTable, DailyPaxData } from "./PaxDailyTable";
import { PaxEditForm } from "./PaxEditForm";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import { ManagementDialog } from "./ManagementDialog";
import { ENERGY_TYPES, EnergyTypeName } from "@/common/types/energy";

export const Page = () => {
  const queryClient = useQueryClient();
  const now = new Date();

  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const firstDayOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  const [filters, setFilters] = useState<HistoryFilters>({
    type: "Electricity" as unknown as EnergyTypeName,
    date: {
      from: firstDayOfMonth,
      to: firstDayOfNextMonth,
    },
    sortBy: "reading_date",
    sortOrder: "desc",
    meterId: undefined,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReadingHistory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ReadingHistory | null>(null);

  const [isPaxModalOpen, setIsPaxModalOpen] = useState(false);
  const [editingPaxData, setEditingPaxData] = useState<DailyPaxData | null>(
    null
  );

  const [paxToDelete, setPaxToDelete] = useState<DailyPaxData | null>(null);

  const { type, date, sortBy, sortOrder, meterId } = filters;
  console.log(date!.from!.toISOString());

  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["readingHistory", type, date, meterId, sortBy, sortOrder],
    queryFn: () =>
      getReadingSessionsApi({
        energyTypeName: type as unknown as EnergyTypeName,

        startDate: date?.from
          ? new Date(
              Date.UTC(
                date.from.getFullYear(),
                date.from.getMonth(),
                date.from.getDate()
              )
            ).toISOString()
          : new Date().toISOString(),
        endDate: date?.from
          ? new Date(
              Date.UTC(
                date.to.getFullYear(),
                date.to.getMonth(),
                date.to.getDate()
              )
            ).toISOString()
          : new Date().toISOString(),
        meterId,
        sortBy,
        sortOrder,
      }),
    enabled: !!date?.from && !!date?.to,
    refetchOnWindowFocus: false,
  });

  const historyData = useMemo<ReadingHistory[]>(() => {
    const data = queryData?.data;
    return Array.isArray(data) ? data : [];
  }, [queryData?.data]);

  const { mutate: deleteSession, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (item) => deleteReadingSessionApi(item),
    onSuccess: () => {
      toast.success("Data pencatatan berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error(
        `Gagal menghapus: ${
          error.response?.data?.status?.message || "Terjadi kesalahan"
        }`
      );
    },
  });

  const { mutate: deletePax, isPending: isDeletingPax } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    DailyPaxData
  >({
    mutationFn: (item: DailyPaxData) => deletePaxApi(item.paxId),
    onSuccess: () => {
      toast.success("Data Pax berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      setPaxToDelete(null);
    },
    onError: (error) => {
      toast.error(
        `Gagal menghapus Pax: ${
          error.response?.data?.status?.message || "Terjadi kesalahan"
        }`
      );
    },
  });

  const handleOpenEdit = useCallback((item: ReadingHistory) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: ReadingHistory) => {
    setItemToDelete(item);
  }, []);

  const handleOpenPaxEdit = useCallback((paxData: DailyPaxData) => {
    setEditingPaxData(paxData);
    setIsPaxModalOpen(true);
  }, []);

  const handleDeletePax = useCallback((paxData: DailyPaxData) => {
    setPaxToDelete(paxData);
  }, []);

  const columns = useMemo(
    () => createColumns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="flex flex-col items-center justify-center text-center h-96">
          <CardContent className="p-6">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Memuat Riwayat...</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Mohon tunggu sebentar.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (isError) {
      return (
        <Card className="flex flex-col items-center justify-center text-center h-96 bg-destructive/10 border-destructive">
          <CardContent className="p-6">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold text-destructive">
              Gagal Mengambil Data
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Terjadi kesalahan pada server. Coba muat ulang halaman.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (historyData?.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center text-center h-96">
          <CardContent className="p-6">
            <BookLock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              Riwayat Tidak Ditemukan
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tidak ada data pencatatan yang cocok dengan filter yang Anda
              pilih.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filters.type === ENERGY_TYPES.ELECTRICITY && (
          <PaxDailyTable
            data={historyData}
            onEdit={handleOpenPaxEdit}
            onDelete={handleDeletePax}
          />
        )}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tabel Riwayat Pencatatan</CardTitle>
                <CardDescription>
                  Menampilkan detail data pencatatan meteran sesuai filter.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={historyData}
              isLoading={isFetching}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <RecapHeader filters={filters} setFilters={setFilters} />
      {renderContent()}

      <ManagementDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem ? "Edit Input Data" : `Tambah Catatan ${filters.type}`
        }
      >
        <ReadingForm
          initialData={editingItem}
          onSuccess={() => setIsModalOpen(false)}
        />
      </ManagementDialog>

      {editingPaxData && (
        <ManagementDialog
          isOpen={isPaxModalOpen}
          onClose={() => setIsPaxModalOpen(false)}
          title="Update Jumlah Pax Harian"
        >
          <PaxEditForm
            initialData={editingPaxData}
            onSuccess={() => setIsPaxModalOpen(false)}
          />
        </ManagementDialog>
      )}

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Ini akan menghapus data
              pencatatan untuk meteran{" "}
              <span className="font-bold">
                {itemToDelete?.meter.meter_code}
              </span>{" "}
              pada tanggal{" "}
              <span className="font-bold">
                {itemToDelete
                  ? format(new Date(itemToDelete.reading_date), "dd MMM yyyy", {
                      locale: id,
                    })
                  : ""}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSession(itemToDelete.session_id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!paxToDelete}
        onOpenChange={() => setPaxToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Ini akan menghapus data Pax pada
              tanggal{" "}
              <span className="font-bold">
                {paxToDelete
                  ? format(new Date(paxToDelete.date), "dd MMMM yyyy", {
                      locale: id,
                    })
                  : ""}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePax(paxToDelete!)}
              disabled={isDeletingPax}
            >
              {isDeletingPax ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
