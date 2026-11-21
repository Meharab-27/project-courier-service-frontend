"use client";

import {
  AlertCircle,
  Bike,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  ImageIcon,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import CourierApplyForm from "@/components/form/courier-apply-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe, useGetMyCourierProfile } from "@/hooks";
import { cn } from "@/lib/utils";

export function CourierProfileView() {
  const { data: userResponse } = useGetMe();
  const user = userResponse?.data;

  const {
    data: profileResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetMyCourierProfile();
  const profile = profileResponse?.data;

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<{
    title: string;
    url: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 text-muted-foreground p-8">
        <Spinner className="size-8 text-emerald-600" />
        <p className="text-xs font-medium">Loading courier fleet credentials...</p>
      </div>
    );
  }

  // If no profile exists yet
  if (!profile) {
    return (
      <Card className="rounded-3xl border-border/80 bg-card/60 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Truck className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground font-heading">
          Courier Profile Not Found
        </h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          You are signed in as a Courier, but your vehicle and hub registration details have not been submitted yet.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="rounded-xl text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
          >
            <Edit3 className="size-3.5" />
            <span>Complete Courier Onboarding</span>
          </Button>
        </div>

        {isEditMode && (
          <div className="mt-8 text-left">
            <CourierApplyForm
              isEditMode={false}
              onSuccess={() => {
                setIsEditMode(false);
                refetch();
              }}
            />
          </div>
        )}
      </Card>
    );
  }

  // Edit Mode view: Reusing CourierApplyForm with prefilled initialData
  if (isEditMode) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <CourierApplyForm
          initialData={profile}
          isEditMode={true}
          onCancelEdit={() => setIsEditMode(false)}
          onSuccess={() => {
            setIsEditMode(false);
            refetch();
          }}
        />
      </div>
    );
  }

  const hubName = profile.hub?.name || "Unassigned Hub";
  const hubCode = profile.hub?.code || "N/A";
  const hubZone = profile.hub?.zone || profile.currentZone || "Regional";
  const isAvailable = profile.isAvailable ?? true;
  const activeDeliveries = profile.activeDeliveries ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Action & Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
            Courier Partner Credentials & Fleet Profile
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational status, assigned logistics hub, vehicle registration, and verified driver documents
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl text-xs gap-1.5 border-border/80"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-emerald-600")} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="rounded-xl text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
          >
            <Edit3 className="size-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <Card className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-card via-card/90 to-emerald-500/5 p-6 sm:p-8 shadow-sm overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25">
              <Truck className="size-8" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-foreground font-heading">
                  {user?.name || "Courier Partner"}
                </h3>

                {/* isAvailable badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border",
                    isAvailable
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-muted bg-muted text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isAvailable ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground",
                    )}
                  />
                  <span>{isAvailable ? "Available for Dispatch" : "Off-Duty"}</span>
                </span>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{user?.email}</span>
                {user?.phone && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{user.phone}</span>
                  </>
                )}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                <ShieldCheck className="size-3.5" />
                <span>Verified Courier Fleet Partner</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-3.5 text-center min-w-[110px] shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Active Deliveries
              </span>
              <p className="text-2xl font-extrabold text-foreground font-heading mt-0.5">
                {activeDeliveries}
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 p-3.5 text-center min-w-[110px] shadow-2xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Max Capacity
              </span>
              <p className="text-2xl font-extrabold text-foreground font-heading mt-0.5">
                {profile.maxCapacityKg}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">KG</span>
              </p>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </Card>

      {/* Grid: Hub Assignment & Vehicle Particulars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Assigned Hub Card */}
        <Card className="rounded-2xl border-border/80 bg-card/70 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Assigned Logistics Hub</h4>
                <p className="text-[11px] text-muted-foreground">Primary sorting terminal and collection point</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Hub Terminal</span>
                <p className="font-bold text-foreground">{hubName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Hub Code</span>
                <p className="font-mono font-bold text-foreground inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs">
                  {hubCode}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Hub Zone</span>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-primary" />
                  <span>{hubZone}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Operating Zone</span>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Compass className="size-3 text-emerald-600" />
                  <span>{profile.currentZone || "All Subzones"}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Particulars Card */}
        <Card className="rounded-2xl border-border/80 bg-card/70 p-5 shadow-2xs backdrop-blur-sm">
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Truck className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Vehicle Specifications</h4>
                <p className="text-[11px] text-muted-foreground">Registered dispatch transport particulars</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Vehicle Type</span>
                <div className="flex items-center gap-1.5 font-bold text-foreground uppercase">
                  {profile.vehicleType === "BICYCLE" ? (
                    <Bike className="size-3.5 text-emerald-600" />
                  ) : (
                    <Truck className="size-3.5 text-emerald-600" />
                  )}
                  <span>{profile.vehicleType}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Vehicle Number</span>
                <p className="font-mono font-bold text-foreground">
                  {profile.vehicleNumber}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Max Weight Limit</span>
                <p className="font-bold text-foreground flex items-center gap-1">
                  <Scale className="size-3 text-muted-foreground" />
                  <span>{profile.maxCapacityKg} KG</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Driving License #</span>
                <p className="font-mono text-xs text-foreground">
                  {profile.drivingLicense || "Verified on File"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Verification Documents Previews */}
      <Card className="rounded-2xl border-border/80 bg-card/70 p-5 shadow-2xs backdrop-blur-sm">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <FileCheck className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Driver Credentials & Documents</h4>
                <p className="text-[11px] text-muted-foreground">
                  Verified Driving License and National Identity Card (NID) files
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
              className="rounded-xl text-xs gap-1 border-border/80"
            >
              <Edit3 className="size-3" />
              <span>Replace Documents</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Driving License Preview */}
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" />
                  <span>Driving License Document</span>
                </span>
                {profile.drivingLicenseUrl && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Uploaded
                  </span>
                )}
              </div>

              {profile.drivingLicenseUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/80 bg-card/60 group">
                    {/* biome-ignore lint/a11y/useAltText: Driving License Preview */}
                    <img
                      src={profile.drivingLicenseUrl}
                      alt="Driving License"
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPreview({
                            title: "Driving License Document",
                            url: profile.drivingLicenseUrl as string,
                          })
                        }
                        className="rounded-lg bg-background/90 text-foreground px-3 py-1 text-xs font-semibold shadow-md flex items-center gap-1 hover:bg-background"
                      >
                        <Eye className="size-3" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={profile.drivingLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-background/90 text-foreground p-1 text-xs shadow-md hover:bg-background"
                        title="Open in new window"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed rounded-xl border-border/70">
                  <ImageIcon className="size-6 text-muted-foreground/50 mb-1" />
                  <p className="text-xs font-medium text-foreground">No license document uploaded</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Click edit to upload license photo</p>
                </div>
              )}
            </div>

            {/* National ID (NID) Card Preview */}
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>National ID (NID) Card</span>
                </span>
                {profile.nidCardUrl && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Uploaded
                  </span>
                )}
              </div>

              {profile.nidCardUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/80 bg-card/60 group">
                    {/* biome-ignore lint/a11y/useAltText: NID Card Preview */}
                    <img
                      src={profile.nidCardUrl}
                      alt="National ID Card"
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPreview({
                            title: "National ID (NID) Document",
                            url: profile.nidCardUrl as string,
                          })
                        }
                        className="rounded-lg bg-background/90 text-foreground px-3 py-1 text-xs font-semibold shadow-md flex items-center gap-1 hover:bg-background"
                      >
                        <Eye className="size-3" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={profile.nidCardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-background/90 text-foreground p-1 text-xs shadow-md hover:bg-background"
                        title="Open in new window"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed rounded-xl border-border/70">
                  <ImageIcon className="size-6 text-muted-foreground/50 mb-1" />
                  <p className="text-xs font-medium text-foreground">No NID document uploaded</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Click edit to upload NID scan</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Zoomed Document Preview */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in-0 duration-150"
          onClick={() => setSelectedPreview(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedPreview(null);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl w-full rounded-2xl bg-card border border-border/80 p-4 shadow-2xl overflow-hidden flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">{selectedPreview.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-auto max-h-[70vh] rounded-xl flex items-center justify-center bg-muted/40 p-2">
              {/* biome-ignore lint/a11y/useAltText: Zoomed Document Preview */}
              <img
                src={selectedPreview.url}
                alt={selectedPreview.title}
                className="max-h-[65vh] w-auto rounded-lg object-contain"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={selectedPreview.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-xl text-xs gap-1.5",
                )}
              >
                <ExternalLink className="size-3.5" />
                <span>Open Full Size</span>
              </a>
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => setSelectedPreview(null)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
