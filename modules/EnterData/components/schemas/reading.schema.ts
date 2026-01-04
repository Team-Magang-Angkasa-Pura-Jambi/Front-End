import z from "zod";

export const formSchema = z.object({
  meter_id: z.coerce
    .number({ message: "Pilih meteran" })
    .min(1, "data tidak boleh kosong"),
  reading_date: z.coerce.date(),
  details: z
    .array(
      z.object({
        reading_type_id: z.coerce
          .number({ message: "Pilih jenis pemakaian" })
          .min(1, { error: "data tidak boleh kosong" }),
        value: z.coerce
          .number({ message: "Nilai harus angka" })
          .min(1, { error: "nilai tidak boleh 0" }),
      })
    )
    .min(1, "Minimal satu detail harus diisi"),
});

export type FormValues = z.infer<typeof formSchema>;
