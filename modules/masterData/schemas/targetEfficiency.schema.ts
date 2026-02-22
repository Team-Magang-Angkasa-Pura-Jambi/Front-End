import z from "zod";

export const targetEfficiencySchema = z
  .object({
    kpi_name: z.string().min(3, "Nama KPI minimal 3 karakter."),
    target_percentage: z.coerce
      .number()
      .min(0, "Minimal 0")
      .max(1, "Gunakan desimal (0 - 1.0). Contoh: 0.15 untuk 15%"),
    baseline_value: z.coerce.number().min(0, "Baseline tidak boleh negatif"),
    meter_id: z.coerce.number().int().positive("Meter wajib dipilih."),
    period_start: z.date({ error: "Tanggal mulai wajib diisi." }),
    period_end: z.date({ error: "Tanggal akhir wajib diisi." }),
  })
  .refine((data) => data.period_end > data.period_start, {
    message: "Tanggal akhir harus setelah tanggal mulai.",
    path: ["period_end"],
  });

export type TargetEfficiencyFormValues = z.infer<typeof targetEfficiencySchema>;
