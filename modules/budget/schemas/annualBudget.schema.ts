// annualBudget.schema.ts
import { z } from "zod";

export const annualBudgetFormSchema = z.object({
  fiscal_year: z.coerce.number().int().min(2000, "Tahun tidak valid"),
  energy_type_id: z.coerce.number().int().positive("Pilih jenis energi"),
  name: z.string().min(1, "Nama anggaran wajib diisi"),
  total_amount: z.coerce.number().min(0, "Total dana tidak boleh minus"),
  efficiency_target_percentage: z.coerce.number().min(0).max(1).default(0),
  description: z.string().optional().nullable(),
});

export type AnnualBudgetFormValues = z.infer<typeof annualBudgetFormSchema>;
