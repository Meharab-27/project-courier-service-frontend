import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCancelContent } from "@/components/modules/payment/PaymentCancelContent";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Payment Cancelled | Courier Service",
  description:
    "Your Stripe checkout session was cancelled. Retry online payment or review your booked shipment details.",
};

export default function PaymentCancelPage() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-background py-12">
      {/* Decorative subtle ambient background */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs">Loading payment cancellation state...</p>
          </div>
        }
      >
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}
