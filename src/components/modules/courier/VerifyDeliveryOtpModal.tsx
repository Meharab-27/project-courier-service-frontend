"use client";

import {
  CheckCircle2,
  KeyRound,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type { IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useVerifyDeliveryOtp } from "@/hooks/shipment.hooks";
import { cn } from "@/lib/utils";

interface VerifyDeliveryOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: IShipmentData | null;
  onSuccess?: () => void;
}

export function VerifyDeliveryOtpModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
}: VerifyDeliveryOtpModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [remarks, setRemarks] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const { mutate: verifyOtp, isPending } = useVerifyDeliveryOtp();

  // Reset inputs when opened
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setRemarks("");
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!shipment) return null;

  const trackingCode =
    shipment.trackingNumber ||
    shipment.trackingId ||
    `#TRK-${shipment.id.slice(0, 8).toUpperCase()}`;

  const otpValue = digits.join("");
  const isComplete = otpValue.length === 6 && /^\d{6}$/.test(otpValue);

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric
    const cleanVal = val.replace(/\D/g, "");

    // Handle multi-character paste (e.g. user pastes full 6 digits)
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split("");
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || "";
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal ? cleanVal[cleanVal.length - 1] : "";
    setDigits(newDigits);

    // Auto advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete) {
      toast.add({
        title: "Incomplete Code",
        description: "Please enter all 6 digits of the recipient's Delivery OTP.",
        type: "error",
      });
      return;
    }

    verifyOtp(
      {
        shipmentId: shipment.id,
        payload: {
          otp: otpValue,
          remarks: remarks.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Delivery Completed Successfully! 🎉",
            description: `Consignment ${trackingCode} has been verified and marked as DELIVERED.`,
            type: "success",
          });
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          const message =
            err?.data?.message ||
            err?.message ||
            "Invalid delivery OTP. Please ask the recipient for the correct code.";
          toast.add({
            title: "OTP Verification Failed",
            description: message,
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="max-w-md sm:max-w-lg p-6 sm:p-7">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Recipient Delivery Handover
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Verify recipient 6-digit OTP code to finalize doorstep delivery.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Consignment Quick Details Card */}
        <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-foreground bg-card px-2.5 py-1 rounded-lg border border-border/80">
              {trackingCode}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="size-3" />
              <span>Doorstep Verification</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 text-foreground">
              <User className="size-3.5 text-muted-foreground shrink-0" />
              <span className="font-semibold truncate">{shipment.receiverName}</span>
            </div>

            {shipment.receiverPhone && (
              <a
                href={`tel:${shipment.receiverPhone}`}
                className="flex items-center gap-2 text-emerald-600 font-semibold hover:underline truncate"
              >
                <Phone className="size-3.5 shrink-0" />
                <span>{shipment.receiverPhone}</span>
              </a>
            )}
          </div>

          <div className="flex items-start gap-2 text-muted-foreground pt-1 border-t border-border/60">
            <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="leading-snug">
              {shipment.receiverAddress || shipment.destinationHub?.name || "Destination Address"}
            </span>
          </div>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div className="space-y-2 text-center">
            <label className="text-xs font-semibold text-foreground">
              Enter 6-Digit Delivery OTP provided by recipient
            </label>
            <p className="text-[11px] text-muted-foreground">
              The recipient received this security OTP when their parcel payment cleared.
            </p>

            {/* 6 Digit PIN Inputs */}
            <div className="flex justify-center items-center gap-2 sm:gap-2.5 pt-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isPending}
                  className={cn(
                    "size-12 sm:size-13 text-center text-xl font-bold font-mono rounded-xl border bg-background transition-all focus:outline-none focus:ring-2",
                    digit
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20"
                      : "border-border/80 text-foreground focus:border-emerald-500 focus:ring-emerald-500/20",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Optional Courier Remarks */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Handover Remarks (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Handed directly to receiver, ID verified"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isPending}
              className="h-9 text-xs rounded-xl border-border/80 bg-background"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl text-xs flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isComplete || isPending}
              className="rounded-xl text-xs flex-1 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
            >
              {isPending ? (
                <>
                  <Spinner className="size-3.5" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Confirm Handover</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

