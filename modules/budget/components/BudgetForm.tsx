"use client";

import React from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { CalendarIcon, PlusCircle, XCircle, Copy } from "lucide-react";
import { format } from "date-fns-tz";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import BudgetPreview from "./BudgetPreview";
import { AnnualBudget } from "@/common/types/budget";
import { EnergyType } from "@/common/types/energy";
import { MeterType } from "@/common/types/meters";
import { AnnualBudgetFormValues } from "../schemas/annualBudget.schema";
import { prepareNextPeriodBudget } from "../services/analytics.service";

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
  prepareNextPeriodBudget: prepareNextPeriodBudget;
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

  const allocationValues = useWatch({
    control,
    name: "allocations",
  });

  const selectedMeterIds = (allocationValues || []).map(
    (alloc) => alloc?.meter_id
  );

  const currentBudgetType = useWatch({
    control,
    name: "budgetType",
  });

  const selectedEnergyTypeId = useWatch({
    control,
    name: "energy_type_id",
  });

  return (
    <>
      <ScrollArea className="max-h-[70vh] overflow-y-auto p-4 -m-4">
        <div className="space-y-6 p-4">
          <div className="col-span-2 space-y-2">
            <FormLabel>Tipe Anggaran</FormLabel>
            <RadioGroup
              onValueChange={(value: "parent" | "child") => {
                setBudgetType(value);
                setValue("budgetType", value, {
                  shouldValidate: true,
                });
              }}
              value={budgetType}
              className="flex items-center space-x-4"
              disabled={!!editingBudget}
            >
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="parent" />
                </FormControl>
                <FormLabel className="font-normal">
                  Anggaran Induk (Tahunan)
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="child" />
                </FormControl>
                <FormLabel className="font-normal">
                  Anggaran Periode (Anak)
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
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
              control={control}
              name="period_end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Periode Selesai</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
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
                        initialFocus
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
                  <FormLabel>Anggaran Induk</FormLabel>
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
                      placeholder="e.g., 50000000"
                      {...field}
                      max={
                        budgetType === "child" &&
                        prepareNextPeriodBudget?.availableBudgetForNextPeriod
                      }
                      className="pr-28"
                    />
                    {budgetType === "child" &&
                      prepareNextPeriodBudget?.availableBudgetForNextPeriod >
                        0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                          onClick={() =>
                            setValue(
                              "total_budget",
                              prepareNextPeriodBudget.availableBudgetForNextPeriod
                            )
                          }
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Gunakan
                        </Button>
                      )}
                  </div>
                </FormControl>
                {budgetType === "child" && prepareNextPeriodBudget && (
                  <FormDescription>
                    Sisa budget dari induk yang dapat dialokasikan:{" "}
                    {formatCurrency(
                      prepareNextPeriodBudget.availableBudgetForNextPeriod || 0
                    )}
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
                  <FormLabel>Efficiency Tag (0-1)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 0.85"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentBudgetType === "parent" && (
            <FormField
              control={control}
              name="energy_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Energi</FormLabel>
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
                        <SelectValue
                          placeholder={
                            isLoadingEnergyTypes
                              ? "Memuat..."
                              : "Pilih Tipe Energi"
                          }
                        />
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
          )}

          {budgetType === "child" && selectedEnergyTypeName && (
            <div className="space-y-2">
              <Label>Tipe Energi</Label>
              <Input
                value={selectedEnergyTypeName}
                disabled
                className="font-semibold"
              />
              <p className="text-sm text-muted-foreground">
                Tipe energi diwarisi dari anggaran induk yang dipilih.
              </p>
            </div>
          )}

          {/* --- Bagian Alokasi Meter --- */}
          {(budgetType === "child" ||
            (editingBudget && editingBudget.allocations?.length > 0)) && (
            <div className="col-span-2">
              <FormLabel>Alokasi Meter</FormLabel>
              <div className="space-y-3 mt-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-x-2 gap-y-2 items-start p-3 border rounded-md"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <FormField
                        control={control}
                        name={`allocations.${index}.meter_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Meter</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ? String(field.value) : ""}
                              disabled={isLoadingMeters || isLoadingEnergyTypes}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isLoadingMeters
                                        ? "Memuat..."
                                        : "Pilih Meter"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {meters
                                  .filter(
                                    (meter) =>
                                      !selectedMeterIds.includes(
                                        meter.meter_id.toString()
                                      ) || field.value === meter.meter_id.toString()
                                  )
                                  .map((meter) => (
                                    <SelectItem
                                      key={meter.meter_id}
                                      value={String(meter.meter_id)}
                                      disabled={
                                        selectedMeterIds.includes(
                                          meter.meter_id
                                        ) && meter.meter_id !== field.value
                                      }
                                    >
                                      {meter.meter_code}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-10 sm:col-span-5">
                      <FormField
                        control={control}
                        name={`allocations.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Bobot</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Bobot (0-1)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  append({ meter_id: undefined, weight: undefined })
                }
                disabled={
                  !selectedEnergyTypeId ||
                  isLoadingMeters ||
                  isLoadingEnergyTypes ||
                  fields.length >= meters.length
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Alokasi
              </Button>
              <FormMessage />
              <BudgetPreview />
            </div>
          )}
        </div>
      </ScrollArea>
      <DialogFooter className="p-4 pt-0">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </>
  );
}