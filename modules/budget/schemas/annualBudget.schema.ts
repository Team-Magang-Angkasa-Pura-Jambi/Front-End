// annualBudget.schema.ts
import { z } from "zod";

export const annualBudgetFormSchema = z.object({
  fiscal_year: z.coerce.number().int().min(2000),
  energy_type_id: z.coerce.number().int().positive("Pilih tipe energi"),
  name: z.string().min(1, "Nama wajib diisi"),
  total_amount: z.coerce.number().min(0),
  total_volume: z.coerce.number().min(0),
  efficiency_target_percentage: z.coerce.number().min(0).max(1).default(0),
  description: z.string().optional().nullable(),
  allocations: z.array(
    z.object({
      allocation_id: z.number().optional(),
      meter_id: z.coerce.number().int().positive("Pilih meteran"),
      allocated_amount: z.coerce.number().min(0),
      allocated_volume: z.coerce.number().min(0),
    })
  ),
  // .min(1, "Minimal satu alokasi wajib ada"),
}); //

export type AnnualBudgetFormValues = z.infer<typeof annualBudgetFormSchema>;
