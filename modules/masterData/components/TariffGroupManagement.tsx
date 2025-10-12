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
import { EnergyType, getEnergyTypesApi } from "@/services/energyType.service";

// --- Definisi Tipe dan Skema untuk Golongan Tarif ---

type PriceScheme = {
  scheme_id: number;
  scheme_name: string;
  effective_date: string;
  is_active: boolean;
};

export type TariffGroup = {
  tariff_group_id: number;
  group_code: string;
  group_name: string;
  description?: string | null;
  daya_va?: number | null;
  faktor_kali: number;
  price_schemes: PriceScheme[];
};

const tariffGroupSchema = z.object({
  group_code: z.string().min(1, "Kode golongan tidak boleh kosong."),
  group_name: z.string().min(1, "Nama golongan tidak boleh kosong."),
  description: z.string().optional(),
  daya_va: z.coerce.number().nullable().optional(),
  faktor_kali: z.coerce.number().min(0, "Faktor kali harus angka positif."),
});

interface TariffGroupFormProps {
  initialData?: TariffGroup | null;
  onSubmit: (values: z.infer<typeof tariffGroupSchema>) => void;
  isLoading?: boolean;
}

export function TariffGroupForm({
  initialData,
  onSubmit,
  isLoading,
}: TariffGroupFormProps) {
  const form = useForm<z.infer<typeof tariffGroupSchema>>({
    resolver: zodResolver(tariffGroupSchema),
    defaultValues: initialData
      ? {
          group_code: initialData.group_code,
          group_name: initialData.group_name,
          description: initialData.description ?? "",
          daya_va: initialData.daya_va ?? null,
          faktor_kali: initialData.faktor_kali,
        }
      : {
          group_code: "",
          group_name: "",
          description: "",
          daya_va: null,
          faktor_kali: 1,
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="group_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Golongan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: R1, B2, I3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="group_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Golongan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Bisnis Tegangan Menengah"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Deskripsi singkat mengenai golongan tarif"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="faktor_kali"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faktor Kali</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daya_va"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daya (VA)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Contoh: 7700000 (kosongkan jika tidak ada)"
                  {...field}
                  value={field.value ?? ""}
                />
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

export const createTariffGroupColumns = (
  onEdit: (item: TariffGroup) => void,
  onDelete: (item: TariffGroup) => void
): ColumnDef<TariffGroup>[] => [
  { accessorKey: "group_code", header: "Kode Golongan" },
  { accessorKey: "group_name", header: "Nama Golongan" },
  { accessorKey: "faktor_kali", header: "Faktor Kali" },
  { accessorKey: "_count.meters", header: "Meter Terhubung" },
  { accessorKey: "_count.price_schemes", header: "Skema Terhubung" },
  {
    accessorKey: "daya_va",
    header: "Daya (VA)",
    cell: ({ row }) => {
      const daya = row.original.daya_va;
      return daya ? new Intl.NumberFormat("id-ID").format(daya) : "-";
    },
  },
  {
    accessorKey: "price_schemes",
    header: "Skema Harga Aktif",
    cell: ({ row }) => {
      const activeScheme = row.original.price_schemes?.find(
        (ps) => ps.is_active
      );
      if (!activeScheme) {
        return <Badge variant="secondary">Tidak Ada</Badge>;
      }
      return <Badge variant="outline">{activeScheme.scheme_name}</Badge>;
    },
  },
  {
    id: "actions",
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

export const TariffGroupManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTariffGroup, setEditingTariffGroup] =
    useState<TariffGroup | null>(null);
  const [tariffGroupToDelete, setTariffGroupToDelete] =
    useState<TariffGroup | null>(null);

  const {
    data: tariffGroupsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tariffGroups"],
    queryFn: masterData.tariffGroup.getAll,
  });

  const { mutate: createOrUpdateTariffGroup, isPending: isMutating } =
    useMutation({
      mutationFn: (tariffGroupData: z.infer<typeof tariffGroupSchema>) => {
        const id = editingTariffGroup
          ? editingTariffGroup.tariff_group_id
          : undefined;
        return id
          ? masterData.tariffGroup.update(id, tariffGroupData)
          : masterData.tariffGroup.create(tariffGroupData);
      },
      onSuccess: () => {
        toast.success(
          `Golongan tarif berhasil ${
            editingTariffGroup ? "diperbarui" : "disimpan"
          }!`
        );
        queryClient.invalidateQueries({ queryKey: ["tariffGroups"] });
        setIsFormOpen(false);
        setEditingTariffGroup(null);
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.status?.message || "Terjadi kesalahan";
        toast.error(`Gagal: ${message}`);
      },
    });

  const { mutate: deleteTariffGroup, isPending: isDeleting } = useMutation({
    mutationFn: (tariffGroup: TariffGroup) =>
      masterData.tariffGroup.delete(tariffGroup.tariff_group_id),
    onSuccess: () => {
      toast.success("Golongan tarif berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["tariffGroups"] });
      setTariffGroupToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  const handleEdit = (tariffGroup: TariffGroup) => {
    setEditingTariffGroup(tariffGroup);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (tariffGroup: TariffGroup) => {
    setTariffGroupToDelete(tariffGroup);
  };

  const columns = createTariffGroupColumns(handleEdit, handleDeleteRequest);

  // Menangani kasus di mana data mungkin tidak terstruktur seperti yang diharapkan
  const tariffGroups = Array.isArray(tariffGroupsResponse?.data)
    ? tariffGroupsResponse.data
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Manajemen Golongan Tarif</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data golongan tarif di sistem.
            </CardDescription>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingTariffGroup(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTariffGroup(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Golongan Tarif
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTariffGroup
                    ? "Edit Golongan Tarif"
                    : "Tambah Golongan Tarif Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail golongan tarif di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <TariffGroupForm
                initialData={editingTariffGroup}
                onSubmit={createOrUpdateTariffGroup}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={tariffGroups}
          isLoading={isLoading}
          filterColumnId="group_code"
          filterPlaceholder="Cari kode golongan..."
        />
      </CardContent>
      <AlertDialog
        open={!!tariffGroupToDelete}
        onOpenChange={() => setTariffGroupToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus golongan tarif{" "}
              <span className="font-bold">
                {tariffGroupToDelete?.group_code}
              </span>
              . Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTariffGroup(tariffGroupToDelete!)}
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
