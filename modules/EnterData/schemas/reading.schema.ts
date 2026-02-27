import { z } from "zod";

export const formSchema = z.object({
  reading: z.object({
    meter_id: z.coerce.number({ error: "Pilih meteran" }).int().positive("Meteran tidak valid"),
    reading_date: z.coerce.date({
      error: "Format tanggal salah",
    }),
    notes: z.string().optional().nullable(),
    evidence_image_url: z.string().url("URL gambar tidak valid").optional().nullable(),
    details: z
      .array(
        z.object({
          reading_type_id: z.coerce.number({ error: "Pilih jenis pemakaian" }).int().positive(),
          value: z.coerce
            .number({ error: "Nilai harus berupa angka" })
            .min(0, "Nilai tidak boleh negatif"),
        })
      )
      .min(1, "Minimal satu detail pembacaan wajib diisi"),
  }),
});

export type FormValues = z.infer<typeof formSchema>;
