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
    period_start: z.coerce.date({
      message: "Tanggal mulai periode tidak valid.",
    }),
    period_end: z.coerce.date({
      message: "Tanggal akhir periode tidak valid.",
    }),
    total_budget: positiveNumber("Total Budget"),
    efficiency_tag: positiveNumber("Efficiency Tag").min(0).max(1).optional(),
    energy_type_id: positiveInt("Tipe Energi"),
    parent_budget_id: positiveInt("Parent Budget ID").optional().nullable(),
    allocations: z
      .array(
        z.object({
          meter_id: positiveInt("Meter ID dalam alokasi"),
          weight: positiveNumber("Bobot alokasi").min(0).max(1),
        })
      )
      .optional(),
  })
  .refine((data) => data.period_end > data.period_start, {
    message: "Tanggal akhir periode harus setelah tanggal mulai.",
    path: ["period_end"],
  })
  .superRefine((data, ctx) => {
    // Jika ini adalah anggaran anak (memiliki parent_budget_id)
    if (data.parent_budget_id) {
      // Pastikan parent_budget_id benar-benar ada dan bukan null/undefined
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
          path: ["allocations"],
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
            message:
              "Total bobot (weight) dari semua alokasi harus sama dengan 100%.",
            path: ["allocations"],
          });
        }
      }
    } else {
      // Jika ini adalah anggaran induk (tidak memiliki parent_budget_id)
      if (data.efficiency_tag === undefined || data.efficiency_tag === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Efficiency Tag wajib diisi untuk anggaran induk.",
          path: ["efficiency_tag"],
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
