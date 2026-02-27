"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { CalendarIcon, ClipboardPaste, History, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { ScrollArea } from "@/common/components/ui/scroll-area";
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
import { getLastReadingApi, submitReadingApi } from "../services";
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
  const readingDate = watch("reading.reading_date");
  const detailsValues = watch("reading.details");

  const { data: meterRes, isLoading: isLoadingMeterDetail } = useQuery({
    queryKey: ["meterDetail", selectedMeterId],
    queryFn: () => getMeterByIdApi(Number(selectedMeterId)),
    enabled: !!selectedMeterId,
  });

  const readingTypes = useMemo(() => {
    if (!meterRes?.data?.reading_configs) return [];

    return meterRes.data.reading_configs.map((config) => config.reading_type);
  }, [meterRes]);

  useEffect(() => {
    if (selectedMeterId) {
      replace([{ reading_type_id: undefined as unknown as number, value: 0 }]);
    }
  }, [selectedMeterId, replace]);

  const lastReadingQueries = useQueries({
    queries: detailsValues.map((d) => ({
      queryKey: ["lastReading", selectedMeterId, d.reading_type_id, readingDate],
      queryFn: () =>
        getLastReadingApi(selectedMeterId!, d.reading_type_id!, readingDate?.toISOString()),
      enabled: !!selectedMeterId && !!d.reading_type_id && !!readingDate,
    })),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: submitReadingApi,
    onSuccess: () => {
      toast.success(`Data ${master?.name} berhasil disimpan!`);
      reset();
      queryClient.invalidateQueries({ queryKey: ["readings"] });
      onSuccess?.();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(err.response?.data?.status?.message || "Gagal menyimpan data.");
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate({
      reading: {
        ...values.reading,
        reading_date: formatToISO(values.reading.reading_date),
      },
    });
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <ScrollArea className="-mr-4 flex-1 pr-4">
          <div className="space-y-8 px-1 pb-4">
            {/* HEADER SECTION */}
            <div className="grid gap-5 md:grid-cols-2">
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
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background h-10 font-medium">
                          <SelectValue placeholder="Pilih Meteran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meters.map((m) => (
                          <SelectItem key={m.meter_id} value={m.meter_id.toString()}>
                            {m.name}
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
                    <FormLabel className="text-muted-foreground text-xs font-bold uppercase">
                      Tanggal Pencatatan
                    </FormLabel>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "bg-background h-10 w-full pl-3 text-left font-medium",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto border-none bg-transparent p-0 shadow-none"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                          }}
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

            <Separator />

            {/* DETAILS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <span className="bg-primary/10 text-primary rounded-md p-1">
                    <ClipboardPaste size={16} />
                  </span>
                  Detail Pembacaan
                </h3>
                {selectedMeterId && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {isLoadingMeterDetail
                      ? "Memuat Config..."
                      : `${readingTypes.length} Tipe Tersedia`}
                  </Badge>
                )}
              </div>

              {/* Tampilkan pesan jika meteran belum dipilih */}
              {!selectedMeterId ? (
                <div className="bg-muted/20 text-muted-foreground flex h-32 flex-col items-center justify-center rounded-xl border border-dashed">
                  <p className="text-sm font-medium">Silakan pilih meteran terlebih dahulu</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {fields.map((field, index) => {
                      const lastQuery = lastReadingQueries[index];
                      const lastVal = lastQuery?.data?.data?.value;
                      const isSyncing = lastQuery?.isFetching;

                      return (
                        <div
                          key={field.id}
                          className="group bg-card hover:border-primary/50 relative flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-start"
                        >
                          {/* TYPE SELECT */}
                          <FormField
                            control={control}
                            name={`reading.details.${index}.reading_type_id`}
                            render={({ field: dField }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-muted-foreground text-[10px] font-bold uppercase">
                                  Tipe Bacaan
                                </FormLabel>
                                <Select
                                  onValueChange={(v) => dField.onChange(Number(v))}
                                  value={dField.value?.toString()}
                                  disabled={isLoadingMeterDetail}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-background/50 h-9">
                                      <SelectValue
                                        placeholder={isLoadingMeterDetail ? "..." : "Pilih Tipe"}
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

                                      return (
                                        <SelectItem
                                          key={t.reading_type_id}
                                          value={t.reading_type_id.toString()}
                                        >
                                          {t.type_name}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* VALUE INPUT */}
                          <FormField
                            control={control}
                            name={`reading.details.${index}.value`}
                            render={({ field: vField }) => (
                              <FormItem className="flex-[1.5]">
                                <FormLabel className="text-muted-foreground flex items-center justify-between text-[10px] font-bold uppercase">
                                  <span>Nilai ({unit})</span>
                                  {lastVal !== undefined && (
                                    <span className="text-muted-foreground flex items-center gap-1 text-xs font-normal">
                                      <History size={10} />
                                      Lalu: {isSyncing ? "..." : lastVal}
                                    </span>
                                  )}
                                </FormLabel>
                                <div className="relative flex items-center gap-2">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="any"
                                      className="bg-background/50 h-9 font-mono font-medium"
                                      placeholder="0.00"
                                      {...vField}
                                    />
                                  </FormControl>
                                  {lastVal !== undefined && (
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="icon"
                                      className="h-9 w-9 shrink-0 shadow-sm"
                                      title="Salin nilai terakhir"
                                      onClick={() =>
                                        setValue(`reading.details.${index}.value`, Number(lastVal))
                                      }
                                    >
                                      <ClipboardPaste size={14} className="text-primary" />
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
                              disabled={fields.length === 1}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:border-primary hover:bg-primary/5 w-full border-dashed"
                    onClick={() =>
                      append({ reading_type_id: undefined as unknown as number, value: 0 })
                    }
                    disabled={fields.length >= readingTypes.length || isLoadingMeterDetail}
                  >
                    <Plus size={14} className="mr-2" /> Tambah Baris Detail
                  </Button>
                </>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* FOOTER ACTION */}
        <div className="bg-background z-10 mt-auto border-t pt-4">
          <Button
            type="submit"
            size="lg"
            className="shadow-primary/20 w-full font-bold shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
            disabled={isPending || isLoadingMaster || !selectedMeterId}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan Data...
              </>
            ) : (
              "Konfirmasi & Simpan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
