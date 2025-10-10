"use client";

import React, { useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Asumsi service dan tipe ini ada di path yang benar

import { useAuthStore } from "@/stores/authStore";
import {
  createReadingSessionApi,
  ReadingSessionWithDetails,
  updateReadingSessionApi,
} from "@/services/readingSession.service";
import { getEnergyTypesApi } from "@/services/energyType.service";
import { ReadingPayload } from "@/services/readings.service";

// --- Skema Validasi Form ---
const detailSchema = z.object({
  reading_type_id: z.number(), // ID akan berupa angka
  value: z.coerce.number().min(0, "Nilai tidak boleh negatif."),
});

const formSchema = z.object({
  meter_id: z.coerce
    .number({ error: "Meteran wajib dipilih." })
    .min(1, "Meteran wajib dipilih."),
  reading_date: z.date({ error: "Tanggal pembacaan wajib diisi." }),
  details: z
    .array(detailSchema)
    .min(1, "Minimal harus ada satu detail pembacaan."),
});

type FormValues = z.infer<typeof formSchema>;

// --- Tipe Props ---
interface ReadingFormProps {
  initialData?: ReadingSessionWithDetails | null;
  onSuccess?: () => void;
}

// --- Komponen Utama ---
export function ReadingForm({ initialData, onSuccess }: ReadingFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canChangeDate = user?.role === "Admin" || user?.role === "SuperAdmin";
  const isEditMode = !!initialData;

  // PERBAIKAN: Nilai default diatur oleh useEffect untuk keandalan yang lebih baik
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Gunakan `replace` untuk mengganti seluruh array, lebih aman saat reset
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "details",
  });

  // Tentukan energyType berdasarkan initialData (mode edit) atau default 'Electricity' (mode tambah)
  const energyType = useMemo(
    () => initialData?.meter.energy_type?.type_name || "Electricity",
    [initialData, isEditMode]
  );

  // --- Pengambilan Data untuk Dropdown (HANYA di mode Tambah Baru) ---
  const { data: energyTypeDetails, isLoading: isLoadingMeters } = useQuery<
    EnergyTypeDetails,
    Error
  >({
    queryKey: ["energyTypeDetailsForForm", energyType],
    queryFn: () => getEnergyTypesApi(energyType as any),
    enabled: !isEditMode, // Query ini hanya berjalan jika BUKAN mode edit
  });

  const meters = useMemo(
    () => energyTypeDetails?.meters || [],
    [energyTypeDetails]
  );

  // "Awasi" perubahan pada form untuk memicu update UI
  const selectedMeterId = useWatch({ control: form.control, name: "meter_id" });

  // Tentukan meteran yang dipilih, baik dari data awal (edit) atau pilihan dropdown (tambah)
  const selectedMeter = useMemo(() => {
    if (isEditMode) return initialData.meter;
    return meters.find((m) => m.meter_id === selectedMeterId);
  }, [selectedMeterId, meters, isEditMode, initialData]);

  // --- Efek untuk Mengisi Form ---
  useEffect(() => {
    if (initialData) {
      // MODE EDIT: Isi form dengan data yang ada dari `initialData`
      form.reset({
        meter_id: initialData.meter.meter_id,
        reading_date: new Date(initialData.reading_date),
        details: initialData.details.map((d) => ({
          reading_type_id: d.reading_type.reading_type_id,
          value: d.value,
        })),
      });
    } else {
      // MODE TAMBAH: Atur nilai default
      form.reset({
        meter_id: undefined,
        reading_date: new Date(),
        details: [],
      });
    }
  }, [initialData, form.reset]);

  // Efek untuk mengisi detail secara dinamis saat meter dipilih (HANYA di mode Tambah Baru)
  useEffect(() => {
    if (isEditMode || !selectedMeter) return;

    const newDetails = selectedMeter.allowed_reading_types.map((rt) => ({
      reading_type_id: rt.reading_type_id, // ID sudah number
      value: undefined as any, // Dikosongkan untuk input pengguna
    }));
    replace(newDetails); // `replace` lebih aman daripada `setValue` untuk field array
  }, [selectedMeter, isEditMode, replace]);

  // --- Mutasi Data (Submit) ---
  const { mutate, isPending } = useMutation({
    mutationFn: (readingData: ReadingPayload) => {
      if (isEditMode) {
        return updateReadingSessionApi(
          initialData!.reading_session_id,
          readingData
        );
      }
      return createReadingSessionApi(readingData);
    },
    onSuccess: () => {
      toast.success("Data berhasil disimpan!");
      // Invalidate query untuk memuat ulang data tabel
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      // Panggil callback onSuccess untuk menutup dialog
      onSuccess?.();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Terjadi kesalahan tidak terduga.";
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: ReadingPayload = {
      ...values,
      reading_date: values.reading_date.toISOString(),
    };
    mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="meter_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meteran</FormLabel>
                {isEditMode ? (
                  // Tampilan di mode Edit (input statis)
                  <Input value={initialData?.meter.meter_code} disabled />
                ) : (
                  // Tampilan di mode Tambah (dropdown)
                  <Select
                    onValueChange={field.onChange}
                    value={String(field.value ?? "")}
                    disabled={isLoadingMeters}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingMeters
                              ? "Memuat meteran..."
                              : "Pilih Meteran"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {meters.map((meter) => (
                          <SelectItem
                            key={meter.meter_id}
                            value={String(meter.meter_id)}
                          >
                            {meter.meter_code} ({meter.category.name})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reading_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Pembacaan</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!canChangeDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <hr className="my-4 border-dashed" />

        <div className="space-y-4">
          {fields.length > 0 ? (
            fields.map((field, index) => {
              const readingType = isEditMode
                ? initialData?.details.find(
                    (d) =>
                      d.reading_type.reading_type_id === field.reading_type_id
                  )?.reading_type
                : selectedMeter?.allowed_reading_types.find(
                    (rt) => rt.reading_type_id === field.reading_type_id
                  );

              return (
                <div key={field.id}>
                  <FormField
                    control={form.control}
                    name={`details.${index}.value`}
                    render={({ field: valueField }) => (
                      <FormItem>
                        <FormLabel>
                          {readingType?.type_name || `Nilai Bacaan`} (
                          {selectedMeter?.energy_type?.unit_of_measurement ||
                            "..."}
                          )
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...valueField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isEditMode
                ? "Memuat detail..."
                : "Pilih meteran untuk menampilkan field pembacaan."}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
