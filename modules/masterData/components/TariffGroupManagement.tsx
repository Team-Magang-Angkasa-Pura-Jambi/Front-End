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

import { DataTableRowActions } from "./dataTableRowActions";

import { ApiErrorResponse } from "@/common/types/api";
import { TariffGroup } from "@/common/types/tariffGroup";
import {
  getTariffGroupsApi,
  createTariffGroupApi,
  updateTariffGroupApi,
  deleteTariffGroupApi,
} from "../services/tariffGroup.service";
import { tarifFormValues } from "../schemas/tariffGroup.schema";
import { TariffGroupForm } from "./forms/tarffGroup.forms";

export const createTariffGroupColumns = (
  onEdit: (item: TariffGroup) => void,
  onDelete: (item: TariffGroup) => void
): ColumnDef<TariffGroup>[] => [
  { accessorKey: "group_code", header: "Kode" },
  { accessorKey: "group_name", header: "Nama Golongan" },
  {
    accessorKey: "daya_va",
    header: "Daya (VA)",
    cell: ({ row }) => (
      <span className="font-mono">
        {new Intl.NumberFormat("id-ID").format(row.original.daya_va)} VA
      </span>
    ),
  },
  {
    accessorKey: "faktor_kali",
    header: "Faktor Kali",
    cell: ({ row }) => (
      <Badge variant="secondary">x{row.original.faktor_kali}</Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm truncate max-w-[200px] block">
        {row.original.description || "-"}
      </span>
    ),
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

export const TariffGroupManagement = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TariffGroup | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TariffGroup | null>(null);

  const { data: tariffGroupsResponse, isLoading } = useQuery({
    queryKey: ["tariffGroups"],
    queryFn: () => getTariffGroupsApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const tariffGroupsData = useMemo(
    () => tariffGroupsResponse?.data || [],
    [tariffGroupsResponse?.data]
  );

  const { mutate: createOrUpdate, isPending: isMutating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    tarifFormValues
  >({
    mutationFn: (formData) => {
      if (editingItem?.tariff_group_id) {
        return updateTariffGroupApi(editingItem.tariff_group_id, formData);
      }
      return createTariffGroupApi(formData);
    },
    onSuccess: () => {
      const action = editingItem ? "diperbarui" : "disimpan";
      toast.success(`Golongan tarif berhasil ${action}!`);

      queryClient.invalidateQueries({ queryKey: ["tariffGroups"] });
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
    mutationFn: (id) => deleteTariffGroupApi(id),
    onSuccess: () => {
      toast.success("Golongan tarif berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["tariffGroups"] });
      setItemToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Gagal menghapus data.";
      toast.error(message);
    },
  });

  const handleEdit = (item: TariffGroup) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (item: TariffGroup) => {
    setItemToDelete(item);
  };

  const columns = useMemo(
    () => createTariffGroupColumns(handleEdit, handleDeleteRequest),
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Golongan Tarif</CardTitle>
            <CardDescription>
              Manajemen master data golongan tarif dan daya.
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
              <Button onClick={() => setEditingItem(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Golongan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Golongan Tarif" : "Tambah Golongan Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail kode golongan, daya, dan faktor kali di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <TariffGroupForm
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
          data={tariffGroupsData}
          isLoading={isLoading}
          filterColumnId="group_name"
          filterPlaceholder="Cari nama golongan..."
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
              Aksi ini akan menghapus golongan tarif{" "}
              <span className="font-bold">{itemToDelete?.group_code}</span>.
              Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (itemToDelete?.tariff_group_id) {
                  deleteItem(itemToDelete.tariff_group_id);
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
