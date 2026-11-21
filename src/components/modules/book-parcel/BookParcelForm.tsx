"use client";

import { useForm } from "@tanstack/react-form";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Compass,
  Info,
  MapPin,
  Package,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IHub, IPriceBreakdown, IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { mergeHubsWithDefaults } from "@/constants";
import {
  useCalculatePrice,
  useCreateShipment,
  useGetCustomerMe,
  useGetHubs,
  useGetMe,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { parcelBookingSchema, type TParcelBookingForm } from "@/validation";
import { RateBreakdownCard } from "./RateBreakdownCard";
import { StripePaymentModal } from "./StripePaymentModal";

interface ApiErrorShape {
  message?: string;
  data?: {
    message?: string;
    error?: string;
    errorMessages?: Array<{ message?: string }>;
  };
}

export function BookParcelForm() {
  // Authentication & Profile Queries
  const { data: userResponse, isLoading: isUserLoading } = useGetMe();
  const { data: customerResponse } = useGetCustomerMe();
  const { data: hubsResponse, isLoading: isHubsLoading } = useGetHubs({ limit: 100 });

  // Mutations
  const { mutate: triggerCalculatePrice, isPending: isPriceApiPending } =
    useCalculatePrice();
  const { mutate: submitBooking, isPending: isBookingPending } =
    useCreateShipment();

  const currentUser = userResponse?.data;
  const currentCustomer = customerResponse?.data;
  const hubs: IHub[] = useMemo(() => {
    return mergeHubsWithDefaults(hubsResponse?.data);
  }, [hubsResponse?.data]);

  const isCustomerRole = currentUser?.role === "CUSTOMER";
  const isLoggedIn = Boolean(currentUser);

  // Completed shipment state for Stripe CTA modal
  const [createdShipment, setCreatedShipment] = useState<IShipmentData | null>(
    null,
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Local calculation & form synchronization state
  const [weightKg, setWeightKg] = useState<number>(1.0);
  const [lengthCm, setLengthCm] = useState<number>(20);
  const [widthCm, setWidthCm] = useState<number>(15);
  const [heightCm, setHeightCm] = useState<number>(10);
  const [isFragile, setIsFragile] = useState<boolean>(false);
  const [originHubId, setOriginHubId] = useState<string>("");
  const [destinationHubId, setDestinationHubId] = useState<string>("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Find active hubs
  const originHub = useMemo(
    () => hubs.find((h) => h.id === originHubId) || null,
    [hubs, originHubId],
  );

  const destinationHub = useMemo(
    () => hubs.find((h) => h.id === destinationHubId) || null,
    [hubs, destinationHubId],
  );

  // Compute live breakdown locally with zero latency
  const localBreakdown = useMemo<IPriceBreakdown>(() => {
    const actual = Math.max(0.1, Number(weightKg) || 1.0);
    const l = Math.max(1, Number(lengthCm) || 10);
    const w = Math.max(1, Number(widthCm) || 10);
    const h = Math.max(1, Number(heightCm) || 10);
    const volumetric = Math.round(((l * w * h) / 5000) * 100) / 100;
    const chargeable = Math.round(Math.max(actual, volumetric) * 100) / 100;

    const sameZone =
      originHub && destinationHub
        ? originHub.zone.toLowerCase() === destinationHub.zone.toLowerCase()
        : true;

    const baseFare = sameZone ? 60 : 120;
    const extraKg = Math.max(0, chargeable - 1);
    const extraRate = sameZone ? 30 : 45;
    const extraWeightFare = Math.ceil(extraKg) * extraRate;
    const surcharge = isFragile ? 50 : 0;
    const totalCost = baseFare + extraWeightFare + surcharge;

    return {
      actualWeightKg: actual,
      volumetricWeightKg: volumetric,
      chargeableWeightKg: chargeable,
      baseFare,
      extraWeightFare,
      surcharge,
      totalCost,
      isSameZone: sameZone,
      currency: "BDT",
    };
  }, [
    weightKg,
    lengthCm,
    widthCm,
    heightCm,
    isFragile,
    originHub,
    destinationHub,
  ]);

  // Server-confirmed breakdown state
  const [serverBreakdown, setServerBreakdown] =
    useState<IPriceBreakdown | null>(null);

  const activeBreakdown = serverBreakdown || localBreakdown;

  // Trigger live price calculation with backend debounce
  const calculatePriceLive = (params: {
    weight: number;
    length: number;
    width: number;
    height: number;
    fragile: boolean;
    origin?: string;
    dest?: string;
  }) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerCalculatePrice(
        {
          weightKg: params.weight,
          lengthCm: params.length,
          widthCm: params.width,
          heightCm: params.height,
          isFragile: params.fragile,
          originHubId: params.origin || undefined,
          destinationHubId: params.dest || undefined,
        },
        {
          onSuccess: (res) => {
            if (res?.data) {
              setServerBreakdown(res.data);
            }
          },
          onError: () => {
            // Keep local breakdown fallback
            setServerBreakdown(null);
          },
        },
      );
    }, 350);
  };

  // Form setup with TanStack Form
  const form = useForm({
    defaultValues: {
      senderName: "",
      senderPhone: "",
      senderAddress: "",
      receiverName: "",
      receiverPhone: "",
      receiverAddress: "",
      receiverEmail: "",
      originHubId: "",
      destinationHubId: "",
      weightKg: 1.0,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 10,
      isFragile: false,
      parcelTitle: "",
      parcelType: "STANDARD",
      notes: "",
    } as TParcelBookingForm,
    validators: {
      onSubmit: parcelBookingSchema,
    },
    onSubmit: ({ value }) => {
      if (!isLoggedIn) {
        toast.add({
          title: "Sign-in Required",
          description:
            "Please log in to your account to confirm parcel booking.",
          type: "error",
        });
        return;
      }

      if (!isCustomerRole) {
        toast.add({
          title: "Customer Role Required",
          description: `You are signed in as ${currentUser?.role}. Booking requires a CUSTOMER account.`,
          type: "error",
        });
        return;
      }

      const payload = {
        senderName: value.senderName.trim(),
        senderPhone: value.senderPhone.trim(),
        senderAddress: value.senderAddress.trim(),
        receiverName: value.receiverName.trim(),
        receiverPhone: value.receiverPhone.trim(),
        receiverAddress: value.receiverAddress.trim(),
        receiverEmail: value.receiverEmail?.trim() || undefined,
        originHubId: value.originHubId,
        destinationHubId: value.destinationHubId,
        weightKg: Number(value.weightKg),
        lengthCm: Number(value.lengthCm),
        widthCm: Number(value.widthCm),
        heightCm: Number(value.heightCm),
        isFragile: Boolean(value.isFragile),
        parcelTitle: value.parcelTitle.trim(),
        parcelType: value.parcelType,
        notes: value.notes?.trim() || undefined,
        totalCost: activeBreakdown.totalCost,
        chargeableWeightKg: activeBreakdown.chargeableWeightKg,
      };

      submitBooking(payload, {
        onSuccess: (res) => {
          const bookedShipment = res.data;
          setCreatedShipment(bookedShipment);
          setIsPaymentModalOpen(true);

          toast.add({
            title: "Parcel Booking Confirmed!",
            description: `Shipment #${bookedShipment?.trackingNumber || bookedShipment?.trackingId || bookedShipment?.id} created successfully.`,
            type: "success",
          });
        },
        onError: (err: ApiErrorShape) => {
          const message =
            err?.data?.message ||
            err?.data?.error ||
            err?.data?.errorMessages?.[0]?.message ||
            err?.message ||
            "Unable to complete parcel booking. Please check the entered details.";

          toast.add({
            title: "Booking Failed",
            description: message,
            type: "error",
          });
        },
      });
    },
  });

  // Automatically pre-fill sender details when user/customer profile is loaded
  const hasPrefilledRef = useRef(false);

  const fillSenderFromProfile = useCallback(
    (force = false) => {
      const senderName =
        currentCustomer?.name || currentUser?.name || currentUser?.email || "";
      const senderPhone = currentCustomer?.phone || currentUser?.phone || "";
      const senderAddress =
        currentCustomer?.address ||
        currentCustomer?.defaultPickupAddress ||
        currentCustomer?.defaultAddress ||
        "";

      if (force || !form.getFieldValue("senderName")) {
        if (senderName) form.setFieldValue("senderName", senderName);
      }
      if (force || !form.getFieldValue("senderPhone")) {
        if (senderPhone) form.setFieldValue("senderPhone", senderPhone);
      }
      if (force || !form.getFieldValue("senderAddress")) {
        if (senderAddress) form.setFieldValue("senderAddress", senderAddress);
      }
    },
    [currentCustomer, currentUser, form],
  );

  useEffect(() => {
    if (!hasPrefilledRef.current && (currentUser || currentCustomer)) {
      fillSenderFromProfile(false);
      hasPrefilledRef.current = true;
    }
  }, [currentUser, currentCustomer, fillSenderFromProfile]);

  return (
    <div className="w-full">
      {/* Role / Authentication Alert Banners */}
      <div className="mb-8 space-y-3">
        {!isUserLoading && !isLoggedIn && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
            <Info className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <span className="font-semibold">Guest preview mode:</span> You can
              explore the interactive shipping rate calculator below freely. To
              finalize and book parcel dispatch, please{" "}
              <Link
                href="/login?redirect=/book-parcel"
                className="font-bold underline hover:text-amber-950 dark:hover:text-amber-100"
              >
                sign in to your customer account
              </Link>
              .
            </div>
          </div>
        )}

        {!isUserLoading && isLoggedIn && !isCustomerRole && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <span className="font-semibold">Role notice:</span> You are
              currently signed in as <strong>{currentUser?.email}</strong> with
              role{" "}
              <strong className="uppercase underline">
                {currentUser?.role}
              </strong>
              . Submitting parcel shipments requires an account with the{" "}
              <strong>CUSTOMER</strong> role. Please log in with a customer
              account to book parcels.
            </div>
          </div>
        )}

        {!isUserLoading && isLoggedIn && isCustomerRole && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Verified Customer:{" "}
                <strong>{currentUser?.name || currentUser?.email}</strong>.
                Profile details ready for instant booking.
              </span>
            </div>
            <button
              type="button"
              onClick={() => fillSenderFromProfile(true)}
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300 underline hover:opacity-80 cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Re-sync Profile
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Form on Left, Sticky Rate Breakdown Card on Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Booking Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-6"
          >
            {/* Section 1: Origin & Destination Hubs */}
            <Card className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border/60 pb-4 mb-5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Compass className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    1. Regional Hub Routing
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose the departure and arrival facilities for your parcel
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Origin Hub */}
                <form.Field name="originHubId">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground flex items-center justify-between"
                        >
                          <span>
                            Origin Hub{" "}
                            <span className="text-destructive">*</span>
                          </span>
                          {originHub && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                              Zone: {originHub.zone}
                            </span>
                          )}
                        </FieldLabel>
                        <select
                          id={field.name}
                          name={field.name}
                          disabled={isHubsLoading}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.handleChange(val);
                            setOriginHubId(val);
                            calculatePriceLive({
                              weight: weightKg,
                              length: lengthCm,
                              width: widthCm,
                              height: heightCm,
                              fragile: isFragile,
                              origin: val,
                              dest: destinationHubId,
                            });
                          }}
                          className={cn(
                            "h-11 w-full rounded-xl border border-border/80 bg-background px-3.5 text-xs text-foreground transition-colors",
                            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
                            isInvalid && "border-destructive text-destructive",
                            !field.state.value && "text-muted-foreground",
                          )}
                        >
                          <option value="" disabled>
                            {isHubsLoading
                              ? "Loading hubs..."
                              : "Select pickup hub"}
                          </option>
                          {hubs.map((hub) => (
                            <option key={hub.id} value={hub.id}>
                              {hub.name} ({hub.code}) — {hub.zone}
                            </option>
                          ))}
                        </select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                {/* Destination Hub */}
                <form.Field name="destinationHubId">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground flex items-center justify-between"
                        >
                          <span>
                            Destination Hub{" "}
                            <span className="text-destructive">*</span>
                          </span>
                          {destinationHub && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                              Zone: {destinationHub.zone}
                            </span>
                          )}
                        </FieldLabel>
                        <select
                          id={field.name}
                          name={field.name}
                          disabled={isHubsLoading}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.handleChange(val);
                            setDestinationHubId(val);
                            calculatePriceLive({
                              weight: weightKg,
                              length: lengthCm,
                              width: widthCm,
                              height: heightCm,
                              fragile: isFragile,
                              origin: originHubId,
                              dest: val,
                            });
                          }}
                          className={cn(
                            "h-11 w-full rounded-xl border border-border/80 bg-background px-3.5 text-xs text-foreground transition-colors",
                            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
                            isInvalid && "border-destructive text-destructive",
                            !field.state.value && "text-muted-foreground",
                          )}
                        >
                          <option value="" disabled>
                            {isHubsLoading
                              ? "Loading hubs..."
                              : "Select destination hub"}
                          </option>
                          {hubs.map((hub) => (
                            <option
                              key={hub.id}
                              value={hub.id}
                              disabled={hub.id === originHubId}
                            >
                              {hub.name} ({hub.code}) — {hub.zone}
                              {hub.id === originHubId
                                ? " (Selected as Origin)"
                                : ""}
                            </option>
                          ))}
                        </select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            </Card>

            {/* Section 2: Parcel Dimensions & Live Weight Specs */}
            <Card className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border/60 pb-4 mb-5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Boxes className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    2. Parcel Specifications & Dimensions
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Live fare recalculates automatically as measurements change
                  </p>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                <form.Field name="parcelTitle">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground"
                        >
                          Parcel Contents / Title{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="e.g. Legal Documents, Smart Watch"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="h-11 rounded-xl text-xs px-3.5"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="parcelType">
                  {(field) => (
                    <Field className="gap-2">
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-xs font-semibold text-foreground"
                      >
                        Parcel Category
                      </FieldLabel>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 w-full rounded-xl border border-border/80 bg-background px-3.5 text-xs text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
                      >
                        <option value="STANDARD">Standard Box / Package</option>
                        <option value="DOCUMENT">
                          Documents & Certificates
                        </option>
                        <option value="ELECTRONICS">
                          Consumer Electronics
                        </option>
                        <option value="APPAREL">Apparel & Textiles</option>
                        <option value="PERISHABLE">
                          Special Care / Perishable
                        </option>
                      </select>
                    </Field>
                  )}
                </form.Field>
              </div>

              {/* Weight & 3D Dimensions */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                {/* Weight */}
                <form.Field name="weightKg">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1.5">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground"
                        >
                          Weight (kg){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            field.handleChange(val);
                            setWeightKg(val);
                            calculatePriceLive({
                              weight: val,
                              length: lengthCm,
                              width: widthCm,
                              height: heightCm,
                              fragile: isFragile,
                              origin: originHubId,
                              dest: destinationHubId,
                            });
                          }}
                          className="h-11 rounded-xl text-xs px-3.5"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                {/* Length */}
                <form.Field name="lengthCm">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1.5">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground"
                        >
                          Length (cm){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="1"
                          min="1"
                          max="300"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            field.handleChange(val);
                            setLengthCm(val);
                            calculatePriceLive({
                              weight: weightKg,
                              length: val,
                              width: widthCm,
                              height: heightCm,
                              fragile: isFragile,
                              origin: originHubId,
                              dest: destinationHubId,
                            });
                          }}
                          className="h-11 rounded-xl text-xs px-3.5"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                {/* Width */}
                <form.Field name="widthCm">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1.5">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground"
                        >
                          Width (cm) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="1"
                          min="1"
                          max="300"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            field.handleChange(val);
                            setWidthCm(val);
                            calculatePriceLive({
                              weight: weightKg,
                              length: lengthCm,
                              width: val,
                              height: heightCm,
                              fragile: isFragile,
                              origin: originHubId,
                              dest: destinationHubId,
                            });
                          }}
                          className="h-11 rounded-xl text-xs px-3.5"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                {/* Height */}
                <form.Field name="heightCm">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1.5">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground"
                        >
                          Height (cm){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="1"
                          min="1"
                          max="300"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            field.handleChange(val);
                            setHeightCm(val);
                            calculatePriceLive({
                              weight: weightKg,
                              length: lengthCm,
                              width: widthCm,
                              height: val,
                              fragile: isFragile,
                              origin: originHubId,
                              dest: destinationHubId,
                            });
                          }}
                          className="h-11 rounded-xl text-xs px-3.5"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>

              {/* Fragile Toggle Card */}
              <form.Field name="isFragile">
                {(field) => (
                  <label
                    htmlFor={field.name}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                      field.state.value
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-border/70 bg-muted/20 hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg transition-colors",
                          field.state.value
                            ? "bg-amber-500 text-white"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <ShieldAlert className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          Fragile / Handle With Care (+৳50 BDT surcharge)
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Adds cushioned sorting, top-load priority & warning
                          tags
                        </p>
                      </div>
                    </div>

                    <input
                      id={field.name}
                      name={field.name}
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        field.handleChange(checked);
                        setIsFragile(checked);
                        calculatePriceLive({
                          weight: weightKg,
                          length: lengthCm,
                          width: widthCm,
                          height: heightCm,
                          fragile: checked,
                          origin: originHubId,
                          dest: destinationHubId,
                        });
                      }}
                      className="size-4.5 rounded border-border accent-primary cursor-pointer"
                    />
                  </label>
                )}
              </form.Field>
            </Card>

            {/* Section 3: Sender Details (Auto-prefilled) */}
            <Card className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      3. Sender (Pickup) Information
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Pre-filled automatically from your profile
                    </p>
                  </div>
                </div>

                {isLoggedIn && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillSenderFromProfile(true)}
                    className="h-7 gap-1 rounded-lg text-[11px]"
                  >
                    <RefreshCw className="size-3" />
                    Auto-fill
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <form.Field name="senderName">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold text-foreground"
                          >
                            Sender Full Name{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="Your full name"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-11 rounded-xl text-xs px-3.5"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="senderPhone">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold text-foreground"
                          >
                            Sender Phone Number{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="e.g. 017XXXXXXXX"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-11 rounded-xl text-xs px-3.5"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                </div>

                <form.Field name="senderAddress">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-xs font-semibold text-foreground"
                        >
                          Pickup Address{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="House/Apartment #, Road #, Area/Zone, City"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="h-11 rounded-xl text-xs px-3.5"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            </Card>

            {/* Section 4: Receiver Details */}
            <Card className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border/60 pb-4 mb-5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    4. Receiver (Destination) Information
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ensure accurate contact details to prevent delivery delays
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <form.Field name="receiverName">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold text-foreground"
                          >
                            Recipient Full Name{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="Recipient's name"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-11 rounded-xl text-xs px-3.5"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="receiverPhone">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold text-foreground"
                          >
                            Recipient Contact No.{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="e.g. 018XXXXXXXX"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-11 rounded-xl text-xs px-3.5"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <form.Field name="receiverAddress">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field
                          data-invalid={isInvalid}
                          className="gap-2 sm:col-span-2"
                        >
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold text-foreground"
                          >
                            Delivery Address{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="Full delivery street address, area & district"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-11 rounded-xl text-xs px-3.5"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name="receiverEmail">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field
                          data-invalid={isInvalid}
                          className="gap-2 sm:col-span-2"
                        >
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-xs font-semibold text-foreground"
                          >
                            Recipient Email (Optional)
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            placeholder="For automated tracking email updates"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="h-11 rounded-xl text-xs px-3.5"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                </div>
              </div>
            </Card>

            {/* Submit Action Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Total Estimated Payable
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chargeable weight:{" "}
                    <strong>
                      {activeBreakdown.chargeableWeightKg.toFixed(2)} kg
                    </strong>{" "}
                    ({activeBreakdown.isSameZone ? "Same-Zone" : "Inter-Zone"})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">
                      ৳{activeBreakdown.totalCost.toFixed(2)}
                    </span>
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">
                      BDT
                    </span>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={
                      isBookingPending || !isLoggedIn || !isCustomerRole
                    }
                    className="h-12 rounded-xl px-6 font-bold shadow-md gap-2"
                  >
                    {isBookingPending ? (
                      <>
                        <Spinner className="size-4" />
                        <span>Processing Booking...</span>
                      </>
                    ) : (
                      <>
                        <Package className="size-4" />
                        <span>Confirm & Book Parcel</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {!isLoggedIn && (
                <p className="mt-3 text-center text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ Sign in with a Customer account to activate booking
                  submission.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Sticky Rate Breakdown Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <RateBreakdownCard
            breakdown={activeBreakdown}
            isCalculating={isPriceApiPending}
            originHub={originHub}
            destinationHub={destinationHub}
            isFragile={isFragile}
          />

          {/* Quick Info Box */}
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-5 text-xs text-muted-foreground space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Standard Pricing Policies
            </h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Same-zone:</strong> Base fare is ৳60 BDT for first 1.0
                kg; extra weight is ৳30 BDT/kg.
              </li>
              <li>
                <strong>Inter-zone:</strong> Base fare is ৳120 BDT for first 1.0
                kg; extra weight is ৳45 BDT/kg.
              </li>
              <li>
                <strong>Volumetric Weight:</strong> Formula is{" "}
                <code className="font-mono text-[11px]">(L×W×H)/5000</code>.
              </li>
              <li>
                <strong>Fragile Surcharge:</strong> Flat ৳50 BDT for careful
                handling & priority bubble padding.
              </li>
              <li>
                <strong>Instant Stripe Checkout:</strong> Pay instantly after
                booking with any Visa, Mastercard, or AMEX.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stripe Payment & Confirmation Dialog */}
      <StripePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        shipment={createdShipment}
        originHubName={originHub?.name}
        destinationHubName={destinationHub?.name}
        onResetForm={() => {
          form.reset();
          setServerBreakdown(null);
        }}
      />
    </div>
  );
}
