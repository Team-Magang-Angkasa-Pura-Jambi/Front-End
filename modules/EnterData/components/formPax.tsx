"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Users } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { submitPaxApi, PaxPayload } from "@/services/pax.service";
import { useAuthStore } from "@/stores/authStore";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/common/types/api";

interface FormPaxProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  data_date: z.date({ error: "Tanggal wajib diisi." }),
  total_pax: z.coerce
    .number()
    .int("Jumlah pax harus bilangan bulat.")
    .positive({ message: "Jumlah pax harus positif." }),
});

type FormValues = z.infer<typeof formSchema>;

export const FormReadingPax = ({ onSuccess }: FormPaxProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canChangeDate = user?.role === "Admin" || user?.role === "SuperAdmin";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      data_date: new Date(),
      total_pax: 0,
    },
  });

  const { mutate, isPending } = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    PaxPayload
  >({
    mutationFn: (paxData) => submitPaxApi(paxData),
    onSuccess: () => {
      toast.success("Data Pax berhasil dikirim!");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["paxData"] });
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error.response?.data?.status?.message ||
        "Terjadi kesalahan tidak terduga.";
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    const date = values.data_date;

    const dateInUTC = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    const payload: PaxPayload = {
      data_date: dateInUTC.toISOString(),
      total_pax: values.total_pax,
    };
    mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="data_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                        disabled={!canChangeDate}
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
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
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
            name="total_pax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Pax</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
