import z from "zod";

export const priceSchemeSchema = z.object({
  scheme_name: z.string().min(1, "Nama skema tidak boleh kosong."),
  effective_date: z.coerce.date({
    error: "Tanggal efektif wajib diisi.",
  }),
  is_active: z.boolean().optional().default(true),
  tariff_group_id: z.coerce
    .number()
    .int()
    .positive("Golongan tarif wajib dipilih."),
  rates: z
    .array(
      z.object({
        reading_type_id: z.coerce
          .number()
          .int()
          .positive("Jenis pembacaan wajib dipilih."),
        value: z.coerce.number(),
      })
    )
    .min(1, "Minimal harus ada satu tarif.")
    .refine(
      (items) =>
        new Set(items.map((i) => i.reading_type_id)).size === items.length,
      { message: "Setiap jenis pembacaan hanya boleh memiliki satu tarif." }
    ),
  tax_ids: z.array(z.coerce.number()).optional(),
});

export type schemaFormValues = z.infer<typeof priceSchemeSchema>;
