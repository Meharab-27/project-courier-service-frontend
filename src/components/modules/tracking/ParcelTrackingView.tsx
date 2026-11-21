"use client";

import {
  AlertCircle,
  Boxes,
  Building2,
  Check,
  Compass,
  Copy,
  MapPin,
  Package,
  Phone,
  PhoneCall,
  Search,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import type { IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetAllShipments, useGetPublicTracking, useGetShipment } from "@/hooks";
import { cn } from "@/lib/utils";
import { PayNowButton } from "../payment/PayNowButton";
import { DeliveryOtpBadge } from "./DeliveryOtpBadge";
import { ShipmentLifecycleStepper } from "./ShipmentLifecycleStepper";
import { ShipmentStatusLogs } from "./ShipmentStatusLogs";

export function ParcelTrackingView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryId = searchParams.get("id") || searchParams.get("tracking") || "";
  const [searchInput, setSearchInput] = useState(queryId);
  const [activeTrackingId, setActiveTrackingId] = useState(queryId);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Sync activeTrackingId when query param changes
  useEffect(() => {
    if (queryId && queryId !== activeTrackingId) {
      setSearchInput(queryId);
      setActiveTrackingId(queryId);
    }
  }, [queryId, activeTrackingId]);

  // Primary: Public unauthenticated tracking query (accessible to guests & receivers)
  const {
    data: publicTrackResponse,
    isLoading: isPublicLoading,
    isFetching: isPublicFetching,
  } = useGetPublicTracking(
    activeTrackingId ? activeTrackingId.trim() : undefined,
  );

  // Authenticated Fallback 1: Query by search term via GET /api/v1/shipments/get-all-shipments?searchTerm=...
  const {
    data: allShipmentsResponse,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
  } = useGetAllShipments(
    activeTrackingId && !publicTrackResponse?.data ? activeTrackingId.trim() : undefined,
  );

  // Authenticated Fallback 2: direct query by ID via GET /api/v1/shipments/:id
  const { data: directShipmentResponse, isLoading: isDirectLoading } =
    useGetShipment(
      activeTrackingId && !publicTrackResponse?.data && !allShipmentsResponse?.data?.length
        ? activeTrackingId.trim()
        : undefined,
    );

  const matchedShipment: IShipmentData | null =
    (publicTrackResponse?.data as unknown as IShipmentData) ||
    allShipmentsResponse?.data?.find(
      (s) =>
        s.trackingNumber?.toLowerCase() === activeTrackingId.toLowerCase() ||
        s.trackingId?.toLowerCase() === activeTrackingId.toLowerCase() ||
        s.id?.toLowerCase() === activeTrackingId.toLowerCase(),
    ) ||
    allShipmentsResponse?.data?.[0] ||
    directShipmentResponse?.data ||
    null;

  const isLoading =
    (isPublicLoading && !matchedShipment) ||
    (isSearchLoading && !matchedShipment) ||
    (isDirectLoading && !matchedShipment);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const cleanId = searchInput.trim();
    if (!cleanId) {
      toast.add({
        title: "Input Required",
        description: "Please enter a tracking number or shipment ID.",
        type: "error",
      });
      return;
    }

    setActiveTrackingId(cleanId);
    router.push(`/track?id=${encodeURIComponent(cleanId)}`);
  };

  const handleCopyTracking = () => {
    if (!matchedShipment) return;
    const code =
      matchedShipment.trackingNumber ||
      matchedShipment.trackingId ||
      matchedShipment.id;
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    toast.add({
      title: "Tracking ID Copied",
      description: `Copied ${code} to clipboard`,
      type: "success",
    });
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  // Courier details from populated courier object or courierName
  const courierName =
    matchedShipment?.courier?.name ||
    matchedShipment?.courierName ||
    null;
  const courierPhone = matchedShipment?.courier?.phone || null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Search Bar Section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Track Your Consignment
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Enter your shipment tracking number (e.g.{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-primary font-bold">
            TRK-2026-XXXXXX
          </code>
          ) to monitor real-time delivery milestones and access your secret
          delivery OTP.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-6 mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-border/80 bg-card p-2 shadow-lg backdrop-blur-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Tracking ID (e.g. TRK-2026-90821)"
              className="h-12 border-0 bg-transparent pl-10 pr-4 text-sm shadow-none focus-visible:ring-0"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-12 rounded-xl px-6 font-bold shadow-md gap-2"
          >
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Truck className="size-4" />
                <span>Track Parcel</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
          <Spinner className="size-8 text-primary" />
          <p className="text-xs">
            Querying shipment lifecycle & transit status logs...
          </p>
        </div>
      )}

      {/* Not Found State */}
      {!isLoading && activeTrackingId && !matchedShipment && (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center max-w-md mx-auto shadow-sm">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No Consignment Found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            We could not find any active shipment matching{" "}
            <span className="font-mono font-bold text-foreground">
              &quot;{activeTrackingId}&quot;
            </span>
            . Please verify the consignment number and try again.
          </p>
        </div>
      )}

      {/* Shipment Found: Full Lifecycle & Timeline Dashboard */}
      {!isLoading && matchedShipment && (
        <div className="space-y-6">
          {/* Top Consignment Snapshot Card */}
          <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-lg">
            {/* Header: Tracking Number + Status Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Consignment Reference
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                    {matchedShipment.trackingNumber ||
                      matchedShipment.trackingId ||
                      `#TRK-${matchedShipment.id.slice(0, 8).toUpperCase()}`}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                    title="Copy tracking number"
                  >
                    {copiedTracking ? (
                      <Check className="size-4.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-primary shadow-2xs">
                  {matchedShipment.status || "PROCESSING"}
                </span>

                {(() => {
                  const isMatchedPaid =
                    matchedShipment.status === "PAID" ||
                    matchedShipment.paymentStatus === "PAID";
                  return (
                    <span
                      className={cn(
                        "rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider border shadow-2xs",
                        isMatchedPaid
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {isMatchedPaid
                        ? "PAID"
                        : matchedShipment.paymentStatus ||
                          matchedShipment.status ||
                          "PAYMENT_PENDING"}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Logistics Grid: Origin Hub, Destination Hub, Courier & Package */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6 text-xs">
              {/* 1. Origin Hub + Click-to-Call */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Compass className="size-3.5 text-primary shrink-0" />
                    Origin Sorting Hub
                  </span>
                  <p className="font-bold text-foreground text-sm leading-tight">
                    {matchedShipment.originHub?.name || "Departure Facility"}
                  </p>
                  {matchedShipment.originHub?.zone && (
                    <span className="inline-block text-[10px] text-muted-foreground font-mono">
                      Zone: {matchedShipment.originHub.zone}
                    </span>
                  )}
                </div>

                {/* Click-to-Call Contact Chip for Origin Hub */}
                <div className="pt-2 border-t border-border/40">
                  {matchedShipment.originHub?.contactNo ? (
                    <a
                      href={`tel:${matchedShipment.originHub.contactNo}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-all group"
                      title={`Call ${matchedShipment.originHub.name}`}
                    >
                      <PhoneCall className="size-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>{matchedShipment.originHub.contactNo}</span>
                    </a>
                  ) : (
                    <a
                      href="tel:+8809612345678"
                      className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-all group"
                      title="Call Central Dispatch Desk"
                    >
                      <PhoneCall className="size-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>+880 9612-345678</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 2. Destination Hub + Click-to-Call */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    Destination Hub
                  </span>
                  <p className="font-bold text-foreground text-sm leading-tight">
                    {matchedShipment.destinationHub?.name || "Arrival Terminal"}
                  </p>
                  {matchedShipment.destinationHub?.zone && (
                    <span className="inline-block text-[10px] text-muted-foreground font-mono">
                      Zone: {matchedShipment.destinationHub.zone}
                    </span>
                  )}
                </div>

                {/* Click-to-Call Contact Chip for Destination Hub */}
                <div className="pt-2 border-t border-border/40">
                  {matchedShipment.destinationHub?.contactNo ? (
                    <a
                      href={`tel:${matchedShipment.destinationHub.contactNo}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-all group"
                      title={`Call ${matchedShipment.destinationHub.name}`}
                    >
                      <PhoneCall className="size-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>{matchedShipment.destinationHub.contactNo}</span>
                    </a>
                  ) : (
                    <a
                      href="tel:+8809612345679"
                      className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-all group"
                      title="Call Destination Support Desk"
                    >
                      <PhoneCall className="size-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>+880 9612-345679</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 3. Assigned Courier Partner + Click-to-Call */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-primary shrink-0" />
                    Assigned Courier
                  </span>
                  <p className="font-bold text-foreground text-sm leading-tight">
                    {courierName || "Rider Assignment Pending"}
                  </p>
                  <span className="inline-block text-[10px] text-muted-foreground">
                    {courierName ? "Active Field Dispatcher" : "Automated routing in queue"}
                  </span>
                </div>

                {/* Click-to-Call Contact Chip for Assigned Courier */}
                <div className="pt-2 border-t border-border/40">
                  {courierPhone ? (
                    <a
                      href={`tel:${courierPhone}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-all group"
                      title={`Call Rider ${courierName || ""}`}
                    >
                      <Phone className="size-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>{courierPhone}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Truck className="size-3 text-muted-foreground/60" />
                      <span>Direct Contact on Dispatch</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Package Specs & Billing Highlights */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Boxes className="size-3.5 text-primary shrink-0" />
                    Consignment Specs
                  </span>
                  <p className="font-bold text-foreground text-sm leading-tight">
                    {matchedShipment.parcelTitle || "Standard Delivery"}
                  </p>
                  <span className="inline-block text-[10px] text-muted-foreground">
                    Weight: {matchedShipment.weightKg} kg (Chargeable: {matchedShipment.chargeableWeightKg || matchedShipment.weightKg} kg)
                  </span>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold">Total Fare:</span>
                  <span className="font-bold font-mono text-xs text-primary">
                    ৳{matchedShipment.totalCost?.toFixed(2)} BDT
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient & Sender Doorstep Info Row with Phone Contact Chips */}
            <div className="mt-5 pt-5 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Sender Details */}
              <div className="flex items-start gap-3 bg-card/60 p-3 rounded-xl border border-border/50">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <User className="size-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Sender Facility
                  </span>
                  <p className="font-bold text-foreground truncate">
                    {matchedShipment.senderName || "Sender Contact"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {matchedShipment.senderAddress}
                  </p>
                  {matchedShipment.senderPhone && (
                    <div className="pt-1">
                      <a
                        href={`tel:${matchedShipment.senderPhone}`}
                        className="inline-flex items-center gap-1 font-semibold text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                        title="Call Sender"
                      >
                        <Phone className="size-2.5" />
                        <span>{matchedShipment.senderPhone}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Receiver Details */}
              <div className="flex items-start gap-3 bg-card/60 p-3 rounded-xl border border-border/50">
                <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="size-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Recipient Doorstep
                  </span>
                  <p className="font-bold text-foreground truncate">
                    {matchedShipment.receiverName || "Recipient"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {matchedShipment.receiverAddress}
                  </p>
                  {matchedShipment.receiverPhone && (
                    <div className="pt-1">
                      <a
                        href={`tel:${matchedShipment.receiverPhone}`}
                        className="inline-flex items-center gap-1 font-semibold text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                        title="Call Recipient"
                      >
                        <Phone className="size-2.5" />
                        <span>{matchedShipment.receiverPhone}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pay Now Banner if payment pending */}
            {matchedShipment.status !== "PAID" &&
              matchedShipment.paymentStatus !== "PAID" &&
              (matchedShipment.paymentStatus === "PAYMENT_PENDING" ||
                matchedShipment.paymentStatus === "UNPAID" ||
                matchedShipment.status === "PAYMENT_PENDING") && (
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                <div>
                  <span className="font-bold text-amber-800 dark:text-amber-300">
                    Payment Required:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    Pay ৳{matchedShipment.totalCost} BDT to unlock dispatch and
                    generate your 6-digit delivery OTP.
                  </span>
                </div>
                <PayNowButton
                  shipmentId={matchedShipment.id}
                  paymentStatus={matchedShipment.paymentStatus}
                  amount={matchedShipment.totalCost}
                  size="sm"
                />
              </div>
            )}
          </Card>

          {/* Dedicated Delivery OTP Security Card: Rendered for paid parcels */}
          <DeliveryOtpBadge shipment={matchedShipment} />

          {/* Main Content Grid: Pulsing Lifecycle Stepper + Chronological Audit Logs */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: 8-Stage Lifecycle Vertical Stepper with Pulsing Active Radar & Solid Emerald Checkmarks */}
            <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm lg:col-span-7">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Package className="size-4.5 text-primary" />
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Consignment Transit Stepper
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Live Dispatch Stream
                </span>
              </div>

              <ShipmentLifecycleStepper shipment={matchedShipment} />
            </Card>

            {/* Right: Chronological Status Audit Logs */}
            <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm lg:col-span-5">
              <ShipmentStatusLogs logs={matchedShipment.statusLogs} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
