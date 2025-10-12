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
import { getEnergyTypesApi, EnergyType } from "@/services/energyType.service";
import { masterData } from "@/services/masterData.service";
import { DataTable } from "@/modules/UserManagement/components/DataTable";
import { Switch } from "@/components/ui/switch";

// Skema validasi Zod untuk form Jenis Energi
const energyTypeSchema = z.object({
  type_name: z.string().min(3, "Nama jenis energi wajib diisi."),
  unit_of_measurement: z.string().min(1, "Satuan ukur wajib diisi."),
  is_active: z.boolean().default(true),
});

export const EnergyTypeForm = ({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: EnergyType | null;
  onSubmit: (values: z.infer<typeof energyTypeSchema>) => void;
  isLoading?: boolean;
}) => {
  const form = useForm<z.infer<typeof energyTypeSchema>>({
    resolver: zodResolver(energyTypeSchema),
    defaultValues: initialData
      ? {
          type_name: initialData.type_name,
          unit_of_measurement: initialData.unit_of_measurement,
          is_active: initialData.is_active,
        }
      : {
          type_name: "",
          unit_of_measurement: "",
          is_active: true,
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type_name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nama Jenis Energi</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Listrik, Air, BBM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit_of_measurement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan Ukur</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: kWh, m³, Liter" {...field} />
                </FormControl>
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
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label htmlFor="is_active">
                    {field.value ? "Aktif" : "Non-Aktif"}
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export const createEnergyTypeColumns = (
  onEdit: (energyType: EnergyType) => void,
  onDelete: (energyType: EnergyType) => void
): ColumnDef<EnergyType>[] => [
  { accessorKey: "type_name", header: "Nama Jenis Energi" },
  { accessorKey: "unit_of_measurement", header: "Satuan Ukur" },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Aktif" : "Non-Aktif"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
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

export const TypeEnergyManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEnergyType, setEditingEnergyType] = useState<EnergyType | null>(
    null
  );
  const [energyTypeToDelete, setEnergyTypeToDelete] =
    useState<EnergyType | null>(null);

  const {
    data: energyTypesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: masterData.energyType.getAll,
  });

  const { mutate: createOrUpdateEnergyType, isPending: isMutating } =
    useMutation({
      mutationFn: (energyTypeData: z.infer<typeof energyTypeSchema>) => {
        const id = editingEnergyType
          ? editingEnergyType.energy_type_id
          : undefined;
        return id
          ? masterData.energyType.update(id, energyTypeData)
          : masterData.energyType.create(energyTypeData);
      },
      onSuccess: () => {
        toast.success(
          `Jenis energi berhasil ${
            editingEnergyType ? "diperbarui" : "disimpan"
          }!`
        );
        queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
        setIsFormOpen(false);
        setEditingEnergyType(null);
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.status?.message || "Terjadi kesalahan";
        toast.error(`Gagal: ${message}`);
      },
    });

  const { mutate: deleteEnergyType, isPending: isDeleting } = useMutation({
    mutationFn: (energyType: EnergyType) =>
      masterData.energyType.delete(energyType.energy_type_id),
    onSuccess: () => {
      toast.success("Jenis energi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["energyTypes"] });
      setEnergyTypeToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  const handleEdit = (energyType: EnergyType) => {
    setEditingEnergyType(energyType);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (energyType: EnergyType) => {
    setEnergyTypeToDelete(energyType);
  };

  const columns = createEnergyTypeColumns(handleEdit, handleDeleteRequest);

  // Menangani kasus di mana data mungkin tidak terstruktur seperti yang diharapkan
  const energyTypes = Array.isArray(energyTypesResponse?.data)
    ? energyTypesResponse.data
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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
              if (!isOpen) setEditingEnergyType(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEnergyType(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jenis Energi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEnergyType
                    ? "Edit Jenis Energi"
                    : "Tambah Jenis Energi Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail jenis energi di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <EnergyTypeForm
                initialData={editingEnergyType}
                onSubmit={createOrUpdateEnergyType}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={energyTypes}
          isLoading={isLoading}
          filterColumnId="type_name"
          filterPlaceholder="Cari nama jenis energi..."
        />
      </CardContent>
      <AlertDialog
        open={!!energyTypeToDelete}
        onOpenChange={() => setEnergyTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus jenis energi{" "}
              <span className="font-bold">{energyTypeToDelete?.type_name}</span>
              . Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEnergyType(energyTypeToDelete!)}
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
