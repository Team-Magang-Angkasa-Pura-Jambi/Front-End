"use client";

import React from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { CalendarIcon, PlusCircle, XCircle, Copy } from "lucide-react";
import { format } from "date-fns-tz";

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
  prepareNextPeriodBudget: PrepareNextPeriodBudget;
  selectedEnergyTypeName?: string;
}

export function BudgetForm({
  budgetType,
  setBudgetType,
  editingBudget,
  isSubmitting,
  parentBudgets,
  energyTypes,
  meters,
  isLoadingMeters,
  isLoadingEnergyTypes,
  prepareNextPeriodBudget,
  selectedEnergyTypeName,
}: BudgetFormProps) {
  const form = useFormContext<AnnualBudgetFormValues>();
  const { control, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  const allocationValues = useWatch({ control, name: "allocations" }) || [];
  const selectedMeterIds = allocationValues.map((alloc) => alloc?.meter_id);
  const selectedEnergyTypeId = useWatch({ control, name: "energy_type_id" });

  return (
    <>
      <ScrollArea className="max-h-[80vh] overflow-y-auto px-6 py-2">
        <div className="space-y-6 pb-6">
          <div className="space-y-3">
            <FormLabel className="text-base font-bold text-primary">
              Tipe Anggaran
            </FormLabel>
            <RadioGroup
              onValueChange={(value: "parent" | "child") => {
                setBudgetType(value);
                setValue("budgetType", value, { shouldValidate: true });

                if (value === "parent") setValue("allocations", []);
              }}
              value={budgetType}
              className="flex items-center space-x-6 p-2 border rounded-lg bg-muted/20"
              disabled={!!editingBudget}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parent" id="parent" />
                <Label htmlFor="parent" className="font-medium cursor-pointer">
                  Induk (Tahunan)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="child" id="child" />
                <Label htmlFor="child" className="font-medium cursor-pointer">
                  Periode (Anak)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        numberOfMonths={2}
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
                        disabled={(date) =>
                          date < (getValues("period_start") || new Date(0))
                        }
                        numberOfMonths={2}
                        className="rounded-md border shadow"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {budgetType === "child" && (
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
                          {`Tahun ${new Date(
                            budget.period_start
                          ).getFullYear()} - ${budget.energy_type.type_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={control}
            name="total_budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Budget</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Input nominal budget"
                      {...field}
                      max={
                        prepareNextPeriodBudget?.availableBudgetForNextPeriod ||
                        undefined
                      }
                      className="pr-24 h-11 text-lg font-medium"
                    />
                    {budgetType === "child" &&
                      (prepareNextPeriodBudget?.availableBudgetForNextPeriod ??
                        0) > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 text-xs"
                          onClick={() =>
                            setValue(
                              "total_budget",
                              prepareNextPeriodBudget.availableBudgetForNextPeriod
                            )
                          }
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Gunakan Sisa
                        </Button>
                      )}
                  </div>
                </FormControl>
                {budgetType === "child" && prepareNextPeriodBudget && (
                  <FormDescription className="bg-blue-50 p-2 rounded border border-blue-100 text-blue-700">
                    Maksimum alokasi tersedia:{" "}
                    <span className="font-bold">
                      {formatCurrency(
                        prepareNextPeriodBudget.availableBudgetForNextPeriod ||
                          0
                      )}
                    </span>
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {budgetType === "parent" && (
            <FormField
              control={control}
              name="efficiency_tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Efisiensi (Saving %)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="Contoh: 0.005 untuk 0.5%"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nilai 0.005 berarti target penghematan 0.5% dari budget
                    dasar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
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
                        <SelectTrigger>
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
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Tipe Energi Terpilih
                </Label>
                <div className="text-lg font-bold text-primary">
                  {selectedEnergyTypeName || "Belum dipilih"}
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Diwarisi otomatis dari anggaran induk.
                </p>
              </div>
            )}
          </div>

          {budgetType === "child" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Alokasi per Meter</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      meter_id: undefined,
                      weight: undefined,
                    })
                  }
                  disabled={
                    !selectedEnergyTypeId ||
                    fields.length >= (meters.length || 0)
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Meter
                </Button>
              </div>

              <div className="grid gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 items-start bg-background p-3 border rounded-xl shadow-sm"
                  >
                    <div className="flex-1">
                      <FormField
                        control={control}
                        name={`allocations.${index}.meter_id`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={field.value ? String(field.value) : ""}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-muted/10">
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
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-32">
                      <FormField
                        control={control}
                        name={`allocations.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Bobot"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => remove(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border-2 border-primary/10 overflow-hidden">
                <BudgetPreview />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <DialogFooter className="sticky bottom-0 bg-background px-6 py-4 border-t">
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto px-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Simpan Anggaran"}
        </Button>
      </DialogFooter>
    </>
  );
}
