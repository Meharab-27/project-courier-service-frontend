"use client";

import {
  ArrowRight,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import type { IHub, IPriceBreakdown } from "@/api";
import { cn } from "@/lib/utils";

interface RateBreakdownCardProps {
  breakdown: IPriceBreakdown;
  isCalculating?: boolean;
  originHub?: IHub | null;
  destinationHub?: IHub | null;
  isFragile: boolean;
  className?: string;
}

export function RateBreakdownCard({
  breakdown,
  isCalculating = false,
  originHub,
  destinationHub,
  isFragile,
  className,
}: RateBreakdownCardProps) {
  const isSameZone =
    originHub && destinationHub
      ? originHub.zone.toLowerCase() === destinationHub.zone.toLowerCase()
      : (breakdown.isSameZone ?? true);

  const extraKg = Math.max(0, breakdown.chargeableWeightKg - 1);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-6 shadow-xl backdrop-blur-md transition-all",
        className,
      )}
    >
      {/* Decorative gradient blur backdrop */}
      <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
              Live Fare Breakdown
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent automated rate calculation
          </p>
        </div>

        {isCalculating ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-ping" />
            Calculating...
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Zap className="size-3" />
            Live Synced
          </span>
        )}
      </div>

      {/* Hub Route & Zone Info */}
      <div className="my-4 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
        <div className="flex items-center justify-between text-muted-foreground mb-1.5">
          <span className="font-medium text-foreground">Delivery Route</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border",
              isSameZone
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
            )}
          >
            {isSameZone ? "Same-Zone (Intra-Zone)" : "Inter-Zone (Cross-Zone)"}
          </span>
        </div>

        <div className="flex items-center gap-2 font-medium text-foreground">
          <div className="truncate">
            {originHub ? (
              <span title={`${originHub.name} (${originHub.zone})`}>
                {originHub.name}
              </span>
            ) : (
              <span className="text-muted-foreground italic">
                Select Origin Hub
              </span>
            )}
          </div>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          <div className="truncate">
            {destinationHub ? (
              <span title={`${destinationHub.name} (${destinationHub.zone})`}>
                {destinationHub.name}
              </span>
            ) : (
              <span className="text-muted-foreground italic">
                Select Destination Hub
              </span>
            )}
          </div>
        </div>

        {originHub && destinationHub && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
            <span>
              Zone:{" "}
              <strong className="text-foreground">{originHub.zone}</strong>
            </span>
            <span>&rarr;</span>
            <span>
              Zone:{" "}
              <strong className="text-foreground">{destinationHub.zone}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Weight Comparison Box */}
      <div className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5">
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Scale className="size-3 text-muted-foreground" />
            Actual
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {breakdown.actualWeightKg.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              kg
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5">
          <p
            className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"
            title="Volumetric Weight = (L × W × H) / 5000"
          >
            <Layers className="size-3 text-muted-foreground" />
            Volumetric
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {breakdown.volumetricWeightKg.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              kg
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-primary/40 bg-primary/10 p-2.5">
          <p className="text-[10px] font-medium text-primary flex items-center justify-center gap-1">
            <Sparkles className="size-3 text-primary" />
            Chargeable
          </p>
          <p className="text-sm font-bold text-primary mt-0.5">
            {breakdown.chargeableWeightKg.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-primary/80">kg</span>
          </p>
        </div>
      </div>

      {/* Formula Explanation Note */}
      <p className="text-[11px] text-muted-foreground mb-4 flex items-center gap-1.5 bg-muted/20 rounded-lg p-2">
        <Info className="size-3.5 shrink-0 text-primary" />
        <span>
          Chargeable weight applies the greater of actual vs. volumetric weight
          (<code className="text-[10px] font-mono">L×W×H/5000</code>).
        </span>
      </p>

      {/* Itemized Cost Breakdown Table */}
      <div className="space-y-2.5 border-t border-border/60 pt-4 text-xs">
        {/* Base Fare */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Base Delivery Fare</span>
            <span className="text-[10px] text-muted-foreground/80">
              {isSameZone
                ? "Same-zone tier (covers up to 1.0 kg)"
                : "Inter-zone tier (covers up to 1.0 kg)"}
            </span>
          </div>
          <span className="font-semibold text-foreground">
            ৳{breakdown.baseFare.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              BDT
            </span>
          </span>
        </div>

        {/* Extra Weight Fare */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Extra Weight Fare</span>
            <span className="text-[10px] text-muted-foreground/80">
              {extraKg > 0 ? (
                <>
                  +{Math.ceil(extraKg)} kg excess @ ৳{isSameZone ? "30" : "45"}
                  /kg
                </>
              ) : (
                "Within base 1.0 kg allowance"
              )}
            </span>
          </div>
          <span className="font-semibold text-foreground">
            ৳{breakdown.extraWeightFare.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              BDT
            </span>
          </span>
        </div>

        {/* Fragile Surcharge */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1">
              Fragile Item Handling
              {isFragile && <ShieldAlert className="size-3 text-amber-500" />}
            </span>
            <span className="text-[10px] text-muted-foreground/80">
              {isFragile
                ? "Special protective transit & handling"
                : "Standard non-fragile parcel"}
            </span>
          </div>
          <span
            className={cn(
              "font-semibold",
              breakdown.surcharge > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          >
            ৳{breakdown.surcharge.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-muted-foreground">
              BDT
            </span>
          </span>
        </div>
      </div>

      {/* Total Card Footer */}
      <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Shipping Rate
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Taxes & fuel surcharge included
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold tracking-tight text-primary">
              ৳{breakdown.totalCost.toFixed(2)}
            </span>
            <span className="ml-1 text-xs font-semibold text-primary/80">
              BDT
            </span>
          </div>
        </div>
      </div>

      {/* Guaranteed delivery highlight */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Truck className="size-3.5 text-primary" />
        <span>
          Estimated Delivery:{" "}
          <strong className="text-foreground">
            {isSameZone ? "24 Hours (Next Day)" : "48 - 72 Hours"}
          </strong>
        </span>
      </div>
    </div>
  );
}
