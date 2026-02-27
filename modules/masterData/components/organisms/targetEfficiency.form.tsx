"use client";

import { ComponentLoader } from "@/common/components/ComponentLoader";
import { AlertDialogFooter } from "@/common/components/ui/alert-dialog";
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
import { ScrollArea } from "@/common/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { MeterType } from "@/common/types/meters";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Resolver, useForm } from "react-hook-form";

// Import Custom Hook & Types
import { useEfficiencyTargets } from "../../hooks/useEfficiencyTargets";
import {
  TargetEfficiencyFormValues,
  targetEfficiencySchema,
} from "../../schemas/targetEfficiency.schema";
import { getMetersApi } from "../../services/meter.service";
import { getEfficiencyTargetByIdApi } from "../../services/targetEfficiency.service";

interface TargetEfficiencyFormProps {
  onAfterSave?: () => void;
  itemId?: number;
}

export function TargetEfficiencyForm({ itemId, onAfterSave }: TargetEfficiencyFormProps) {
  // 1. Panggil Hook (Logic CRUD)
  // Ambil setEditingItem untuk memberi tahu hook bahwa ini adalah sesi EDIT
  const { save, isSaving, setEditingItem } = useEfficiencyTargets();

  const isEditing = !!itemId;

  // 2. Fetch Data (Detail Target)
  const { data: targetData, isLoading: isLoadingTarget } = useQuery({
    queryKey: ["targetEfficiency", itemId],
    queryFn: () => getEfficiencyTargetByIdApi(itemId!),
    enabled: isEditing,
  });

  const initialData = useMemo(() => targetData?.data, [targetData]);
  console.log(initialData);

  // 3. Setup Form
  const form = useForm<TargetEfficiencyFormValues>({
    resolver: zodResolver(
      targetEfficiencySchema
    ) as unknown as Resolver<TargetEfficiencyFormValues>,
    defaultValues: {
      kpi_name: "",
      target_percentage: 0,
      baseline_value: 0,
      meter_id: undefined,
      period_start: undefined,
      period_end: undefined,
    },
  });

  // 4. Effect: Populate Form & Sync Hook State
  useEffect(() => {
    if (initialData) {
      // a. Isi form dengan data
      form.reset({
        kpi_name: initialData.kpi_name,
        target_percentage: initialData.target_percentage,
        baseline_value: initialData.baseline_value,
        meter_id: initialData.meter_id,
        period_start: initialData.period_start ? new Date(initialData.period_start) : undefined,
        period_end: initialData.period_end ? new Date(initialData.period_end) : undefined,
      });

      // b. PENTING: Set state editingItem di hook agar fungsi 'save' melakukan UPDATE, bukan CREATE
      setEditingItem(initialData);
    }
  }, [initialData, form, setEditingItem]);

  // 5. Fetch Data Pendukung (Meters)
  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["allMeters"],
    queryFn: () => getMetersApi(),
  });

  const meters = metersResponse?.data.meter || [];
  const selectedMeterId = form.watch("meter_id");

  // 6. Handle Submit
  const onSubmit = (values: TargetEfficiencyFormValues) => {
    save(values);

    if (onAfterSave) {
      onAfterSave();
    }
  };

  if (isEditing && isLoadingTarget && isLoadingMeters) return <ComponentLoader />;

  return (
    <Form {...form}>
      <ScrollArea className="max-h-[70vh] px-4 pr-4">
        <form
          id="target-efficiency-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 pb-4"
        >
          {/* Meter Selection */}
          <FormField
            control={form.control}
            name="meter_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meter</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                  disabled={isLoadingMeters}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingMeters ? "Memuat..." : "Pilih Meter"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {meters.map((meter: MeterType) => (
                      <SelectItem key={meter.meter_id} value={String(meter.meter_id)}>
                        {meter.meter_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedMeterId && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
              {/* KPI Name */}
              <FormField
                control={form.control}
                name="kpi_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama KPI</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Contoh: Penghematan Listrik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Baseline Value */}
                <FormField
                  control={form.control}
                  name="baseline_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai Baseline</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription>Nilai referensi saat ini</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Percentage */}
                <FormField
                  control={form.control}
                  name="target_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Efisiensi (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.15"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription>Input desimal: 0.15 = 15%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Period Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="period_start"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Periode Mulai</FormLabel>
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
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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

                <FormField
                  control={form.control}
                  name="period_end"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Periode Selesai</FormLabel>
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
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
            </div>
          )}
        </form>
      </ScrollArea>

      <AlertDialogFooter className="mt-2 border-t pt-4">
        <Button
          type="submit"
          form="target-efficiency-form"
          className="w-full md:w-auto"
          disabled={isSaving}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </AlertDialogFooter>
    </Form>
  );
}
