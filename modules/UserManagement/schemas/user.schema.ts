import z from "zod";

export const userFormSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter."),
  password: z.string().optional(),
  role_id: z.coerce.number().min(1, "Peran harus dipilih."),
});

export type userFormValues = z.infer<typeof userFormSchema>;
