import { z } from "zod";

import { MeterType } from "@/services/meter.service";
import { EnergyType } from "@/services/energyType.service";
/**
 * Tipe data AnnualBudget yang merepresentasikan data dari API.
 * Tanggal dalam format string (ISO 8601).
 */
export interface AnnualBudget {
  budget_id: number;
  period_start: string;
  period_end: string;
  total_budget: number;
  efficiency_tag: number;
  energy_type: EnergyType; // BARU: Tambahkan relasi ke EnergyType
  parent_budget_id?: number | null;
  allocations: {
    allocation_id: number;
    weight: number;
    meter: MeterType;
    [key: string]: any; // Allow other properties
  }[];
  createdAt: string;
  updatedAt: string;
}

// Helper untuk memastikan input adalah angka positif
const positiveNumber = (fieldName: string) =>
  z.coerce
    .number({ error: `${fieldName} harus berupa angka.` })
    .positive({ message: `${fieldName} harus lebih dari 0.` });

// Helper untuk memastikan input adalah integer positif
const positiveInt = (fieldName: string) =>
  z.coerce
    .number({ error: `${fieldName} harus berupa angka.` })
    .int({ message: `${fieldName} harus berupa bilangan bulat.` })
    .positive({ message: `${fieldName} harus lebih dari 0.` });

// Skema Zod untuk validasi form
export const annualBudgetFormSchema = z
  .object({
    budgetType: z.enum(["parent", "child"], {
      error: "Tipe anggaran tidak valid.",
    }),
    period_start: z.coerce.date({
      message: "Tanggal mulai periode tidak valid.",
    }),
    period_end: z.coerce.date({
      message: "Tanggal akhir periode tidak valid.",
    }),
    total_budget: z.coerce.number().nullable(),
    efficiency_tag: z.coerce.number().min(0).max(1).optional().nullable(),
    energy_type_id: positiveInt("Tipe Energi").optional().nullable(),
    parent_budget_id: positiveInt("Parent Budget ID").optional().nullable(),
    allocations: z
      .array(
        z.object({
          meter_id: positiveInt("Meter ID"),
          weight: positiveNumber("Bobot"),
        })
      )
      .optional(),
  })
  .refine((data) => data.period_end > data.period_start, {
    message: "Tanggal akhir periode harus setelah tanggal mulai.",
    path: ["period_end"],
  })
  .superRefine((data, ctx) => {
    if (data.budgetType === "child") {
      if (!data.parent_budget_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Anggaran Induk wajib dipilih untuk Anggaran Periode.",
          path: ["parent_budget_id"],
        });
      }

      if (!data.allocations || data.allocations.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Anggaran periode (anak) wajib memiliki minimal satu alokasi meter.",
          path: ["allocations"], // Path ke tombol "Tambah Alokasi"
        });
      }

      if (data.allocations && data.allocations.length > 0) {
        const totalWeight = data.allocations.reduce(
          (sum, alloc) => sum + (alloc.weight || 0),
          0
        );
        if (Math.abs(totalWeight - 1) > 0.001) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Total bobot dari semua alokasi harus tepat 100%.",
            path: ["allocations"],
          });
        }
      }
    } else if (data.budgetType === "parent") {
      // Validasi untuk Anggaran Induk (Tahunan)
      if (
        data.efficiency_tag === undefined ||
        data.efficiency_tag === null ||
        data.efficiency_tag <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Efficiency Tag harus lebih dari 0.",
          path: ["efficiency_tag"],
        });
      }
      if (!data.energy_type_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tipe Energi wajib diisi untuk anggaran induk.",
          path: ["energy_type_id"],
        });
      }

      if (!data.total_budget || data.total_budget <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total Budget harus lebih dari 0.",
          path: ["total_budget"],
        });
      }
    }
  });

// Tipe data untuk form, diinferensi dari skema Zod
export type AnnualBudgetFormValues = z.infer<typeof annualBudgetFormSchema>;

// --- Skema untuk Form Proses Ulang Budget ---
export const processBudgetFormSchema = z.object({
  pjj_rate: z.coerce
    .number({ error: "PJJ Rate harus berupa angka." })
    .min(0, "PJJ Rate minimal 0.")
    .max(1, "PJJ Rate maksimal 1."),
  process_date: z.date().optional(),
});

export type ProcessBudgetFormValues = z.infer<typeof processBudgetFormSchema>;

// --- Skema untuk Parameter URL/Route ---
export const annualBudgetParamsSchema = z.object({
  budgetId: positiveInt("Budget ID"),
});
