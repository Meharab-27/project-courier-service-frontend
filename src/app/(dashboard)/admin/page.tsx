"use client";

import {
  Boxes,
  CheckCircle2,
  Compass,
  FileCheck,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetHubs, useGetMe } from "@/hooks";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: userResponse } = useGetMe();
  const user = userResponse?.data;

  const { data: hubsResponse, isLoading: isLoadingHubs } = useGetHubs();
  const hubs = hubsResponse?.data || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-card via-card/90 to-purple-500/5 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
              Executive Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
              Admin Command Center
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              System monitoring, courier onboard approvals, transit hub
              routing, and shipment tracking across the nationwide courier
              network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/approve-courier"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "rounded-xl gap-2 font-semibold shadow-md shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white",
              )}
            >
              <FileCheck className="size-4" />
              <span>Approve Couriers</span>
            </Link>
            <Link
              href="/track"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl gap-2 font-semibold border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10",
              )}
            >
              <Compass className="size-4" />
              <span>Audit Consignment</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Active Hubs
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {isLoadingHubs ? "-" : hubs.length}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Warehouse className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Courier Approval Queue
              </span>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
                <FileCheck className="size-4" />
                <span>Pending Reviews</span>
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
                Platform Access
              </span>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="size-4" />
                <span>Super Admin</span>
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
                System Status
              </span>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 pt-1">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Operational</span>
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hubs Overview & Admin Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Regional Transit Hubs
            </h2>
            <span className="text-xs text-muted-foreground">
              {hubs.length} Hubs Connected
            </span>
          </div>

          <Card className="rounded-2xl border-border/70 bg-card/60 shadow-2xs overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {hubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Warehouse className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {hub.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3" />
                          <span>
                            {hub.address} ({hub.zone})
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase font-bold rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
                      {hub.code}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Management Links */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Operations</h2>

          <Card className="rounded-2xl border-border/70 bg-card/60 p-5 shadow-2xs space-y-3">
            <CardContent className="p-0 space-y-3">
              <Link
                href="/admin/approve-courier"
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <FileCheck className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Approve Couriers
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Review license & vehicle cards
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">
                  →
                </span>
              </Link>

              <Link
                href="/track"
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Compass className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Universal Consignment Search
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Inspect milestones & OTPs
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">
                  →
                </span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
