"use client";

import { BookUser, MapPin } from "lucide-react";
import React from "react";
import { CustomerProfileAddressForm } from "@/components/modules/customer";

export default function CustomerAddressBookPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1">
            <BookUser className="size-3" />
            <span>Customer Address Book</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Profile & Default Address Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your sender credentials, default pickup address, and secondary contact phone for 1-click booking.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <CustomerProfileAddressForm />
    </div>
  );
}
