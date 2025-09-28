"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnergyType } from "../types";
import { getMeterCategoriesApi } from "@/services/meterCategory.service";

type Category = {
  category_id: number;
  name: string;
};

export type MeterWithRelations = {
  meter_id: number;
  category: Category;
  status: "Active" | "UnderMaintenance" | "Inactive" | "DELETED";
  energy_type: EnergyType;
};

const meterSchema = z.object({
  meter_code: z.string().min(1, "Kode meter tidak boleh kosong."),
  category_id: z.coerce.number().min(1, "Kategori harus dipilih."),
  status: z.enum(["Active", "UnderMaintenance", "Inactive", "DELETED"]),
});

type MeterFormData = z.infer<typeof meterSchema>;

interface MeterFormProps {
  initialData?: MeterWithRelations | null;
  onSubmit: (values: MeterFormData) => void;
  isLoading?: boolean;
}

export function MeterForm({
  initialData,
  onSubmit,
  isLoading,
}: MeterFormProps) {
  const form = useForm<MeterFormData>({
    resolver: zodResolver(meterSchema),
    defaultValues: initialData
      ? {
          meter_code: initialData.meter_code,
          category_id: initialData.category.category_id,
          status: initialData.status,
        }
      : {
          meter_code: "",
          category_id: undefined,
          status: "Active",
        },
  });

  const { data: meterCategories = [], isLoading: isLoadingCategories } =
    useQuery({
      queryKey: ["meterCategories"],
      queryFn: getMeterCategoriesApi,
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="meter_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Meter</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: MTR-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DIUBAH: FormField untuk kategori sekarang sudah benar */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Lokasi</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ? String(field.value) : ""}
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
                  {meterCategories.data?.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={String(category.category_id)}
                    >
                      {category.name}
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Aktif</SelectItem>
                  <SelectItem value="UnderMaintenance">
                    Dalam Perbaikan
                  </SelectItem>
                  <SelectItem value="Inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="DELETED">Dihapus</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export const createMeterColumns = (
  onEdit: (item: MeterWithRelations) => void,
  onDelete: (item: MeterWithRelations) => void
): ColumnDef<MeterWithRelations>[] => [
  { accessorKey: "meter_code", header: "Kode Meter" },

  { accessorKey: "category.name", header: "Lokasi" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === "Active"
          ? "default"
          : status === "DELETED"
          ? "destructive"
          : "secondary";
      return <Badge variant={variant}>{status}</Badge>;
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
