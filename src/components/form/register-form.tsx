"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@tanstack/react-form";
import {
  Eye,
  EyeClosed,
  Info,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGoogleOAuth, useRegister } from "@/hooks";
import { cn } from "@/lib/utils";
import { registerSchema, type TRole } from "@/validation";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { HaloInput } from "../ui/halo-input";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";

interface ApiErrorShape {
  message?: string;
  data?: {
    message?: string;
    error?: string;
    errorMessages?: Array<{ message?: string }>;
  };
}

interface RoleOption {
  value: TRole;
  label: string;
  tag: string;
  description: string;
  icon: typeof User;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "CUSTOMER",
    label: "Customer",
    tag: "Send & Receive",
    description: "Book parcel pickups, track deliveries, and manage shipments nationwide.",
    icon: User,
  },
  {
    value: "COURIER",
    label: "Courier",
    tag: "Delivery Rider",
    description: "Deliver packages, earn on flexible routes, and link to regional transit hubs.",
    icon: Truck,
  },
  {
    value: "ADMIN",
    label: "Admin",
    tag: "Operations",
    description: "Supervise transit hubs, manage parcels, approve couriers, and dispatch orders.",
    icon: ShieldCheck,
  },
];

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const { mutate: register, isPending: registerPending } = useRegister();
  const { mutate: googleLogin } = useGoogleOAuth();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "CUSTOMER" as TRole,
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: ({ value }) => {
      const { confirmPassword, ...registerData } = value;

      register(registerData, {
        onSuccess: () => {
          toast.add({
            title: "Registration Initiated",
            description: `Your ${registerData.role.toLowerCase()} account has been created. Please enter the OTP sent to your email to verify.`,
            type: "success",
          });

          // Pass email and role to account-verify page for role-based onboarding
          const params = new URLSearchParams({
            email: registerData.email,
            role: registerData.role,
          });
          router.push(`/account-verify?${params.toString()}`);
        },
        onError: (err: ApiErrorShape) => {
          const message =
            err?.data?.message ||
            err?.data?.error ||
            err?.data?.errorMessages?.[0]?.message ||
            err?.message ||
            "Registration failed. Please check your details and try again.";
          toast.add({
            title: "Registration Failed",
            description: message,
            type: "error",
          });
        },
      });
    },
  });

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.add({
        title: "Google OAuth Failed",
        description: "Authentication credential was missing.",
        type: "error",
      });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: () => {
          toast.add({
            title: "Logged in Successfully",
            description: "Welcome back!",
            type: "success",
          });
          router.push("/");
        },
        onError: (err: ApiErrorShape) => {
          const message =
            err?.data?.message ||
            err?.data?.error ||
            err?.data?.errorMessages?.[0]?.message ||
            err?.message ||
            "Something went wrong with Google authentication.";
          toast.add({
            title: "Google Sign-In Failed",
            description: message,
            type: "error",
          });
        },
      },
    );
  };

  const handleGoogleError = () => {
    toast.add({
      title: "Google OAuth Failed",
      description: "Unable to sign in with Google. Please try again.",
      type: "error",
    });
  };

  return (
    <Card className="w-full border border-border/60 bg-card/95 p-6 shadow-sm sm:max-w-md sm:rounded-2xl sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Create an Account
          </h1>
          <p className="max-w-xs text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Select your account role and enter your details to get started
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            {/* Role Selection Tabs */}
            <form.Field name="role">
              {(field) => {
                const currentRole = field.state.value;
                const activeRoleMeta =
                  ROLE_OPTIONS.find((r) => r.value === currentRole) ||
                  ROLE_OPTIONS[0];

                return (
                  <div className="space-y-2">
                    <FieldLabel className="text-xs font-semibold text-foreground/90">
                      Choose Your Account Role
                    </FieldLabel>

                    {/* Role Choice Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {ROLE_OPTIONS.map((r) => {
                        const isSelected = currentRole === r.value;
                        const RoleIcon = r.icon;

                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => field.handleChange(r.value)}
                            className={cn(
                              "flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer select-none relative",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                                : "border-border/70 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <RoleIcon
                              className={cn(
                                "size-5 mb-1.5 transition-transform",
                                isSelected ? "text-primary scale-110" : "text-muted-foreground",
                              )}
                            />
                            <span className="text-xs font-bold leading-tight">
                              {r.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground/80 mt-0.5 leading-none">
                              {r.tag}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Role Description Note */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 flex items-start gap-2 text-[11px] text-muted-foreground">
                      <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {activeRoleMeta.description}
                      </span>
                    </div>
                  </div>
                );
              }}
            </form.Field>

            {/* Name Field */}
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1.5">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Full Name
                    </FieldLabel>
                    <HaloInput
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. John Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="name"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* Email Field */}
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1.5">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Email Address
                    </FieldLabel>
                    <HaloInput
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="email"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* Password Field */}
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1.5">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Password
                    </FieldLabel>
                    <div className="relative">
                      <HaloInput
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 chars (uppercase, number, symbol)"
                        className="pr-12"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={isInvalid}
                      />
                      <button
                        className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none"
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeClosed className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* Confirm Password Field */}
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-1.5">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                      <HaloInput
                        id={field.name}
                        name={field.name}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat your password"
                        className="pr-12"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={isInvalid}
                      />
                      <button
                        className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none"
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeClosed className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* Submit Button */}
            <form.Subscribe
              selector={(state) => [state.values.role]}
            >
              {([role]) => (
                <Button
                  disabled={registerPending}
                  type="submit"
                  className="mt-2 h-10 w-full rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md cursor-pointer"
                >
                  {registerPending ? (
                    <>
                      <Spinner className="size-4" />
                      <span>Creating {role.toLowerCase()} account...</span>
                    </>
                  ) : (
                    <span>
                      {role === "COURIER"
                        ? "Register as Courier Partner"
                        : role === "ADMIN"
                          ? "Register as Administrator"
                          : "Create Customer Account"}
                    </span>
                  )}
                </Button>
              )}
            </form.Subscribe>

            <div className="relative flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="text-[11px] text-muted-foreground">
                Or continue with
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>

            <p className="text-center text-xs text-muted-foreground pt-1">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </FieldGroup>
        </form>
      </div>
    </Card>
  );
}
