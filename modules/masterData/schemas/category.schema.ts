import z from "zod";

export const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter."),
});

export type categoryType = z.infer<typeof categorySchema>;
