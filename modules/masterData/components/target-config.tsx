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

export type EfficiencyTarget = {
  target_id: number;
  kpi_name: string;
  target_value: number;
  period_start: Date;
  period_end: Date;
};

const targetSchema = z.object({
  kpi_name: z.string().min(1, "Nama KPI tidak boleh kosong."),
  target_value: z.coerce.number().positive("Nilai target harus angka positif."),
  period_start: z.date({ required_error: "Tanggal mulai harus diisi." }),
  period_end: z.date({ required_error: "Tanggal berakhir harus diisi." }),
});

interface TargetFormProps {
  initialData?: EfficiencyTarget | null;
  onSubmit: (values: z.infer<typeof targetSchema>) => void;
  isLoading?: boolean;
}

export function EfficiencyTargetForm({
  initialData,
  onSubmit,
  isLoading,
}: TargetFormProps) {
  const form = useForm<z.infer<typeof targetSchema>>({
    resolver: zodResolver(targetSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          period_start: new Date(initialData.period_start),
          period_end: new Date(initialData.period_end),
        }
      : { kpi_name: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="kpi_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama KPI</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Konsumsi per Pax" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nilai Target</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Contoh: 1.5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="period_start"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Periode Mulai</FormLabel>
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
        <FormField
          control={form.control}
          name="period_end"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Periode Berakhir</FormLabel>
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
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export const createEfficiencyTargetColumns = (
  onEdit: (item: EfficiencyTarget) => void,
  onDelete: (item: EfficiencyTarget) => void
): ColumnDef<EfficiencyTarget>[] => [
  { accessorKey: "kpi_name", header: "Nama KPI" },
  { accessorKey: "target_value", header: "Nilai Target" },
  {
    accessorKey: "period_start",
    header: "Periode Mulai",
    cell: ({ row }) =>
      format(new Date(row.original.period_start), "dd MMMM yyyy"),
  },
  {
    accessorKey: "period_end",
    header: "Periode Berakhir",
    cell: ({ row }) =>
      format(new Date(row.original.period_end), "dd MMMM yyyy"),
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
