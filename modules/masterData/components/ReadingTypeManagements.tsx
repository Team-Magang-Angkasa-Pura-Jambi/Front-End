import { Loader2, MoreHorizontal, PlusCircle } from "lucide-react";
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
import { DataTable } from "./DataTable";
import { EnergyType, getEnergyTypesApi } from "@/services/energyType.service";

// --- Definisi Internal dari reading-type-config.tsx ---

export type ReadingType = {
  reading_type_id: number;
  type_name: string;
  reading_unit: string;
  energy_type: EnergyType; // Tambahkan relasi
};

const readingTypeSchema = z.object({
  type_name: z.string().min(1, "Nama tipe tidak boleh kosong."),
  reading_unit: z.string().min(1, "Satuan tidak boleh kosong."),
  energy_type_id: z.coerce.number().min(1, "Jenis energi wajib dipilih."),
});

interface ReadingTypeFormProps {
  initialData?: ReadingType | null;
  onSubmit: (values: z.infer<typeof readingTypeSchema>) => void;
  isLoading?: boolean;
}

export function ReadingTypeForm({
  initialData,
  onSubmit,
  isLoading,
}: ReadingTypeFormProps) {
  const form = useForm<z.infer<typeof readingTypeSchema>>({
    resolver: zodResolver(readingTypeSchema),
    defaultValues: initialData
      ? {
          type_name: initialData.type_name,
          reading_unit: initialData.reading_unit,
          energy_type_id: initialData.energy_type.energy_type_id,
        }
      : { type_name: "", reading_unit: "", energy_type_id: undefined },
  });

  const { data: energyTypesResponse, isLoading: isLoadingEnergyTypes } =
    useQuery({
      queryKey: ["energyTypes"],
      queryFn: () => getEnergyTypesApi(),
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Tipe Pembacaan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: WBP, LWBP, Stand Meter"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reading_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satuan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: kWh, m³, L" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="energy_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Energi</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ? String(field.value) : ""}
                disabled={isLoadingEnergyTypes}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingEnergyTypes
                          ? "Memuat..."
                          : "Pilih Jenis Energi"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {energyTypesResponse?.data?.map((et) => (
                    <SelectItem
                      key={et.energy_type_id}
                      value={String(et.energy_type_id)}
                    >
                      {et.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export const createReadingTypeColumns = (
  onEdit: (item: ReadingType) => void,
  onDelete: (item: ReadingType) => void
): ColumnDef<ReadingType>[] => [
  { accessorKey: "type_name", header: "Nama Tipe" },
  { accessorKey: "reading_unit", header: "Satuan" },
  { accessorKey: "energy_type.type_name", header: "Jenis Energi" },
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
    queryFn: masterData.readingType.getAll,
  });

  const { mutate: createOrUpdateReadingType, isPending: isMutating } =
    useMutation({
      mutationFn: (readingTypeData: z.infer<typeof readingTypeSchema>) => {
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
      onError: (error: any) => {
        const message =
          error.response?.data?.status?.message || "Terjadi kesalahan";
        toast.error(`Gagal: ${message}`);
      },
    });

  const { mutate: deleteReadingType, isPending: isDeleting } = useMutation({
    mutationFn: (readingType: ReadingType) =>
      masterData.readingType.delete(readingType.reading_type_id),
    onSuccess: () => {
      toast.success("Tipe pembacaan berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["readingTypes"] });
      setReadingTypeToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
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

  // Menangani kasus di mana data mungkin tidak terstruktur seperti yang diharapkan
  const readingTypes = Array.isArray(readingTypesResponse?.data)
    ? readingTypesResponse.data
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
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
                onSubmit={createOrUpdateReadingType}
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
          isLoading={isLoading}
          filterColumnId="type_name"
          filterPlaceholder="Cari nama tipe..."
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
              onClick={() => deleteReadingType(readingTypeToDelete!)}
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
