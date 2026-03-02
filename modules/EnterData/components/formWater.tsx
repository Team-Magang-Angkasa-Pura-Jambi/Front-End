"use client";

import { useMemo, useEffect } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useForm,
  useFieldArray,
  Resolver,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, isValid } from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  ClipboardPaste,
  PlusCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";

import { useAuthStore } from "@/stores/authStore";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import { formSchema, FormValues } from "../schemas/reading.schema";
import {
  getLastReadingApi,
  ReadingPayload,
  submitReadingApi,
} from "../services";
import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { formatToISO } from "@/utils/formatIso";

interface FormReadingProps {
  onSuccess?: () => void;
  type_name: "Electricity" | "Water" | "Fuel";
}

export const FormReadingWater = ({
  onSuccess,
  type_name,
}: FormReadingProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Role check untuk akses ganti tanggal
  const canChangeDate = user?.role === "Admin" || user?.role === "SuperAdmin";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      meter_id: undefined,
      reading_date: new Date(),
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const { data: energyTypeData, isLoading: isLoadingData } = useQuery({
    queryKey: ["energyData", type_name],
    queryFn: () => getEnergyTypesApi(type_name),
    refetchOnWindowFocus: false,
  });

  const meters = useMemo(
    () => energyTypeData?.data[0]?.meters || [],
    [energyTypeData]
  );
  const readingTypes = useMemo(
    () => energyTypeData?.data[0]?.reading_types || [],
    [energyTypeData]
  );
  const unit = useMemo(
    () => energyTypeData?.data[0]?.unit_of_measurement || "...",
    [energyTypeData]
  );

  const selectedMeterId = form.watch("meter_id");
  const detailsValues = form.watch("details");
  const readingDate = form.watch("reading_date");

  const lastReadingsQueries = useQueries({
    queries: detailsValues.map((detail) => ({
      queryKey: [
        "lastReading",
        selectedMeterId,
        detail.reading_type_id,
        readingDate,
      ],
      queryFn: () =>
        getLastReadingApi(
          selectedMeterId,
          detail.reading_type_id,
          readingDate.toISOString()
        ),
      enabled: !!selectedMeterId && !!detail.reading_type_id,
      refetchOnWindowFocus: false,
    })),
  });

  // Efek Otomatisasi Tanggal (H+1 dari data terakhir)
  useEffect(() => {
    const firstSuccessful = lastReadingsQueries.find(
      (q) => q.isSuccess && q.data?.data?.session?.reading_date
    );

    const lastDateStr = firstSuccessful?.data?.data?.session?.reading_date;

    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);
      if (isValid(lastDate)) {
        const nextDay = addDays(lastDate, 1);
        // Proteksi infinite loop: cek apakah tanggal berbeda
        if (
          format(nextDay, "yyyy-MM-dd") !== format(readingDate, "yyyy-MM-dd")
        ) {
          form.setValue("reading_date", nextDay);
        }
      }
    }
  }, [
    lastReadingsQueries
      .map((q) => q.data?.data?.session?.reading_date)
      .join(","),
    form,
    readingDate,
  ]);

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    ReadingPayload
  >({
    mutationFn: (readingData) => submitReadingApi(readingData),
    onSuccess: () => {
      toast.success("Data berhasil dikirim!");
      form.reset({
        meter_id: undefined,
        reading_date: new Date(),
        details: [],
      });
      queryClient.invalidateQueries({
        queryKey: ["readings", "analysisData", "lastReading"],
      });
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan tidak terduga.";
      toast.error(message);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const payload: ReadingPayload = {
      meter_id: values.meter_id,
      reading_date: formatToISO(values.reading_date),
      details: values.details.map((d) => ({
        reading_type_id: d.reading_type_id,
        value: Number(d.value),
      })),
    };
    mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="meter_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Meteran</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                  disabled={isLoadingData}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingData ? "Memuat..." : "Pilih Meteran"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem
                        key={meter.meter_id}
                        value={meter.meter_id.toString()}
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

          <FormField
            control={form.control}
            name="reading_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        disabled={!canChangeDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "d MMMM yyyy", { locale: id })
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
          {fields.map((field, index) => {
            const queryResult = lastReadingsQueries[index];
            const lastVal = queryResult?.data?.data?.value;
            const lastDateStr = queryResult?.data?.data?.session?.reading_date;

            return (
              <div
                key={field.id}
                className="grid grid-cols-12 items-start gap-4"
              >
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name={`details.${index}.reading_type_id`}
                    render={({ field: typeField }) => (
                      <FormItem>
                        <FormLabel className={index > 0 ? "sr-only" : ""}>
                          Jenis
                        </FormLabel>
                        <Select
                          onValueChange={(val) =>
                            typeField.onChange(Number(val))
                          }
                          value={typeField.value ? String(typeField.value) : ""}
                          disabled={!selectedMeterId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {readingTypes
                              .filter(
                                (t) =>
                                  !detailsValues.some(
                                    (d, idx) =>
                                      idx !== index &&
                                      Number(d.reading_type_id) ===
                                        t.reading_type_id
                                  )
                              )
                              .map((type) => (
                                <SelectItem
                                  key={type.reading_type_id}
                                  value={type.reading_type_id.toString()}
                                >
                                  {type.type_name}
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
                    name={`details.${index}.value`}
                    render={({ field: valField }) => (
                      <FormItem>
                        <FormLabel className={index > 0 ? "sr-only" : ""}>
                          Nilai ({unit})
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="0.00"
                              className="pr-10"
                              {...valField}
                              onChange={(e) =>
                                valField.onChange(
                                  e.target.value.replace(/,/g, ".")
                                )
                              }
                              disabled={!detailsValues[index]?.reading_type_id}
                            />
                          </FormControl>
                          {lastVal !== undefined && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                              onClick={() =>
                                form.setValue(`details.${index}.value`, lastVal)
                              }
                            >
                              <ClipboardPaste className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormDescription className="text-[10px]">
                          {queryResult?.isFetching
                            ? "Memuat..."
                            : lastVal
                              ? `Terakhir: ${lastVal} (${lastDateStr ? format(new Date(lastDateStr), "dd/MM/yy") : "-"})`
                              : "Belum ada data"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1 flex h-[58px] items-end">
                  {fields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <XCircleIcon className="text-destructive h-5 w-5" />
                    </Button>
                  )}
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
          onClick={() =>
            append({
              reading_type_id: undefined as unknown as number,
              value: undefined as unknown as number,
            })
          }
          disabled={fields.length >= readingTypes.length}
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Tambah Baris
        </Button>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim Data"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
