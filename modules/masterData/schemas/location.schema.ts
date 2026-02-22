import { z } from "zod";


export const locationFormSchema = z.object({
  name: z.string().min(1, "Nama lokasi wajib diisi"),
  parent_id: z.coerce.number().optional().nullable(),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;
