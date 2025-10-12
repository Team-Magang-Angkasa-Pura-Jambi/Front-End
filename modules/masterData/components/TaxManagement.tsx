import { MoreHorizontal, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Asumsi Anda menggunakan shadcn/ui untuk komponen ini
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { masterData } from "@/services/masterData.service";
import { DataTable } from "./dataTable";
import { TariffGroup } from "./TariffGroupManagement";

export type Tax = {
  tax_id: number;
  tax_name: string;
  rate: number;
  is_active: boolean;
  price_schemes: {
    price_scheme: TariffGroup;
  }[];
};

const taxDefaultSchema = z.object({
  tax_name: z.string().min(1, "Nama pajak tidak boleh kosong."),
  rate: z.coerce.number().positive("Tarif harus angka positif."),
  is_active: z.coerce.boolean().default(true),
});

interface TaxFormProps {
  initialData?: Tax | null;
  onSubmit: (values: z.infer<typeof taxDefaultSchema>) => void;
  isLoading?: boolean;
  priceSchemes: TariffGroup[];
  isLoadingPriceSchemes?: boolean;
}

export function TaxForm({
  initialData,
  onSubmit,
  isLoading,
  priceSchemes,
  isLoadingPriceSchemes,
}: TaxFormProps) {
  const form = useForm<z.infer<typeof taxDefaultSchema>>({
    resolver: zodResolver(taxDefaultSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price_scheme_ids:
            initialData.price_schemes?.map(
              (ps) => ps.price_scheme.tariff_group_id
            ) || [],
        }
      : {
          tax_name: "",
          rate: 0.11, // Default PPN 11%
          is_active: true,
          price_scheme_ids: [],
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tax_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pajak</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: PPN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarif (Rate)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.11"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Masukkan nilai desimal. Contoh: 0.11 untuk 11%.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={String(field.value)}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export const createTaxColumns = (
  onEdit: (item: Tax) => void,
  onDelete: (item: Tax) => void
): ColumnDef<Tax>[] => [
  { accessorKey: "tax_name", header: "Nama Pajak" },

  {
    accessorKey: "rate",
    header: "Tarif",
    cell: ({ row }) => {
      const rate = parseFloat(row.original.rate as any);
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "percent",
        minimumFractionDigits: 2,
      }).format(rate);
      return <div className="font-medium">{formatted}</div>;
    },
  },

  {
    id: "actions",
    header: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-red-600"
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// --- Akhir Definisi Internal ---

export const TaxManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);

  const {
    data: taxesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["taxes"],
    queryFn: masterData.tax.getAll,
  });

  const { data: priceSchemesResponse, isLoading: isLoadingPriceSchemes } =
    useQuery({
      queryKey: ["tariffGroups"],
      queryFn: masterData.tariffGroup.getAll,
    });

  const { mutate: createOrUpdateTax, isPending: isMutating } = useMutation({
    mutationFn: (taxData: z.infer<typeof taxDefaultSchema>) => {
      const id = editingTax ? editingTax.tax_id : undefined;
      return id
        ? masterData.tax.update(id, taxData)
        : masterData.tax.create(taxData);
    },
    onSuccess: () => {
      toast.success(
        `Pajak berhasil ${editingTax ? "diperbarui" : "disimpan"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      setIsFormOpen(false);
      setEditingTax(null);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.status?.message || "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteTax, isPending: isDeleting } = useMutation({
    mutationFn: (tax: Tax) => masterData.tax.delete(tax.tax_id),
    onSuccess: () => {
      toast.success("Target efisiensi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      setTaxToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  const handleEdit = (target: Tax) => {
    setEditingTax(target);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (target: Tax) => {
    setTaxToDelete(target);
  };

  const columns = createTaxColumns(handleEdit, handleDeleteRequest);

  const taxes = Array.isArray(taxesResponse?.data) ? taxesResponse.data : [];
  const priceSchemes = Array.isArray(priceSchemesResponse?.data)
    ? priceSchemesResponse.data
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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
                onSubmit={createOrUpdateTax}
                isLoading={isMutating}
                priceSchemes={priceSchemes}
                isLoadingPriceSchemes={isLoadingPriceSchemes}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={taxes}
          isLoading={isLoading}
          filterColumnId="tax_name"
          filterPlaceholder="Cari nama pajak..."
        />
      </CardContent>
      <AlertDialog
        open={!!taxToDelete}
        onOpenChange={() => setTaxToDelete(null)}
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
              onClick={() => deleteTax(taxToDelete!)}
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
