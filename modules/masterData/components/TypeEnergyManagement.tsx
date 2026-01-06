import { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
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
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";

import { EnergyTypeForm } from "./forms/energyType.form";
import { DataTableRowActions } from "./dataTableRowActions";

import { ApiErrorResponse } from "@/common/types/api";
import {
  getEnergyTypesApi,
  createEnergyTypeApi,
  updateEnergyTypeApi,
  deleteEnergyTypeApi,
} from "../services/energyType.service";
import { EnergyTypeFormValues } from "../schemas/energyType.schema";
import { EnergyType } from "@/common/types/energy";

export const createEnergyTypeColumns = (
  onEdit: (item: EnergyType) => void,
  onDelete: (item: EnergyType) => void
): ColumnDef<EnergyType>[] => [
  { accessorKey: "type_name", header: "Nama Jenis Energi" },
  { accessorKey: "unit_of_measurement", header: "Satuan Ukur" },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Aktif" : "Non-Aktif"}
        </Badge>
      );
    },
  },
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

export const TypeEnergyManagement = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EnergyType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<EnergyType | null>(null);

  const { data: energyTypesResponse, isLoading } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const energyTypesData = useMemo(
    () => energyTypesResponse?.data || [],
    [energyTypesResponse?.data]
  );

  const { mutate: createOrUpdate, isPending: isMutating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    EnergyTypeFormValues
  >({
    mutationFn: (formData) => {
      if (editingItem?.energy_type_id) {
        return updateEnergyTypeApi(editingItem.energy_type_id, formData);
      }
      return createEnergyTypeApi(formData);
    },
    onSuccess: () => {
      const action = editingItem ? "diperbarui" : "disimpan";
      toast.success(`Jenis energi berhasil ${action}!`);

      queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat menyimpan.";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => deleteEnergyTypeApi(id),
    onSuccess: () => {
      toast.success("Jenis energi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
      setItemToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Gagal menghapus data.";
      toast.error(message);
    },
  });

  const handleEdit = (item: EnergyType) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (item: EnergyType) => {
    setItemToDelete(item);
  };

  const columns = useMemo(
    () => createEnergyTypeColumns(handleEdit, handleDeleteRequest),
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Manajemen Jenis Energi</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data jenis energi di sistem.
            </CardDescription>
          </div>

          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingItem(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)} disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jenis Energi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? "Edit Jenis Energi"
                    : "Tambah Jenis Energi Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail jenis energi di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <EnergyTypeForm
                initialData={editingItem}
                onSubmit={(values) => createOrUpdate(values)}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={energyTypesData}
          isLoading={isLoading}
          filterColumnId="type_name"
          filterPlaceholder="Cari nama jenis energi..."
        />
      </CardContent>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setItemToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus jenis energi{" "}
              <span className="font-bold">{itemToDelete?.type_name}</span>. Data
              yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (itemToDelete?.energy_type_id) {
                  deleteItem(itemToDelete.energy_type_id);
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
