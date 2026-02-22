import { z } from "zod";

export enum MeterStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
}

export enum TankShape {
  CYLINDER_VERTICAL = "CYLINDER_VERTICAL",
  CYLINDER_HORIZONTAL = "CYLINDER_HORIZONTAL",
  BOX = "BOX",
}

const profileBase = z.object({
  shape: z.nativeEnum(TankShape).optional().nullable(),
  capacity_liters: z.coerce.number().min(0).optional().nullable(),
  height_max_cm: z.coerce.number().min(0).optional().nullable(),
  diameter_cm: z.coerce.number().min(0).optional().nullable(),
  length_cm: z.coerce.number().min(0).optional().nullable(),
  width_cm: z.coerce.number().min(0).optional().nullable(),
});

const configBase = z.object({
  reading_type_id: z.coerce.number({ error: "Parameter wajib dipilih" }).min(1),
  is_active: z.boolean().default(true),
  alarm_min_threshold: z.coerce.number().optional().nullable(),
  alarm_max_threshold: z.coerce.number().optional().nullable(),
});

export const meterFormSchema = z
  .object({
    meter: z.object({
      meter_code: z.string().min(3, "Minimal 3 karakter"),
      name: z.string().optional().nullable(),
      serial_number: z.string().optional().nullable(),
      energy_type_id: z.coerce.number({
        error: "Tipe Energi wajib dipilih",
      }),
      status: z.nativeEnum(MeterStatus),

      multiplier: z.coerce.number().default(1),
      is_virtual: z.boolean().default(false),
      allow_gap: z.boolean().default(false),
      allow_decrease: z.boolean().default(false),

      has_rollover: z.boolean().default(false),
      rollover_limit: z.coerce.number().optional().nullable(),

      location_id: z.coerce.number().optional().nullable(),
      tenant_id: z.coerce.number().optional().nullable(),
    }),

    meter_profile: profileBase.optional(),

    reading_config: z.array(configBase).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.meter.has_rollover &&
      (!data.meter.rollover_limit || data.meter.rollover_limit <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Batas rollover wajib diisi",
        path: ["meter", "rollover_limit"],
      });
    }
  });

export type MeterFormValues = z.infer<typeof meterFormSchema>;
