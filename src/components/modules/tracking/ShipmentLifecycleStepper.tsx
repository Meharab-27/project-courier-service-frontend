"use client";

import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  PackageCheck,
  Radio,
  Truck,
} from "lucide-react";
import type { ComponentType } from "react";
import type { IShipmentData } from "@/api";
import { cn } from "@/lib/utils";

export interface LifecycleStage {
  key: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const LIFECYCLE_STAGES: readonly LifecycleStage[] = [
  {
    key: "ORDER_PLACED",
    label: "Order Placed",
    description: "Shipment registered in courier booking system",
    icon: Package,
  },
  {
    key: "PAYMENT_PENDING",
    label: "Payment Pending",
    description: "Awaiting customer payment confirmation",
    icon: Clock,
  },
  {
    key: "PAID",
    label: "Payment Verified",
    description: "Stripe payment cleared & delivery OTP issued",
    icon: CreditCard,
  },
  {
    key: "PICKUP_ASSIGNED",
    label: "Pickup Assigned",
    description: "Courier partner dispatched for doorstep pickup",
    icon: Truck,
  },
  {
    key: "PICKED_UP",
    label: "Parcel Picked Up",
    description: "Package collected from sender facility",
    icon: PackageCheck,
  },
  {
    key: "IN_HUB_TRANSIT",
    label: "In Hub Transit",
    description: "Sorted & in transit between regional sorting hubs",
    icon: Building2,
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Courier out for final doorstep delivery",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Package handed over & delivery OTP verified",
    icon: CheckCircle2,
  },
] as const;

export function getShipmentStageIndex(shipment: IShipmentData): number {
  const status = (shipment.status || "").toUpperCase();
  const paymentStatus = (shipment.paymentStatus || "").toUpperCase();

  if (status === "DELIVERED") return 7;
  if (status === "OUT_FOR_DELIVERY") return 6;
  if (status === "IN_HUB_TRANSIT" || status === "IN_TRANSIT") return 5;
  if (status === "PICKED_UP") return 4;
  if (status === "PICKUP_ASSIGNED") return 3;
  if (paymentStatus === "PAID" || status === "PAID") return 2;
  if (paymentStatus === "PAYMENT_PENDING" || paymentStatus === "UNPAID")
    return 1;
  if (status === "ORDER_PLACED" || status === "PENDING") return 0;

  // Fallback match by key in LIFECYCLE_STAGES
  const matchIdx = LIFECYCLE_STAGES.findIndex((s) => s.key === status);
  return matchIdx !== -1 ? matchIdx : 0;
}

interface ShipmentLifecycleStepperProps {
  shipment: IShipmentData;
  className?: string;
}

export function ShipmentLifecycleStepper({
  shipment,
  className,
}: ShipmentLifecycleStepperProps) {
  const currentStageIndex = getShipmentStageIndex(shipment);
  const isCancelled = shipment.status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-center text-xs text-destructive">
        <AlertCircle className="size-6 mx-auto mb-2" />
        <h4 className="font-bold text-sm">Shipment Has Been Cancelled</h4>
        <p className="mt-1 text-muted-foreground">
          This consignment lifecycle was stopped before completion.
        </p>
      </div>
    );
  }

  // Map logs to stage timestamps
  const logsByStatus = new Map<string, string>();
  if (shipment.statusLogs) {
    for (const log of shipment.statusLogs) {
      if (log.toStatus && !logsByStatus.has(log.toStatus)) {
        logsByStatus.set(log.toStatus, log.createdAt);
      }
    }
  }

  const formatStageTime = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return null;
    }
  };

  return (
    <div className={cn("relative py-2", className)}>
      <div className="space-y-6 sm:space-y-7">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const isDelivered = (shipment.status || "").toUpperCase() === "DELIVERED";
          const isCompleted = idx < currentStageIndex || (isDelivered && idx === currentStageIndex);
          const isCurrent = idx === currentStageIndex && !isDelivered;
          const isPending = idx > currentStageIndex && !(isDelivered && idx === currentStageIndex);
          const Icon = stage.icon;
          const isLast = idx === LIFECYCLE_STAGES.length - 1;

          // Milestone timestamp if recorded
          const stageTimestamp =
            logsByStatus.get(stage.key) ||
            (isCompleted && idx === 0 ? shipment.createdAt : undefined);
          const formattedTimestamp = formatStageTime(stageTimestamp);

          return (
            <div key={stage.key} className="relative flex items-start gap-4 group">
              {/* Connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-4.5 top-9 -bottom-7 w-0.5 -translate-x-1/2 transition-all duration-500",
                    isCompleted
                      ? "bg-emerald-500 shadow-xs shadow-emerald-500/20"
                      : isCurrent
                        ? "bg-gradient-to-b from-primary via-primary/50 to-border/40"
                        : "bg-border/60 border-dashed",
                  )}
                />
              )}

              {/* Status Icon Circle with Pulse & Solid Emerald Checkmarks */}
              <div className="relative z-10 flex shrink-0 items-center justify-center">
                {/* Pulsing Radar Ring for Active Stage */}
                {isCurrent && (
                  <span className="absolute -inset-1.5 rounded-full bg-primary/25 animate-ping opacity-75" />
                )}

                <div
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    // 1. Completed stages: Solid emerald checkmark with subtle ring
                    isCompleted &&
                      "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-4 ring-emerald-500/15",
                    // 2. Current active stage: High contrast primary with glowing border
                    isCurrent &&
                      "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/25 scale-105",
                    // 3. Upcoming stages: Subtle muted gray
                    isPending &&
                      "border border-border/80 bg-muted/40 text-muted-foreground/60",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4.5 stroke-[3] text-white" />
                  ) : (
                    <Icon className={cn("size-4", isCurrent ? "text-primary-foreground stroke-[2.5]" : "text-muted-foreground")} />
                  )}
                </div>
              </div>

              {/* Status Content */}
              <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={cn(
                        "text-xs sm:text-sm tracking-tight",
                        isCompleted && "text-foreground font-bold",
                        isCurrent && "text-foreground font-black text-sm sm:text-base",
                        isPending && "text-muted-foreground font-normal",
                      )}
                    >
                      {stage.label}
                    </h4>

                    {/* High-Contrast Active Badge with Radar Dot */}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase text-primary shadow-xs">
                        <span className="relative flex size-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full size-2 bg-primary" />
                        </span>
                        <span>Active Stage</span>
                      </span>
                    )}

                    {/* Completed Tag */}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="size-2.5 stroke-[3]" />
                        <span>{stage.key === "DELIVERED" ? "Handover Complete" : "Completed"}</span>
                      </span>
                    )}
                  </div>

                  {/* Timestamp Audit Chip */}
                  {formattedTimestamp && (isCompleted || isCurrent) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-muted-foreground bg-muted/60 border border-border/60 px-2 py-0.5 rounded-md shrink-0">
                      <Clock className="size-2.5 text-muted-foreground" />
                      <span>{formattedTimestamp}</span>
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    isCurrent ? "text-foreground/90 font-medium" : "text-muted-foreground",
                    isPending && "text-muted-foreground/70",
                  )}
                >
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
