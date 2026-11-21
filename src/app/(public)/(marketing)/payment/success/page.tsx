import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccessContent } from "@/components/modules/payment/PaymentSuccessContent";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Payment Successful | Courier Service",
  description:
    "Your Stripe parcel booking payment has been successfully processed. View your consignment confirmation and delivery OTP.",
};

export default function PaymentSuccessPage() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-background py-12">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs">Loading payment confirmation...</p>
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
