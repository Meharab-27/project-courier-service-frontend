"use client";

import { UserCheck } from "lucide-react";
import React from "react";
import { CourierProfileView } from "@/components/modules/courier";

export default function CourierProfilePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
          <UserCheck className="size-3" />
          <span>Courier Fleet Credentials</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Courier Profile & Fleet Credentials
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Registered vehicle particulars, driver licensing documents, and allocated hub
        </p>
      </div>

      <CourierProfileView />
    </div>
  );
}
