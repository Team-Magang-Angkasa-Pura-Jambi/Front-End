import { z } from "zod";

// Regex untuk nomor telepon Indonesia (mendukung +62, 62, atau 08)
const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,10}$/;

export const tenantFormSchema = z.object({
  name: z.string().min(1, "Nama tenant wajib diisi").trim(),
  category: z.string().min(1, "Kategori wajib diisi"),
  contact_person: z.string().min(1, "Nama kontak wajib diisi").trim(),

  // Improvisasi Phone
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(phoneRegex, "Format nomor telepon Indonesia tidak valid (cth: 0812xxx)"),

  // Improvisasi Email
  email: z
    .string()
    .transform((val) => (val === "" ? undefined : val)) // Ubah string kosong jadi undefined
    .pipe(
      z.string().email("Format email tidak valid. Gunakan contoh: nama@perusahaan.com").optional()
    ),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
