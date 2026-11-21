"use client";

import {
  ArrowRight,
  Boxes,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Package,
  Scale,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BANGLADESH_ZONES = [
  "Dhaka Metro",
  "Dhaka Division",
  "Chittagong Division",
  "Rajshahi Division",
  "Khulna Division",
  "Barisal Division",
  "Sylhet Division",
  "Rangpur Division",
  "Mymensingh Division",
] as const;

const WEIGHT_PRESETS = [
  { label: "Document / Envelope", weight: 0.5, desc: "Under 500g" },
  { label: "Small Box", weight: 1.0, desc: "Standard 1 kg" },
  { label: "Medium Carton", weight: 3.0, desc: "3 kg parcel" },
  { label: "Heavy Cargo", weight: 8.0, desc: "8 kg bulk" },
];

export function RateEstimatorSection() {
  const [originZone, setOriginZone] = useState<string>("Dhaka Metro");
  const [destZone, setDestZone] = useState<string>("Chittagong Division");
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [isFragile, setIsFragile] = useState<boolean>(false);
  const [isSameDay, setIsSameDay] = useState<boolean>(false);

  const isSameZone = originZone === destZone;

  // Formula based on platform backend pricing logic:
  // Same Zone: Base 60 BDT (first 1kg), +30 BDT per extra kg
  // Different Zone: Base 120 BDT (first 1kg), +45 BDT per extra kg
  // Fragile surcharge: +50 BDT
  // Express/Same-Day optional boost: +80 BDT
  const pricing = useMemo(() => {
    const baseFare = isSameZone ? 60 : 120;
    const perKgRate = isSameZone ? 30 : 45;
    const billableWeight = Math.max(1, Math.ceil(weightKg));
    const extraWeightKg = Math.max(0, billableWeight - 1);
    const extraWeightCost = extraWeightKg * perKgRate;
    const fragileFee = isFragile ? 50 : 0;
    const expressFee = isSameDay ? 80 : 0;
    const total = baseFare + extraWeightCost + fragileFee + expressFee;

    return {
      baseFare,
      extraWeightKg,
      extraWeightCost,
      fragileFee,
      expressFee,
      total,
      transitTime: isSameDay
        ? "Within 12 Hours"
        : isSameZone
          ? "Next-Day (24h)"
          : "24-48 Hours",
    };
  }, [originZone, destZone, weightKg, isFragile, isSameDay, isSameZone]);

  return (
    <section className="relative py-20 bg-muted/30 border-y border-border/70 overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 size-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Calculator className="size-3.5" />
            <span>Transparent Pricing Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            Instant Delivery Rate Estimator
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            No hidden costs or surprise surcharges. Calculate guaranteed shipping rates between any of our 62 nationwide transit hubs in real-time.
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm space-y-6">
              {/* Origin & Destination Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>Pickup Location (Origin)</span>
                  </label>
                  <select
                    value={originZone}
                    onChange={(e) => setOriginZone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-border/80 bg-background px-3.5 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {BANGLADESH_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Dropoff Location (Destination)</span>
                  </label>
                  <select
                    value={destZone}
                    onChange={(e) => setDestZone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-border/80 bg-background px-3.5 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {BANGLADESH_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Zone Tag Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/60 text-xs">
                <span className="text-muted-foreground">Routing Classification:</span>
                <span
                  className={cn(
                    "font-bold px-2.5 py-0.5 rounded-full text-[11px]",
                    isSameZone
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
                  )}
                >
                  {isSameZone ? "Intra-Zone (Same Region)" : "Inter-Zone (Nationwide Corridor)"}
                </span>
              </div>

              {/* Weight Presets & Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Scale className="size-3.5 text-primary" />
                    <span>Consignment Weight</span>
                  </label>
                  <span className="font-mono text-base font-extrabold text-foreground bg-primary/10 text-primary px-3 py-0.5 rounded-lg border border-primary/20">
                    {weightKg.toFixed(1)} KG
                  </span>
                </div>

                {/* Weight Presets Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEIGHT_PRESETS.map((preset) => {
                    const isSelected = Math.abs(weightKg - preset.weight) < 0.2;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setWeightKg(preset.weight)}
                        className={cn(
                          "rounded-xl p-2.5 text-left border transition-all cursor-pointer flex flex-col justify-between",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary shadow-xs"
                            : "bg-background hover:bg-muted/60 border-border/80 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className="text-xs font-bold truncate leading-tight">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Slider Input */}
                <div className="pt-2">
                  <input
                    type="range"
                    min={0.5}
                    max={25}
                    step={0.5}
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                    <span>0.5 KG (Min)</span>
                    <span>10 KG</span>
                    <span>25 KG (Heavy Freight)</span>
                  </div>
                </div>
              </div>

              {/* Service Add-ons (Fragile / Express) */}
              <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsFragile((prev) => !prev)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                    isFragile
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200"
                      : "bg-background hover:bg-muted/50 border-border/80 text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className={cn("size-4", isFragile ? "text-amber-600" : "text-muted-foreground")} />
                    <div className="text-left">
                      <p className="text-xs font-bold leading-none text-foreground">Fragile Handling</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">+50 BDT Bubble/Cushion</p>
                    </div>
                  </div>
                  <div className={cn("size-4 rounded-full border flex items-center justify-center", isFragile ? "bg-amber-500 border-amber-500 text-white" : "border-border")}>
                    {isFragile && <Check className="size-3" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSameDay((prev) => !prev)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                    isSameDay
                      ? "bg-purple-500/10 border-purple-500/40 text-purple-900 dark:text-purple-200"
                      : "bg-background hover:bg-muted/50 border-border/80 text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className={cn("size-4", isSameDay ? "text-purple-600" : "text-muted-foreground")} />
                    <div className="text-left">
                      <p className="text-xs font-bold leading-none text-foreground">Express Priority</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">+80 BDT Rush Dispatch</p>
                    </div>
                  </div>
                  <div className={cn("size-4 rounded-full border flex items-center justify-center", isSameDay ? "bg-purple-500 border-purple-500 text-white" : "border-border")}>
                    {isSameDay && <Check className="size-3" />}
                  </div>
                </button>
              </div>
            </Card>
          </div>

          {/* Right: Live Quote & Direct Booking (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Guaranteed Rate Quote
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Clock className="size-3" />
                    <span>{pricing.transitTime}</span>
                  </span>
                </div>

                {/* Big Total Cost */}
                <div className="py-2 border-b border-border/60">
                  <span className="text-xs text-muted-foreground font-medium">Estimated Shipping Fee</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground font-mono">
                      ৳{pricing.total}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">BDT</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <span>Doorstep Pickup & 6-Digit Delivery OTP Included</span>
                  </p>
                </div>

                {/* Itemized Cost Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Tier (First 1 KG)</span>
                    <span className="font-mono font-medium text-foreground">৳{pricing.baseFare} BDT</span>
                  </div>

                  {pricing.extraWeightKg > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Extra Weight ({pricing.extraWeightKg} KG)</span>
                      <span className="font-mono font-medium text-foreground">+৳{pricing.extraWeightCost} BDT</span>
                    </div>
                  )}

                  {pricing.fragileFee > 0 && (
                    <div className="flex justify-between text-amber-700 dark:text-amber-400">
                      <span>Fragile Package Care</span>
                      <span className="font-mono font-medium">+৳{pricing.fragileFee} BDT</span>
                    </div>
                  )}

                  {pricing.expressFee > 0 && (
                    <div className="flex justify-between text-purple-700 dark:text-purple-400">
                      <span>Rush Priority Dispatch</span>
                      <span className="font-mono font-medium">+৳{pricing.expressFee} BDT</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="pt-3">
                  <Link href="/book-parcel" className="block">
                    <Button
                      size="lg"
                      className="w-full rounded-2xl h-12 gap-2 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                    >
                      <span>Book Parcel at This Rate</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <p className="text-center text-[10px] text-muted-foreground mt-2">
                    Pay securely via Stripe Card or Instant Cash on Delivery
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Guarantees Card */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <Truck className="size-4" />
                  <span>Free Pickup</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Courier collects from your home or warehouse with zero surcharge.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="size-4" />
                  <span>OTP Secure</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Delivery is completed only when the recipient provides their 6-digit PIN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
