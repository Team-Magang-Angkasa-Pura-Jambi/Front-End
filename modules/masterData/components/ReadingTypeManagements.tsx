import { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { SubmitHandler } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { DataTable } from "@/components/DataTable";

import { DataTableRowActions } from "./dataTableRowActions";
import { ReadingTypeForm } from "./forms/readingType.form";

import { ReadingType } from "@/common/types/readingTypes";
import { ApiErrorResponse } from "@/common/types/api";
import { readingTypeFormValues } from "../schemas/readingType.schema";

import {
  createReadingTypeApi,
  getReadingTypesApi,
  updateReadingTypeApi,
  deleteReadingTypeApi,
} from "../services/readingsType.service";

export const createReadingTypeColumns = (
  onEdit: (item: ReadingType) => void,
  onDelete: (item: ReadingType) => void
): ColumnDef<ReadingType>[] => [
  { accessorKey: "type_name", header: "Nama Tipe" },
  { accessorKey: "reading_unit", header: "Satuan" },
  { accessorKey: "energy_type.type_name", header: "Jenis Energi" },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

export const ReadingTypeManagement = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReadingType, setEditingReadingType] =
    useState<ReadingType | null>(null);
  const [readingTypeToDelete, setReadingTypeToDelete] =
    useState<ReadingType | null>(null);

  const { data: readingTypesResponse, isLoading } = useQuery({
    queryKey: ["readingTypes"],
    queryFn: () => getReadingTypesApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const readingTypesData = useMemo(
    () => readingTypesResponse?.data || [],
    [readingTypesResponse?.data]
  );

  const { mutate: createOrUpdate, isPending: isMutating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    readingTypeFormValues
  >({
    mutationFn: (formData) => {
      if (editingReadingType?.reading_type_id) {
        return updateReadingTypeApi(
          editingReadingType.reading_type_id,
          formData
        );
      }
      return createReadingTypeApi(formData);
    },
    onSuccess: () => {
      const action = editingReadingType ? "diperbarui" : "disimpan";
      toast.success(`Tipe pembacaan berhasil ${action}!`);

      queryClient.invalidateQueries({ queryKey: ["readingTypes"] });
      setIsFormOpen(false);
      setEditingReadingType(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat menyimpan.";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteReadingType, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => deleteReadingTypeApi(id),
    onSuccess: () => {
      toast.success("Tipe pembacaan berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingTypes"] });
      setReadingTypeToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat menghapus.";
      toast.error(`Gagal: ${message}`);
    },
  });

  const handleEdit = (item: ReadingType) => {
    setEditingReadingType(item);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (item: ReadingType) => {
    setReadingTypeToDelete(item);
  };

  const handleFormSubmit: SubmitHandler<readingTypeFormValues> = (data) => {
    createOrUpdate(data);
  };

  const columns = useMemo(
    () => createReadingTypeColumns(handleEdit, handleDeleteRequest),
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Manajemen Tipe Pembacaan</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data tipe pembacaan di sistem.
            </CardDescription>
          </div>

          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);

              if (!isOpen) setEditingReadingType(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingReadingType(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tipe Pembacaan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingReadingType
                    ? "Edit Tipe Pembacaan"
                    : "Tambah Tipe Pembacaan Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail tipe pembacaan di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <ReadingTypeForm
                initialData={editingReadingType}
                onSubmit={handleFormSubmit}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable<ReadingType, unknown>
          columns={columns}
          data={readingTypesData}
          isLoading={isLoading}
          filterColumnId="type_name"
          filterPlaceholder="Cari nama tipe..."
        />
      </CardContent>

      <AlertDialog
        open={!!readingTypeToDelete}
        onOpenChange={(open) => {
          if (!open) setReadingTypeToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus tipe pembacaan{" "}
              <span className="font-bold">
                {readingTypeToDelete?.type_name}
              </span>
              . Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (readingTypeToDelete?.reading_type_id) {
                  deleteReadingType(readingTypeToDelete.reading_type_id);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
