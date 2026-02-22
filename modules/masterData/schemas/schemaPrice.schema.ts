import { z } from "zod";

// Reusable shapes sesuai dengan BE
const rateShape = z.object({
  rate_id: z.number().int().optional(),
  reading_type_id: z.coerce.number().int().positive("Jenis pembacaan wajib dipilih"),
  rate_value: z.coerce.number().positive("Nilai tarif harus lebih dari 0"),
});

export const priceSchemeSchema = z.object({
  name: z.string().min(1, "Nama skema harga wajib diisi"),
  description: z.string().optional().nullable(),
  effective_date: z.date({
    error: "Format tanggal salah",
  }),
  is_active: z.boolean().default(true),

  // Kita kumpulkan rates di sini untuk keperluan Form UI
  // Nanti di-transform saat onSubmit agar sesuai format BE
  rates: z
    .array(rateShape)
    .min(1, "Minimal harus ada satu rincian tarif")
    .refine(
      (items) => {
        const ids = items.map((i) => i.reading_type_id);
        return new Set(ids).size === ids.length;
      },
      { message: "Tipe pembacaan tidak boleh duplikat dalam satu skema" }
    ),
});

export type SchemaFormValues = z.infer<typeof priceSchemeSchema>;
