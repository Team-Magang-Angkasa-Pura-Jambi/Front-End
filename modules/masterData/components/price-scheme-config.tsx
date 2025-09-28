"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// === Type dari backend ===
export type CreatePriceSchemeBody = {
  scheme_name: string;
  effective_date: Date;
  is_active: boolean;
  energy_type_id: number;
};

// === Schema untuk validasi form ===
const priceSchemeSchema = z.object({
  scheme_name: z.string().min(1, "Nama skema tidak boleh kosong."),
  effective_date: z.date({
    errorMap: () => ({ message: "Tanggal wajib diisi" }),
  }),
  is_active: z.boolean().default(true),
  energy_type_id: z.number().min(1, "Pilih jenis energi"),
});

interface PriceSchemeFormProps {
  initialData?: CreatePriceSchemeBody | null;
  onSubmit: (values: CreatePriceSchemeBody) => void;
  isLoading?: boolean;
}

export function PriceSchemeForm({
  initialData,
  onSubmit,
  isLoading,
}: PriceSchemeFormProps) {
  const form = useForm<CreatePriceSchemeBody>({
    resolver: zodResolver(priceSchemeSchema),
    defaultValues: initialData ?? {
      scheme_name: "",
      effective_date: new Date(),
      is_active: true,
      energy_type_id: 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nama Skema */}
        <FormField
          control={form.control}
          name="scheme_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Skema Harga</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Tarif Listrik 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tanggal Efektif */}
        <FormField
          control={form.control}
          name="effective_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Efektif</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Jenis Energi */}
        <FormField
          control={form.control}
          name="energy_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Energi</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Masukkan ID jenis energi"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Aktif */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <select
                className="border rounded px-3 py-2"
                value={field.value ? "true" : "false"}
                onChange={(e) => field.onChange(e.target.value === "true")}
              >
                <option value="true">Aktif</option>
                <option value="false">Non-Aktif</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tombol Submit */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export const createPriceSchemeColumns = (
  onEdit: (item: CreatePriceSchemeBody) => void,
  onDelete: (item: CreatePriceSchemeBody) => void
): ColumnDef<CreatePriceSchemeBody>[] => [
  { accessorKey: "scheme_name", header: "Nama Skema" },
  {
    accessorKey: "effective_date",
    header: "Tanggal Efektif",
    cell: ({ row }) =>
      format(new Date(row.original.effective_date), "dd MMMM yyyy"),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={
          row.original.is_active
            ? "text-green-600 font-semibold"
            : "text-gray-400 italic"
        }
      >
        {row.original.is_active ? "Aktif" : "Non-Aktif"}
      </span>
    ),
  },
  {
    accessorKey: "energy_type_id",
    header: "Jenis Energi",
    cell: ({ row }) => `ID ${row.original.energy_type_id}`,
  },
  {
    id: "actions",
    header: "Aksi",
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
