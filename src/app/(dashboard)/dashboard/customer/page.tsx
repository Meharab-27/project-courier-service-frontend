"use client";

import {
  BookUser,
  Boxes,
  CheckCircle2,
  Compass,
  MapPin,
  Package,
  PackagePlus,
  ShieldCheck,
  TrendingUp,
  Truck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CustomerProfileAddressForm,
  CustomerShipmentsTable,
} from "@/components/modules/customer";
import { useGetCustomerMe, useGetMe, useGetMyShipments } from "@/hooks";
import { cn } from "@/lib/utils";

export default function CustomerDashboardHubPage() {
  const { data: userResponse } = useGetMe();
  const user = userResponse?.data;

  const { data: customerResponse } = useGetCustomerMe();
  const customer = customerResponse?.data;

  const { data: shipmentsResponse, isLoading: isLoadingShipments } = useGetMyShipments();
  const shipments = shipmentsResponse?.data || [];

  const inTransitCount = shipments.filter(
    (s: { status?: string }) =>
      s.status === "IN_TRANSIT" ||
      s.status === "OUT_FOR_DELIVERY" ||
      s.status === "PICKED_UP" ||
      s.status === "IN_HUB_TRANSIT",
  ).length;

  const deliveredCount = shipments.filter(
    (s: { status?: string }) => s.status === "DELIVERED",
  ).length;

  const [activeTab, setActiveTab] = useState<"shipments" | "address-book">("shipments");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Customer Operations Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
              Customer Management & Address Book
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Track live consignments, modify receiver info prior to dispatch, and maintain your primary delivery address book.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/book-parcel"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-xl gap-2 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all text-xs sm:text-sm",
              )}
            >
              <PackagePlus className="size-4" />
              <span>Book Parcel</span>
            </Link>
            <Link
              href="/track"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl gap-2 font-semibold border-border bg-background/50 text-xs sm:text-sm",
              )}
            >
              <Compass className="size-4" />
              <span>Track Live</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Lifetime Consignments
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {customer?.totalOrders ?? (isLoadingShipments ? "-" : shipments.length)}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                In Active Transit
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {isLoadingShipments ? "-" : inTransitCount}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Truck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Delivered
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {isLoadingShipments ? "-" : deliveredCount}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Verified Customer
              </span>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="size-4" />
                <span>Active Account</span>
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Tabs: My Shipments & Customer Profile / Address Book */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("shipments")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeTab === "shipments"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Package className="size-4" />
            <span>My Consignments & Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("address-book")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeTab === "address-book"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <BookUser className="size-4" />
            <span>Profile & Address Book Settings</span>
          </button>
        </div>

        {/* Tab Content View */}
        {activeTab === "shipments" ? (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  My Shipments Management
                </h2>
                <p className="text-xs text-muted-foreground">
                  Sort, filter, edit receiver information, or cancel consignments prior to courier pickup.
                </p>
              </div>
            </div>
            <CustomerShipmentsTable />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <CustomerProfileAddressForm />
          </div>
        )}
      </div>
    </div>
  );
}
