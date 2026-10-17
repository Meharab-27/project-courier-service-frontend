import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Password Must Minimum 8 Characters Long")
    .regex(/[a-z]/, "Password must contain at least 1 Number")
    .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
    .regex(/[0-9]/, "Password must contain atleast 1 Number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain atleast 1 Special Character"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be minimum 8 characters long")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least 1 special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    otp: z
      .string()
      .min(1, "OTP is required")
      .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
    newPassword: z
      .string()
      .min(8, "Password must be minimum 8 characters long")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least 1 special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const verifyCustomerEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z
    .string()
    .min(1, "OTP is required")
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export type TLoginForm = z.infer<typeof loginSchema>;
export type TRegisterForm = z.infer<typeof registerSchema>;
export type TResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type TForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type TVerifyCustomerEmailForm = z.infer<
  typeof verifyCustomerEmailSchema
>;
