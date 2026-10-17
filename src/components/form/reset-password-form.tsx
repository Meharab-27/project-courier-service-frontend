"use client";

import { useForm } from "@tanstack/react-form";
import {
  ArrowLeft,
  Eye,
  EyeClosed,
  KeyRound,
  Mail,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useResetPassword } from "@/hooks";
import { cn } from "@/lib/utils";
import { resetPasswordSchema } from "@/validation";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
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

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [isEmailLocked, setIsEmailLocked] = useState(Boolean(emailParam));
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { mutate: resetPasswordMutate, isPending } = useResetPassword();

  const form = useForm({
    defaultValues: {
      email: emailParam,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: ({ value }) => {
      resetPasswordMutate(
        {
          email: value.email,
          otp: value.otp,
          newPassword: value.newPassword,
        },
        {
          onSuccess: () => {
            toast.add({
              title: "Password Reset Successful",
              description:
                "Your password has been updated. You can now log in.",
              type: "success",
            });
            router.push("/login");
          },
          onError: (err: ApiErrorShape) => {
            const message =
              err?.data?.message ||
              err?.data?.error ||
              err?.data?.errorMessages?.[0]?.message ||
              err?.message ||
              "Unable to reset password. Please verify the code and try again.";
            toast.add({
              title: "Reset Failed",
              description: message,
              type: "error",
            });
          },
        },
      );
    },
  });

  // Synchronize form value if URL searchParams change or load after mount
  useEffect(() => {
    if (emailParam) {
      form.setFieldValue("email", emailParam);
      setIsEmailLocked(true);
    }
  }, [emailParam, form]);

  return (
    <Card className="w-full border border-border/60 bg-card/95 p-8 shadow-sm sm:max-w-md sm:rounded-2xl sm:p-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-balance text-muted-foreground">
            Enter your email, the 6-digit OTP code sent to your inbox, and your
            new password.
          </p>
        </div>

        {/* URLSearchParams Email Recap Banner */}
        {emailParam && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Verification code sent to
                </p>
                <p className="truncate font-medium text-foreground">
                  {form.state.values.email || emailParam}
                </p>
              </div>
            </div>
            {isEmailLocked ? (
              <button
                type="button"
                onClick={() => setIsEmailLocked(false)}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                <Pencil className="size-3" />
                Change
              </button>
            ) : (
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                Editing
              </span>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            {/* Email field */}
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                      >
                        Email Address
                      </FieldLabel>
                      {isEmailLocked ? (
                        <button
                          type="button"
                          onClick={() => setIsEmailLocked(false)}
                          className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:underline"
                        >
                          <Pencil className="size-3" />
                          Change email
                        </button>
                      ) : emailParam ? (
                        <button
                          type="button"
                          onClick={() => {
                            field.handleChange(emailParam);
                            setIsEmailLocked(true);
                          }}
                          className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
                        >
                          Reset to {emailParam}
                        </button>
                      ) : null}
                    </div>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="you@example.com"
                        readOnly={isEmailLocked}
                        className={cn(
                          "h-11 rounded-lg bg-background px-3.5 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30",
                          isEmailLocked &&
                            "cursor-default bg-muted/50 text-muted-foreground select-none",
                        )}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="email"
                        aria-invalid={isInvalid}
                      />
                      {isEmailLocked && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs border border-border/50">
                          Locked
                        </span>
                      )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* OTP field */}
            <form.Field name="otp">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                      >
                        6-Digit OTP Code
                      </FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                      >
                        Request OTP
                      </Link>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      className="h-11 rounded-lg bg-background px-3.5 font-mono tracking-widest shadow-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value.trim())
                      }
                      autoComplete="one-time-code"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* New Password field */}
            <form.Field name="newPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      New Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="h-11 rounded-lg bg-background pl-3.5 pr-12 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={isInvalid}
                      />
                      <button
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        type="button"
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowNewPassword((prev) => !prev)}
                      >
                        {showNewPassword ? (
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

            {/* Confirm Password field */}
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Confirm New Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat new password"
                        className="h-11 rounded-lg bg-background pl-3.5 pr-12 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={isInvalid}
                      />
                      <button
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
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

            {/* Submit button */}
            <Button
              disabled={isPending}
              type="submit"
              className="mt-2 h-11 w-full rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              {isPending ? (
                <>
                  <Spinner /> Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to login
              </Link>
            </div>
          </FieldGroup>
        </form>
      </div>
    </Card>
  );
}
