"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { taxSchema, taxFormValue } from "../../schemas/taxes.schema";
import { Taxes } from "@/common/types/taxes";

interface TaxFormProps {
  initialData?: Taxes | null;
  onSubmit: (values: taxFormValue) => void;
  isLoading?: boolean;
}

export function TaxForm({ initialData, onSubmit, isLoading }: TaxFormProps) {
  const form = useForm<taxFormValue>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      tax_name: initialData?.tax_name ?? "",
      rate: initialData?.rate ?? 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tax_name">Nama Pajak</Label>
        <Input
          id="tax_name"
          {...form.register("tax_name")}
          placeholder="Contoh: PPN"
        />
        {form.formState.errors.tax_name && (
          <p className="text-destructive text-sm">
            {form.formState.errors.tax_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate">Tarif (%)</Label>
        <Input
          id="rate"
          type="number"
          step="0.01"
          {...form.register("rate")}
          placeholder="Contoh: 0.11"
        />
        {form.formState.errors.rate && (
          <p className="text-destructive text-sm">
            {form.formState.errors.rate.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Tambah Pajak"}
      </Button>
    </form>
  );
}
