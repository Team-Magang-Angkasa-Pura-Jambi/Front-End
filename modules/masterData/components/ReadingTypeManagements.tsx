import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

import { masterData } from "@/services/masterData.service";
import { DataTable } from "./dataTable";
import { EnergyType } from "../types";
import { readingTypeFormValues } from "../schemas/readingType.schema";
import { DataTableRowActions } from "./dataTableRowActions";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import { getReadingTypesApi } from "../services/readingsType.service";
import { ReadingType } from "@/common/types/readingTypes";
import { ReadingTypeForm } from "./forms/readingType.form";
import { SubmitHandler } from "react-hook-form";

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

  const {
    data: readingTypesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["readingTypes"],
    queryFn: () => getReadingTypesApi(),
  });

  const { mutate: createOrUpdateReadingType, isPending: isMutating } =
    useMutation<unknown, AxiosError<ApiErrorResponse>, readingTypeFormValues>({
      mutationFn: (readingTypeData) => {
        const id = editingReadingType
          ? editingReadingType.reading_type_id
          : undefined;
        return id
          ? masterData.readingType.update(id, readingTypeData)
          : masterData.readingType.create(readingTypeData);
      },
      onSuccess: () => {
        toast.success(
          `Tipe pembacaan berhasil ${
            editingReadingType ? "diperbarui" : "disimpan"
          }!`
        );
        queryClient.invalidateQueries({ queryKey: ["readingTypes"] });
        setIsFormOpen(false);
        setEditingReadingType(null);
      },
      onError: (error) => {
        const message =
          error.response?.data?.status?.message || "Terjadi kesalahan";
        toast.error(`Gagal: ${message}`);
      },
    });

  const { mutate: deleteReadingType, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => masterData.readingType.delete(id),
    onSuccess: () => {
      toast.success("Tipe pembacaan berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingTypes"] });
      setReadingTypeToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    },
  });

  const handleEdit = (readingType: ReadingType) => {
    setEditingReadingType(readingType);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (readingType: ReadingType) => {
    setReadingTypeToDelete(readingType);
  };

  const columns = createReadingTypeColumns(handleEdit, handleDeleteRequest);

  const readingTypes = Array.isArray(readingTypesResponse?.data)
    ? readingTypesResponse.data
    : [];
  const handleFormSubmit: SubmitHandler<readingTypeFormValues> = (data) => {
    createOrUpdateReadingType(data);
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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
        <DataTable
          columns={columns}
          data={readingTypes}
          // isLoading={isLoading}
        />
      </CardContent>
      <AlertDialog
        open={!!readingTypeToDelete}
        onOpenChange={() => setReadingTypeToDelete(null)}
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
              onClick={() =>
                deleteReadingType(readingTypeToDelete.reading_type_id)
              }
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
