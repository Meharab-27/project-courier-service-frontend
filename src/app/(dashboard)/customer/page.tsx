"use client";

import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Package,
  PackagePlus,
  ShieldCheck,
  TrendingUp,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useGetCustomerMe, useGetMe, useGetMyShipments } from "@/hooks";
import { cn } from "@/lib/utils";

export default function CustomerDashboardPage() {
  const { data: userResponse } = useGetMe();
  const user = userResponse?.data;

  const { data: customerResponse } = useGetCustomerMe();
  const customer = customerResponse?.data;

  const { data: shipmentsResponse, isLoading: isLoadingShipments } =
    useGetMyShipments();
  const shipments = shipmentsResponse?.data || [];

  const inTransitCount = shipments.filter(
    (s: { status?: string }) =>
      s.status === "IN_TRANSIT" ||
      s.status === "OUT_FOR_DELIVERY" ||
      s.status === "PICKED_UP",
  ).length;

  const deliveredCount = shipments.filter(
    (s: { status?: string }) => s.status === "DELIVERED",
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Customer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
              Welcome back, {user?.name || "Customer"}!
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Manage your parcel consignments, book next-day deliveries, and
              track live status updates across all nationwide transit hubs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/book-parcel"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-xl gap-2 font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all",
              )}
            >
              <PackagePlus className="size-4" />
              <span>Book New Parcel</span>
            </Link>
            <Link
              href="/track"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl gap-2 font-semibold border-border bg-background/50",
              )}
            >
              <Compass className="size-4" />
              <span>Track Parcel</span>
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
                Total Consignments
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {isLoadingShipments ? "-" : shipments.length}
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
                In Transit
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
                Account Status
              </span>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="size-4" />
                <span>Verified Account</span>
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Shipments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Shipments (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Recent Shipments
              </h2>
              <p className="text-xs text-muted-foreground">
                Track status and timeline of your latest bookings
              </p>
            </div>
            <Link
              href="/dashboard/customer/shipments"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <Card className="rounded-2xl border-border/70 bg-card/60 shadow-2xs overflow-hidden">
            <CardContent className="p-0">
              {isLoadingShipments ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Spinner className="size-6 text-primary" />
                  <span className="text-xs">Loading shipments...</span>
                </div>
              ) : shipments.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-muted mb-3">
                    <Package className="size-6 text-muted-foreground/60" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    No shipments yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    You have not booked any parcels yet. Start by calculating a
                    rate or creating a delivery order.
                  </p>
                  <Link
                    href="/book-parcel"
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "mt-4 rounded-xl gap-2 font-semibold text-xs",
                    )}
                  >
                    <PackagePlus className="size-3.5" />
                    <span>Book Your First Parcel</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {shipments.slice(0, 5).map((shipment: any) => (
                    <Link
                      key={shipment.id}
                      href={`/dashboard/shipments/${shipment.id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                          <Package className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {shipment.parcelTitle || `Consignment #${shipment.id.slice(0, 8)}`}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                            <MapPin className="size-3 text-muted-foreground/70" />
                            <span>To: {shipment.receiverAddress || shipment.destinationHub?.name || "Recipient"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="rounded-lg border border-border/80 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase tracking-wider">
                          {shipment.status || "PENDING"}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Services & Courier Application Banner */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Services</h2>

          {/* Become a Courier Card */}
          <Card className="rounded-2xl border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-card p-5 shadow-2xs">
            <CardContent className="p-0 space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Truck className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Earn as a Delivery Partner
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Have a bike, van, or truck? Join our registered courier fleet
                  and start earning on every delivery in your zone.
                </p>
              </div>
              <Link
                href="/courier-apply"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full rounded-xl gap-2 font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs",
                )}
              >
                <span>Apply as Courier</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Rate Calculator Quick Promo */}
          <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs">
            <CardContent className="p-0 space-y-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Instant Rate Estimator
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Calculate volumetric shipping charges and estimated delivery
                  time between any two national hubs in seconds.
                </p>
              </div>
              <Link
                href="/book-parcel"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "w-full rounded-xl gap-2 font-semibold text-xs",
                )}
              >
                <span>Calculate Shipping Cost</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
