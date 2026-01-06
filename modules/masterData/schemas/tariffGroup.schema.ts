import z from "zod";

export const tariffGroupSchema = z.object({
  group_code: z.string().min(1, "Kode golongan tidak boleh kosong."),
  group_name: z.string().min(1, "Nama golongan tidak boleh kosong."),
  description: z.string().optional(),
  daya_va: z.coerce.number().nullable().optional(),
  faktor_kali: z.coerce.number().min(0, "Faktor kali harus angka positif."),
});

export type tarifFormValues = z.infer<typeof tariffGroupSchema>;
