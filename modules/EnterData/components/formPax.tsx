"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Users } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

import { ApiErrorResponse } from "@/common/types/api";
import { AxiosError } from "axios";
import { PaxPayload, submitPaxApi } from "../services/pax.service";

interface FormPaxProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  date: z.date({ error: "Tanggal wajib diisi." }),
  pax_count: z.coerce
    .number()
    .int("Jumlah pax harus bilangan bulat.")
    .positive({ message: "Jumlah pax harus positif." }),
});

type FormValues = z.infer<typeof formSchema>;

export const FormReadingPax = ({ onSuccess }: FormPaxProps) => {
  const queryClient = useQueryClient();
  // const { user } = useAuthStore();
  // const __canChangeDate = user?.role === "Admin" || user?.role === "SuperAdmin";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      date: new Date(),
      pax_count: 0,
    },
  });

  const { mutate, isPending } = useMutation<unknown, AxiosError<ApiErrorResponse>, PaxPayload>({
    mutationFn: (paxData) => submitPaxApi(paxData),
    onSuccess: () => {
      toast.success("Data Pax berhasil dikirim!");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["paxData"] });
      onSuccess?.();
    },
    onError: (error) => {
      const message = error.response?.data?.status?.message || "Terjadi kesalahan tidak terduga.";
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    const date = values.date;

    const dateInUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    const payload: PaxPayload = {
      date: dateInUTC.toISOString(),
      pax_count: values.pax_count,
    };
    mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                          }`}
                      // disabled={!canChangeDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      defaultMonth={field.value || new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pax_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Pax</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      min={0}
                      type="number"
                      className="pl-10"
                      placeholder="Masukkan jumlah pax"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim Data"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
