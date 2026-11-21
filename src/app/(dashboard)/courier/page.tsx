"use client";

import {
  Boxes,
  CheckCircle2,
  Compass,
  FileText,
  MapPin,
  Navigation,
  ShieldCheck,
  Truck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe, useGetMyCourierProfile } from "@/hooks";
import { cn } from "@/lib/utils";

export default function CourierDashboardPage() {
  const { data: userResponse } = useGetMe();
  const user = userResponse?.data;

  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetMyCourierProfile();
  const profile = profileResponse?.data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-card via-card/90 to-emerald-500/5 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Courier Fleet Rider
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
              Welcome, Rider {user?.name || "Partner"}!
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Access your daily dispatch batches, confirm delivery OTPs, and
              coordinate transit handovers with your assigned regional hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/courier/profile"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl gap-2 font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs sm:text-sm",
              )}
            >
              <FileText className="size-4" />
              <span>Fleet Profile</span>
            </Link>
            <Link
              href="/dashboard/courier/deliveries"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-xl gap-2 font-semibold shadow-md shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm",
              )}
            >
              <Truck className="size-4" />
              <span>Deliveries Queue</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Assigned Hub
              </span>
              <p className="text-base font-bold tracking-tight text-foreground truncate max-w-[140px]">
                {isLoadingProfile
                  ? "Loading..."
                  : profile?.hub?.name || "Main Terminal"}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Vehicle Type
              </span>
              <p className="text-base font-bold tracking-tight text-foreground uppercase">
                {isLoadingProfile ? "-" : profile?.vehicleType || "MOTORBIKE"}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Capacity Limit
              </span>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {isLoadingProfile
                  ? "-"
                  : `${profile?.maxCapacityKg || 25} KG`}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Boxes className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Duty Status
              </span>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span>On-Duty & Ready</span>
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courier Profile & Fleet Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-foreground">
            Vehicle & Registration Details
          </h2>

          <Card className="rounded-2xl border-border/70 bg-card/60 p-6 shadow-2xs">
            <CardContent className="p-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground">Vehicle Number</span>
                  <p className="font-mono font-bold text-foreground">
                    {profile?.vehicleNumber || "DHAKA-METRO-HA-1234"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground">Current Transit Zone</span>
                  <p className="font-semibold text-foreground">
                    {profile?.currentZone || profile?.hub?.zone || "Central Hub Zone"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground">Driving License</span>
                  <p className="font-mono font-semibold text-foreground">
                    {profile?.drivingLicense ? "Verified" : "Submitted for Review"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground">Verification Audit</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="size-3.5" />
                    <span>Courier Fleet Active</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courier Guidelines */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Rider Guidelines</h2>

          <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs space-y-3">
            <CardContent className="p-0 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                1. Always request the <strong>Delivery OTP</strong> from the
                receiver before handing over fragile or standard consignments.
              </p>
              <p>
                2. Report failed delivery attempts immediately to allow hub
                rerouting or rescheduled delivery.
              </p>
              <p>
                3. Inspect volumetric weight limits when accepting bulk items.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
