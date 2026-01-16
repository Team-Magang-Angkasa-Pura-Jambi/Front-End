"use client";

import React from "react";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarIcon, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { DailyPaxData } from "./PaxDailyTable";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";
import { updatePaxApi } from "../services/pax.service";

const formSchema = z.object({
  total_pax: z.coerce
    .number({ error: "Pax harus berupa angka." })
    .int("Jumlah pax harus bilangan bulat.")
    .positive({ message: "Jumlah pax harus positif." }),
});

type FormValues = z.infer<typeof formSchema>;

interface PaxEditFormProps {
  initialData: DailyPaxData;
  onSuccess?: () => void;
}

export const PaxEditForm: React.FC<PaxEditFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      total_pax: initialData?.totalPax,
    },
  });

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    FormValues
  >({
    mutationFn: (payload: FormValues) =>
      updatePaxApi(initialData.paxId, payload),
    onSuccess: () => {
      toast.success("Jumlah Pax berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Gagal memperbarui Pax", {
        description:
          error.response?.data?.status?.message || "Terjadi kesalahan.",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-muted/50 flex items-center gap-3 rounded-md border p-4">
          <CalendarIcon className="text-muted-foreground h-5 w-5" />
          <p className="font-semibold">
            {format(new Date(initialData?.date), "EEEE, dd MMMM yyyy", {
              locale: id,
            })}
          </p>
        </div>
        <FormField
          control={form.control}
          name="total_pax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Pax</FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="number"
                    placeholder="0"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Pax
          </Button>
        </div>
      </form>
    </Form>
  );
};
