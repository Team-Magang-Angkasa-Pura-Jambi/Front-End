"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AlertTriangle, BookLock, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

// --- Services & Components ---
import { deletePaxApi } from "../services/pax.service";
import {
  deleteReadingSessionApi,
  getReadingSessionsApi,
  ReadingHistory,
} from "../services/reading.service";
import { createColumns } from "./ColumnTable";
import { RecapHeader } from "./Header";
import { ManagementDialog } from "./ManagementDialog";
import { DailyPaxData, PaxDailyTable } from "./PaxDailyTable";
import { PaxEditForm } from "./PaxEditForm";
import { ReadingForm } from "./readingForm";
import { DataTable } from "./Table";

// --- Types ---
import { Button } from "@/common/components/ui/button";
import { ApiErrorResponse } from "@/common/types/api";
import { EnergyTypeName } from "@/common/types/energy";
import { HistoryFilters } from "../types";

export const Page = () => {
  const queryClient = useQueryClient();
  const now = new Date();

  // Initialize Dates
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // --- STATE ---
  const [filters, setFilters] = useState<HistoryFilters>({
    type: "Electricity", // Default start
    date: {
      from: firstDayOfMonth,
      to: firstDayOfNextMonth,
    },
    sortBy: "reading_date",
    sortOrder: "desc",
    meterId: undefined,
  });

  // State untuk Modal & Delete Actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReadingHistory | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ReadingHistory | null>(null);

  // State Spesifik Pax
  const [isPaxModalOpen, setIsPaxModalOpen] = useState(false);
  const [editingPaxData, setEditingPaxData] = useState<DailyPaxData | null>(null);
  const [paxToDelete, setPaxToDelete] = useState<DailyPaxData | null>(null);

  const { type, date, sortBy, sortOrder, meterId } = filters;

  // --- QUERY DATA ---
  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    // Tambahkan pagination page/limit ke queryKey jika nanti diimplementasikan
    queryKey: [
      "readingHistory",
      type,
      date?.from?.toISOString(),
      date?.to?.toISOString(),
      meterId,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getReadingSessionsApi({
        energyTypeName: type as unknown as EnergyTypeName,
        // Backend Zod Schema Expectation: String YYYY-MM-DD or ISO
        // Menggunakan format date string agar tidak tergeser timezone saat dikirim ke BE
        startDate: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
        endDate: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
        meterId,
        sortBy,
        sortOrder,
        page: 1, // Default dari schema backend
        limit: 100, // Ambil banyak dulu karena belum ada UI pagination
      }),
    enabled: !!date?.from && !!date?.to, // Hanya fetch jika tanggal lengkap
    refetchOnWindowFocus: false,
  });

  const historyData = useMemo(() => {
    const data = queryData?.data;
    // Handle response structure (terkadang dibungkus 'data' lagi tergantung backend response wrapper)
    return Array.isArray(data) ? data : [];
  }, [queryData?.data]);

  // --- MUTATIONS ---
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

  const { mutate: deletePax, isPending: isDeletingPax } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    DailyPaxData
  >({
    mutationFn: (item) => deletePaxApi(item.paxId), // Asumsi paxId adalah identifier
    onSuccess: () => {
      toast.success("Data Pax berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] }); // Asumsi pax juga menggunakan queryKey yg sama atau setara
      setPaxToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.status?.message || "Gagal menghapus data Pax.");
    },
  });

  // --- HANDLERS ---
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

  // --- RENDER CONTENT LOGIC ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="flex h-96 flex-col items-center justify-center border-dashed text-center">
          <CardContent className="p-6">
            <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
            <h3 className="mt-4 text-lg font-semibold">Memuat Data...</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Mengambil riwayat pencatatan terbaru.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (isError) {
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ["readingHistory"] })}
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (historyData.length === 0) {
      return (
        <Card className="bg-muted/20 flex h-96 flex-col items-center justify-center border-dashed text-center">
          <CardContent className="p-6">
            <BookLock className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Data Tidak Ditemukan</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm">
              Tidak ada riwayat pencatatan untuk periode dan filter yang Anda pilih.
            </p>
          </CardContent>
        </Card>
      );
    }

    // --- LOGIC PEMISAHAN TAMPILAN PAX VS ENERGY ---
    // Jika tipe adalah "Pax", tampilkan tabel Pax.
    // Jika tipe adalah Electricity/Water/Fuel, tampilkan tabel standar.

    if (filters.type === "Pax") {
      return (
        <PaxDailyTable
          data={historyData} // Cast ke any atau type Pax yang sesuai
          onEdit={handleOpenPaxEdit}
          onDelete={handleDeletePax}
        />
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tabel Riwayat {filters.type}</CardTitle>
              <CardDescription>Menampilkan detail angka stand meteran.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={historyData} isLoading={isFetching} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <RecapHeader filters={filters} setFilters={setFilters} />

      {renderContent()}

      <ManagementDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Data Meteran" : "Input Data Baru"}
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

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pencatatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus data meteran{" "}
              <span className="text-foreground font-bold">{itemToDelete?.meter?.meter_code}</span>{" "}
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

      <AlertDialog open={!!paxToDelete} onOpenChange={() => setPaxToDelete(null)}>
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
    </div>
  );
};
