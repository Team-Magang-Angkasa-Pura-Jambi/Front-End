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
import { DataTable } from "@/components/table/dataTable";


import { ApiErrorResponse } from "@/common/types/api";

import {
  getTaxesApi,
  createTaxApi,
  updateTaxApi,
  deleteTaxApi,
} from "../services/tax.service";
import { Taxes } from "@/common/types/taxes";
import { taxFormValue } from "../schemas/taxes.schema";
import { TaxForm } from "./forms/taxes.form";
import { DataTableRowActions } from "@/components/table/dataTableRowActions";

const RateCell = ({ value }: { value: number }) => {
  const rate = Number(value);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate);

  return <div className="font-mono font-medium">{formatted}</div>;
};

export const createTaxColumns = (
  onEdit: (item: Taxes) => void,
  onDelete: (item: Taxes) => void
): ColumnDef<Taxes>[] => [
  { accessorKey: "tax_name", header: "Nama Pajak" },
  {
    accessorKey: "rate",
    header: "Tarif",
    cell: ({ row }) => <RateCell value={row.original.rate} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

export const TaxManagement = () => {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Taxes | null>(null);
  const [taxToDelete, setTaxToDelete] = useState<Taxes | null>(null);

  const { data: taxesResponse, isLoading } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => getTaxesApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const taxesData = useMemo(
    () => taxesResponse?.data || [],
    [taxesResponse?.data]
  );

  const { mutate: createOrUpdateTax, isPending: isMutating } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    taxFormValue
  >({
    mutationFn: (formData) => {
      if (editingTax?.tax_id) {
        return updateTaxApi(editingTax.tax_id, formData);
      }
      return createTaxApi(formData);
    },
    onSuccess: () => {
      const action = editingTax ? "diperbarui" : "disimpan";
      toast.success(`Pajak berhasil ${action}!`);

      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      setIsFormOpen(false);
      setEditingTax(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan saat menyimpan.";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteTax, isPending: isDeleting } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    number
  >({
    mutationFn: (id) => deleteTaxApi(id),
    onSuccess: () => {
      toast.success("Pajak berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      setTaxToDelete(null);
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message || "Gagal menghapus data.";
      toast.error(message);
    },
  });

  const handleEdit = (tax: Taxes) => {
    setEditingTax(tax);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (tax: Taxes) => {
    setTaxToDelete(tax);
  };

  const columns = useMemo(
    () => createTaxColumns(handleEdit, handleDeleteRequest),
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Manajemen Pajak</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data pajak di sistem.
            </CardDescription>
          </div>

          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingTax(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTax(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pajak
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTax ? "Edit Pajak" : "Tambah Pajak Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail pajak di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <TaxForm
                initialData={editingTax}
                onSubmit={(values) => createOrUpdateTax(values)}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={taxesData}
          isLoading={isLoading}
          filterColumnId="tax_name"
          filterPlaceholder="Cari nama pajak..."
        />
      </CardContent>

      <AlertDialog
        open={!!taxToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTaxToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus pajak{" "}
              <span className="font-bold">{taxToDelete?.tax_name}</span>. Data
              yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (taxToDelete?.tax_id) {
                  deleteTax(taxToDelete.tax_id);
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
