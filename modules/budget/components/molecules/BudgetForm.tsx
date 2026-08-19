"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Coins, Loader2, Zap } from "lucide-react";
import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";

import { Button } from "@/common/components/ui/button";
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

import { EnergyType } from "@/common/types/energy";
import { useAnnualBudgetLogic } from "../../hooks/useAnnualBudgetLogic";
import { annualBudgetFormSchema, AnnualBudgetFormValues } from "../../schemas/annualBudget.schema";
import { annualBudgetApi } from "../../services/annualBudget.service";

interface BudgetFormProps {
  editingBudgetId: number | null;
  onClose: () => void;
  energyTypes: EnergyType[];
}

export function BudgetForm({ editingBudgetId, onClose, energyTypes }: BudgetFormProps) {
  const { createOrUpdateMutation } = useAnnualBudgetLogic();
  const isEditing = !!editingBudgetId;

  const form = useForm<AnnualBudgetFormValues>({
    resolver: zodResolver(annualBudgetFormSchema) as Resolver<AnnualBudgetFormValues>,
    defaultValues: {
      name: "",
      fiscal_year: new Date().getFullYear(),
      energy_type_id: undefined,
      total_amount: 0,
      efficiency_target_percentage: 0,
    },
  });

  const { control, reset, handleSubmit } = form;

  const { data: detailRes, isFetching: isFetchingDetail } = useQuery({
    queryKey: ["annualBudgetDetail", editingBudgetId],
    queryFn: () => annualBudgetApi.getById(editingBudgetId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && detailRes?.data) {
      const d = detailRes.data;
      reset({
        name: d.name || "",
        fiscal_year: Number(d.fiscal_year) || new Date().getFullYear(),
        energy_type_id: Number(d.energy_type_id),
        total_amount: Number(d.total_amount) || 0,
        efficiency_target_percentage: Number(d.efficiency_target_percentage || 0),
      });
    }
  }, [detailRes?.data, isEditing, reset]);

  const onSubmit = (values: AnnualBudgetFormValues) => {
    createOrUpdateMutation.mutate(
      { values, isEditing, id: editingBudgetId ?? undefined },
      { onSuccess: onClose }
    );
  };

  const isSyncingDetail = isEditing && isFetchingDetail;
  const isWaitingForEnergyTypes = !energyTypes || energyTypes.length === 0;

  if (isSyncingDetail || isWaitingForEnergyTypes) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="animate-pulse text-sm font-bold tracking-tighter uppercase">
          {isWaitingForEnergyTypes ? "Memuat Tipe Energi..." : "Menyiapkan Data Anggaran..."}
        </p>
      </div>
    );
  }

  if (isEditing && !detailRes?.data) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-8 px-6 py-6">
            {/* Bagian Informasi Utama */}
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
                        placeholder="Contoh: Anggaran Listrik Terminal 2026"
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
                    <FormLabel className="text-xs font-bold uppercase opacity-60">
                      Jenis Energi
                    </FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 font-medium">
                          <SelectValue placeholder="Pilih Jenis Energi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {energyTypes?.map((t) => (
                          <SelectItem key={t.energy_type_id} value={String(t.energy_type_id)}>
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

            {/* Bagian Target & Kuota Utama */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                      <Coins size={14} /> Total Dana (Rp)
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
                name="efficiency_target_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                      <Zap size={14} /> Target Hemat Energi
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
                          {Math.round(Number(field.value || 0) * 100)}%
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="bg-background sticky bottom-0 border-t p-6">
          <Button
            type="submit"
            size="lg"
            className="w-full font-black tracking-widest uppercase shadow-xl"
            disabled={createOrUpdateMutation.isPending}
          >
            {createOrUpdateMutation.isPending ? "Menyimpan Data..." : "Simpan Anggaran"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
