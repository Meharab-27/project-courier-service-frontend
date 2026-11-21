"use client";

import { UserCheck } from "lucide-react";
import React from "react";
import { CourierProfileView } from "@/components/modules/courier";

export default function DedicatedCourierProfilePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
          <UserCheck className="size-3" />
          <span>Courier Partner Identity</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Courier Profile & Fleet Credentials
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View assigned hub terminal, registered vehicle particulars, capacity limits, and verified licensing documents.
        </p>
      </div>

      {/* Main Profile View with Edit Mode */}
      <CourierProfileView />
    </div>
  );
}
