import z from "zod";

export const targetEfficiencySchema = z
  .object({
    kpi_name: z.string().min(3, "Nama KPI minimal 3 karakter."),
    target_value: z.coerce
      .number()
      .min(0, "Nilai target tidak boleh negatif.")
      .positive("Nilai target harus angka positif."),
    meter_id: z.coerce.number().int().positive("Meter wajib dipilih."),
    period_start: z.date({ error: "Tanggal mulai wajib diisi." }),
    period_end: z.date({ error: "Tanggal akhir wajib diisi." }),
  })
  .refine((data) => data.period_end >= data.period_start, {
    message: "Tanggal akhir tidak boleh lebih awal dari tanggal mulai.",
    path: ["period_end"],
  });

export type TargetEfficiencyFormValues = z.infer<typeof targetEfficiencySchema>;
