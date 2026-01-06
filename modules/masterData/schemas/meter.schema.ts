import z from "zod";

export const meterSchema = z.object({
  meter_code: z.string().trim().min(1, "Kode meter wajib diisi."),

  status: z.enum(["Active", "Inactive", "UnderMaintenance", "DELETED"], {
    message: "Status tidak valid.",
  }),

  category_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ error: "Kategori wajib dipilih." })
      .min(1, "Kategori wajib dipilih.")
  ),

  tariff_group_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ error: "Golongan tarif wajib dipilih." })
      .min(1, "Golongan tarif wajib dipilih.")
  ),

  energy_type_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ error: "Jenis energi wajib dipilih." })
      .min(1, "Jenis energi wajib dipilih.")
  ),

  tank_height_cm: z
    .preprocess(
      (val) => (val === "" || val === null ? null : val),
      z.coerce.number().positive("Tinggi harus positif.").nullable()
    )
    .optional(),

  tank_volume_liters: z
    .preprocess(
      (val) => (val === "" || val === null ? null : val),
      z.coerce.number().positive("Volume harus positif.").nullable()
    )
    .optional(),

  has_rollover: z.boolean().default(false),

  rollover_limit: z
    .preprocess(
      (val) => (val === "" || val === null ? null : val),
      z.coerce
        .number()
        .positive("Batas Rollover harus angka positif.")
        .nullable()
    )
    .optional(),
});

export type MeterFormValues = z.infer<typeof meterSchema>;
