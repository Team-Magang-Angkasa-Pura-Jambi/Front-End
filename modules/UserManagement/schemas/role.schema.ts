import z from "zod";

export const roleSchema = z.object({
  role_name: z.string().min(3, "Nama peran minimal 3 karakter."),
});

export type roleFormValues = z.infer<typeof roleSchema>;
