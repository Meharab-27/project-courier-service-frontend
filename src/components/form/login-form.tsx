"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useGoogleOAuth, useLogin } from "@/hooks";
import { loginSchema } from "@/validation";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { HaloButton } from "../ui/halo-button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const { mutate: login, isPending: loginPending } = useLogin();

  const { mutate: googleLogin } = useGoogleOAuth();

  const form = useForm({
    defaultValues: {
      email: "meharabrahman28@gmail.com",

      password: "Ab^1236789",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      const loginData = {
        email: value.email,

        password: value.password,
      };

      login(loginData, {
        onSuccess: (res) => {
          toast.add({
            title: "Login Success",
            description: "Welcome back",
            type: "success",
          });
          router.push("/");
        },
        onError: (err) => {
          toast.add({
            title: "Authorization failure",
            description: err.message || "Something went wrong.Please try again",
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
        description: "Something Went Wrong",
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
            description: "Welcome back",
            type: "success",
          });
          router.push("/");
        },
        onError: (err) => {
          toast.add({
            title: "Google OAuth Failed",
            description: err.message || "Something Went Wrong",
            type: "error",
          });
        },
      },
    );
  };

  const handleGoogleError = () => {
    toast.add({
      title: "Google OAuth Failed",
      description: "Something Went Wrong",
      type: "error",
    });
  };
  return (
    <Card className="w-full border border-border/60 bg-card/95 p-8 shadow-sm sm:max-w-md sm:rounded-2xl sm:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Login to your account
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-5">
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
                      Email
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="you@example.com"
                      className="h-11 rounded-lg bg-background px-3.5 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="password">
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
                        Password
                      </FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-11 rounded-lg bg-background pl-3.5 pr-12 shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="off"
                        aria-invalid={isInvalid}
                      />
                      <button
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
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

            <Button
              disabled={loginPending}
              type="submit"
              className="mt-1 h-11 w-full rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              {loginPending ? (
                <>
                  {" "}
                  <Spinner /> submitting
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                Or continue with
              </span>
              <Separator className="flex-1" />
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </FieldGroup>
        </form>
      </div>
    </Card>
  );
}
