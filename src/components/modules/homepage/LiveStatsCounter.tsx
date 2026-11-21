"use client";

import {
  CheckCircle2,
  MapPin,
  Package,
  ShieldCheck,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const STATS = [
  {
    number: "62",
    suffix: " Hubs",
    label: "Nationwide Transit Network",
    subtext: "Across all 8 administrative divisions",
    icon: Warehouse,
  },
  {
    number: "64",
    suffix: " Districts",
    label: "Complete Geographic Coverage",
    subtext: "Urban centers & remote thanas",
    icon: MapPin,
  },
  {
    number: "99.4",
    suffix: "%",
    label: "On-Time Next-Day Delivery",
    subtext: "Overnight line-haul sortation",
    icon: TrendingUp,
  },
  {
    number: "100",
    suffix: "%",
    label: "Delivery OTP Verified",
    subtext: "Zero unauthorized parcel handovers",
    icon: ShieldCheck,
  },
];

export function LiveStatsCounter() {
  return (
    <section className="py-16 bg-muted/40 border-y border-border/70 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-3xl border border-border/80 bg-card/70 p-6 shadow-2xs backdrop-blur-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Verified
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                      {s.number}
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
                      {s.suffix}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground mt-1">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {s.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
