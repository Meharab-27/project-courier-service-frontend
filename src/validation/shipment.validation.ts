import z from "zod";

export const parcelBookingSchema = z.object({
  // Sender Details
  senderName: z.string().min(2, "Sender name must be at least 2 characters"),
  senderPhone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .regex(
      /^(\+?880|0)?1[3-9]\d{8}$/,
      "Please enter a valid phone number (e.g. 017XXXXXXXX)",
    ),
  senderAddress: z
    .string()
    .min(5, "Pickup address must be at least 5 characters"),

  // Receiver Details
  receiverName: z
    .string()
    .min(2, "Receiver name must be at least 2 characters"),
  receiverPhone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .regex(
      /^(\+?880|0)?1[3-9]\d{8}$/,
      "Please enter a valid phone number (e.g. 017XXXXXXXX)",
    ),
  receiverAddress: z
    .string()
    .min(5, "Delivery address must be at least 5 characters"),
  receiverEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),

  // Hubs
  originHubId: z.string().min(1, "Please select an origin hub"),
  destinationHubId: z.string().min(1, "Please select a destination hub"),

  // Dimensions & Weight
  weightKg: z
    .number()
    .min(0.1, "Minimum weight is 0.1 kg")
    .max(100, "Maximum weight allowed is 100 kg"),
  lengthCm: z
    .number()
    .min(1, "Length must be at least 1 cm")
    .max(300, "Length cannot exceed 300 cm"),
  widthCm: z
    .number()
    .min(1, "Width must be at least 1 cm")
    .max(300, "Width cannot exceed 300 cm"),
  heightCm: z
    .number()
    .min(1, "Height must be at least 1 cm")
    .max(300, "Height cannot exceed 300 cm"),
  isFragile: z.boolean(),

  // Parcel Info
  parcelTitle: z
    .string()
    .min(2, "Parcel item title or description is required"),
  parcelType: z.string(),
  notes: z.string().optional(),
});

export type TParcelBookingForm = z.infer<typeof parcelBookingSchema>;
