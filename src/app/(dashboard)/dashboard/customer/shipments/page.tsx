"use client";

import { Package, PackagePlus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { CustomerShipmentsTable } from "@/components/modules/customer";
import { cn } from "@/lib/utils";

export default function CustomerShipmentsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1">
            <Package className="size-3" />
            <span>Customer Shipment Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            My Shipments & Consignments
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor consignment progress, update recipient information, or cancel prior to rider pickup.
          </p>
        </div>

        <Link
          href="/book-parcel"
          className={cn(
            buttonVariants({ variant: "default" }),
            "rounded-xl gap-2 text-xs font-semibold shadow-xs self-start sm:self-auto",
          )}
        >
          <PackagePlus className="size-4" />
          <span>Book New Parcel</span>
        </Link>
      </div>

      {/* Main Table */}
      <CustomerShipmentsTable />
    </div>
  );
}
