import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, useFormContext, useWatch } from "react-hook-form";
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
import { format } from "date-fns-tz";
import { cn } from "@/lib/utils";
import {
  getEfficiencyTargetPreviewApi,
  EfficiencyTargetPreviewPayload,
} from "@/services/analysis.service";
import { Skeleton } from "@/components/ui/skeleton";

export type EfficiencyTarget = {
  target_id: number;
  kpi_name: string;
  target_value: number;
  target_cost: number; // BARU: Tambahkan properti target_cost
  period_start: string;
  period_end: string;
  meter: MeterType;
  energy_type: EnergyType;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    value
  );
const targetEfficiencySchema = z
  .object({
    kpi_name: z.string().min(3, "Nama KPI minimal 3 karakter."),
    target_value: z.coerce
      .number()
      .min(0, "Nilai target tidak boleh negatif.")
      .positive("Nilai target harus angka positif."),
    meter_id: z.coerce.number().int().positive("Meter wajib dipilih."),
    period_start: z.date({ error: "Tanggal mulai wajib diisi." }),
    period_end: z.date({ error: "Tanggal akhir wajib diisi." }),
  })
  .refine((data) => data.period_end >= data.period_start, {
    message: "Tanggal akhir tidak boleh lebih awal dari tanggal mulai.",
    path: ["period_end"],
  });

interface TargetEfficiencyFormProps {
  initialData?: EfficiencyTarget | null;
  onSubmit: (values: z.infer<typeof targetEfficiencySchema>) => void;
  isLoading?: boolean;
}

