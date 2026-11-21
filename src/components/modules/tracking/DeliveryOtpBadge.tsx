"use client";

import {
  AlertCircle,
  Check,
  Copy,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { getShipmentStageIndex } from "./ShipmentLifecycleStepper";

interface DeliveryOtpBadgeProps {
  shipment: IShipmentData;
  className?: string;
}

export function DeliveryOtpBadge({
  shipment,
  className,
}: DeliveryOtpBadgeProps) {
  const [copied, setCopied] = useState(false);

  const stageIndex = getShipmentStageIndex(shipment);
  const isPaidOrBeyond =
    stageIndex >= 2 ||
    shipment.paymentStatus === "PAID" ||
    shipment.status === "PAID";

  const isDelivered = (shipment.status || "").toUpperCase() === "DELIVERED";

  // Only display the 6-digit deliveryOtp badge once shipment status reaches PAID and OTP is assigned
  if (!isPaidOrBeyond || !shipment.deliveryOtp) {
    return null;
  }

  const otpCode = shipment.deliveryOtp;

  const handleCopy = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    toast.add({
      title: "Handover PIN Copied",
      description: `Copied ${otpCode} to clipboard`,
      type: "success",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 border-emerald-500/40",
        "bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-card/90",
        "p-6 sm:p-7 shadow-xl shadow-emerald-500/5 backdrop-blur-md transition-all",
        className,
      )}
    >
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      {/* Header with Title and Active Verification Pill */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <KeyRound className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                Delivery Handover Code
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                </span>
                {isDelivered ? "Verified & Completed" : "Active Recipient PIN"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unique 6-digit cryptographic security PIN for contactless consignment handover.
            </p>
          </div>
        </div>

        {/* Security Meta Chip */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-emerald-500/20 bg-background/60 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Fraud-Proof Handover</span>
        </div>
      </div>

      {/* Hero Display: Large Numeric Tracking Font & Tactile Copy Button */}
      <div className="my-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-emerald-500/30 bg-background/95 p-4 sm:p-5 shadow-inner">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Recipient Verification PIN
          </span>
          <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.25em] sm:tracking-[0.3em] text-emerald-600 dark:text-emerald-400 select-all drop-shadow-xs">
            {otpCode}
          </span>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={handleCopy}
          className="h-12 w-full sm:w-auto px-6 rounded-xl border-emerald-500/40 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all shadow-xs gap-2"
        >
          {copied ? (
            <>
              <Check className="size-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              <span>Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="size-4" />
              <span>Copy Handover PIN</span>
            </>
          )}
        </Button>
      </div>

      {/* Visual Notice Callout Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 p-4 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs sm:text-sm leading-tight text-amber-950 dark:text-amber-100">
              Share this 6-digit PIN with your rider only upon receiving your package.
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Your courier will prompt you for this code at doorstep delivery. Once entered into the rider dispatch app, the package is officially recorded as successfully delivered. Do not provide this code before inspecting parcel seal integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Safeguard Indicators */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-500/20 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Lock className="size-3.5 text-emerald-500" />
          <span>Issued automatically via Stripe Payment Settlement</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-3" />
          <span>256-Bit Encrypted Courier Verification</span>
        </div>
      </div>
    </div>
  );
}
