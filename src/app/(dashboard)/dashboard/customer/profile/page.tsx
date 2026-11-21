"use client";

import { User } from "lucide-react";
import React from "react";
import { CustomerProfileAddressForm } from "@/components/modules/customer";

export default function CustomerProfilePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1">
            <User className="size-3" />
            <span>Customer Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Customer Profile & Address Book
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your customer identity and default consignment shipping details.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <CustomerProfileAddressForm />
    </div>
  );
}
