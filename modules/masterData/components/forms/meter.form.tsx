"use client";

import React, { useEffect, useMemo } from "react";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { Switch } from "@/common/components/ui/switch";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { DialogFooter } from "@/common/components/ui/dialog";
import { categoryApi } from "@/modules/masterData/services/category.service";
import { STATUS_METER } from "../../types/meter.type";
import { MeterFormValues, meterSchema } from "../../schemas/meter.schema";
import { ENERGY_TYPES } from "@/common/types/energy";
import { MeterType } from "@/common/types/meters";
import { getTariffGroupsApi } from "../../services/tariffGroup.service";
import { getEnergyTypesApi } from "../../services/energyType.service";

interface MeterFormProps {
  initialData?: MeterType | null;
  onSubmit: SubmitHandler<MeterFormValues>;
  isLoading?: boolean;
}

export const MeterForm = ({
  initialData,
  onSubmit,
  isLoading,
}: MeterFormProps) => {
  const { data: energyTypeRes, isLoading: isLoadingEnergy } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: categoryRes, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: tariffGroupRes, isLoading: isLoadingTariff } = useQuery({
    queryKey: ["tariffGroups"],
    queryFn: getTariffGroupsApi,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const energyTypes = useMemo(() => energyTypeRes?.data || [], [energyTypeRes]);
  
  const categoriesData = useMemo(() => categoryRes?.data || [], [categoryRes]);

  const form = useForm<MeterFormValues>({
    resolver: zodResolver(meterSchema) as Resolver<MeterFormValues>,
    defaultValues: {
      meter_code: initialData?.meter_code ?? "",
      status: initialData?.status ?? STATUS_METER.ACTIVE,
      category_id: initialData?.category_id ?? undefined,
      tariff_group_id: initialData?.tariff_group_id ?? undefined,
      energy_type_id: initialData?.energy_type_id ?? undefined,
      tank_height_cm: initialData?.tank_height_cm ?? null,
      tank_volume_liters: initialData?.tank_volume_liters ?? null,
      has_rollover: Boolean(initialData?.rollover_limit),
      rollover_limit: initialData?.rollover_limit ?? null,
    },
  });

  const energyTypeId = form.watch("energy_type_id");
  const hasRollover = form.watch("has_rollover");

  const selectedEnergyType = useMemo(
    () => energyTypes.find((et) => et.energy_type_id === energyTypeId),
    [energyTypes, energyTypeId]
  );

  const isFuelType = selectedEnergyType?.type_name === ENERGY_TYPES.FUEL;

  const isRolloverEligible =
    selectedEnergyType?.type_name === ENERGY_TYPES.ELECTRICITY ||
    selectedEnergyType?.type_name === ENERGY_TYPES.WATER;

  useEffect(() => {
    if (!hasRollover) {
      form.setValue("rollover_limit", null, { shouldValidate: true });
    }
  }, [hasRollover, form]);

  const handleSubmit: SubmitHandler<MeterFormValues> = (data) => {
    if (isFuelType) {
      if (!data.tank_height_cm || !data.tank_volume_liters) {
        form.setError("tank_height_cm", {
          message: "Tinggi dan volume tangki wajib diisi untuk bahan bakar",
        });
        return;
      }
    }

    if (data.has_rollover && !data.rollover_limit) {
      form.setError("rollover_limit", {
        message: "Batas rollover wajib diisi",
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="meter_code"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Kode Meter</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: MTR-GDU-01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="energy_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Energi</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={isLoadingEnergy}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis energi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {energyTypes.map((et) => (
                      <SelectItem
                        key={et.energy_type_id}
                        value={String(et.energy_type_id)}
                      >
                        {et.type_name}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Aktif</SelectItem>
                    <SelectItem value="Inactive">Non-Aktif</SelectItem>
                    <SelectItem value="UnderMaintenance">
                      Dalam Perbaikan
                    </SelectItem>
                    <SelectItem value="DELETED">Dihapus</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={isLoadingCategory}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesData?.map((cat) => (
                      <SelectItem
                        key={cat.category_id}
                        value={String(cat.category_id)}
                      >
                        {cat.name}
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
            name="tariff_group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Golongan Tarif</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={isLoadingTariff}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih golongan tarif" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tariffGroupRes?.data?.map((tg) => (
                      <SelectItem
                        key={tg.tariff_group_id}
                        value={String(tg.tariff_group_id)}
                      >
                        {tg.group_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isFuelType && (
            <>
              <FormField
                control={form.control}
                name="tank_height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tinggi Tangki (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tank_volume_liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume Tangki (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {isRolloverEligible && (
            <div className="space-y-4 md:col-span-2">
              <FormField
                control={form.control}
                name="has_rollover"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Aktifkan Rollover</FormLabel>
                      <FormDescription>
                        Meter kembali ke 0 setelah mencapai batas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {hasRollover && (
                <FormField
                  control={form.control}
                  name="rollover_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batas Rollover</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
