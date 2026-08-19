import { z } from "zod";

export const readingTypeSchema = z.object({
  type_name: z.string().min(1, "Nama tipe tidak boleh kosong."),
  unit: z.string().min(1, "Satuan tidak boleh kosong."),

  // PERBAIKAN: Gunakan z.object() untuk nested object
  energy_type: z.object({
    energy_type_id: z.coerce.number().min(1, "Jenis energi wajib dipilih.").nullable(),
    name: z.string().min(1, "Nama tipe tidak boleh kosong."),
  }),
});

// Penamaan type (opsional tapi disarankan: gunakan PascalCase untuk Type/Interface)
export type ReadingTypeFormValues = z.infer<typeof readingTypeSchema>;
