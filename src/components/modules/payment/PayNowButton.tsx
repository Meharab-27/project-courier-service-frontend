"use client";

import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { extractPaymentCheckoutUrl } from "@/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useInitiatePayment } from "@/hooks";
import { cn } from "@/lib/utils";

interface PayNowButtonProps {
  shipmentId: string;
  paymentStatus?: string | null;
  amount?: number;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "stripe" | "default" | "outline";
}

export function PayNowButton({
  shipmentId,
  paymentStatus = "PAYMENT_PENDING",
  amount,
  className,
  size = "default",
  variant = "stripe",
}: PayNowButtonProps) {
  const { mutate: initiate, isPending } = useInitiatePayment();

  // If already paid, do not render a payment trigger
  if (paymentStatus === "PAID" || paymentStatus === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="size-3.5" />
        Payment Verified
      </span>
    );
  }

  const handlePay = () => {
    if (!shipmentId) {
      toast.add({
        title: "Missing Shipment",
        description: "Cannot initiate payment without a valid shipment ID.",
        type: "error",
      });
      return;
    }

    initiate(
      { shipmentId },
      {
        onSuccess: (res) => {
          const checkoutUrl = extractPaymentCheckoutUrl(res);

          if (checkoutUrl) {
            toast.add({
              title: "Redirecting to Stripe",
              description: "Opening secure checkout session...",
              type: "info",
            });
            window.location.href = checkoutUrl;
          } else {
            toast.add({
              title: "Checkout Unavailable",
              description:
                "Could not retrieve Stripe checkout URL from server.",
              type: "error",
            });
          }
        },
        onError: (err: { message?: string }) => {
          toast.add({
            title: "Payment Initiation Failed",
            description:
              err?.message ||
              "Unable to start Stripe checkout. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  if (variant === "stripe") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={handlePay}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl",
          "bg-gradient-to-r from-[#635BFF] via-[#7871FF] to-[#635BFF] bg-[length:200%_auto] font-semibold text-white",
          "shadow-md shadow-indigo-500/20 transition-all duration-300 hover:bg-[right_center] hover:shadow-indigo-500/35 active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-60",
          size === "sm" && "h-8 px-3 text-xs",
          size === "default" && "h-10 px-4 text-xs sm:text-sm",
          size === "lg" && "h-12 px-6 text-sm sm:text-base",
          className,
        )}
      >
        {isPending ? (
          <>
            <Spinner className="size-4" />
            <span>Connecting to Stripe...</span>
          </>
        ) : (
          <>
            <CreditCard className="size-4 shrink-0" />
            <span>Pay Now</span>
            {amount !== undefined && amount > 0 && (
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-mono font-bold">
                ৳{amount.toFixed(2)} BDT
              </span>
            )}
            <ExternalLink className="size-3.5 opacity-80 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    );
  }

  return (
    <Button
      variant={variant === "outline" ? "outline" : "default"}
      size={size}
      disabled={isPending}
      onClick={handlePay}
      className={cn("gap-2 rounded-xl", className)}
    >
      {isPending ? (
        <>
          <Spinner className="size-3.5" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="size-3.5" />
          <span>Pay Now</span>
          {amount !== undefined && amount > 0 && (
            <span className="font-mono text-xs">৳{amount.toFixed(2)}</span>
          )}
        </>
      )}
    </Button>
  );
}
