"use client";

import {
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  CreditCard,
  KeyRound,
  MapPin,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    step: "01",
    title: "Instant Booking & Rate Quote",
    shortTitle: "1. Book & Pay",
    description:
      "Enter pickup and dropoff addresses, package weight, and calculate guaranteed rates in seconds. Senders pay securely via Stripe or select Cash on Delivery.",
    badge: "1-Minute Setup",
    icon: CreditCard,
    details: [
      "Dynamic volumetric rate calculation",
      "Automatic assignment to nearest regional hub",
      "Instant 6-digit delivery OTP generation",
    ],
  },
  {
    step: "02",
    title: "Doorstep Pickup by Fleet Courier",
    shortTitle: "2. Doorstep Pickup",
    description:
      "Our system immediately dispatches an on-duty local courier to your doorstep. The rider collects your parcel and scans the tracking barcode.",
    badge: "Same-Day Dispatch",
    icon: PackageCheck,
    details: [
      "Zero-fee doorstep collection",
      "Live rider contact phone & identity check",
      "Parcel transitioned to PICKED_UP in real-time",
    ],
  },
  {
    step: "03",
    title: "Nationwide Hub-to-Hub Transit",
    shortTitle: "3. Hub Transit",
    description:
      "Consignments are routed through our 62 nationwide sorting hubs. Automated barcode scanners update milestone logs at every transit checkpoint.",
    badge: "62 Connected Hubs",
    icon: Building2,
    details: [
      "Inter-division night freight haulers",
      "Real-time milestone logs with timestamp audit",
      "Continuous tracking updates on public portal",
    ],
  },
  {
    step: "04",
    title: "Doorstep Handover with 6-Digit OTP",
    shortTitle: "4. OTP Handover",
    description:
      "Before handing over the package, the delivery rider verifies the secret 6-digit OTP code sent exclusively to the recipient, ensuring zero lost parcels.",
    badge: "Zero-Fraud Guarantee",
    icon: KeyRound,
    details: [
      "Recipient receives secret OTP on booking completion",
      "Rider enters OTP into mobile verification portal",
      "Instant confirmation and delivery receipt",
    ],
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const current = STAGES[activeStep];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Package className="size-3.5" />
            <span>Streamlined Logistics Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            How Nationwide Delivery Works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            From your doorstep to the recipient's hands in 4 transparent stages. Every parcel is safeguarded by cryptographic OTP verification.
          </p>
        </div>

        {/* Step Selector Navigation (Tabs) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-8">
          {STAGES.map((s, idx) => {
            const isActive = activeStep === idx;
            const Icon = s.icon;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-xs font-black",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    STEP {s.step}
                  </span>
                  <Icon className="size-4 shrink-0" />
                </div>
                <span className="text-xs font-bold truncate leading-tight">
                  {s.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-6 sm:p-10 shadow-sm overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Details (7 cols) */}
              <div className="md:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                  <span>{current.badge}</span>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-xs font-extrabold text-muted-foreground">
                    STAGE {current.step} OF 04
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {current.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {current.description}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2.5 pt-2 border-t border-border/60">
                  {current.details.map((point) => (
                    <div key={point} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/book-parcel"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                  >
                    <span>Experience This Flow</span>
                    <ArrowRight className="size-3.5" />
                  </Link>

                  <Link
                    href="/track"
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    <span>Track Consignment</span>
                  </Link>
                </div>
              </div>

              {/* Right Decorative Graphic Card (5 cols) */}
              <div className="md:col-span-5 bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 p-6 sm:p-8 rounded-2xl border border-primary/20 flex flex-col items-center text-center space-y-4">
                <div className="size-20 rounded-3xl bg-primary/15 text-primary flex items-center justify-center shadow-inner">
                  {React.createElement(current.icon, { className: "size-10 text-primary" })}
                </div>

                <div className="space-y-1">
                  <span className="font-mono font-bold text-xs text-muted-foreground">
                    STATUS MILESTONE
                  </span>
                  <p className="text-lg font-black text-foreground font-mono">
                    {current.step === "01" && "ORDER_PLACED & PAID"}
                    {current.step === "02" && "PICKED_UP"}
                    {current.step === "03" && "IN_HUB_TRANSIT"}
                    {current.step === "04" && "DELIVERED (OTP OK)"}
                  </p>
                </div>

                <div className="w-full bg-card/80 border border-border/70 rounded-xl p-3 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex justify-between font-mono">
                    <span>Audit Logged:</span>
                    <span className="text-emerald-600 font-bold">Yes (Prisma)</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Client Notification:</span>
                    <span className="text-foreground font-bold">Live Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
