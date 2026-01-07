import { EnergyType } from "@/common/types/energy";
import { MeterType } from "@/common/types/meters";
import { z } from "zod";

const requiredPositiveNumber = (label: string) =>
  z.coerce
    .number({ error: `${label} harus berupa angka.` })
    .positive({ error: `${label} harus lebih besar dari 0.` });

const requiredPositiveInt = (label: string) =>
  requiredPositiveNumber(label).int({
    message: `${label} harus berupa bilangan bulat.`,
  });

const requiredDate = (label: string) =>
  z.coerce.date({ error: `${label} tidak valid.` });

const baseBudgetSchema = z.object({
  period_start: requiredDate("Tanggal Mulai"),
  period_end: requiredDate("Tanggal Selesai"),
});

const parentBudgetSchema = baseBudgetSchema.extend({
  budgetType: z.literal("parent"),
  total_budget: requiredPositiveNumber("Total Anggaran"),
  efficiency_tag: z.coerce
    .number({ error: "Efficiency Tag harus berupa angka." })
    .min(0, "Efficiency Tag minimal 0.")
    .max(1, "Efficiency Tag maksimal 1.")
    .refine((val) => val > 0, {
      message: "Efficiency Tag harus lebih dari 0.",
    }),
  energy_type_id: requiredPositiveInt("Tipe Energi"),
  parent_budget_id: z.any().optional(),
  allocations: z.array(z.any()).optional(),
});

const allocationSchema = z.object({
  meter_id: requiredPositiveInt("Meter ID"),
  weight: z.coerce
    .number()
    .min(0, "Bobot tidak boleh negatif.")
    .max(1, "Bobot maksimal 1 (100%)."),
});

const childBudgetSchema = baseBudgetSchema.extend({
  budgetType: z.literal("child"),
  parent_budget_id: requiredPositiveInt("Anggaran Induk"),
  allocations: z
    .array(allocationSchema)
    .min(1, {
      message: "Anggaran periode wajib memiliki minimal satu alokasi meter.",
    }),

  total_budget: z.any().nullable().optional(),
  efficiency_tag: z.any().nullable().optional(),
  energy_type_id: z.any().nullable().optional(),
});

export const annualBudgetFormSchema = z
  .discriminatedUnion("budgetType", [parentBudgetSchema, childBudgetSchema])
  .refine((data) => data.period_end > data.period_start, {
    message: "Tanggal akhir periode harus setelah tanggal mulai.",
    path: ["period_end"],
  })
  .superRefine((data, ctx) => {
    if (data.budgetType === "child") {
      const totalWeight = data.allocations.reduce(
        (sum, item) => sum + (item.weight || 0),
        0
      );

      if (Math.abs(totalWeight - 1) > 0.001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Total bobot alokasi saat ini ${(totalWeight * 100).toFixed(
            1
          )}%. Total harus tepat 100%.`,
          path: ["allocations"],
        });
      }
    }
  });

export type AnnualBudgetFormValues = z.infer<typeof annualBudgetFormSchema>;

export const processBudgetFormSchema = z.object({
  pjj_rate: z.coerce
    .number({ error: "PJJ Rate harus berupa angka." })
    .min(0, "PJJ Rate minimal 0.")
    .max(1, "PJJ Rate maksimal 1."),
  process_date: z.date().optional(),
});

export type ProcessBudgetFormValues = z.infer<typeof processBudgetFormSchema>;

export const annualBudgetParamsSchema = z.object({
  budgetId: requiredPositiveInt("Budget ID"),
});
