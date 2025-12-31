import { Loader2, MoreHorizontal, PlusCircle, XCircleIcon } from "lucide-react";
import React, { useState } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { getMetersApi, MeterType } from "@/services/meter.service";
import { EnergyType, getEnergyTypesApi } from "@/services/energyType.service";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { MultiSelect, Option } from "@/components/ui/MultiSelect";
import { TariffGroup } from "./TariffGroupManagement";
import { ReadingType } from "./ReadingTypeManagements";

export type ReadingType = {
  reading_type_id: number;
  type_name: string;
  reading_unit: string;
};

export type Rate = {
  rate_id: number;
  value: string;
  reading_type_id: number;
  reading_type?: ReadingType;
};

export type PriceScheme = {
  scheme_id: number;
  scheme_name: string;
  effective_date: string;
  is_active: boolean;
  tariff_group_id: number;
  tariff_group: TariffGroup;
  rates: Rate[];
  taxes?: { tax_id: number; tax_name: string }[];
};

const priceSchemeSchema = z.object({
  scheme_name: z.string().min(1, "Nama skema tidak boleh kosong."),
  effective_date: z.coerce.date({
    error: "Tanggal efektif wajib diisi.",
  }),
  is_active: z.boolean().optional().default(true),
  tariff_group_id: z.coerce
    .number()
    .int()
    .positive("Golongan tarif wajib dipilih."),
  rates: z
    .array(
      z.object({
        reading_type_id: z.coerce
          .number()
          .int()
          .positive("Jenis pembacaan wajib dipilih."),
        value: z.coerce.number(),
      })
    )
    .min(1, "Minimal harus ada satu tarif.")
    .refine(
      (items) =>
        new Set(items.map((i) => i.reading_type_id)).size === items.length,
      { message: "Setiap jenis pembacaan hanya boleh memiliki satu tarif." }
    ),
  tax_ids: z.array(z.coerce.number()).optional(),
});

interface PriceSchemeFormProps {
  initialData?: PriceScheme | null;
  readingTypes: ReadingType[];
  taxes: { tax_id: number; tax_name: string }[];
  onSubmit: (values: z.infer<typeof priceSchemeSchema>) => void;
  isLoading?: boolean;
}

