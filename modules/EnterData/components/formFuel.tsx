"use client";

import { addDays, subDays } from "date-fns";
import { useMemo, useEffect, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClipboardPaste,
  PlusCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

// Impor komponen shadcn/ui
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

// Impor service dan tipe
import {
  getEnergyTypesApi,
  EnergyTypesApiResponse,
  ReadingType,
} from "@/services/energyType.service";
import {
  getLastReadingApi,
  ReadingPayload,
  submitReadingApi,
} from "@/services/readings.service";
import { useAuthStore } from "@/stores/authStore";

// --- Tipe Data ---
interface FormReadingProps {
  onSuccess?: () => void;
  type_name: "Electricity" | "Water" | "Fuel";
}

// --- Skema Validasi Zod ---
const formSchema = z.object({
  meter_id: z.string().min(1, { message: "Meteran wajib dipilih." }),
  reading_date: z.date({ error: "Tanggal pembacaan wajib diisi." }),
  details: z
    .array(
      z.object({
        reading_type_id: z.string().min(1, { message: "Jenis wajib dipilih." }),
        value: z.coerce.number().positive({ message: "Nilai harus positif." }),
      })
    )
    .min(1, "Minimal harus ada satu detail pembacaan."),
});

type FormValues = z.infer<typeof formSchema>;

// --- Komponen Utama ---
export const FormReadingFuel = ({ onSuccess, type_name }: FormReadingProps) => {
  // --- Hooks ---
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [lastReadingDate, setLastReadingDate] = useState<string | null>(null);
  const canChangeDate = user?.role === "Admin" || user?.role === "SuperAdmin";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meter_id: "",
      reading_date: new Date(),
      details: [{ reading_type_id: "", value: "" as any }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "details",
  });

  // --- Data Fetching Utama ---
  const { data: energyTypeData, isLoading: isLoadingData } =
    useQuery<EnergyTypesApiResponse>({
      queryKey: ["energyData", type_name],
      queryFn: () => getEnergyTypesApi(type_name),
    });

  // --- Data Turunan ---
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

  // --- Form State & Effects ---
  const selectedMeterId = form.watch("meter_id");
  const detailsValues = form.watch("details");
  const readingDate = form.watch("reading_date");

  useEffect(() => {
    if (selectedMeterId) {
      replace([{ reading_type_id: "", value: "" as any }]);
    }
  }, [selectedMeterId, replace]);

  const selectedTypeIds = useMemo(
    () => detailsValues.map((d) => d.reading_type_id),
    [detailsValues]
  );

  // --- Data Fetching Dependen (Last Reading) ---
  const lastReadingsQueries = useQueries({
    queries: detailsValues.map((detail) => {
      return {
        queryKey: [
          "lastReading",
          selectedMeterId,
          detail.reading_type_id,
          readingDate,
        ],
        queryFn: () =>
          getLastReadingApi(
            parseInt(selectedMeterId),
            parseInt(detail.reading_type_id),
            readingDate.toISOString()
          ),
        enabled: !!selectedMeterId && !!detail.reading_type_id && !!readingDate,
      };
    }),
  });

  // Efek untuk menampilkan notifikasi jika data sebelumnya tidak ada
  useEffect(() => {
    lastReadingsQueries.forEach((query) => {
      // Cek jika query sudah selesai (bukan fetching) dan hasilnya error
      if (
        !query.isFetching &&
        ((query.isSuccess && !query.data?.data) || query.isError)
      ) {
        toast.error("Data hari sebelumnya belum diinput.", {
          description: "Silakan isi data untuk tanggal yang benar.",
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastReadingsQueries.map((q) => q.status).join(",")]); // Bergantung pada status semua query

  useEffect(() => {
    const lastDate = lastReadingsQueries[0]?.data?.data?.session?.reading_date;
    if (lastDate) {
      setLastReadingDate(format(new Date(lastDate), "PPP"));
    } else {
      setLastReadingDate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastReadingsQueries[0]?.data]);

  if (!lastReadingsQueries) {
    toast.error("error");
  }

  // --- Data Submission ---
  const { mutate, isPending } = useMutation({
    mutationFn: (readingData: ReadingPayload) => submitReadingApi(readingData),
    onSuccess: () => {
      toast.success("Data berhasil dikirim!");
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["readings", "analysisData", "lastReading"],
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan tidak terduga.";
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: ReadingPayload = {
      meter_id: parseInt(values.meter_id),
      reading_date: values.reading_date.toISOString(),
      details: values.details.map((d) => ({
        reading_type_id: parseInt(d.reading_type_id),
        value: d.value,
      })),
    };
    mutate(payload);
  };

  // --- JSX ---
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="meter_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Meteran</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingData}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingData ? "Memuat meteran..." : "Pilih Meteran"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {meters.map((meter) => (
                        <SelectItem
                          key={meter.meter_id}
                          value={meter.meter_id.toString()}
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
                <FormLabel>Tanggal Pembacaan</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                        disabled={
                          !canChangeDate ||
                          !selectedMeterId ||
                          !detailsValues[0]?.reading_type_id
                        }
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
                      disabled={(date) => {
                        const lastDate =
                          lastReadingsQueries[0]?.data?.data?.session
                            ?.reading_date;
                        return (
                          date > new Date() ||
                          (lastDate ? date <= new Date(lastDate) : false)
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  {lastReadingDate
                    ? `Data terakhir diinput: ${lastReadingDate}`
                    : "Pilih tanggal pembacaan."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <hr className="my-4 border-dashed" />

        <div className="space-y-4">
          {fields.map((field, index) => {
            const lastReadingQuery = lastReadingsQueries[index];
            const lastReadingValue = lastReadingQuery?.data?.data?.value;
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
                          value={field.value}
                          disabled={isLoadingData || meters.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !selectedMeterId
                                    ? "Pilih meteran"
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
                                .filter(
                                  (type) =>
                                    !selectedTypeIds.includes(
                                      type.reading_type_id.toString()
                                    ) ||
                                    field.value ===
                                      type.reading_type_id.toString()
                                )
                                .map((type) => (
                                  <SelectItem
                                    key={type.reading_type_id}
                                    value={type.reading_type_id.toString()}
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
                          Nilai Pembacaan ({unit})
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
                                const value = e.target.value.replace(/,/g, ".");
                                field.onChange(value);
                              }}
                              disabled={!detailsValues[index]?.reading_type_id}
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
                                  lastReadingValue ?? ""
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
                            : `Angka terakhir: ${lastReadingValue || "-"}`}
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
          onClick={() => append({ reading_type_id: "", value: "" as any })}
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
      </form>
    </Form>
  );
};
