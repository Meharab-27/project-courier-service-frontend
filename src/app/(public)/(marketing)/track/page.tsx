import type { Metadata } from "next";
import { Suspense } from "react";
import { ParcelTrackingView } from "@/components/modules/tracking/ParcelTrackingView";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Live Parcel Tracking & Consignment Stepper | Courier Service",
  description:
    "Track your parcel in real-time across the 8-stage lifecycle from booking to doorstep delivery. Access milestone audit logs and your delivery handover OTP.",
};

export default function TrackPage() {
  return (
    <div className="relative min-h-screen bg-background py-8">
      {/* Decorative ambient background blur */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-full max-w-5xl -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <Suspense
        fallback={
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs">Loading consignment tracking portal...</p>
          </div>
        }
      >
        <ParcelTrackingView />
      </Suspense>
    </div>
  );
}
