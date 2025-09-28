"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- DIUBAH: Tipe Data disederhanakan hanya untuk Kategori ---
export type MeterCategory = {
  category_id: number;
  name: string;
};

// --- DIUBAH: Skema Validasi sekarang untuk Kategori ---
const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter."),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// --- DIUBAH: Props Komponen disesuaikan untuk Form Kategori ---
interface MeterCategoryFormProps {
  initialData?: MeterCategory | null;
  onSubmit: (values: CategoryFormData) => void;
  isLoading?: boolean;
}

// --- DIUBAH: Komponen Form sekarang benar-benar untuk Kategori ---
export function MeterCategoryForm({
  initialData,
  onSubmit,
  isLoading,
}: MeterCategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
    },
  });

  // CATATAN: `useQuery` tidak diperlukan di sini karena form ini
  // tidak bergantung pada daftar data eksternal.

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* BARU: Field tunggal untuk nama kategori */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Listrik Terminal" {...field} />
              </FormControl>
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

// --- DIUBAH: Definisi Kolom DataTable untuk Kategori ---
export const createMeterCategoryColumns = (
  onEdit: (item: MeterCategory) => void,
  onDelete: (item: MeterCategory) => void
): ColumnDef<MeterCategory>[] => [
  {
    accessorKey: "name",
    header: "Nama Kategori",
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
