"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Package,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { extractPaymentCheckoutUrl, type IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useInitiatePayment } from "@/hooks";
import { cn } from "@/lib/utils";

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: IShipmentData | null;
  originHubName?: string;
  destinationHubName?: string;
  onResetForm?: () => void;
}

export function StripePaymentModal({
  isOpen,
  onClose,
  shipment,
  originHubName,
  destinationHubName,
  onResetForm,
}: StripePaymentModalProps) {
  const [copied, setCopied] = useState(false);

  const { mutate: initiateCheckout, isPending: isInitiating } =
    useInitiatePayment();

  if (!shipment) return null;

  const trackingCode =
    shipment.trackingNumber ||
    shipment.trackingId ||
    `TRK-${shipment.id?.slice(0, 8).toUpperCase()}`;

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    toast.add({
      title: "Copied to clipboard",
      description: `Tracking code ${trackingCode} copied`,
      type: "success",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePayWithStripe = () => {
    // 1. Direct URL check on shipment object
    const directUrl =
      shipment.checkoutUrl ||
      shipment.stripeSessionUrl ||
      shipment.paymentUrl ||
      (shipment as Record<string, any>)?.url;
    if (directUrl) {
      toast.add({
        title: "Redirecting to Stripe",
        description: "Opening secure checkout...",
        type: "info",
      });
      window.location.href = directUrl;
      return;
    }

    // 2. Call POST /api/v1/payments/initiate with { shipmentId }
    initiateCheckout(
      { shipmentId: shipment.id },
      {
        onSuccess: (res) => {
          const checkoutUrl = extractPaymentCheckoutUrl(res);

          if (checkoutUrl) {
            toast.add({
              title: "Redirecting to Stripe",
              description: "Opening secure Stripe Checkout...",
              type: "info",
            });
            window.location.href = checkoutUrl;
          } else {
            toast.add({
              title: "Redirect Failed",
              description: "Could not retrieve checkout URL.",
              type: "error",
            });
          }
        },
        onError: (err: { message?: string }) => {
          toast.add({
            title: "Payment Initiation Failed",
            description:
              err?.message ||
              "Unable to start Stripe checkout. You can retry from shipment details.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="max-w-xl sm:rounded-2xl p-6 sm:p-7">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            Booking Confirmed
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Parcel Booked Successfully!
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Your delivery request has been registered in the system. Proceed
            with instant payment to initiate pickup dispatch and unlock your
            6-digit delivery OTP.
          </p>
        </DialogHeader>

        {/* Tracking ID Badge */}
        <div className="my-2 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Consignment Tracking ID
            </span>
            <span className="font-mono text-base font-bold text-foreground">
              {trackingCode}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTracking}
            className="h-8 gap-1.5 rounded-lg border-primary/30 text-xs font-medium text-primary hover:bg-primary/10"
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy ID
              </>
            )}
          </Button>
        </div>

        {/* Shipment Overview Box */}
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-muted-foreground">Parcel Description</span>
            <span className="font-semibold text-foreground">
              {shipment.parcelTitle || `${shipment.senderName}'s Parcel`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery Route</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span>{originHubName || "Origin Hub"}</span>
              <ArrowRight className="size-3 text-muted-foreground" />
              <span>{destinationHubName || "Destination Hub"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium text-foreground">
              {shipment.receiverName} ({shipment.receiverPhone})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery Address</span>
            <span className="font-medium text-foreground max-w-[240px] truncate text-right">
              {shipment.receiverAddress}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-sm">
            <span className="font-semibold text-foreground">
              Total Payable Amount
            </span>
            <span className="font-extrabold text-primary text-base">
              ৳{Number(shipment.totalCost || 0).toFixed(2)} BDT
            </span>
          </div>
        </div>

        {/* Immediate "Pay Now with Stripe" CTA */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isInitiating}
            onClick={handlePayWithStripe}
            className={cn(
              "group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl",
              "bg-gradient-to-r from-[#635BFF] via-[#7A73FF] to-[#635BFF] bg-[length:200%_auto] px-5 py-3.5",
              "text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300",
              "hover:bg-[right_center] hover:shadow-indigo-500/40 active:scale-[0.99]",
              "disabled:pointer-events-none disabled:opacity-60",
            )}
          >
            {isInitiating ? (
              <>
                <Spinner className="size-4" />
                <span>Connecting to Stripe Secure Checkout...</span>
              </>
            ) : (
              <>
                <CreditCard className="size-4 shrink-0" />
                <span className="text-base tracking-wide font-bold">
                  Pay Now with Stripe
                </span>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-mono font-bold tracking-normal">
                  ৳{Number(shipment.totalCost || 0).toFixed(2)} BDT
                </span>
                <ExternalLink className="size-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              256-bit Encrypted
            </span>
            <span>•</span>
            <span>Instant Webhook Delivery OTP</span>
            <span>•</span>
            <span className="font-semibold text-[#635BFF]">
              Stripe Verified
            </span>
          </div>
        </div>

        {/* Modal Secondary Actions */}
        <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border/60 pt-4">
          <Link href={`/shipments/${shipment.id}`} onClick={onClose}>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Package className="size-3.5" />
              <span>View Shipment Page</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onResetForm?.();
              }}
              className="rounded-lg text-xs"
            >
              Book Another Parcel
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="rounded-lg text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