const TargetEfficiencyPreview = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<z.infer<typeof targetEfficiencySchema>>();

  const watchedFields = useWatch({
    control,
    name: ["meter_id", "target_value", "period_start", "period_end"],
  });

  const debouncedFields = useDebounce(watchedFields, 500);
  const [meter_id, target_value, period_start, period_end] = debouncedFields;

  const hasErrors =
    errors.meter_id ||
    errors.target_value ||
    errors.period_start ||
    errors.period_end;

  const canFetchPreview =
    !hasErrors &&
    meter_id &&
    target_value > 0 &&
    period_start instanceof Date &&
    period_end instanceof Date;

  const {
    data: previewData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "efficiencyTargetPreview",
      meter_id,
      target_value,
      period_start,
      period_end,
    ],
    queryFn: () =>
      getEfficiencyTargetPreviewApi({
        meter_id: Number(meter_id), // Menggunakan snake_case
        target_value: Number(target_value), // Menggunakan snake_case
        period_start: period_start
          ? format(period_start, "yyyy-MM-dd", { timeZone: "UTC" })
          : "",
        period_end: period_end
          ? format(period_end, "yyyy-MM-dd", { timeZone: "UTC" })
          : "",
      }),
    enabled: canFetchPreview,
  });

  const isExceedingBudget =
    previewData?.budget &&
    previewData.preview.estimatedTotalCost > previewData.budget.remainingBudget;

  return (
    <Card className="mt-4 col-span-2 bg-muted/50 border-dashed transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pratinjau Target</CardTitle>
      </CardHeader>
      <CardContent>
        {!canFetchPreview && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Isi semua field untuk melihat pratinjau.
          </p>
        )}
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive">
            Gagal memuat pratinjau. {(error as any)?.response?.data?.message}
          </p>
        )}
        {previewData && !isLoading && !isError && (
          <>
            <div className="flex items-start gap-3">
              {isExceedingBudget ? (
                <AlertTriangle className="h-8 w-8 text-destructive mt-1 shrink-0" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600 mt-1 shrink-0" />
              )}
              <div>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    isExceedingBudget ? "text-destructive" : "text-primary"
                  )}
                >
                  {formatCurrency(previewData.preview.estimatedTotalCost || 0)}
                </p>
                {previewData.budget && (
                  <p className="text-xs text-muted-foreground">
                    Sisa Anggaran Periode Ini:{" "}
                    <strong>
                      {formatCurrency(previewData.budget.remainingBudget)}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Estimasi total biaya berdasarkan target{" "}
              <strong>
                {previewData?.preview?.totalTargetConsumption?.toLocaleString(
                  "id-ID"
                )}{" "}
                {previewData?.calculation?.unitOfMeasurement}
              </strong>{" "}
              selama {previewData?.calculation?.totalDays} hari.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Target harian:{" "}
              {previewData?.preview?.dailyTargetConsumption?.toLocaleString(
                "id-ID"
              )}{" "}
              {previewData?.calculation?.unitOfMeasurement}.
            </p>
            {isExceedingBudget && (
              <p className="text-xs text-destructive font-medium mt-1">
                Peringatan: Target yang Anda masukkan melebihi sisa anggaran.
              </p>
            )}
            {previewData.suggestion?.standard && (
              <div className="mt-2 text-xs p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-md">
                <p className="text-blue-800 dark:text-blue-300">
                  {previewData.suggestion.standard.message}
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    setValue(
                      "target_value",
                      Number(
                        previewData.suggestion.standard.suggestedDailyKwh.toFixed(
                          2
                        )
                      )
                    )
                  }
                >
                  <Copy className="mr-1 h-3 w-3" /> Gunakan nilai ini
                </Button>
              </div>
            )}
            {previewData.suggestion?.efficiency && (
              <div className="mt-2 text-xs p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-md">
                <p className="text-green-800 dark:text-green-300">
                  {previewData.suggestion.efficiency.message}
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-green-600 hover:text-green-700"
                  onClick={() =>
                    setValue(
                      "target_value",
                      Number(
                        previewData.suggestion.efficiency.suggestedDailyKwh.toFixed(
                          2
                        )
                      )
                    )
                  }
                >
                  <Copy className="mr-1 h-3 w-3" /> Gunakan nilai ini
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export function TargetEfficiencyForm({
  initialData,
  onSubmit,
  isLoading,
}: TargetEfficiencyFormProps) {
  const form = useForm<z.infer<typeof targetEfficiencySchema>>({
    resolver: zodResolver(targetEfficiencySchema),
    defaultValues: initialData
      ? {
          ...initialData,
          period_start: new Date(initialData.period_start),
          period_end: new Date(initialData.period_end),
          meter_id: initialData?.meter?.meter_id,
        }
      : {
          kpi_name: "",
          target_value: 0,
          period_start: undefined,
          period_end: undefined,
          meter_id: undefined,
        },
  });

  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["allMeters"],
    queryFn: () => getMetersApi(),
  });

  const meters = metersResponse?.data || [];

  const selectedMeterId = form.watch("meter_id");

  return (
    <Form {...form}>
      <form
        id="target-efficiency-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="meter_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meter</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ? String(field.value) : ""}
                disabled={isLoadingMeters}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingMeters ? "Memuat meter..." : "Pilih Meter"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {meters.map((meter) => (
                    <SelectItem
                      key={meter.meter_id}
                      value={String(meter.meter_id)}
                    >
                      {meter.meter_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedMeterId && (
          <>
            <FormField
              control={form.control}
              name="kpi_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama KPI</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Penghematan Listrik Gedung A"
                      {...field}
                    />
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
                  <FormLabel>
                    Nilai Target (
                    {meters.find(
                      (m: MeterType) => m.meter_id == selectedMeterId
                    )?.energy_type?.unit_of_measurement || "%"}
                    )
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                name="period_end"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Periode Selesai</FormLabel>
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
            </div>
          </>
        )}
        <TargetEfficiencyPreview />
      </form>
      <DialogFooter className="pt-4">
        <Button
          type="submit"
          form="target-efficiency-form"
          disabled={isLoading}
        >
          {isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </Form>
  );
}

export const createTargetEfficiencyColumns = (
  onEdit: (item: EfficiencyTarget) => void,
  onDelete: (item: EfficiencyTarget) => void
): ColumnDef<EfficiencyTarget>[] => [
  { accessorKey: "kpi_name", header: "Nama KPI" },
  {
    accessorKey: "target_value",
    header: "Target",
    cell: ({ row }) => {
      const unit = row.original.meter?.energy_type?.unit_of_measurement || "%";
      return `${row.original.target_value} ${unit}`;
    },
  },
  {
    accessorKey: "target_cost",
    header: "Target Rupiah",
    cell: ({ row }) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(row.original.target_cost),
  },
  {
    accessorKey: "meter.meter_code",
    header: "Code Meter",
  },
  {
    accessorKey: "period_start",
    header: "Periode Mulai",
    cell: ({ row }) =>
      format(new Date(row.original.period_start), "dd MMMM yyyy"),
  },
  {
    accessorKey: "period_end",
    header: "Periode Selesai",
    cell: ({ row }) =>
      format(new Date(row.original.period_end), "dd MMMM yyyy"),
  },
  {
    accessorKey: "set_by_user.username",
    header: "Set By",
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

export const TargetEfficiencyManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<EfficiencyTarget | null>(
    null
  );
  const [targetToDelete, setTargetToDelete] = useState<EfficiencyTarget | null>(
    null
  );

  const {
    data: targetsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["efficiencyTargets"],
    queryFn: masterData.efficiencyTarget.getAll,
  });

  const { mutate: createOrUpdateTarget, isPending: isMutating } = useMutation({
    mutationFn: (
      originalTargetData: z.infer<typeof targetEfficiencySchema>
    ) => {
      // Format tanggal sebelum mengirim ke API untuk menghindari masalah timezone
      const targetData = {
        ...originalTargetData,
        period_start: format(originalTargetData.period_start, "yyyy-MM-dd", {
          timeZone: "UTC",
        }),
        period_end: format(originalTargetData.period_end, "yyyy-MM-dd", {
          timeZone: "UTC",
        }),
      };

      const id = editingTarget ? editingTarget.target_id : undefined;
      return id
        ? masterData.efficiencyTarget.update(id, targetData)
        : masterData.efficiencyTarget.create(targetData);
    },
    onSuccess: () => {
      toast.success(
        `Target efisiensi berhasil ${
          editingTarget ? "diperbarui" : "disimpan"
        }!`
      );
      queryClient.invalidateQueries({ queryKey: ["efficiencyTargets"] });
      setIsFormOpen(false);
      setEditingTarget(null);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.status?.message || "Terjadi kesalahan";
      toast.error(`Gagal: ${message}`);
    },
  });

  const { mutate: deleteTarget, isPending: isDeleting } = useMutation({
    mutationFn: (target: EfficiencyTarget) =>
      masterData.efficiencyTarget.delete(target.target_id),
    onSuccess: () => {
      toast.success("Target efisiensi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["efficiencyTargets"] });
      setTargetToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus: ${error.message}`);
    },
  });

  const handleEdit = (target: EfficiencyTarget) => {
    setEditingTarget(target);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (target: EfficiencyTarget) => {
    setTargetToDelete(target);
  };

  const columns = createTargetEfficiencyColumns(
    handleEdit,
    handleDeleteRequest
  );

  const targets = Array.isArray(targetsResponse?.data)
    ? targetsResponse.data
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Manajemen Target Efisiensi</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data target efisiensi di sistem.
            </CardDescription>
          </div>
          <Dialog
            open={isFormOpen}
            onOpenChange={(isOpen) => {
              setIsFormOpen(isOpen);
              if (!isOpen) setEditingTarget(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTarget(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Target
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTarget ? "Edit Target" : "Tambah Target Baru"}
                </DialogTitle>
                <DialogDescription>
                  Isi detail target efisiensi di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <TargetEfficiencyForm
                initialData={editingTarget}
                onSubmit={createOrUpdateTarget}
                isLoading={isMutating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={targets}
          isLoading={isLoading}
          filterColumnId="kpi_name"
          filterPlaceholder="Cari nama KPI..."
        />
      </CardContent>
      <AlertDialog
        open={!!targetToDelete}
        onOpenChange={() => setTargetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menghapus target{" "}
              <span className="font-bold">{targetToDelete?.kpi_name}</span>.
              Data yang terhapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget(targetToDelete!)}
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
