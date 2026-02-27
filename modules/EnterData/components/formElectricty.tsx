"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, ClipboardPaste, Loader2, PlusCircleIcon, XCircleIcon } from "lucide-react";
import { useMemo } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
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

import { cn } from "@/lib/utils";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { formatToISO } from "@/utils/formatIso";
import { formSchema, FormValues } from "../schemas/reading.schema";
import { getLastReadingApi, submitReadingApi } from "../services";

interface FormReadingProps {
  onSuccess?: () => void;
  type_name: "Electricity" | "Water" | "Fuel";
}

export const FormReadingElectric = ({ onSuccess, type_name }: FormReadingProps) => {
  const queryClient = useQueryClient();

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reading.details",
  });

  // Fetch Master Data
  const { data: energyTypeData, isLoading: isLoadingData } = useQuery({
    queryKey: ["energyData", type_name],
    queryFn: () => getEnergyTypesApi(type_name),
  });

  const { data: metersRes, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["meters"],
    queryFn: () => getMetersApi(),
  });

  const meters = useMemo(() => metersRes?.data.meter || [], [metersRes]);

  const readingTypes = useMemo(
    () => energyTypeData?.data[0]?.reading_types || [],
    [energyTypeData]
  );
  const unit = useMemo(() => energyTypeData?.data[0]?.unit_standard || "...", [energyTypeData]);

  // Watchers
  const selectedMeterId = form.watch("reading.meter_id");
  const readingDate = form.watch("reading.reading_date");
  const detailsValues = form.watch("reading.details");

  // Last Reading Logic
  const lastReadingQueries = useQueries({
    queries: detailsValues.map((detail) => ({
      queryKey: ["lastReading", selectedMeterId, detail.reading_type_id, readingDate],
      queryFn: () =>
        getLastReadingApi(selectedMeterId, detail.reading_type_id, readingDate.toISOString()),
      enabled: !!selectedMeterId && !!detail.reading_type_id && !!readingDate,
    })),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: FormValues) => submitReadingApi(payload as any),
    onSuccess: () => {
      toast.success("Data pembacaan berhasil disimpan!");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["readings"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.status?.message || "Gagal mengirim data.");
    },
  });

  const onSubmit = (values: FormValues) => {
    // Karena schema sudah dibungkus 'reading', kita tinggal format tanggalnya saja
    const formattedPayload = {
      ...values,
      reading: {
        ...values.reading,
        reading_date: formatToISO(values.reading.reading_date),
      },
    };
    mutate(formattedPayload as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className="max-h-[70vh] p-1">
          <div className="grid gap-6 px-1 md:grid-cols-2">
            {/* METER SELECT */}
            <FormField
              control={form.control}
              name="reading.meter_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Meteran</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingData ? "Memuat..." : "Pilih Meteran"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {meters.map((m) => (
                        <SelectItem key={m.meter_id} value={m.meter_id.toString()}>
                          {m.meter_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DATE PICKER */}
            <FormField
              control={form.control}
              name="reading.reading_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Pembacaan</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pilih Tanggal</span>}
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

          <hr className="my-6 border-dashed" />

          {/* DYNAMIC DETAILS */}
          <div className="space-y-4 px-1">
            {fields.map((field, index) => {
              const lastQuery = lastReadingQueries[index];
              const lastValue = lastQuery?.data?.data?.value;

              return (
                <div
                  key={field.id}
                  className="bg-muted/30 grid grid-cols-12 items-end gap-4 rounded-lg border p-3"
                >
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`reading.details.${index}.reading_type_id`}
                      render={({ field: detailField }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase opacity-60">
                            Tipe Pembacaan
                          </FormLabel>
                          <Select
                            onValueChange={(v) => detailField.onChange(Number(v))}
                            value={detailField.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Pilih Tipe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {readingTypes.map((t) => (
                                <SelectItem
                                  key={t.reading_type_id}
                                  value={t.reading_type_id.toString()}
                                >
                                  {t.type_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`reading.details.${index}.value`}
                      render={({ field: valueField }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase opacity-60">
                            Nilai ({unit})
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                className="bg-background pr-10"
                                {...valueField}
                              />
                            </FormControl>
                            {lastValue !== undefined && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                                onClick={() =>
                                  form.setValue(`reading.details.${index}.value`, lastValue)
                                }
                              >
                                <ClipboardPaste size={14} />
                              </Button>
                            )}
                          </div>
                          <FormDescription className="text-[10px]">
                            Terakhir: {lastQuery?.isFetching ? "..." : lastValue || "-"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive"
                    >
                      <XCircleIcon size={18} />
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
            className="mt-4"
            onClick={() => append({ reading_type_id: undefined as any, value: 0 })}
            disabled={fields.length >= readingTypes.length}
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Tambah Baris
          </Button>

          <div className="flex justify-end pt-8">
            <Button
              type="submit"
              size="lg"
              className="w-full px-12 font-bold md:w-auto"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                </>
              ) : (
                "Simpan Pembacaan"
              )}
            </Button>
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
};
