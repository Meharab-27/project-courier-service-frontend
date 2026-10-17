// "use client";
// import { GoogleLogin } from "@react-oauth/google";
// import { useForm } from "@tanstack/react-form";
// import { Eye, EyeClosed } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useGoogleOAuth, useRegister } from "@/hooks";
// import { registerSchema } from "@/validation";
// import { Button } from "../ui/button";
// import { Card } from "../ui/card";
// import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
// import { HaloInput } from "../ui/halo-input";
// import { Separator } from "../ui/separator";
// import { Spinner } from "../ui/spinner";
// import { toast } from "../ui/toast";

// interface ApiErrorShape {
//   message?: string;
//   data?: {
//     message?: string;
//     error?: string;
//     errorMessages?: Array<{ message?: string }>;
//   };
// }

// export default function RegisterForm() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const router = useRouter();

//   const { mutate: register, isPending: registerPending } = useRegister();

//   const { mutate: googleLogin } = useGoogleOAuth();

//   const form = useForm({
//     defaultValues: {
//       name: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//     validators: {
//       onSubmit: registerSchema,
//     },
//     onSubmit: ({ value }) => {
//       const { confirmPassword, ...registerData } = value;

//       register(registerData, {
//         onSuccess: () => {
//           toast.add({
//             title: "Registration Successful",
//             description:
//               "Your account has been created. Please check your email to verify your account.",
//             type: "success",
//           });
//           router.push(
//             `/account-verify?email=${encodeURIComponent(registerData.email)}`,
//           );
//         },
//         onError: (err: ApiErrorShape) => {
//           const message =
//             err?.data?.message ||
//             err?.data?.error ||
//             err?.data?.errorMessages?.[0]?.message ||
//             err?.message ||
//             "Something went wrong. Please try again.";
//           toast.add({
//             title: "Registration Failed",
//             description: message,
//             type: "error",
//           });
//         },
//       });
//     },
//   });

//   const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
//     const idToken = credentialResponse.credential;

//     if (!idToken) {
//       toast.add({
//         title: "Google OAuth Failed",
//         description: "Something Went Wrong",
//         type: "error",
//       });
//       return;
//     }
//     googleLogin(
//       { idToken },
//       {
//         onSuccess: () => {
//           toast.add({
//             title: "Logged in Successfully",
//             description: "Welcome back",
//             type: "success",
//           });
//           router.push("/");
//         },
//         onError: (err: ApiErrorShape) => {
//           const message =
//             err?.data?.message ||
//             err?.data?.error ||
//             err?.data?.errorMessages?.[0]?.message ||
//             err?.message ||
//             "Something Went Wrong";
//           toast.add({
//             title: "Google OAuth Failed",
//             description: message,
//             type: "error",
//           });
//         },
//       },
//     );
//   };

//   const handleGoogleError = () => {
//     toast.add({
//       title: "Google OAuth Failed",
//       description: "Something Went Wrong",
//       type: "error",
//     });
//   };

//   return (
//     <Card className="w-full border border-border/60 bg-card/95 p-8 shadow-sm sm:max-w-md sm:rounded-2xl sm:p-10">
//       <div className="flex flex-col gap-8">
//         <div className="flex flex-col items-center gap-2 text-center">
//           <h1 className="text-2xl font-semibold tracking-tight">
//             Create an account
//           </h1>
//           <p className="max-w-xs text-sm leading-relaxed text-balance text-muted-foreground">
//             Enter your details below to create your account
//           </p>
//         </div>

//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             form.handleSubmit();
//           }}
//         >
//           <FieldGroup className="gap-5">
//             {/* Name Field */}
//             <form.Field name="name">
//               {(field) => {
//                 const isInvalid =
//                   field.state.meta.isTouched && !field.state.meta.isValid;
//                 return (
//                   <Field data-invalid={isInvalid} className="gap-2">
//                     <FieldLabel
//                       htmlFor={field.name}
//                       className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
//                     >
//                       Full Name
//                     </FieldLabel>
//                     <HaloInput
//                       id={field.name}
//                       name={field.name}
//                       placeholder="John Doe"
//                       value={field.state.value}
//                       onBlur={field.handleBlur}
//                       onChange={(e) => field.handleChange(e.target.value)}
//                       autoComplete="name"
//                       aria-invalid={isInvalid}
//                     />
//                     {isInvalid && (
//                       <FieldError errors={field.state.meta.errors} />
//                     )}
//                   </Field>
//                 );
//               }}
//             </form.Field>

//             {/* Email Field */}
//             <form.Field name="email">
//               {(field) => {
//                 const isInvalid =
//                   field.state.meta.isTouched && !field.state.meta.isValid;
//                 return (
//                   <Field data-invalid={isInvalid} className="gap-2">
//                     <FieldLabel
//                       htmlFor={field.name}
//                       className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
//                     >
//                       Email
//                     </FieldLabel>
//                     <HaloInput
//                       id={field.name}
//                       name={field.name}
//                       type="email"
//                       placeholder="you@example.com"
//                       value={field.state.value}
//                       onBlur={field.handleBlur}
//                       onChange={(e) => field.handleChange(e.target.value)}
//                       autoComplete="email"
//                       aria-invalid={isInvalid}
//                     />
//                     {isInvalid && (
//                       <FieldError errors={field.state.meta.errors} />
//                     )}
//                   </Field>
//                 );
//               }}
//             </form.Field>

