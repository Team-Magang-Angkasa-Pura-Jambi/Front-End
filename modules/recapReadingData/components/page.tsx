"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, AlertTriangle, PlusCircle, BookLock } from "lucide-react";
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
import { RecapHeader } from "./Header"; // Pastikan path ini benar
import { ReadingSessionWithDetails, HistoryFilters } from "../types";
import { ReadingForm } from "./readingForm"; // Pastikan path ini benar
import {
  deleteReadingSessionApi,
  getReadingSessionsApi,
} from "@/services/readingSession.service";
import { ManagementDialog } from "./ManagementDialog";
import { DataTable } from "./Table";

export const Page = () => {
  const queryClient = useQueryClient();

  // --- State untuk Filter dan Data ---
  const [filters, setFilters] = useState<HistoryFilters>({
    type: "Electricity",
    date: { from: subDays(new Date(), 7), to: new Date() },
    sortBy: "reading_date",
    sortOrder: "desc",
    meterId: undefined,
  });

  // --- State untuk mengelola dialog/modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ReadingSessionWithDetails | null>(null);
  const [itemToDelete, setItemToDelete] =
    useState<ReadingSessionWithDetails | null>(null);

  const { type, date, sortBy, sortOrder, meterId } = filters;

  // --- Pengambilan Data (Data Fetching) ---
  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["readingHistory", type, date, meterId, sortBy, sortOrder],
    queryFn: () =>
      getReadingSessionsApi({
        energyTypeName: type,
        startDate: date!.from!.toISOString(),
        endDate: date!.to!.toISOString(),
        meterId,
        sortBy,
        sortOrder,
      }),
    enabled: !!date?.from && !!date?.to,
  });

  const historyData = queryData?.data || [];

  const { mutate: deleteSession, isPending: isDeleting } = useMutation({
    mutationFn: (item: ReadingSessionWithDetails) =>
      deleteReadingSessionApi(item.session_id),
    onSuccess: () => {
      toast.success("Data pencatatan berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      setItemToDelete(null); // Menutup dialog konfirmasi
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message || "Terjadi kesalahan"}`);
    },
  });

  // --- Handlers untuk Aksi Dialog ---
  const handleOpenCreate = () => {
    setEditingItem(null); // Pastikan tidak ada item yang diedit
    setIsModalOpen(true);
  };

  const handleOpenEdit = useCallback((item: ReadingSessionWithDetails) => {
    setEditingItem(item);
    setIsModalOpen(true); // Buka dialog yang sama untuk edit
  }, []);

  const handleDelete = useCallback((item: ReadingSessionWithDetails) => {
    setItemToDelete(item); // Ini akan membuka AlertDialog
  }, []);

  // --- Definisi Kolom sekarang menerima handler ---
  const columns = useMemo(
    () => createColumns(handleOpenEdit, handleDelete, filters.type),
    [handleOpenEdit, handleDelete, filters.type]
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

    if (historyData.length === 0) {
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tabel Riwayat Pencatat an</CardTitle>
              <CardDescription>
                Menampilkan semua data pencatatan meteran sesuai filter.
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
    );
  };

  return (
    <div className="space-y-6">
      <RecapHeader
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        isFetching={isFetching}
      />
      {renderContent()}

      {/* Dialog untuk Tambah/Edit Data. Sekarang diaktifkan. */}
      <ManagementDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? "Edit Catatan Pembacaan"
            : `Tambah Catatan ${filters.type}`
        }
      >
        <ReadingForm
          initialData={editingItem}
          onSuccess={() => setIsModalOpen(false)} // Tutup dialog saat berhasil
        />
      </ManagementDialog>

      {/* Dialog Konfirmasi untuk Hapus Data */}
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
              onClick={() => deleteSession(itemToDelete!)}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