export function PriceSchemeForm({
  initialData,
  onSubmit,
  readingTypes,
  taxes,
  isLoading,
}: PriceSchemeFormProps) {
  const form = useForm<z.infer<typeof priceSchemeSchema>>({
    resolver: zodResolver(priceSchemeSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          effective_date: new Date(initialData.effective_date),
          rates: initialData.rates.map((r) => ({
            reading_type_id: r.reading_type_id,
            value: parseFloat(r.value),
          })),
          tax_ids: initialData.taxes?.map((t) => t.tax_id) || [],
        }
      : {
          scheme_name: "",
          effective_date: new Date(),
          is_active: true,
          tariff_group_id: undefined,
          rates: [{ reading_type_id: undefined, value: undefined }],
          tax_ids: [],
        },
  });

  const { data: tariffGroupsResponse, isLoading: isLoadingTariffGroups } =
    useQuery({
      queryKey: ["tariffGroups"],
      queryFn: masterData.tariffGroup.getAll,
    });

  const { data: taxesResponse, isLoading: isLoadingTaxes } = useQuery({
    queryKey: ["taxes"],
    queryFn: masterData.tax.getAll,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rates",
  });

  const tariffGroups = tariffGroupsResponse?.data || [];
  const allTaxes = taxesResponse?.data || [];

  return (
    <Form {...form}>
      <form
        id="price-scheme-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="scheme_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Skema</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Tarif Dasar 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                        "w-full pl-3 text-left font-normal",
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
                        isLoadingTariffGroups
                          ? "Memuat golongan..."
                          : "Pilih Golongan Tarif"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tariffGroups.map((tg: TariffGroup) => (
                    <SelectItem
                      key={tg.tariff_group_id}
                      value={String(tg.tariff_group_id)}
                    >
                      {tg.group_code} - {tg.group_name}
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
          name="tax_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pajak yang Berlaku</FormLabel>
              <MultiSelect
                options={allTaxes.map((tax: any) => ({
                  value: String(tax.tax_id),
                  label: tax.tax_name,
                }))}
                selected={field.value?.map(String) || []}
                onChange={(selectedValues) => {
                  field.onChange(selectedValues.map(Number));
                }}
                className="w-full"
                placeholder={
                  isLoadingTaxes ? "Memuat pajak..." : "Pilih pajak..."
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <hr className="my-4 border-dashed" />

        <div>
          <h3 className="text-md font-medium mb-3">Detail Tarif</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-x-2 gap-y-4 items-start p-3 border rounded-md"
              >
                <div className="col-span-12 sm:col-span-5">
                  <FormField
                    control={form.control}
                    name={`rates.${index}.reading_type_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">
                          Jenis Pembacaan
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis Pembacaan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {readingTypes.map((rt) => (
                              <SelectItem
                                key={rt.reading_type_id}
                                value={String(rt.reading_type_id)}
                              >
                                {rt.type_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <FormField
                    control={form.control}
                    name={`rates.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Nilai Tarif</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nilai Tarif (Rp)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 sm:col-span-1 flex items-center justify-end">
                  {fields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <XCircleIcon className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ reading_type_id: 0, value: 0 })}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Tarif
        </Button>
      </form>
      <DialogFooter className="pt-4">
        <Button type="submit" form="price-scheme-form" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </Form>
  );
}

const getReadingTypeName = (id: number, readingTypes: ReadingType[]) => {
  const type = readingTypes.find((rt) => rt.reading_type_id === id);
  return type ? type.type_name : `ID ${id}`;
};

const getTaxNames = (taxIds: number[] = [], allTaxes: any[] = []) => {
  if (!taxIds || taxIds.length === 0) return "-";
  return taxIds
    .map((id) => {
      const tax = allTaxes.find((t) => t.tax_id === id);
      return tax ? tax.tax_name : null;
    })
    .filter(Boolean)
    .join(", ");
};

export const createPriceSchemeColumns = (
  onEdit: (item: PriceScheme) => void,
  onDelete: (item: PriceScheme) => void,
  readingTypes: ReadingType[] = []
): ColumnDef<PriceScheme>[] => [
  { accessorKey: "scheme_name", header: "Nama Skema" },
  { accessorKey: "tariff_group.group_code", header: "Golongan Tarif" },
  {
    accessorKey: "effective_date",
    header: "Tanggal Efektif",
    cell: ({ row }) =>
      format(new Date(row.original.effective_date), "dd MMMM yyyy"),
  },
  {
    accessorKey: "rates",
    header: "Tarif (Rp)",
    cell: ({ row }) => {
      const rates = row.original.rates;
      if (!rates || rates.length === 0) return "-";

      return (
        <div className="flex flex-col gap-1">
          {rates.map((rate) => (
            <div
              key={rate.rate_id}
              className="flex justify-between text-xs gap-2"
            >
              <span className="text-muted-foreground">
                {getReadingTypeName(rate.reading_type_id, readingTypes)}:
              </span>
              <span className="font-mono whitespace-nowrap">
                {new Intl.NumberFormat("id-ID").format(parseFloat(rate.value))}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "taxes.tax.tax_name",
    header: "Pajak",
    cell: ({ row }) => {
      const taxes = row.original.taxes;
      if (!taxes || taxes.length === 0) return "-";
      return (
        <div className="flex flex-col flex-wrap gap-1">
            {taxes.map((item) => (
              <Badge key={item?.tax?.tax_id} variant="outline">
                {item?.tax?.tax_name} (
                {new Intl.NumberFormat("id-ID", {
                  style: "percent",
                  minimumFractionDigits: 0,
                }).format(parseFloat(item?.tax?.rate))}
                )
              </Badge>
            ))}
        </div>
      );
    },
  },

  {
    header: "actions",
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

export const SchemePriceManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<PriceScheme | null>(null);
  const [schemeToDelete, setSchemeToDelete] = useState<PriceScheme | null>(
    null
  );

  const {
    data: schemesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["priceSchemes"],
    queryFn: masterData.priceScheme.getAll,
  });

  const { data: readingTypesResponse } = useQuery({
    queryKey: ["readingTypes"],
    queryFn: masterData.readingType.getAll,
  });

  const { data: taxesResponse } = useQuery({
    queryKey: ["taxes"],
    queryFn: masterData.tax.getAll,
  });

  const { mutate: createOrUpdateScheme, isPending: isMutating } = useMutation({
    mutationFn: (schemeData: z.infer<typeof priceSchemeSchema>) => {
      const id = editingScheme ? editingScheme.scheme_id : undefined;
      return id
        ? masterData.priceScheme.update(id, schemeData)
        : masterData.priceScheme.create(schemeData);
    },
    onSuccess: () => {
      toast.success(
        `Skema harga berhasil ${editingScheme ? "diperbarui" : "disimpan"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["priceSchemes"] });
      setIsFormOpen(false);
      setEditingScheme(null);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.status?.message || "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteScheme, isPending: isDeleting } = useMutation({
    mutationFn: (scheme: PriceScheme) =>
      masterData.priceScheme.delete(scheme.scheme_id),
    onSuccess: () => {
      toast.success("Skema harga berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["priceSchemes"] });
      setSchemeToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  const handleEdit = (scheme: PriceScheme) => {
    setEditingScheme(scheme);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (scheme: PriceScheme) => {
    setSchemeToDelete(scheme);
  };

  const readingTypes = readingTypesResponse?.data || [];
  const allTaxes = taxesResponse?.data || [];
  const columns = createPriceSchemeColumns(
    handleEdit,
    handleDeleteRequest,
    readingTypes,
    allTaxes
  );

  const schemes = Array.isArray(schemesResponse?.data)
    ? schemesResponse.data
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Manajemen Skema Harga</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data skema harga di sistem.
            </CardDescription>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingScheme(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingScheme(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Skema
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingScheme
                    ? "Edit Skema Harga"
                    : "Tambah Skema Harga Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail skema harga di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <PriceSchemeForm
                initialData={editingScheme}
                onSubmit={createOrUpdateScheme}
                isLoading={isMutating}
                readingTypes={readingTypes}
                taxes={allTaxes}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={schemes}
          isLoading={isLoading}
          filterColumnId="scheme_name"
          filterPlaceholder="Cari nama skema..."
        />
      </CardContent>
      <AlertDialog
        open={!!schemeToDelete}
        onOpenChange={() => setSchemeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus skema harga{" "}
              <span className="font-bold">{schemeToDelete?.scheme_name}</span>.
              Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteScheme(schemeToDelete!)}
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
