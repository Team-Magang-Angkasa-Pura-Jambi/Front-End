"use client";

import { Button } from "@/common/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { ApiErrorResponse } from "@/common/types/api";
import { formSchema, FormValues } from "@/modules/EnterData/schemas/reading.schema";
import {
  ReadingHistory,
  ReadingPayload,
  updateReadingSessionApi,
} from "@/modules/EnterData/services";
import { formatToISO } from "@/utils/formatIso";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarDays, Hash, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { FieldErrors, Resolver, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ReadingFormProps {
  initialData: ReadingHistory | null;
  onSuccess?: () => void;
}

export function ReadingForm({ initialData, onSuccess }: ReadingFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      reading: {
        meter_id: 0,
        reading_date: new Date(),
        notes: "",

        details: [],
      },
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "reading.details",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        reading: {
          meter_id: initialData.meter_id,
          reading_date: new Date(initialData.reading_date),
          notes: initialData.notes || "",

          details: initialData.details.map((d) => ({
            reading_type_id: d.reading_type_id,
            value: Number(d.value),
          })),
        },
      });
    }
  }, [initialData, form]);

  const { mutate, isPending } = useMutation<unknown, AxiosError<ApiErrorResponse>, ReadingPayload>({
    mutationFn: (payload) => {
      if (!initialData?.session_id) throw new Error("Session ID is missing.");
      return updateReadingSessionApi(initialData.session_id, payload);
    },
    onSuccess: async () => {
      toast.success("Data pencatatan berhasil diperbarui!");
      await queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      onSuccess?.();
    },
    onError: (error) => {
      const message = error.response?.data?.status?.message || "Terjadi kesalahan sistem.";
      toast.error("Gagal Memperbarui", { description: message });
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const payload = {
      reading: {
        meter_id: values.reading.meter_id,
        reading_date: formatToISO(values.reading.reading_date),
        details: values.reading.details.map((d) => ({
          reading_type_id: d.reading_type_id,
          value: d.value,
        })),
      },
    };
    mutate(payload);
  };

  const onFormError = (errors: FieldErrors<FormValues>) => {
    console.error("Validation Errors:", errors);

    const detailsErrors = errors.reading?.details;
    let errorFields: string[] = [];

    if (Array.isArray(detailsErrors)) {
      detailsErrors.forEach((err, index) => {
        if (err?.value) {
          const typeName =
            initialData?.details[index]?.reading_type?.type_name || `Baris ${index + 1}`;
          errorFields.push(`"${typeName}"`);
        }
      });
    }

    const description =
      errorFields.length > 0
        ? `Nilai pada ${errorFields.join(", ")} wajib diisi dan tidak boleh kurang dari 0.`
        : "Pastikan semua nilai telah diisi dengan angka yang valid.";

    toast.error("Validasi Gagal", {
      description: description,
    });
  };

  if (!initialData) return null;

  const meterDisplayName =
    initialData.meter?.meter_code || initialData.meter?.name || `ID: ${initialData.meter_id}`;

  return (
    <Form {...form}>
      {/* PERBAIKAN: Tambahkan onFormError sebagai argumen kedua pada handleSubmit */}
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6">
        <ScrollArea className="max-h-[75vh] p-1">
          <div className="bg-secondary/30 border-secondary/50 mb-6 flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Hash className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  Identitas Meteran
                </p>
                <p className="text-foreground leading-tight font-semibold">{meterDisplayName}</p>
              </div>
            </div>

            <div className="bg-border hidden h-8 w-[1px] md:block" />

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <CalendarDays className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  Tanggal Pencatatan
                </p>
                <p className="text-foreground leading-tight font-semibold">
                  {format(new Date(initialData.reading_date), "EEEE, dd MMMM yyyy", {
                    locale: localeId,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-foreground text-sm font-bold tracking-tight">Perbarui Nilai</h4>
            <p className="text-muted-foreground text-xs">
              Ubah angka pembacaan jika terdapat kesalahan input sebelumnya.
            </p>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const detailMeta = initialData.details[index];
              const typeName = detailMeta?.reading_type?.type_name || "Nilai";
              const unit = detailMeta?.reading_type?.unit || "";

              return (
                <div
                  key={field.id}
                  className="bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{typeName}</span>
                    {unit && (
                      <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                        Satuan: {unit}
                      </span>
                    )}
                  </div>

                  <div className="w-full md:w-1/2">
                    <FormField
                      control={form.control}
                      name={`reading.details.${index}.value`}
                      render={({ field: valueField }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="0.00"
                              className="bg-background font-mono text-base font-semibold transition-all focus:ring-2"
                              value={valueField.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;

                                valueField.onChange(val === "" ? null : parseFloat(val));
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-background sticky bottom-0 mt-8 flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" className="min-w-[140px] font-bold" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
}
