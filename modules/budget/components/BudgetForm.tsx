"use client";

import React from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import {
  CalendarIcon,
  PlusCircle,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/common/components/ui/button";
import { DialogFooter } from "@/common/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { Calendar } from "@/common/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Label } from "@/common/components/ui/label";
import { Separator } from "@/common/components/ui/separator";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import BudgetPreview from "./BudgetPreview";
import { AnnualBudget } from "@/common/types/budget";
import { EnergyType } from "@/common/types/energy";
import { MeterType } from "@/common/types/meters";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { PrepareNextPeriodBudget } from "../services/analytics.service";

interface BudgetFormProps {
  budgetType: "parent" | "child";
  setBudgetType: (type: "parent" | "child") => void;
  editingBudget: AnnualBudget | null;
  isSubmitting: boolean;
  parentBudgets: AnnualBudget[];
  energyTypes: EnergyType[];
  meters: MeterType[];
  isLoadingMeters: boolean;
  isLoadingEnergyTypes: boolean;
  prepareNextPeriodBudget?: PrepareNextPeriodBudget;
  selectedEnergyTypeName?: string;
  isValidTotal?: boolean;
  totalWeight?: number;
  targetTotal?: number;
}

export function BudgetForm({
  budgetType,
  setBudgetType,
  editingBudget,
  isSubmitting,
  parentBudgets,
  energyTypes,
  meters,
  isLoadingEnergyTypes,
  prepareNextPeriodBudget,
  selectedEnergyTypeName,
  isValidTotal,
  totalWeight,
  targetTotal,
}: BudgetFormProps) {
  const form = useFormContext<AnnualBudgetFormValues>();

  const { control, setValue, watch } = form;

  const periodStart = watch("period_start");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  const allocationValues = useWatch({ control, name: "allocations" }) || [];

  const selectedMeterIds = allocationValues
    .map((alloc) => alloc?.meter_id)
    .filter(Boolean);

  const selectedEnergyTypeId = useWatch({ control, name: "energy_type_id" });

  const availableBudget =
    prepareNextPeriodBudget?.availableBudgetForNextPeriod ?? 0;

  return (
    <>
      <ScrollArea className="max-h-[75vh] overflow-y-auto px-1">
        <div className="space-y-6 px-4 py-2">
          {/* TIPE ANGGARAN */}
          <div className="space-y-3">
            <FormLabel className="text-primary text-base font-bold">
              Tipe Anggaran
            </FormLabel>
            <RadioGroup
              onValueChange={(value: "parent" | "child") => {
                setBudgetType(value);
                setValue("budgetType", value, { shouldValidate: true });

                if (value === "parent") setValue("allocations", []);
              }}
              value={budgetType}
              className="grid grid-cols-2 gap-4"
              disabled={!!editingBudget}
            >
              <div>
                <RadioGroupItem
                  value="parent"
                  id="parent"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="parent"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <span className="text-lg font-semibold">Induk (Tahunan)</span>
                  <span className="text-muted-foreground mt-1 text-center text-xs">
                    Anggaran dasar per tahun
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="child"
                  id="child"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="child"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <span className="text-lg font-semibold">Periode (Anak)</span>
                  <span className="text-muted-foreground mt-1 text-center text-xs">
                    Sub-anggaran bulanan/triwulan
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* INPUT TANGGAL */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={control}
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
                            format(field.value, "d MMMM yyyy", { locale: id })
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
                        className="rounded-md border shadow"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
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
                          disabled={!periodStart}
                        >
                          {field.value ? (
                            format(field.value, "d MMMM yyyy", { locale: id })
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
                        disabled={(date) => date < (periodStart || new Date(0))}
                        initialFocus
                        className="rounded-md border shadow"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* LOGIC UNTUK CHILD BUDGET */}
          {budgetType === "child" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <FormField
                control={control}
                name="parent_budget_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran Induk (Annual)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : ""}
                      disabled={!!editingBudget}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Anggaran Induk" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentBudgets.map((budget) => (
                          <SelectItem
                            key={budget.budget_id}
                            value={String(budget.budget_id)}
                          >
                            {`${budget.energy_type?.type_name} - ${new Date(
                              budget.period_start
                            ).getFullYear()}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* TOTAL BUDGET & SAVING */}
          <div
            className={cn(
              "grid grid-cols-1 gap-6",

              budgetType === "parent" ? "md:grid-cols-2" : "md:grid-cols-1"
            )}
          >
            {/* FIELD 1: TOTAL BUDGET */}
            <FormField
              control={control}
              name="total_budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Budget (Rp)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        min={0}
                        {...field}
                        max={
                          budgetType === "child" ? availableBudget : undefined
                        }
                        className="h-11 pr-28 text-lg font-medium"
                      />

                      {/* Tombol Gunakan Sisa (Child Mode Only) */}
                      {budgetType === "child" && availableBudget > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-1/2 right-1.5 h-8 -translate-y-1/2 bg-blue-50 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          onClick={() =>
                            setValue("total_budget", availableBudget)
                          }
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Max: {formatCurrency(availableBudget)}
                        </Button>
                      )}
                    </div>
                  </FormControl>

                  {/* Helper Text Sisa Budget */}
                  {budgetType === "child" && prepareNextPeriodBudget && (
                    <FormDescription
                      className={cn(
                        "mt-1 text-xs",
                        availableBudget < 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {availableBudget < 0
                        ? "Anggaran induk sudah over-budget!"
                        : "Sesuai sisa anggaran induk yang tersedia."}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* FIELD 2: EFFICIENCY TAG (Hanya muncul saat Parent Mode) */}
            {budgetType === "parent" && (
              <FormField
                control={control}
                name="efficiency_tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Efisiensi (Saving)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.001"
                          min={0}
                          placeholder="0.005"
                          {...field}
                          className="h-11"
                        />
                        <div className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                          {(parseFloat(String(field.value || 0)) * 100).toFixed(
                            1
                          )}
                          %
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Masukkan dalam desimal (contoh: 0.05 = 5%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* PILIH ENERGI */}
          <div className="bg-muted/30 rounded-lg border border-dashed p-4">
            {budgetType === "parent" ? (
              <FormField
                control={control}
                name="energy_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Tipe Energi</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                        setValue("allocations", []);
                      }}
                      value={field.value ? String(field.value) : ""}
                      disabled={isLoadingEnergyTypes || !!editingBudget}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Pilih Tipe Energi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {energyTypes.map((type) => (
                          <SelectItem
                            key={type.energy_type_id}
                            value={String(type.energy_type_id)}
                          >
                            {type.type_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                    Tipe Energi (Otomatis)
                  </Label>
                  <div className="text-primary text-lg font-bold">
                    {selectedEnergyTypeName || "Menunggu Anggaran Induk..."}
                  </div>
                </div>
                {selectedEnergyTypeName && (
                  <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    Auto-inherit
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ALOKASI METER (Hanya Child) */}
          {budgetType === "child" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 border-t pt-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <FormLabel className="text-base font-semibold">
                    Alokasi per Meter
                  </FormLabel>
                  <p className="text-muted-foreground text-xs">
                    Tentukan bobot alokasi untuk setiap meter.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      meter_id: undefined as unknown as number,
                      weight: 0,
                    })
                  }
                  disabled={
                    !selectedEnergyTypeId ||
                    fields.length >= (meters.length || 0)
                  }
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Tambah Meter
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="bg-muted/10 text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
                  Belum ada meter yang dialokasikan.
                </div>
              )}

              <div className="grid gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-card hover:border-primary/50 flex items-start gap-3 rounded-xl border p-3 shadow-sm transition-all"
                  >
                    <div className="flex-1">
                      <FormField
                        control={control}
                        name={`allocations.${index}.meter_id`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={field.value ? String(field.value) : ""}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Pilih Meter" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {meters.map((m) => (
                                  <SelectItem
                                    key={m.meter_id}
                                    value={String(m.meter_id)}
                                    disabled={
                                      selectedMeterIds.includes(m.meter_id) &&
                                      m.meter_id !== field.value
                                    }
                                  >
                                    {m.meter_code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="mt-1 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-28">
                      <FormField
                        control={control}
                        name={`allocations.${index}.weight`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  placeholder="Bobot"
                                  className="h-10 pr-6 text-right"
                                  {...field}
                                />
                                <span className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs font-medium">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage className="mt-1 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-10 w-10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all",
                  isValidTotal
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                )}
              >
                <div className="flex items-center gap-2">
                  {isValidTotal ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      Total Alokasi: {totalWeight?.toFixed(2)}%
                    </span>
                    {!isValidTotal && (
                      <span className="text-xs opacity-90">
                        Total harus tepat 100%. (Kurang/Lebih:{" "}
                        {((targetTotal ?? 0) - (totalWeight ?? 0)).toFixed(2)}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Indikator Status Kanan */}
                <div className="text-right font-medium">
                  {isValidTotal ? "Valid" : "Invalid"}
                </div>
              </div>

              {/* Preview Kalkulasi */}
              <div className="border-primary/10 bg-primary/5 mt-4 overflow-hidden rounded-xl border">
                <BudgetPreview />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <DialogFooter className="bg-background sticky bottom-0 border-t px-6 py-4">
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Anggaran"}
        </Button>
      </DialogFooter>
    </>
  );
}
