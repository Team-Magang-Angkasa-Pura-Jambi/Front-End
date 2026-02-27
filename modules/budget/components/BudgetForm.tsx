"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Coins, Gauge, Loader2, PlusCircle, Trash2, Zap } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Resolver, useFieldArray, useForm, useWatch } from "react-hook-form";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { DialogFooter } from "@/common/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";

import { AnnualBudgetAllocation } from "@/common/types/budget";
import { EnergyType } from "@/common/types/energy";
import { cn } from "@/lib/utils";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { useAnnualBudgetLogic } from "../hooks/useAnnualBudgetLogic";
import { annualBudgetFormSchema, AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { annualBudgetApi } from "../services/annualBudget.service";

interface BudgetFormProps {
  editingBudgetId: number | null;
  onClose: () => void;
  energyTypes: EnergyType[];
}

export function BudgetForm({ editingBudgetId, onClose, energyTypes }: BudgetFormProps) {
  const { createOrUpdateMutation } = useAnnualBudgetLogic();

  // --- 1. RHF INITIALIZATION ---
  const form = useForm<AnnualBudgetFormValues>({
    resolver: zodResolver(annualBudgetFormSchema) as Resolver<AnnualBudgetFormValues>,
    defaultValues: {
      name: "",
      fiscal_year: new Date().getFullYear(),
      total_amount: 0,
      total_volume: 0,
      efficiency_target_percentage: 0,
      allocations: [],
    },
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  // --- 2. FETCH DETAIL IF EDITING ---
  const { data: detailRes, isLoading: isFetchingDetail } = useQuery({
    queryKey: ["annualBudgetDetail", editingBudgetId],
    queryFn: () => annualBudgetApi.getById(editingBudgetId!),
    enabled: !!editingBudgetId,
  });

  useEffect(() => {
    if (detailRes?.data) {
      const d = detailRes.data;
      reset({
        name: d.name,
        fiscal_year: d.fiscal_year,
        energy_type_id: d.energy_type_id,
        total_amount: d.total_amount,
        total_volume: d.total_volume,
        efficiency_target_percentage: Number(d.efficiency_target_percentage || 0),
        description: d.description || "",
        allocations:
          d.allocations?.map((alloc: AnnualBudgetAllocation) => ({
            allocation_id: alloc.allocation_id,
            meter_id: alloc.meter_id,
            allocated_amount: Number(alloc.allocated_amount),
            allocated_volume: Number(alloc.allocated_volume),
          })) || [],
      });
    }
  }, [detailRes, reset]);

  // --- 3. AUTO FETCH METERS ---
  const selectedEnergyTypeId = useWatch({ control, name: "energy_type_id" });
  const selectedEnergyId = useMemo(
    () => energyTypes.find((t) => t.energy_type_id === selectedEnergyTypeId)?.energy_type_id,
    [selectedEnergyTypeId, energyTypes]
  );

  const { data: metersRes, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["meters", selectedEnergyId],
    queryFn: () => getMetersApi(selectedEnergyId!),
    enabled: !!selectedEnergyId,
  });

  const meters = metersRes?.data?.meter || [];

  // --- 4. ALLOCATION LOGIC ---
  const { fields, append, remove } = useFieldArray({ control, name: "allocations" });
  const watchAllocations = useWatch({ control, name: "allocations" }) || [];
  const watchTotalAmount = useWatch({ control, name: "total_amount" }) || 0;
  const efficiencyTarget = useWatch({ control, name: "efficiency_target_percentage" }) || 0;

  const selectedMeterIds = watchAllocations.map((a) => a.meter_id).filter(Boolean);
  const currentAllocatedTotal = watchAllocations.reduce(
    (sum, item) => sum + Number(item.allocated_amount || 0),
    0
  );
  const remainingToAllocate = watchTotalAmount - currentAllocatedTotal;
  const isOverAllocated = remainingToAllocate < 0;

  // --- 5. SUBMIT HANDLER ---
  const onSubmit = (values: AnnualBudgetFormValues) => {
    createOrUpdateMutation.mutate(
      { values, isEditing: !!editingBudgetId, id: editingBudgetId ?? undefined },
      { onSuccess: onClose }
    );
  };

  if (isFetchingDetail) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="animate-pulse text-sm font-bold tracking-tighter uppercase">
          Syncing Budget Details...
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-8 px-6 py-6">
            {/* SECTION 1: INFO UMUM */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="text-xs font-bold uppercase opacity-60">
                      Nama Anggaran
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Listrik Terminal 2026"
                        className="h-11 font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="fiscal_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase opacity-60">Tahun</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-11 font-medium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="energy_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase opacity-60">Energi</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(Number(val));
                        reset({ ...form.getValues(), allocations: [] });
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 font-medium">
                          <SelectValue placeholder="Pilih Energi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {energyTypes.map((t) => (
                          <SelectItem key={t.energy_type_id} value={t.energy_type_id.toString()}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="opacity-50" />

            {/* SECTION 2: PLAFON */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                      <Coins size={14} /> Pagu Biaya
                    </FormLabel>
                    <FormControl>
                      <Input type="number" className="text-primary h-11 font-bold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="total_volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                      <Gauge size={14} /> Pagu Volume
                    </FormLabel>
                    <FormControl>
                      <Input type="number" className="h-11 font-bold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="efficiency_target_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                      <Zap size={14} /> Efisiensi
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-11 pr-12 font-bold"
                          {...field}
                        />
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-black uppercase opacity-40">
                          {(Number(field.value || 0) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="opacity-50" />

            {/* SECTION 3: ALLOCATIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-primary text-sm font-bold tracking-widest uppercase">
                  Titik Alokasi Meter
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:bg-primary/5 h-8 rounded-lg"
                  onClick={() =>
                    append({
                      meter_id: undefined as unknown as number,
                      allocated_amount: 0,
                      allocated_volume: 0,
                    })
                  }
                  disabled={
                    !selectedEnergyTypeId ||
                    isLoadingMeters ||
                    fields.length >= (meters?.length || 0)
                  }
                >
                  <PlusCircle size={14} className="mr-2" /> Tambah Unit
                </Button>
              </div>

              <AnimatePresence>
                {(errors.allocations?.root || isOverAllocated) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-start gap-3 rounded-xl border p-4 text-sm font-medium">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        {errors.allocations?.root?.message ||
                          "Alokasi biaya melebihi plafon utama."}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card
                className={cn(
                  "border-none shadow-none",
                  isOverAllocated ? "bg-destructive/10" : "bg-muted/50"
                )}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      Sisa Kuota Biaya
                    </span>
                    <span
                      className={cn("text-sm font-black", isOverAllocated && "text-destructive")}
                    >
                      Rp {remainingToAllocate.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <Badge
                    variant={isOverAllocated ? "destructive" : "secondary"}
                    className="font-bold"
                  >
                    {isOverAllocated ? "OVER" : "SAFE"}
                  </Badge>
                </CardContent>
              </Card>

              <div className="grid gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-card group hover:border-primary/40 relative flex flex-col items-start gap-4 rounded-xl border p-4 shadow-sm transition-all md:flex-row md:items-end"
                  >
                    <FormField
                      control={control}
                      name={`allocations.${index}.meter_id`}
                      render={({ field: selectField }) => (
                        <FormItem className="w-full flex-1">
                          <FormLabel className="text-[10px] font-bold uppercase opacity-40">
                            Meter Unit
                          </FormLabel>
                          <Select
                            onValueChange={(val) => selectField.onChange(Number(val))}
                            value={selectField.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/30 h-10 border-none font-medium">
                                <SelectValue placeholder="Pilih Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {meters.map((m) => {
                                const isSelectedElsewhere =
                                  selectedMeterIds.includes(m.meter_id) &&
                                  selectField.value !== m.meter_id;
                                return !isSelectedElsewhere ? (
                                  <SelectItem key={m.meter_id} value={m.meter_id.toString()}>
                                    {m.meter_code} - {m.name}
                                  </SelectItem>
                                ) : null;
                              })}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`allocations.${index}.allocated_amount`}
                      render={({ field }) => (
                        <FormItem className="w-full md:w-44">
                          <FormLabel className="text-[10px] font-bold uppercase opacity-40">
                            Amount
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="bg-muted/30 h-10 border-none font-bold"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive h-10 w-10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="bg-background sticky bottom-0 border-t p-6">
          <Button
            type="submit"
            size="lg"
            className="w-full font-black tracking-widest uppercase shadow-xl"
            disabled={createOrUpdateMutation.isPending || isOverAllocated}
          >
            {createOrUpdateMutation.isPending ? "Syncing to Sentinel..." : "Confirm & Save Budget"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
