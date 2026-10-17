import z from "zod";

export const vehicleTypes = ["BICYCLE", "MOTORBIKE", "VAN", "TRUCK"] as const;
export type TVehicleType = (typeof vehicleTypes)[number];

export const courierApplySchema = z.object({
  hubId: z.string().min(1, "Please select an assigned hub"),
  vehicleType: z.enum(vehicleTypes),
  vehicleNumber: z.string().min(2, "Vehicle registration number is required"),
  drivingLicense: z.string().optional(),
  currentZone: z.string().min(2, "Current operating zone/area is required"),
  maxCapacityKg: z
    .number()
    .min(1, "Max capacity must be at least 1 kg")
    .max(1000, "Max capacity cannot exceed 1000 kg"),
});

export type TCourierApplyForm = z.infer<typeof courierApplySchema>;
