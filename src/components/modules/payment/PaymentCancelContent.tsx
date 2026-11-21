"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Package,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { extractPaymentCheckoutUrl } from "@/api";
import { useGetShipment, useInitiatePayment } from "@/hooks";
import { cn } from "@/lib/utils";

export function PaymentCancelContent() {
  const searchParams = useSearchParams();

  const shipmentId =
    searchParams.get("shipment_id") ||
    searchParams.get("shipmentId") ||
    searchParams.get("id") ||
    "";

  const { data: shipmentResponse, isLoading: isShipmentLoading } =
    useGetShipment(shipmentId || undefined);

  const { mutate: initiateRetry, isPending: isRetrying } = useInitiatePayment();

  const shipment = shipmentResponse?.data;
  const trackingCode =
    shipment?.trackingNumber ||
    shipment?.trackingId ||
    (shipmentId ? `#TRK-${shipmentId.slice(0, 8).toUpperCase()}` : null);
  const amountDue = shipment?.totalCost;

  const handleRetryStripeCheckout = () => {
    if (!shipmentId) {
      toast.add({
        title: "Missing Shipment Reference",
        description:
          "Cannot re-initiate payment without shipment reference. Please select your parcel from dashboard.",
        type: "error",
      });
      return;
    }

    initiateRetry(
      { shipmentId },
      {
        onSuccess: (res) => {
          const checkoutUrl = extractPaymentCheckoutUrl(res);

          if (checkoutUrl) {
            toast.add({
              title: "Re-opening Stripe Checkout",
              description: "Redirecting to secure payment session...",
              type: "info",
            });
            window.location.href = checkoutUrl;
          } else {
            toast.add({
              title: "Payment Error",
              description: "Could not obtain checkout session URL.",
              type: "error",
            });
          }
        },
        onError: (err: { message?: string }) => {
          toast.add({
            title: "Checkout Initiation Failed",
            description:
              err?.message ||
              "Could not reconnect to Stripe. Please try again shortly.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      {/* Warning / Cancellation Banner */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-18 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/10">
          <AlertTriangle className="size-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          <ShieldAlert className="size-3.5" />
          <span>Checkout Incomplete</span>
        </div>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Payment Was Cancelled
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          No charges were applied to your payment card. Your booking has been
          saved in <strong>PAYMENT_PENDING</strong> status. You can retry
          checkout at any time.
        </p>
      </div>

      {isShipmentLoading && (
        <div className="flex items-center justify-center p-6 text-muted-foreground gap-2">
          <Spinner className="size-4" />
          <span className="text-xs">Locating your parcel details...</span>
        </div>
      )}

      {/* Shipment Snapshot (If ID exists) */}
      {shipment && (
        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm mb-6 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-muted-foreground">Parcel Tracking</span>
            <span className="font-mono font-bold text-foreground">
              {trackingCode}
            </span>
          </div>

          {shipment.receiverName && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-medium text-foreground">
                {shipment.receiverName}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Payment Pending
            </span>
          </div>

          {amountDue !== undefined && (
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="font-semibold text-foreground">Amount Due</span>
              <span className="text-base font-extrabold text-primary">
                ৳{amountDue.toFixed(2)} BDT
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Clear Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Primary Clear Retry Button */}
        <button
          type="button"
          disabled={isRetrying || !shipmentId}
          onClick={handleRetryStripeCheckout}
          className={cn(
            "group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl",
            "bg-gradient-to-r from-[#635BFF] via-[#7871FF] to-[#635BFF] bg-[length:200%_auto] py-3.5 px-5",
            "text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300",
            "hover:bg-[right_center] hover:shadow-indigo-500/40 active:scale-[0.99]",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {isRetrying ? (
            <>
              <Spinner className="size-4" />
              <span>Connecting to Stripe Checkout...</span>
            </>
          ) : (
            <>
              <RefreshCw className="size-4 shrink-0 transition-transform group-hover:rotate-180 duration-500" />
              <span>Retry Stripe Checkout Now</span>
              {amountDue !== undefined && (
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-mono font-bold">
                  ৳{amountDue.toFixed(2)}
                </span>
              )}
            </>
          )}
        </button>

        {/* Return to Shipment Details */}
        {shipmentId ? (
          <Link href={`/shipments/${shipmentId}`} className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted"
            >
              <Package className="size-4" />
              <span>Return to Shipment Details</span>
              <ArrowRight className="size-3.5 ml-auto text-muted-foreground" />
            </Button>
          </Link>
        ) : (
          <Link href="/book-parcel" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Booking Portal</span>
            </Button>
          </Link>
        )}

        <div className="text-center pt-3">
          <Link
            href="/about-us"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="size-3.5" />
            <span>Need assistance? Contact our courier support team</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
