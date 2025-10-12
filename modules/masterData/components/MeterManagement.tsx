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
import {
  getTariffGroupsApi,
  TariffGroup,
} from "@/services/tariffGroup.service";
import { getEnergyTypesApi, EnergyType } from "@/services/energyType.service";
import { masterData } from "@/services/masterData.service";
import { getCategoryApi } from "@/services/category.service";
import { DataTable } from "@/modules/UserManagement/components/DataTable";

export type MeterType = {
  meter_id: number;
  meter_code: string;
  status: "Active" | "Inactive" | "UnderMaintenance" | "DELETED";
  energy_type_id: number;
  category_id: number;
  tariff_group_id: number;
  category: {
    category_id: number;
    name: string;
  };
  tariff_group: {
    tariff_group_id: number;
    group_code: string;
    faktor_kali: number;
  };
  energy_type: EnergyType;
};

// Skema validasi Zod untuk form meter
const meterSchema = z.object({
  meter_code: z.string().min(1, "Kode meter wajib diisi."),
  status: z.enum(["Active", "Inactive", "UnderMaintenance", "DELETED"]),
  category_id: z.coerce.number().min(1, "Kategori wajib dipilih."),
  tariff_group_id: z.coerce.number().min(1, "Golongan tarif wajib dipilih."),
  energy_type_id: z.coerce.number().min(1, "Jenis energi wajib dipilih."),
});

export const MeterForm = ({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: MeterType | null;
  onSubmit: (values: z.infer<typeof meterSchema>) => void;
  isLoading?: boolean;
}) => {
  const form = useForm<z.infer<typeof meterSchema>>({
    resolver: zodResolver(meterSchema),
    defaultValues: initialData
      ? {
          meter_code: initialData.meter_code,
          status: initialData.status,
          category_id: initialData.category_id,
          tariff_group_id: initialData.tariff_group_id,
          energy_type_id: initialData.energy_type_id,
        }
      : {
          meter_code: "",
          status: "Active",
          category_id: undefined,
          tariff_group_id: undefined,
        },
  });

  const { data: energyTypesResponse, isLoading: isLoadingEnergyTypes } =
    useQuery({
      queryKey: ["energyTypes"],
      queryFn: () => getEnergyTypesApi(),
    });
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery(
    {
      queryKey: ["meterCategories"],
      queryFn: getCategoryApi,
    }
  );
  const { data: tariffGroupsResponse, isLoading: isLoadingTariffGroups } =
    useQuery({
      queryKey: ["tariffGroups"],
      queryFn: getTariffGroupsApi,
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="meter_code"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Kode Meter</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: MTR-GDU-01" {...field} />
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
                    {energyTypesResponse?.data?.map((et: any) => (
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
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Aktif</SelectItem>
                    <SelectItem value="Inactive">Non-Aktif</SelectItem>
                    <SelectItem value="UnderMaintenance">
                      Dalam Perbaikan
                    </SelectItem>
                    <SelectItem value="DELETED">Dihapus</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ? String(field.value) : ""}
                  disabled={isLoadingCategories}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingCategories ? "Memuat..." : "Pilih Kategori"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesResponse?.data?.map((cat: any) => (
                      <SelectItem
                        key={cat.category_id}
                        value={String(cat.category_id)}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tariff_group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Golongan Tarif</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ? String(field.value) : ""}
                  disabled={isLoadingTariffGroups}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingTariffGroups ? "Memuat..." : "Pilih Golongan"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tariffGroupsResponse?.data?.map((tg: any) => (
                      <SelectItem
                        key={tg.tariff_group_id}
                        value={String(tg.tariff_group_id)}
                      >
                        {tg.group_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export const createMeterColumns = (
  onEdit: (meter: MeterType) => void,
  onDelete: (meter: MeterType) => void
): ColumnDef<MeterType>[] => [
  { accessorKey: "meter_code", header: "Kode Meter" },
  { accessorKey: "category.name", header: "Lokasi" },
  { accessorKey: "energy_type.type_name", header: "Energi" },
  { accessorKey: "tariff_group.group_code", header: "Golongan" },
  { accessorKey: "tariff_group.faktor_kali", header: "Faktor Kali" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === "Active"
          ? "default"
          : status === "Inactive"
          ? "secondary"
          : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
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

export const MeterManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<MeterType | null>(null);
  const [meterToDelete, setMeterToDelete] = useState<MeterType | null>(null);

  const {
    data: metersResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["meters"],
    queryFn: masterData.meter.getAll,
  });

  const { mutate: createOrUpdateMeter, isPending: isMutating } = useMutation({
    mutationFn: (meterData: z.infer<typeof meterSchema>) => {
      const id = editingMeter ? editingMeter.meter_id : undefined;
      return id
        ? masterData.meter.update(id, meterData)
        : masterData.meter.create(meterData);
    },
    onSuccess: () => {
      toast.success(
        `Data meter berhasil ${editingMeter ? "diperbarui" : "disimpan"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setIsFormOpen(false);
      setEditingMeter(null);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.status?.message || "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteMeter, isPending: isDeleting } = useMutation({
    mutationFn: (meter: MeterType) => masterData.meter.delete(meter.meter_id),
    onSuccess: () => {
      toast.success("Meter berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      setMeterToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  const handleEdit = (meter: MeterType) => {
    setEditingMeter(meter);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (meter: MeterType) => {
    setMeterToDelete(meter);
  };

  const columns = createMeterColumns(handleEdit, handleDeleteRequest);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Daftar Meter</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data meter di sistem.
            </CardDescription>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingMeter(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingMeter(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Meter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMeter ? "Edit Meter" : "Tambah Meter Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail meter di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <MeterForm
                initialData={editingMeter}
                onSubmit={createOrUpdateMeter}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={metersResponse?.data || []}
          isLoading={isLoading}
          filterColumnId="meter_code"
          filterPlaceholder="Cari kode meter..."
        />
      </CardContent>
      <AlertDialog
        open={!!meterToDelete}
        onOpenChange={() => setMeterToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus meter{" "}
              <span className="font-bold">{meterToDelete?.meter_code}</span>.
              Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMeter(meterToDelete!)}
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
