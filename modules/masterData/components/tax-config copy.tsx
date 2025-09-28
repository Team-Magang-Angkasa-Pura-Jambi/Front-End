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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- DIUBAH: Tipe Data untuk Pajak (Tax) ---
export type Tax = {
  tax_id: number;
  tax_name: string;
  rate: number; // Disimpan sebagai desimal, misal 0.11 untuk 11%
  is_active: boolean;
};

// --- DIUBAH: Skema Validasi untuk Form Pajak ---
const taxSchema = z.object({
  tax_name: z.string().min(3, "Nama pajak minimal 3 karakter."),
  rate: z.coerce
    .number()
    .min(0, "Tarif tidak boleh negatif.")
    .max(1, "Tarif maksimal adalah 1 (100%)."),
});

type TaxFormData = z.infer<typeof taxSchema>;

// --- DIUBAH: Props Komponen untuk Form Pajak ---
interface TaxFormProps {
  initialData?: Tax | null;
  onSubmit: (values: TaxFormData) => void;
  isLoading?: boolean;
}

// --- DIUBAH: Komponen Form Pajak ---
export function TaxForm({ initialData, onSubmit, isLoading }: TaxFormProps) {
  const form = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: initialData
      ? {
          tax_name: initialData.tax_name,
          rate: initialData.rate,
        }
      : {
          tax_name: "",
          rate: 0.11, // Contoh nilai default
        },
  });

  // CATATAN: useQuery untuk data eksternal tidak lagi diperlukan di form ini.

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* BARU: Field untuk Nama Pajak */}
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

        {/* BARU: Field untuk Tarif Pajak */}
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

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// --- DIUBAH: Definisi Kolom DataTable untuk Pajak ---
export const createTaxColumns = (
  onEdit: (item: Tax) => void,
  onDelete: (item: Tax) => void
): ColumnDef<Tax>[] => [
  {
    accessorKey: "tax_name",
    header: "Nama Pajak",
  },
  {
    accessorKey: "rate",
    header: "Tarif",
    cell: ({ row }) => {
      const rate = parseFloat(row.getValue("rate"));
      // Format menjadi persentase untuk ditampilkan
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "percent",
        minimumFractionDigits: 2,
      }).format(rate);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Aktif" : "Tidak Aktif"}
        </Badge>
      );
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
