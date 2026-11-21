import z from "zod";

export const createHubSchema = z.object({
  name: z.string().min(2, "Hub name must be at least 2 characters"),
  code: z.string().optional(),
  address: z.string().min(3, "Physical address is required"),
  zone: z.string().min(2, "Operating zone is required"),
  contactNo: z.string().optional(),
  latitude: z.union([z.number(), z.string()]).optional().nullable(),
  longitude: z.union([z.number(), z.string()]).optional().nullable(),
});

export const updateHubSchema = z.object({
  name: z.string().min(2, "Hub name must be at least 2 characters").optional(),
  code: z.string().optional(),
  address: z.string().min(3, "Physical address is required").optional(),
  zone: z.string().min(2, "Operating zone is required").optional(),
  contactNo: z.string().optional(),
  latitude: z.union([z.number(), z.string()]).optional().nullable(),
  longitude: z.union([z.number(), z.string()]).optional().nullable(),
});

export type TCreateHubForm = z.infer<typeof createHubSchema>;
export type TUpdateHubForm = z.infer<typeof updateHubSchema>;
