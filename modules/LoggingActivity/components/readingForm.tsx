"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useForm,
  useFieldArray,
  Resolver,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";

import {
  formSchema,
  FormValues,
} from "@/modules/EnterData/schemas/reading.schema";
import { ApiErrorResponse } from "@/common/types/api";
import { ReadingPayload } from "@/modules/EnterData/services";
import {
  ReadingHistory,
  updateReadingSessionApi,
} from "../services/reading.service";

interface ReadingFormProps {
  initialData: ReadingHistory | null;
  onSuccess?: () => void;
}

export function ReadingForm({ initialData, onSuccess }: ReadingFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      meter_id: initialData?.meter.meter_id,
      reading_date: initialData?.reading_date
        ? new Date(initialData.reading_date)
        : new Date(),
      details: initialData?.details.map((d) => ({
        reading_type_id: d.reading_type.reading_type_id,
        value: d.value,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    ReadingPayload
  >({
    mutationFn: (payload) => {
      if (!initialData?.session_id)
        throw new Error("Session ID is missing for update.");
      return updateReadingSessionApi(initialData.session_id, payload);
    },
    onSuccess: () => {
      toast.success("Data berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan tidak terduga.";
      toast.error("Gagal Memperbarui Data", { description: message });
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
        <div className="grid items-start gap-4 md:grid-cols-2">
          <FormItem>
            <FormLabel className="text-muted-foreground text-xs font-bold tracking-tight uppercase">
              Meteran
            </FormLabel>
            <Input
              value={initialData?.meter.meter_code}
              disabled
              className="bg-muted/50 h-10" // Menyamakan tinggi (h-10)
            />
            <p className="text-muted-foreground mt-1 text-[10px] leading-tight">
              ID Meteran tidak dapat diubah saat update.
            </p>
          </FormItem>

          <div className="space-y-2">
            <span className="text-muted-foreground ml-1 text-xs font-bold tracking-tight uppercase">
              Waktu Data
            </span>
            <div className="bg-secondary/20 border-secondary/40 flex h-10 items-center gap-3 rounded-md border p-2">
              <CalendarIcon className="text-primary h-4 w-4 shrink-0" />
              <div className="flex min-w-0 flex-col">
                <p className="text-foreground truncate text-[11px] leading-tight font-bold">
                  {format(
                    initialData?.reading_date
                      ? new Date(initialData.reading_date)
                      : new Date(),
                    "EEEE, dd MMM yyyy",
                    {
                      locale: id,
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4 border-dashed" />

        {/* Dynamic Details Area */}
        <div className="space-y-4">
          <FormLabel>Detail Pembacaan</FormLabel>
          {fields.map((field, index) => {
            const label =
              initialData?.details[index]?.reading_type?.type_name || "Nilai";

            return (
              <div
                key={field.id}
                className="bg-background grid grid-cols-12 items-center gap-4 rounded-lg border p-3"
              >
                <div className="col-span-5">
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="col-span-7">
                  <FormField
                    control={form.control}
                    name={`details.${index}.value`}
                    render={({ field: valueField }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Masukkan angka..."
                            value={valueField.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              valueField.onChange(
                                val === "" ? null : parseFloat(val)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onSuccess?.()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memperbarui...
              </>
            ) : (
              "Update Data"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
