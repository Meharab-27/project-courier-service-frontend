"use client";

import { useForm } from "@tanstack/react-form";
import {
  AlertCircle,
  Bike,
  CheckCircle2,
  Info,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useGetHubs, useGetMe, useSubmitCourierProfile } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  courierApplySchema,
  type TCourierApplyForm,
  type TVehicleType,
} from "@/validation";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";

interface CourierApplyFormProps {
  onSuccess?: () => void;
  className?: string;
}

interface ApiErrorShape {
  message?: string;
  data?: {
    message?: string;
    error?: string;
    errorMessages?: Array<{ message?: string }>;
  };
}

const VEHICLE_OPTIONS: Array<{
  value: TVehicleType;
  label: string;
  desc: string;
  icon: typeof Bike;
}> = [
  {
    value: "BICYCLE",
    label: "Bicycle",
    desc: "Light parcels, eco-friendly",
    icon: Bike,
  },
  {
    value: "MOTORBIKE",
    label: "Motorbike",
    desc: "Fast urban document & small parcel",
    icon: Bike,
  },
  {
    value: "VAN",
    label: "Delivery Van",
    desc: "Medium & bulk regional delivery",
    icon: Package,
  },
  {
    value: "TRUCK",
    label: "Cargo Truck",
    desc: "Heavy loads & long-haul transport",
    icon: Truck,
  },
];

