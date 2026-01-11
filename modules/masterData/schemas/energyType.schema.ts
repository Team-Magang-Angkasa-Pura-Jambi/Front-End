import z from "zod";

export const energyTypeSchema = z.object({
  type_name: z.string().min(3, "Nama jenis energi wajib diisi."),
  unit_of_measurement: z.string().min(1, "Satuan ukur wajib diisi."),
  is_active: z.boolean().default(true),
});

export type EnergyTypeFormValues = z.infer<typeof energyTypeSchema>;
