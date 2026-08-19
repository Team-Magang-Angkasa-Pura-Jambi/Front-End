"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon, Loader2, Users } from "lucide-react";
import React, { useEffect } from "react";
import { FieldErrors, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/common/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";

import { ApiErrorResponse } from "@/common/types/api";
import { updatePaxApi } from "../services/pax.service";
import { DailyPaxData } from "./PaxDailyTable";

const formSchema = z.object({
  pax_count: z.coerce
    .number({ error: "Pax harus berupa angka." })
    .int("Jumlah pax harus bilangan bulat.")
    .min(0, { message: "Jumlah pax tidak boleh negatif." }),
});

type FormValues = z.infer<typeof formSchema>;

interface PaxEditFormProps {
  initialData: DailyPaxData;
  onSuccess?: () => void;
}

export const PaxEditForm: React.FC<PaxEditFormProps> = ({ initialData, onSuccess }) => {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      pax_count: initialData?.pax_count || 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        pax_count: initialData.pax_count,
      });
    }
  }, [initialData, form]);

  const { mutate, isPending } = useMutation<unknown, AxiosError<ApiErrorResponse>, FormValues>({
    mutationFn: (payload: FormValues) => updatePaxApi(initialData.pax_id, payload),
    onSuccess: async () => {
      toast.success("Jumlah Pax berhasil diperbarui!");

      await queryClient.invalidateQueries({ queryKey: ["paxHistory"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Gagal Memperbarui Pax", {
        description: error.response?.data?.status?.message || "Terjadi kesalahan sistem.",
      });
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    mutate(values);
  };

  const onFormError = (errors: FieldErrors<FormValues>) => {
    console.error("Validation Errors:", errors);
    toast.error("Validasi Gagal", {
      description: "Pastikan jumlah penumpang diisi dengan angka yang benar.",
    });
  };

  if (!initialData) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6">
        {/* INFO CARD READ-ONLY */}
        <div className="bg-secondary/30 border-secondary/50 flex items-center gap-4 rounded-xl border p-4">
          <div className="bg-primary/10 rounded-full p-2">
            <CalendarIcon className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              Tanggal Penumpang
            </p>
            <p className="text-foreground leading-tight font-semibold">
              {format(new Date(initialData.date), "EEEE, dd MMMM yyyy", {
                locale: localeId,
              })}
            </p>
          </div>
        </div>

        {/* INPUT FIELD */}
        <FormField
          control={form.control}
          name="pax_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase opacity-80">
                Total Penumpang (Pax)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-background pl-10 font-mono text-base font-semibold"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : parseInt(val, 10));
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {/* ACTION BUTTONS */}
        <div className="bg-background sticky bottom-0 mt-8 flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="min-w-[140px] font-bold"
            disabled={isPending || !form.formState.isDirty}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Update Pax"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
