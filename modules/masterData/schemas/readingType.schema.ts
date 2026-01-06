import z from "zod";

export const readingTypeSchema = z.object({
  type_name: z.string().min(1, "Nama tipe tidak boleh kosong."),
  reading_unit: z.string().min(1, "Satuan tidak boleh kosong."),
  energy_type_id: z.coerce.number().min(1, "Jenis energi wajib dipilih."),
});

export type readingTypeFormValues = z.infer<typeof readingTypeSchema>;