//             {/* Password Field */}
//             <form.Field name="password">
//               {(field) => {
//                 const isInvalid =
//                   field.state.meta.isTouched && !field.state.meta.isValid;
//                 return (
//                   <Field data-invalid={isInvalid} className="gap-2">
//                     <FieldLabel
//                       htmlFor={field.name}
//                       className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
//                     >
//                       Password
//                     </FieldLabel>
//                     <div className="relative">
//                       <HaloInput
//                         id={field.name}
//                         name={field.name}
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Create a strong password"
//                         className="pr-12"
//                         value={field.state.value}
//                         onBlur={field.handleBlur}
//                         onChange={(e) => field.handleChange(e.target.value)}
//                         autoComplete="new-password"
//                         aria-invalid={isInvalid}
//                       />
//                       <button
//                         className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
//                         type="button"
//                         aria-label={
//                           showPassword ? "Hide password" : "Show password"
//                         }
//                         onClick={() => setShowPassword((prev) => !prev)}
//                       >
//                         {showPassword ? (
//                           <EyeClosed className="size-4" />
//                         ) : (
//                           <Eye className="size-4" />
//                         )}
//                       </button>
//                     </div>
//                     {isInvalid && (
//                       <FieldError errors={field.state.meta.errors} />
//                     )}
//                   </Field>
//                 );
//               }}
//             </form.Field>

//             {/* Confirm Password Field */}
//             <form.Field name="confirmPassword">
//               {(field) => {
//                 const isInvalid =
//                   field.state.meta.isTouched && !field.state.meta.isValid;
//                 return (
//                   <Field data-invalid={isInvalid} className="gap-2">
//                     <FieldLabel
//                       htmlFor={field.name}
//                       className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
//                     >
//                       Confirm Password
//                     </FieldLabel>
//                     <div className="relative">
//                       <HaloInput
//                         id={field.name}
//                         name={field.name}
//                         type={showConfirmPassword ? "text" : "password"}
//                         placeholder="Repeat your password"
//                         className="pr-12"
//                         value={field.state.value}
//                         onBlur={field.handleBlur}
//                         onChange={(e) => field.handleChange(e.target.value)}
//                         autoComplete="new-password"
//                         aria-invalid={isInvalid}
//                       />
//                       <button
//                         className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
//                         type="button"
//                         aria-label={
//                           showConfirmPassword
//                             ? "Hide confirm password"
//                             : "Show confirm password"
//                         }
//                         onClick={() => setShowConfirmPassword((prev) => !prev)}
//                       >
//                         {showConfirmPassword ? (
//                           <EyeClosed className="size-4" />
//                         ) : (
//                           <Eye className="size-4" />
//                         )}
//                       </button>
//                     </div>
//                     {isInvalid && (
//                       <FieldError errors={field.state.meta.errors} />
//                     )}
//                   </Field>
//                 );
//               }}
//             </form.Field>

//             <Button
//               disabled={registerPending}
//               type="submit"
//               className="mt-1 h-11 w-full rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
//             >
//               {registerPending ? (
//                 <>
//                   <Spinner /> Creating account...
//                 </>
//               ) : (
//                 "Create Account"
//               )}
//             </Button>

//             <div className="relative flex items-center gap-3">
//               <Separator className="flex-1" />
//               <span className="text-xs text-muted-foreground">
//                 Or continue with
//               </span>
//               <Separator className="flex-1" />
//             </div>

//             <GoogleLogin
//               onSuccess={handleGoogleSuccess}
//               onError={handleGoogleError}
//             />

//             <p className="text-center text-sm text-muted-foreground">
//               Already have an account?{" "}
//               <Link
//                 href="/login"
//                 className="font-medium text-foreground underline-offset-4 hover:underline"
//               >
//                 Sign in
//               </Link>
//             </p>
//           </FieldGroup>
//         </form>
//       </div>
//     </Card>
//   );
// }



"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGoogleOAuth, useRegister } from "@/hooks";
import { registerSchema } from "@/validation";
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
            title: "Registration Successful",
            description:
              "Your account has been created. Please check your email to verify your account.",
            type: "success",
          });

          // URLSearchParams ব্যবহার করে কুয়েরি প্যারামিটার তৈরি
          const params = new URLSearchParams({ email: registerData.email });
          router.push(`/account-verify?${params.toString()}`);
        },
        onError: (err: ApiErrorShape) => {
          const message =
            err?.data?.message ||
            err?.data?.error ||
            err?.data?.errorMessages?.[0]?.message ||
            err?.message ||
            "Something went wrong. Please try again.";
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
        onError: (err: ApiErrorShape) => {
          const message =
            err?.data?.message ||
            err?.data?.error ||
            err?.data?.errorMessages?.[0]?.message ||
            err?.message ||
            "Something Went Wrong";
          toast.add({
            title: "Google OAuth Failed",
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
      description: "Something Went Wrong",
      type: "error",
    });
  };

  return (
    <Card className="w-full border border-border/60 bg-card/95 p-8 shadow-sm sm:max-w-md sm:rounded-2xl sm:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-balance text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-5">
            {/* Name Field */}
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Full Name
                    </FieldLabel>
                    <HaloInput
                      id={field.name}
                      name={field.name}
                      placeholder="John Doe"
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
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Email
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
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
                    >
                      Password
                    </FieldLabel>
                    <div className="relative">
                      <HaloInput
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pr-12"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={isInvalid}
                      />
                      <button
                        className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
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
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground/80 group-data-[invalid=true]/field:text-destructive"
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
                        className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
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

            <Button
              disabled={registerPending}
              type="submit"
              className="mt-1 h-11 w-full rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              {registerPending ? (
                <>
                  <Spinner /> Creating account...
                </>
              ) : (
                "Create Account"
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
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
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
