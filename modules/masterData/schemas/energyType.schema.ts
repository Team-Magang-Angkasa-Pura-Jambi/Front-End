import z from "zod";

export const readingTypeItemSchema = z.object({
  type_name: z.string().min(1, "Nama bacaan wajib diisi."),
  unit: z.string().min(1, "Satuan wajib diisi."),
});

export const energyTypeSchema = z.object({
  name: z.string().min(3, "Nama jenis energi minimal 3 karakter."),
  unit_standard: z.string().min(1, "Satuan standar wajib diisi."),
  reading_types: z.array(readingTypeItemSchema).optional(),
});

export type EnergyTypeFormValues = z.infer<typeof energyTypeSchema>;
