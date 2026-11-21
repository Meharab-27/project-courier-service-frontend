"use client";

import { Truck } from "lucide-react";
import React from "react";
import { AssignedDeliveriesQueue } from "@/components/modules/courier";

export default function CourierDeliveriesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
          <Truck className="size-3" />
          <span>Active Dispatch Queue</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Assigned Deliveries Queue
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Collect parcel delivery OTPs, report handover milestones, and inspect delivery routes
        </p>
      </div>

      <AssignedDeliveriesQueue />
    </div>
  );
}
