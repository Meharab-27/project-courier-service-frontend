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
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AssignedDeliveriesQueue,
  CourierProfileView,
} from "@/components/modules/courier";
import { useGetMe, useGetMyCourierProfile, useGetAllShipments } from "@/hooks";
import { cn } from "@/lib/utils";

export default function CourierDashboardHubPage() {
  const { data: userResponse } = useGetMe();
  const user = userResponse?.data;

  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetMyCourierProfile();
  const profile = profileResponse?.data;

  const { data: shipmentsResponse, isLoading: isLoadingShipments } =
    useGetAllShipments();
  const shipments = shipmentsResponse?.data || [];

  const [activeTab, setActiveTab] = useState<"queue" | "profile">("queue");

  const pendingCount = shipments.filter(
    (s: { status?: string }) =>
      s.status === "PICKUP_ASSIGNED" ||
      s.status === "PICKED_UP" ||
      s.status === "OUT_FOR_DELIVERY",
  ).length;

  const completedCount = shipments.filter(
    (s: { status?: string }) => s.status === "DELIVERED",
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-card via-card/90 to-emerald-500/5 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Courier Partner Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
              Welcome, Rider {user?.name || "Partner"}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Access your assigned delivery batches, view pickup & dropoff coordinates, verify recipient delivery OTPs, and manage your partner credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
            <Link
              href="/track"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl gap-2 font-semibold border-border bg-background/50 text-xs sm:text-sm",
              )}
            >
              <Navigation className="size-4" />
              <span>Lookup Tracking</span>
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
              <p className="text-sm font-bold tracking-tight text-foreground truncate max-w-[150px]">
                {isLoadingProfile
                  ? "Loading..."
                  : profile?.hub?.name || "Unassigned"}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                {profile?.hub?.code || "No Code"}
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
                In-Flight Parcels
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {isLoadingShipments ? "-" : pendingCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Active delivery routes</p>
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
                Delivered by You
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {isLoadingShipments ? "-" : completedCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Successfully fulfilled</p>
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
                Duty Status
              </span>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{profile?.isAvailable ?? true ? "Available for Dispatch" : "Off-Duty"}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                {profile?.vehicleNumber || "Vehicle Pending"}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Tabs: Assigned Deliveries Queue & Courier Profile */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeTab === "queue"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Truck className="size-4" />
            <span>Assigned Deliveries Queue</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeTab === "profile"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <UserCheck className="size-4" />
            <span>Overview & Partner Profile</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "queue" ? (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <AssignedDeliveriesQueue />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <CourierProfileView />
          </div>
        )}
      </div>
    </div>
  );
}
