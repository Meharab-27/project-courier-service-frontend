"use client";

import {
  AlertCircle,
  Clock,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Truck,
  UserCheck,
  Warehouse,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { IUser } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetUsers } from "@/hooks/auth.hooks";
import { useGetHubs } from "@/hooks/hub.hooks";
import { cn } from "@/lib/utils";
import { CourierProfileModal } from "./CourierProfileModal";
import { InspectUserDrawer } from "./InspectUserDrawer";

export function AdminCourierManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [profileStatusFilter, setProfileStatusFilter] = useState("ALL");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");
  const [_copiedText, setCopiedText] = useState<string | null>(null);

  // Modal / Drawer state
  const [selectedCourier, setSelectedCourier] = useState<IUser | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  // Queries
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isRefetching,
    refetch,
  } = useGetUsers({
    role: "COURIER",
    searchTerm: searchTerm || undefined,
  });

  const { data: hubsResponse } = useGetHubs();
  const hubs = hubsResponse?.data || [];
  const courierUsers: IUser[] = usersResponse?.data || [];

  // Client-side filtering fallback
  const filteredCouriers = useMemo(() => {
    return courierUsers.filter((courier) => {
      const profile = courier.courierProfile;

      // Profile configuration status filter
      if (profileStatusFilter === "CONFIGURED" && !profile) return false;
      if (profileStatusFilter === "PENDING" && profile) return false;

      // Vehicle type filter
      if (vehicleFilter !== "ALL") {
        if (!profile || profile.vehicleType !== vehicleFilter) {
          return false;
        }
      }

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = courier.name?.toLowerCase().includes(query);
        const matchesEmail = courier.email?.toLowerCase().includes(query);
        const matchesPhone = courier.phone?.toLowerCase().includes(query);
        const matchesVehicle = profile?.vehicleNumber
          ?.toLowerCase()
          .includes(query);
        const matchesZone = profile?.currentZone?.toLowerCase().includes(query);
        const matchesHub = profile?.hub?.name?.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesVehicle &&
          !matchesZone &&
          !matchesHub
        ) {
          return false;
        }
      }

      return true;
    });
  }, [courierUsers, profileStatusFilter, vehicleFilter, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = courierUsers.length;
    const configured = courierUsers.filter((u) =>
      Boolean(u.courierProfile),
    ).length;
    const pending = total - configured;
    const activeDeliveries = courierUsers.reduce(
      (sum, u) => sum + (u.courierProfile?.activeDeliveries || 0),
      0,
    );

    return { total, configured, pending, activeDeliveries };
  }, [courierUsers]);

  const _handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.add({
      title: "Copied to Clipboard",
      description: `${label}: ${text}`,
      type: "success",
    });
    setTimeout(() => {
      setCopiedText((prev) => (prev === text ? null : prev));
    }, 2000);
  };

  const handleOpenSetup = (courier: IUser) => {
    setSelectedCourier(courier);
    setIsProfileModalOpen(true);
  };

  const handleOpenInspect = (id: string) => {
    setInspectUserId(id);
    setIsInspectOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Courier Fleet Management & Onboarding
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Fleet Ops
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage courier accounts, assign distribution hubs, and setup vehicle
            profiles
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rounded-xl text-xs gap-1.5 h-9 self-start sm:self-auto"
        >
          <RefreshCw
            className={cn(
              "size-3.5",
              isRefetching && "animate-spin text-emerald-600",
            )}
          />
          <span>Refresh Fleet</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Courier Accounts
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.total}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Truck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Fleet Configured
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.configured}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Awaiting Setup
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.pending}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Deliveries
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.activeDeliveries}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Package className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="rounded-2xl border-border/80 bg-card/60 shadow-2xs backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by courier name, email, phone, vehicle plate, or hub..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 rounded-xl border-border/80 bg-background/70 text-xs h-9"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status & Vehicle Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Profile Status */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/70 px-2.5 py-1 rounded-xl">
              <Filter className="size-3.5" />
              <span className="font-medium">Profile:</span>
              <select
                value={profileStatusFilter}
                onChange={(e) => setProfileStatusFilter(e.target.value)}
                className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">
                  All Couriers ({courierUsers.length})
                </option>
                <option value="CONFIGURED">
                  Fleet Configured ({metrics.configured})
                </option>
                <option value="PENDING">
                  Setup Pending ({metrics.pending})
                </option>
              </select>
            </div>

            {/* Vehicle Type */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/70 px-2.5 py-1 rounded-xl">
              <Truck className="size-3.5" />
              <span className="font-medium">Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Vehicles</option>
                <option value="MOTORBIKE">Motorbike</option>
                <option value="VAN">Delivery Van</option>
                <option value="TRUCK">Freight Truck</option>
                <option value="BICYCLE">Bicycle</option>
              </select>
            </div>

            {(profileStatusFilter !== "ALL" || vehicleFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProfileStatusFilter("ALL");
                  setVehicleFilter("ALL");
                }}
                className="h-8 text-xs rounded-xl text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Couriers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Courier Driver</th>
                <th className="py-3 px-4">Assigned Transit Hub</th>
                <th className="py-3 px-4">Vehicle Tier & Plate</th>
                <th className="py-3 px-4">Operating Subzone</th>
                <th className="py-3 px-4 text-center">Capacity / Tasks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoadingUsers ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Spinner className="size-6 text-emerald-600 mx-auto mb-2" />
                    <span>Loading courier fleet accounts...</span>
                  </td>
                </tr>
              ) : filteredCouriers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Truck className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="font-semibold text-foreground text-sm">
                      No matching courier accounts found
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verify your filters or ensure user accounts have the role
                      COURIER.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCouriers.map((courier) => {
                  const profile = courier.courierProfile;
                  const isConfigured = Boolean(profile);
                  const matchedHub =
                    profile?.hub || hubs.find((h) => h.id === profile?.hubId);

                  return (
                    <tr
                      key={courier.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* 1. Courier Driver */}
                      <td className="py-3.5 px-4 align-top min-w-[200px]">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-0.5">
                            {(courier.name?.[0] || "C").toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-foreground text-xs leading-tight">
                                {courier.name}
                              </p>
                              {courier.isVerified && (
                                <span title="Verified Account">
                                  <ShieldCheck className="size-3 text-emerald-500" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {courier.email}
                            </p>
                            {courier.phone && (
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                {courier.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Assigned Hub */}
                      <td className="py-3.5 px-4 align-top min-w-[170px]">
                        {matchedHub ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-foreground text-xs flex items-center gap-1.5">
                              <Warehouse className="size-3.5 text-purple-600 shrink-0" />
                              <span>{matchedHub.name}</span>
                            </p>
                            <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/60">
                              {matchedHub.code || matchedHub.zone}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            <AlertCircle className="size-3" />
                            Hub Unassigned
                          </span>
                        )}
                      </td>

                      {/* 3. Vehicle Tier & Plate */}
                      <td className="py-3.5 px-4 align-top min-w-[160px]">
                        {isConfigured && profile ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                              {profile.vehicleType}
                            </span>
                            <p className="font-mono text-xs font-semibold text-foreground">
                              {profile.vehicleNumber}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Profile Setup Needed
                          </span>
                        )}
                      </td>

                      {/* 4. Operating Subzone */}
                      <td className="py-3.5 px-4 align-top min-w-[140px]">
                        {profile?.currentZone ? (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            {profile.currentZone}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            No zone set
                          </span>
                        )}
                      </td>

                      {/* 5. Capacity / Active Tasks */}
                      <td className="py-3.5 px-4 align-top text-center min-w-[130px]">
                        {isConfigured && profile ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {profile.maxCapacityKg} kg max
                            </span>
                            <p className="text-[10px] text-muted-foreground">
                              {profile.activeDeliveries ?? 0} active packages
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            —
                          </span>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 align-top text-right min-w-[160px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleOpenSetup(courier)}
                            className={cn(
                              "h-7 text-xs px-2.5 rounded-lg font-bold gap-1",
                              isConfigured
                                ? "bg-muted text-foreground hover:bg-muted/80 border border-border/80"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25",
                            )}
                          >
                            <Settings2 className="size-3" />
                            <span>
                              {isConfigured ? "Edit Profile" : "Setup Profile"}
                            </span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenInspect(courier.id)}
                            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                            title="Inspect Courier"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Managing <strong>{filteredCouriers.length}</strong> active courier
            drivers
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              {metrics.configured} Configured & Active
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" />
              {metrics.pending} Pending Setup
            </span>
          </div>
        </div>
      </Card>

      {/* Courier Profile Setup / Update Dialog */}
      <CourierProfileModal
        courierUser={selectedCourier}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedCourier(null);
        }}
        onSuccess={() => refetch()}
      />

      {/* Inspect User Drawer */}
      <InspectUserDrawer
        userId={inspectUserId}
        isOpen={isInspectOpen}
        onClose={() => {
          setIsInspectOpen(false);
          setInspectUserId(null);
        }}
      />
    </div>
  );
}
