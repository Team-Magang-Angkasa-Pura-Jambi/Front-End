"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";
import {
  CalendarIcon,
  ClipboardPaste,
  PlusCircleIcon,
  XCircleIcon,
} from "lucide-react";
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
  FormDescription,
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

import {
  getEnergyTypesApi,
  EnergyTypesApiResponse,
} from "@/services/energyType.service";

import { ScrollArea } from "@/components/ui/scroll-area";
import { formSchema, FormValues } from "./schemas/reading.schema";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import {
  getLastReadingApi,
  ReadingPayload,
  submitReadingApi,
} from "./services";

interface FormReadingProps {
  onSuccess?: () => void;
  type_name: "Electricity" | "Water" | "Fuel";
}

export const FormReadingElectric = ({
  onSuccess,
  type_name,
}: FormReadingProps) => {
  const queryClient = useQueryClient();

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

  const { data: energyTypeData, isLoading: isLoadingData } =
    useQuery<EnergyTypesApiResponse>({
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

  const lastReadingQueries = useQueries({
    queries: detailsValues?.map((detail) => ({
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

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    ReadingPayload
  >({
    mutationFn: (readingData: ReadingPayload) => submitReadingApi(readingData),
    onSuccess: () => {
      toast.success("Data berhasil dikirim!");
      form.reset();
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
      reading_date: values.reading_date,
      details: values.details.map((d) => ({
        reading_type_id: d.reading_type_id,
        value: d.value,
      })),
    };
    mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className="max-h-[70vh] overflow-y-auto p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="meter_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Meteran</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ? String(field.value) : ""}
                    disabled={isLoadingData}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingData
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
                            key={meter?.meter_id}
                            value={meter?.meter_id.toString()}
                          >
                            {meter.meter_code}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
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
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <hr className="my-4 border-dashed" />

          <div className="space-y-4">
            {fields.map((field, index) => {
              const lastReadingQuery = lastReadingQueries[index];
              const lastReadingValue = lastReadingQuery?.data?.data?.value;
              const dateString =
                lastReadingQuery?.data?.data?.session?.reading_date;
              const lastReadingDate = dateString ? new Date(dateString) : null;

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 items-start"
                >
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`details.${index}.reading_type_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index > 0 ? "sr-only" : ""}>
                            Jenis Pemakaian
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field?.value?.toString()}
                            disabled={isLoadingData || meters.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    !selectedMeterId
                                      ? "Pilih Jenis"
                                      : isLoadingData
                                      ? "Memuat..."
                                      : "Pilih Jenis"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                {readingTypes
                                  .filter((type) => {
                                    const isUsedInOtherRows =
                                      detailsValues.some(
                                        (d, idx) =>
                                          idx !== index && // 'index' didapat dari map fieldArray
                                          Number(d.reading_type_id) ===
                                            type.reading_type_id
                                      );

                                    return !isUsedInOtherRows;
                                  })
                                  .map((type) => (
                                    <SelectItem
                                      key={type.reading_type_id}
                                      value={
                                        type.reading_type_id?.toString() || ""
                                      }
                                    >
                                      {type.type_name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index > 0 ? "sr-only" : ""}>
                            Nilai ({unit})
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="decimal"
                                step="any"
                                min={lastReadingValue}
                                placeholder="0.00"
                                className="pr-10"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /,/g,
                                    "."
                                  );
                                  field.onChange(value);
                                }}
                                disabled={
                                  !detailsValues[index]?.reading_type_id
                                }
                              />
                            </FormControl>
                            {lastReadingValue && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() =>
                                  form.setValue(
                                    `details.${index}.value`,
                                    lastReadingValue ??
                                      ("" as unknown as number)
                                  )
                                }
                              >
                                <ClipboardPaste className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormDescription>
                            {lastReadingQuery?.isFetching
                              ? "Mencari..."
                              : `Angka terakhir: ${
                                  lastReadingValue || "-"
                                } Pada  ${
                                  lastReadingDate && isValid(lastReadingDate)
                                    ? format(lastReadingDate, "PPP")
                                    : "-"
                                }`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 flex items-end h-[58px]">
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
                reading_type_id: "" as unknown as number,
                value: "" as unknown as number,
              })
            }
            disabled={fields.length >= readingTypes.length}
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Tambah Baris
          </Button>

          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim Data"}
            </Button>
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
};
