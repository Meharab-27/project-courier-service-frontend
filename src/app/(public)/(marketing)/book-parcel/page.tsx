import { Calculator, CreditCard, ShieldCheck, Truck, Zap } from "lucide-react";
import type { Metadata } from "next";
import { BookParcelForm } from "@/components/modules/book-parcel/BookParcelForm";

export const metadata: Metadata = {
  title:
    "Interactive Shipping Rate Calculator & Parcel Booking | Courier Service",
  description:
    "Calculate instant shipping rates across Bangladesh and book doorstep parcel pickup with live volumetric pricing and secure online payments via Stripe.",
};

export default function BookParcelPage() {
  return (
    <div className="relative min-h-screen bg-background py-10 md:py-16">
      {/* Decorative ambient gradient backdrop */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-full max-w-6xl -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 -z-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-10 text-center sm:mb-12">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-xs">
            <Calculator className="size-3.5" />
            <span>Interactive Shipping Rate Calculator & Parcel Booking</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Estimate Rates & Book Parcel Pickup
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            Enter your parcel weight, dimensions, and regional hubs to get
            real-time fare quotes. Book seamless doorstep delivery and pay
            securely with Stripe in seconds.
          </p>

          {/* Key Value Props */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-primary" />
              Live Volumetric Calculation
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-primary" />
              64 Districts Doorstep Service
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Fragile Item Protection
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-indigo-500" />
              Instant Stripe Checkout
            </span>
          </div>
        </div>

        {/* Interactive Booking & Rate Calculator Form */}
        <BookParcelForm />
      </div>
    </div>
  );
}
