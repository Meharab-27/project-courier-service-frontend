"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForgotPassword } from "@/hooks";
import { forgotPasswordSchema } from "@/validation";
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

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { mutate: forgotPasswordMutate, isPending } = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: ({ value }) => {
      forgotPasswordMutate(
        {
          email: value.email,
        },
        {
          onSuccess: () => {
            toast.add({
              title: "OTP Sent Successfully",
              description: `A 6-digit verification code has been sent to ${value.email}.`,
              type: "success",
            });
            router.push(
              `/reset-password?email=${encodeURIComponent(value.email)}`,
            );
          },
          onError: (err: ApiErrorShape) => {
            const message =
              err?.data?.message ||
              err?.data?.error ||
              err?.data?.errorMessages?.[0]?.message ||
              err?.message ||
              "Failed to send reset code. Please check your email and try again.";
            toast.add({
              title: "Request Failed",
              description: message,
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <Card className="w-full border border-border/60 bg-card/95 p-8 shadow-sm sm:max-w-md sm:rounded-2xl sm:p-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Forgot password?
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-balance text-muted-foreground">
            Enter your registered email address and we&apos;ll send you a
            6-digit OTP to reset your password.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Email Address
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 rounded-lg bg-background px-3.5 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30"
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

            <Button
              disabled={isPending}
              type="submit"
              className="mt-2 h-11 w-full rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              {isPending ? (
                <>
                  <Spinner /> Sending reset code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>

            <div className="flex flex-col items-center gap-2 pt-2 text-center text-sm">
              <Link
                href="/reset-password"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Already have an OTP? Reset password
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
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
