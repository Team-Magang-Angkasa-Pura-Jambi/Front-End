"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  ClipboardPaste,
  Copy,
  History,
  Info,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";

import { ApiErrorResponse } from "@/common/types/api";
import { cn } from "@/lib/utils";
import { getEnergyTypeByIdApi } from "@/modules/masterData/services/energyType.service";
import { getMeterByIdApi } from "@/modules/masterData/services/meter.service";
import { formatToISO } from "@/utils/formatIso";
import { formSchema, FormValues } from "../schemas/reading.schema";
import { getLatestMeterLogApi, submitReadingApi } from "../services";
import { MasterEnergyResponse } from "../types";

interface BaseEnergyReadingFormProps {
  energy_type_id: number;
  onSuccess?: () => void;
}

export const BaseEnergyReadingForm = ({
  energy_type_id,
  onSuccess,
}: BaseEnergyReadingFormProps) => {
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isSubmittingLock = useRef<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      reading: {
        meter_id: undefined,
        reading_date: new Date(),
        details: [{ reading_type_id: undefined, value: 0 }],
        notes: "",
      },
    },
  });

  const { control, watch, setValue, handleSubmit, reset } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "reading.details",
  });

  const { data: energyRes, isLoading: isLoadingMaster } = useQuery<MasterEnergyResponse>({
    queryKey: ["energyMasterData", energy_type_id],
    queryFn: () => getEnergyTypeByIdApi(energy_type_id),
  });

  const master = energyRes?.data;
  const meters = useMemo(() => master?.meters || [], [master]);
  const unit = master?.unit_standard || "...";

  const selectedMeterId = watch("reading.meter_id");
  const detailsValues = watch("reading.details");

  // Fetch detail konfigurasi tipe bacaan untuk meteran terpilih
  const { data: meterRes, isLoading: isLoadingMeterDetail } = useQuery({
    queryKey: ["meterDetail", selectedMeterId],
    queryFn: () => getMeterByIdApi(Number(selectedMeterId)),
    enabled: !!selectedMeterId,
  });

  const readingTypes = useMemo(() => {
    if (!meterRes?.data?.reading_configs) return [];
    return meterRes.data.reading_configs
      .map((config) => config.reading_type)
      .filter((rt): rt is NonNullable<typeof rt> => Boolean(rt));
  }, [meterRes]);

  // Fetch info log terakhir meteran & konsumsi terakhir
  const { data: latestLogRes } = useQuery({
    queryKey: ["latestMeterLog", selectedMeterId],
    queryFn: () => getLatestMeterLogApi(Number(selectedMeterId)),
    enabled: !!selectedMeterId,
    staleTime: 0,
  });

  const latestLog = latestLogRes?.data;

  // UX ENHANCEMENT: Ketika meteran dipilih, inisialisasi baris pembacaan dan tanggal otomatis H+1
  useEffect(() => {
    if (selectedMeterId) {
      if (readingTypes.length > 0) {
        const initialDetails = readingTypes.map((t) => ({
          reading_type_id: t.reading_type_id,
          value: 0,
        }));
        replace(initialDetails);
      } else {
        replace([{ reading_type_id: undefined as unknown as number, value: 0 }]);
      }
    }
  }, [selectedMeterId, readingTypes, replace]);

  // UX ENHANCEMENT: Auto-set tanggal ke Tanggal Terakhir Log + 1 Hari
  useEffect(() => {
    if (latestLog?.suggested_next_date) {
      try {
        const nextDate = new Date(latestLog.suggested_next_date);
        if (!isNaN(nextDate.getTime())) {
          setValue("reading.reading_date", nextDate);
        }
      } catch (err) {
        console.warn("Gagal auto-set tanggal H+1:", err);
      }
    }
  }, [latestLog, setValue]);

  // Mutation Simpan Data dengan Proteksi Race Condition
  const { mutate, isPending } = useMutation({
    mutationFn: submitReadingApi,
    onMutate: () => {
      isSubmittingLock.current = true;
    },
    onSuccess: () => {
      toast.success(`Data pembacaan ${master?.name} berhasil disimpan!`);
      reset();
      isSubmittingLock.current = false;
      queryClient.invalidateQueries({ queryKey: ["readings"] });
      queryClient.invalidateQueries({ queryKey: ["latestMeterLog"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      isSubmittingLock.current = false;
      toast.error(err.response?.data?.status?.message || "Gagal menyimpan data.");
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isPending || isSubmittingLock.current) return;

    mutate({
      reading: {
        meter_id: values.reading.meter_id,
        reading_date: formatToISO(values.reading.reading_date),
        details: values.reading.details,
        notes: values.reading.notes,
      },
    });
  };

  // Helper untuk mencari nilai stand meter terakhir per tipe bacaan
  const getLastStandValue = (readingTypeId?: number): number | undefined => {
    if (!latestLog || !readingTypeId) return undefined;
    const found = latestLog.details?.find((d) => d.reading_type_id === readingTypeId);
    return found ? found.last_value : undefined;
  };

  // Helper untuk menyalin semua angka stand meter terakhir ke seluruh baris form
  const handleCopyAllLastStands = () => {
    if (!latestLog?.details || latestLog.details.length === 0) {
      toast.info("Tidak ada riwayat angka stand sebelumnya untuk disalin.");
      return;
    }

    const updatedDetails = fields.map((f) => {
      const lastVal = getLastStandValue(f.reading_type_id);
      return {
        reading_type_id: f.reading_type_id,
        value: lastVal !== undefined ? lastVal : 0,
      };
    });

    replace(updatedDetails);
    toast.success("Semua angka stand meter terakhir berhasil disalin ke form!");
  };

  if (isLoadingMaster) {
    return (
      <div className="flex h-60 flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground animate-pulse text-xs font-medium italic">
          Menyiapkan Form Data...
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* AREA FORM UTAMA: DIBATASI DENGAN MAX-HEIGHT & OVERFLOW AUTO AGAR SELALU MUNCUL SCROLLBAR */}
        <div className="max-h-[58vh] overflow-y-auto pr-2 space-y-5">
          {/* HEADER SECTION: PILIH METERAN & TANGGAL PENCATATAN */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="reading.meter_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-bold uppercase">
                    Pilih Meteran
                  </FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background h-10 font-medium">
                        <SelectValue placeholder="Pilih Meteran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {meters?.map((m) => (
                        <SelectItem key={m.meter_id} value={m.meter_id.toString()}>
                          {m.name} {m.meter_code ? `(${m.meter_code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="reading.reading_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-muted-foreground text-xs font-bold uppercase flex items-center justify-between">
                    <span>Tanggal Pencatatan</span>
                    {latestLog?.suggested_next_date && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-normal"
                      >
                        ✨ Rekomendasi (H+1)
                      </Badge>
                    )}
                  </FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          disabled={isPending}
                          className={cn(
                            "bg-background h-10 w-full pl-3 text-left font-medium",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: id })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border border-slate-200 dark:border-slate-800 shadow-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        locale={id}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* BANNER LOG TERAKHIR & KONSUMSI TERAKHIR */}
          {selectedMeterId && latestLog && (
            <div className="rounded-xl border border-indigo-500/30 bg-linear-to-r from-indigo-500/5 via-blue-500/5 to-slate-500/5 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Riwayat Pencatatan Terakhir ({latestLog.meter_name})
                  </span>
                </div>

                {latestLog.last_reading_date && (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] text-muted-foreground"
                  >
                    📅 Dicatat:{" "}
                    {format(new Date(latestLog.last_reading_date), "dd MMMM yyyy", {
                      locale: id,
                    })}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Card 1: Konsumsi Terakhir */}
                <div className="rounded-lg bg-background/80 border border-slate-200/80 dark:border-slate-800/80 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Konsumsi Hari Terakhir:
                    </span>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">
                      {latestLog.last_consumption.toLocaleString("id-ID", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        {unit}
                      </span>
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>

                {/* Card 2: Status Rekomendasi Input H+1 */}
                <div className="rounded-lg bg-background/80 border border-slate-200/80 dark:border-slate-800/80 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Target Tanggal Pencatatan:
                    </span>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {latestLog.suggested_next_date
                        ? format(
                            new Date(latestLog.suggested_next_date),
                            "EEEE, dd MMMM yyyy",
                            { locale: id }
                          )
                        : "Hari ini"}
                    </p>
                  </div>
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* DETAILS SECTION: INPUT NILAI METER */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-md p-1">
                  <ClipboardPaste size={16} />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Detail Angka Meteran
                </h3>
              </div>

              {selectedMeterId && (
                <div className="flex items-center gap-2">
                  {latestLog?.details && latestLog.details.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1 border-indigo-200 dark:border-indigo-900 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      onClick={handleCopyAllLastStands}
                      disabled={isPending}
                    >
                      <Copy className="h-3 w-3" /> Salin Semua Stand Terakhir
                    </Button>
                  )}
                  <Badge variant="outline" className="font-mono text-xs">
                    {isLoadingMeterDetail
                      ? "Memuat Config..."
                      : `${readingTypes.length} Tipe Tersedia`}
                  </Badge>
                </div>
              )}
            </div>

            {/* Message if meter not selected */}
            {!selectedMeterId ? (
              <div className="bg-muted/20 text-muted-foreground flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Info className="h-6 w-6 mb-1 opacity-50" />
                <p className="text-xs font-medium">
                  Silakan pilih meteran terlebih dahulu di atas
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {fields.map((field, index) => {
                    const currentReadingTypeId = detailsValues[index]?.reading_type_id;
                    const lastVal = getLastStandValue(currentReadingTypeId);

                    return (
                      <div
                        key={field.id}
                        className="group bg-card hover:border-primary/50 relative flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs transition-all hover:shadow-md md:flex-row md:items-start"
                      >
                        {/* TYPE SELECT */}
                        <FormField
                          control={control}
                          name={`reading.details.${index}.reading_type_id`}
                          render={({ field: dField }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-muted-foreground text-[10px] font-bold uppercase">
                                Tipe Parameter Bacaan
                              </FormLabel>
                              <Select
                                onValueChange={(v) => dField.onChange(Number(v))}
                                value={dField.value?.toString()}
                                disabled={isLoadingMeterDetail || isPending}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-background h-9">
                                    <SelectValue
                                      placeholder={
                                        isLoadingMeterDetail ? "Memuat..." : "Pilih Tipe"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {readingTypes.map((t) => {
                                    const isSelectedElsewhere = detailsValues.some(
                                      (detail, detailIndex) =>
                                        detail.reading_type_id === t.reading_type_id &&
                                        detailIndex !== index
                                    );
                                    if (isSelectedElsewhere) return null;

                                    const typeName =
                                      (t as any).type_name ||
                                      t.name ||
                                      `Tipe #${t.reading_type_id}`;

                                    return (
                                      <SelectItem
                                        key={t.reading_type_id}
                                        value={t.reading_type_id.toString()}
                                      >
                                        {typeName} ({t.unit})
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* VALUE INPUT & COPY PREVIOUS BUTTON */}
                        <FormField
                          control={control}
                          name={`reading.details.${index}.value`}
                          render={({ field: vField }) => (
                            <FormItem className="flex-[1.5]">
                              <FormLabel className="text-muted-foreground flex items-center justify-between text-[10px] font-bold uppercase">
                                <span>Nilai Angka Stand ({unit})</span>
                                {lastVal !== undefined && (
                                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold flex items-center gap-1 text-[10px]">
                                    <History size={10} />
                                    Stand Lalu: {lastVal.toLocaleString("id-ID")}
                                  </span>
                                )}
                              </FormLabel>
                              <div className="relative flex items-center gap-2">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="any"
                                    disabled={isPending}
                                    className="bg-background h-9 font-mono font-semibold"
                                    placeholder="0.00"
                                    {...vField}
                                    onChange={(e) =>
                                      vField.onChange(parseFloat(e.target.value) || 0)
                                    }
                                  />
                                </FormControl>

                                {/* Quick Copy Previous Stand Button */}
                                {lastVal !== undefined && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-9 px-2.5 shrink-0 shadow-xs text-xs font-semibold gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/60 dark:border-indigo-800"
                                    title="Salin nilai stand meteran terakhir"
                                    disabled={isPending}
                                    onClick={() => {
                                      setValue(`reading.details.${index}.value`, Number(lastVal));
                                      toast.success(`Stand terakhir (${lastVal}) berhasil disalin!`);
                                    }}
                                  >
                                    <ClipboardPaste size={14} />
                                    <span className="hidden sm:inline text-[11px]">
                                      Salin Stand
                                    </span>
                                  </Button>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100 md:static md:mt-6 md:opacity-100">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                            disabled={fields.length === 1 || isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {fields.length < readingTypes.length && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:border-primary hover:bg-primary/5 w-full border-dashed"
                    onClick={() =>
                      append({ reading_type_id: undefined as unknown as number, value: 0 })
                    }
                    disabled={isLoadingMeterDetail || isPending}
                  >
                    <Plus size={14} className="mr-2" /> Tambah Parameter Bacaan
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* FOOTER ACTION SELALU TERLIHAT DI BAWAH CONTAINER */}
        <div className="border-t border-border/40 pt-3">
          <Button
            type="submit"
            size="lg"
            className="shadow-primary/20 w-full font-bold shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
            disabled={isPending || isLoadingMaster || !selectedMeterId}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan & Menghitung
                Output...
              </>
            ) : (
              "Konfirmasi & Simpan Pembacaan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
