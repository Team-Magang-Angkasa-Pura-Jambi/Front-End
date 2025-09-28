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

export type ReadingType = {
  reading_type_id: number;
  type_name: string;
};

const readingTypeSchema = z.object({
  type_name: z.string().min(1, "Nama tipe tidak boleh kosong."),
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
    defaultValues: initialData || { type_name: "" },
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
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export const createReadingTypeColumns = (
  onEdit: (item: ReadingType) => void,
  onDelete: (item: ReadingType) => void
): ColumnDef<ReadingType>[] => [
  { accessorKey: "type_name", header: "Nama Tipe" },
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
