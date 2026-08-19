"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, Info, PlusCircle, Trash2, Zap } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";

import { ComponentLoader } from "@/common/components/ComponentLoader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { PriceSchemeType } from "@/common/types/schemaPrice";
import { useQuery } from "@tanstack/react-query";
import { priceSchemeSchema, SchemaFormValues } from "../../schemas/schemaPrice.schema";
import { getReadingTypesApi } from "../../services/readingsType.service";

interface PriceSchemeFormProps {
  initialData?: PriceSchemeType | null;
  onSubmit: (payload: unknown) => void; // Payload diubah ke 'any' karena akan di-transform
  isLoading?: boolean;
}

export function PriceSchemeForm({ initialData, onSubmit, isLoading }: PriceSchemeFormProps) {
  const { data: readingTypeRes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["readingTypes"],
    queryFn: () => getReadingTypesApi(),
  });

  const allReadingTypes = useMemo(() => readingTypeRes?.data || [], [readingTypeRes]);

  const form = useForm<SchemaFormValues>({
    resolver: zodResolver(priceSchemeSchema) as unknown as Resolver<SchemaFormValues>,
    defaultValues: {
      name: "",
      effective_date: new Date(),
      is_active: true,
      rates: [{ reading_type_id: 0, rate_value: 0 }],
    },
  });

  // Sinkronisasi data saat Edit Mode
  useEffect(() => {
    if (initialData && allReadingTypes.length > 0) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        effective_date: new Date(initialData.effective_date),
        is_active: initialData.is_active,
        rates: initialData.tariffs.map((t) => ({
          reading_type_id:
            allReadingTypes.find((rt) => rt.type_name === t.label)?.reading_type_id || 0,
          rate_value: Number(t.value),
        })),
      });
    }
  }, [initialData, allReadingTypes, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rates",
  });

  // --- Transformasi Data ke Format Backend ---
  const handleFormSubmit = (values: SchemaFormValues) => {
    const payload = {
      scheme: {
        name: values.name,
        description: values.description,
        effective_date: values.effective_date,
        is_active: values.is_active,
        rates: {
          // Menggunakan 'create' sesuai schema store/patch Backend
          create: values.rates.map((r) => ({
            reading_type_id: r.reading_type_id,
            rate_value: r.rate_value,
          })),
        },
      },
    };
    onSubmit(payload);
  };

  if (isLoading || isLoadingTypes) return <ComponentLoader />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Skema</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Tarif Listrik Tenant 2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="effective_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-2">Tanggal Efektif</FormLabel>
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
                        {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("2000-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="flex items-center gap-1 text-[10px]">
                  <Info className="h-3 w-3" /> Tarif berlaku mulai tanggal terpilih.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section: Dynamic Rates */}
        <div className="bg-muted/30 rounded-xl border border-dashed p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-primary flex items-center gap-2 text-sm font-bold">
                <Zap className="fill-primary h-4 w-4" /> Rincian Nilai Tarif
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => append({ reading_type_id: 0, rate_value: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Baris
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="animate-in fade-in slide-in-from-top-1 bg-background flex items-start gap-3 rounded-lg border p-3 shadow-sm"
              >
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`rates.${index}.reading_type_id`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value === 0 ? "" : String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Tipe Pembacaan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allReadingTypes.map((rt) => (
                              <SelectItem
                                key={rt.reading_type_id}
                                value={String(rt.reading_type_id)}
                              >
                                {rt.type_name} ({rt.unit})
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
                    name={`rates.${index}.rate_value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <span className="text-muted-foreground absolute top-2.5 left-3 text-xs font-bold">
                              Rp
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              className="pl-8"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Global Error Handling (e.g. Duplicates) */}
            {form.formState.errors.rates?.root && (
              <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-2 text-[12px] font-medium">
                <AlertCircle className="h-4 w-4" />
                {form.formState.errors.rates.root.message}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 pt-4 md:flex-row">
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isDirty}
            className="w-full px-10 md:w-auto"
          >
            {isLoading ? "Memproses..." : initialData ? "Simpan Perubahan" : "Buat Skema"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
