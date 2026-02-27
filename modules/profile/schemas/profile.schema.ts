import z from "zod";

export const profileSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  // Tambahkan field lain yang ada di schema agar tidak error saat validasi
  full_name: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional(),
  role_id: z.coerce.number().int().optional(),
  is_active: z.coerce.boolean().default(true),

  password: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)) // Ubah string kosong jadi undefined
    .refine((val) => !val || val.length >= 6, {
      message: "Password minimal 6 karakter",
    }),

  image_url: z
    .string()
    .transform((val) => (val === "" ? null : val)) // Ubah string kosong jadi null untuk backend
    .nullable()
    .refine((val) => !val || /^(https?:\/\/)/.test(val), {
      message: "Format URL gambar tidak valid",
    })
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
