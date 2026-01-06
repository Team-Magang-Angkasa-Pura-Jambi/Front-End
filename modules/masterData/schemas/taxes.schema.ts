import z from "zod";

export const taxSchema = z.object({
  tax_name: z.string().min(1, "Nama pajak tidak boleh kosong."),
  rate: z.coerce.number().positive("Tarif harus angka positif."),
  is_active: z.coerce.boolean().default(true),
});

export type taxFormValue = z.infer<typeof taxSchema>;