export default function CourierApplyForm({
  onSuccess,
  className,
}: CourierApplyFormProps) {
  const { data: userResponse, isLoading: isUserLoading } = useGetMe();
  const { data: hubsData, isLoading: isHubsLoading } = useGetHubs();
  const { mutate: submitProfile, isPending: isSubmitting } =
    useSubmitCourierProfile();

  const currentUser = userResponse?.data;
  const isCourier =
    currentUser?.role === "COURIER" || currentUser?.role === "ADMIN";

  // File upload states
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);

  const hubs = hubsData?.data || [];

  const handleLicenseUpload = (files: File[]) => {
    setLicenseFile(files[0] || null);
  };

  const handleNidUpload = (files: File[]) => {
    setNidFile(files[0] || null);
  };

  const form = useForm({
    defaultValues: {
      hubId: "",
      vehicleType: "MOTORBIKE" as TVehicleType,
      vehicleNumber: "",
      drivingLicense: "" as string | undefined,
      currentZone: "",
      maxCapacityKg: 30,
    } as TCourierApplyForm,
    validators: {
      onSubmit: courierApplySchema,
    },
    onSubmit: ({ value }) => {
      const formData = new FormData();

      // Backend expects files + payload (either parsed JSON in req.body.data or individual form fields)
      const payload = {
        hubId: value.hubId,
        vehicleType: value.vehicleType,
        vehicleNumber: value.vehicleNumber.trim(),
        drivingLicense: value.drivingLicense?.trim() || undefined,
        currentZone: value.currentZone.trim(),
        maxCapacityKg: Number(value.maxCapacityKg) || 30.0,
      };

      formData.append("data", JSON.stringify(payload));
      formData.append("hubId", payload.hubId);
      formData.append("vehicleType", payload.vehicleType);
      formData.append("vehicleNumber", payload.vehicleNumber);
      if (payload.drivingLicense && !licenseFile) {
        formData.append("drivingLicense", payload.drivingLicense);
      }
      formData.append("currentZone", payload.currentZone);
      formData.append("maxCapacityKg", String(payload.maxCapacityKg));

      // Append documents if uploaded
      if (licenseFile) {
        formData.append("drivingLicense", licenseFile);
      }
      if (nidFile) {
        formData.append("nidCard", nidFile);
      }

      submitProfile(formData, {
        onSuccess: () => {
          toast.add({
            title: "Application Submitted!",
            description:
              "Your courier profile and documents have been submitted successfully.",
            type: "success",
          });
          onSuccess?.();
        },
        onError: (err: ApiErrorShape) => {
          const message =
            err?.data?.message ||
            err?.data?.error ||
            err?.data?.errorMessages?.[0]?.message ||
            err?.message ||
            "Unable to submit courier application. Please try again.";

          toast.add({
            title: "Submission Failed",
            description: message,
            type: "error",
          });
        },
      });
    },
  });

  return (
    <Card
      className={cn(
        "w-full border border-border/60 bg-card p-6 shadow-sm sm:rounded-2xl sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Truck className="size-4" />
            Courier Onboarding
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Apply as Courier Partner
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fill in your vehicle specifications, select your regional hub, and
            upload verification documents to start delivering.
          </p>
        </div>

        {/* Not logged in alert */}
        {!isUserLoading && !currentUser && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400">
            <Info className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Authentication required:</span>{" "}
              You must be logged in to register as a courier. Please{" "}
              <Link
                href="/login"
                className="font-medium underline hover:text-amber-900 dark:hover:text-amber-300"
              >
                sign in to your account
              </Link>{" "}
              before submitting.
            </div>
          </div>
        )}

        {/* Logged in as Customer alert (403 explanation) */}
        {!isUserLoading && currentUser && !isCourier && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Role notice:</span> You are
              currently signed in as{" "}
              <span className="font-semibold">{currentUser.email}</span> with
              role{" "}
              <span className="font-bold underline">{currentUser.role}</span>.
              The backend courier profile endpoint requires an account with the{" "}
              <span className="font-semibold">COURIER</span> role. Please log in
              with a courier account (e.g.{" "}
              <span className="font-mono font-medium">
                meharabrahman28@gmail.com
              </span>
              ) to submit.
            </div>
          </div>
        )}

        {/* Logged in as Courier status banner */}
        {!isUserLoading && currentUser && isCourier && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <div className="flex-1">
              Signed in as{" "}
              <span className="font-semibold">{currentUser.email}</span> (Role:{" "}
              <span className="font-bold uppercase">{currentUser.role}</span>).
              Ready to submit your courier profile.
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-5"
        >
          <FieldGroup className="gap-5">
            {/* Hub Selection */}
            <form.Field name="hubId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="gap-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Assigned Regional Hub{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <select
                        id={field.name}
                        name={field.name}
                        disabled={isHubsLoading}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={cn(
                          "h-11 w-full rounded-lg border border-border/80 bg-background px-3.5 text-sm text-foreground transition-colors",
                          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                          isInvalid &&
                            "border-destructive text-destructive focus-visible:ring-destructive/20",
                          !field.state.value && "text-muted-foreground",
                        )}
                      >
                        <option value="" disabled>
                          {isHubsLoading
                            ? "Loading operational hubs..."
                            : "Select your operating hub"}
                        </option>
                        {hubs.map((hub) => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name} ({hub.code}) — {hub.zone}
                          </option>
                        ))}
                      </select>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* Vehicle Type (Interactive Cards) */}
            <form.Field name="vehicleType">
              {(field) => (
                <Field className="gap-2">
                  <FieldLabel className="text-sm font-medium text-foreground">
                    Vehicle Type <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {VEHICLE_OPTIONS.map((opt) => {
                      const isSelected = field.state.value === opt.value;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.handleChange(opt.value)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                            "hover:border-primary/50 hover:bg-muted/40",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40"
                              : "border-border/70 bg-card text-muted-foreground",
                          )}
                        >
                          <Icon className="size-5" />
                          <span className="text-xs font-semibold text-foreground">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground hidden sm:block">
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
            </form.Field>

            {/* Vehicle Number & Max Capacity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="vehicleNumber">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="gap-2">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Vehicle Number{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="e.g. DHAKA-METRO-HA-1234"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-lg"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="maxCapacityKg">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="gap-2">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Max Carrying Capacity (KG)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={1}
                        max={1000}
                        step={0.5}
                        placeholder="30"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        className="h-11 rounded-lg"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            {/* Current Zone & Driving License Number */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="currentZone">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="gap-2">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Current Delivery Zone{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="e.g. Mirpur, Tejgaon, Gulshan"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-lg"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="drivingLicense">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="gap-2">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Driving License Number{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          (Optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="e.g. DL-87654321"
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-lg"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            {/* Document Uploads (Driving License & NID Card) */}
            <div className="flex flex-col gap-6 pt-1">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Verification Documents
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload your driving license and national identity card. Photos
                  or PDF documents up to 6MB are accepted.
                </p>
              </div>

              {/* Driving License Upload */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm font-medium text-foreground">
                    Driving License Document
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Required for Motorbike, Van, Truck (JPG, PNG, PDF max 6MB)
                  </span>
                </div>
                <div className="w-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <FileUpload
                    title="Upload Driving License"
                    description="Drag or drop your driving license here or click to upload"
                    accept={{
                      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
                      "application/pdf": [".pdf"],
                    }}
                    onChange={handleLicenseUpload}
                  />
                </div>
              </div>

              {/* NID Card Upload */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm font-medium text-foreground">
                    National ID (NID) Document
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Identity verification (JPG, PNG, PDF max 6MB)
                  </span>
                </div>
                <div className="w-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <FileUpload
                    title="Upload National ID (NID) Card"
                    description="Drag or drop your NID card here or click to upload"
                    accept={{
                      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
                      "application/pdf": [".pdf"],
                    }}
                    onChange={handleNidUpload}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              disabled={
                isSubmitting || isUserLoading || !currentUser || !isCourier
              }
              type="submit"
              className="mt-2 h-11 w-full rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Submitting Courier Application...
                </>
              ) : isUserLoading ? (
                "Checking account status..."
              ) : !currentUser ? (
                "Sign In Required to Apply"
              ) : !isCourier ? (
                `Courier Role Required (Signed in as ${currentUser.role})`
              ) : (
                "Submit Courier Profile & Documents"
              )}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </Card>
  );
}
