"use client";

import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  KeyRound,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  Scale,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { IShipmentData } from "@/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetAllShipments, useUpdateCourierStatus } from "@/hooks";
import { cn } from "@/lib/utils";
import { VerifyDeliveryOtpModal } from "./VerifyDeliveryOtpModal";

const COURIER_STATUS_TABS = [
  { label: "All Active", value: "ALL" },
  { label: "Pickup Assigned", value: "PICKUP_ASSIGNED" },
  { label: "Picked Up", value: "PICKED_UP" },
  { label: "In Hub Transit", value: "IN_HUB_TRANSIT" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
] as const;

export function AssignedDeliveriesQueue() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // OTP Handover Modal State
  const [selectedShipmentForOtp, setSelectedShipmentForOtp] =
    useState<IShipmentData | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Status progression mutation
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateCourierStatus();
  const [updatingShipmentId, setUpdatingShipmentId] = useState<string | null>(
    null,
  );

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    const timeout = setTimeout(() => {
      setDebouncedSearch(val.trim());
    }, 300);
    return () => clearTimeout(timeout);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
  };

  const handleAdvanceStatus = (
    shipment: IShipmentData,
    targetStatus: "PICKED_UP" | "IN_HUB_TRANSIT" | "OUT_FOR_DELIVERY",
  ) => {
    setUpdatingShipmentId(shipment.id);
    updateStatus(
      {
        shipmentId: shipment.id,
        payload: {
          status: targetStatus,
          remarks: `Transitioned to ${targetStatus} via Courier Dispatch Queue`,
        },
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Milestone Updated",
            description: `Consignment status is now ${targetStatus.replace(/_/g, " ")}.`,
            type: "success",
          });
          setUpdatingShipmentId(null);
          refetch();
        },
        onError: (err: any) => {
          const message =
            err?.data?.message || err?.message || "Could not update status";
          toast.add({
            title: "Update Failed",
            description: message,
            type: "error",
          });
          setUpdatingShipmentId(null);
        },
      },
    );
  };

  // Queries GET /api/v1/shipments/get-all-shipments
  // On the backend, courier requests are automatically scoped to courierId = user.userId!
  const queryParams = useMemo(
    () => ({
      status: activeTab === "ALL" ? undefined : activeTab,
      searchTerm: debouncedSearch || undefined,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [activeTab, debouncedSearch],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllShipments(queryParams);

  const shipments: IShipmentData[] = response?.data || [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.add({
      title: `${label} Copied`,
      description: `Copied "${text}" to clipboard`,
      type: "success",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PICKUP_ASSIGNED":
        return {
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
          label: "Pickup Assigned",
        };
      case "PICKED_UP":
        return {
          bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
          label: "Picked Up",
        };
      case "IN_HUB_TRANSIT":
        return {
          bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
          label: "In Hub Transit",
        };
      case "OUT_FOR_DELIVERY":
        return {
          bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25",
          label: "Out For Delivery",
        };
      case "DELIVERED":
        return {
          bg: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
          label: "Delivered",
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-muted text-muted-foreground border-border/80",
          label: status.replace("_", " "),
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {COURIER_STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border",
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-xs border-emerald-600"
                    : "bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70",
                )}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search bar & Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Tracking #, Recipient Name, or Dropoff Address..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9 h-10 rounded-xl border-border/80 bg-card/60 text-xs shadow-2xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl text-xs gap-1.5 border-border/80 bg-card/60"
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-emerald-600")} />
              <span>Refresh Queue</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Deliveries Cards / Queue */}
      <Card className="rounded-3xl border-border/80 bg-card/70 shadow-2xs overflow-hidden backdrop-blur-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground p-8">
              <Spinner className="size-8 text-emerald-600" />
              <p className="text-xs font-medium">Loading your assigned delivery assignments...</p>
            </div>
          ) : shipments.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 shadow-2xs">
                <Truck className="size-7" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No Active Delivery Assignments
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {debouncedSearch || activeTab !== "ALL"
                  ? "No deliveries match your current filters. Try adjusting or clearing search terms."
                  : "You have no shipments currently assigned to your route. New batches will appear once the hub dispatcher allocates them."}
              </p>
              {(debouncedSearch || activeTab !== "ALL") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("ALL");
                    handleClearSearch();
                  }}
                  className="mt-4 rounded-xl text-xs"
                >
                  Reset Queue Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {shipments.map((shipment) => {
                const badge = getStatusBadge(shipment.status);
                const trackingCode =
                  shipment.trackingNumber ||
                  shipment.trackingId ||
                  `#${shipment.id.slice(0, 8).toUpperCase()}`;

                const deliveryNotes = shipment.notes || shipment.deliveryNotes;
                const weightDisplay =
                  shipment.weightKg || shipment.chargeableWeightKg || 1;

                return (
                  <div
                    key={shipment.id}
                    className="p-5 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                  >
                    {/* Left: Consignment Details, Route & Addresses */}
                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Top Bar: Tracking #, Status & Weight */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/80">
                          <span>{trackingCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(trackingCode, "Tracking #")}
                            title="Copy tracking number"
                            className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                            badge.bg,
                          )}
                        >
                          {badge.label}
                        </span>

                        {/* Weight Badge */}
                        <span className="inline-flex items-center gap-1 rounded-lg bg-card border border-border/80 px-2 py-0.5 text-xs font-semibold text-foreground">
                          <Scale className="size-3 text-muted-foreground" />
                          <span>{weightDisplay} KG</span>
                        </span>

                        {shipment.parcelTitle && (
                          <span className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">
                            {shipment.parcelTitle}
                          </span>
                        )}
                      </div>

                      {/* Route Grid: Pickup Address & Receiver Contact */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                        {/* Pickup Address */}
                        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-primary font-semibold">
                            <MapPin className="size-3.5" />
                            <span>Pickup Location (Sender)</span>
                          </div>
                          <p className="font-semibold text-foreground">
                            {shipment.senderName}
                            {shipment.senderPhone && (
                              <span className="font-normal text-muted-foreground ml-1.5">
                                ({shipment.senderPhone})
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {shipment.senderAddress ||
                              shipment.originHub?.name ||
                              "Origin Hub Dispatch Area"}
                          </p>
                        </div>

                        {/* Dropoff / Receiver Contact */}
                        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <Navigation className="size-3.5" />
                              <span>Dropoff Contact (Receiver)</span>
                            </div>
                            {shipment.receiverPhone && (
                              <a
                                href={`tel:${shipment.receiverPhone}`}
                                className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                <Phone className="size-3" />
                                <span>Call</span>
                              </a>
                            )}
                          </div>
                          <p className="font-semibold text-foreground">
                            {shipment.receiverName}
                            <span className="font-mono text-muted-foreground ml-1.5">
                              {shipment.receiverPhone}
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {shipment.receiverAddress ||
                              shipment.destinationHub?.name ||
                              "Receiver Address"}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Notes (Prominent Callout if present) */}
                      {deliveryNotes && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                          <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <div>
                            <span className="font-bold">Delivery Instructions: </span>
                            <span className="italic">{deliveryNotes}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                      {/* Workflow Action 1: PICKUP_ASSIGNED -> PICKED_UP */}
                      {shipment.status === "PICKUP_ASSIGNED" && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isUpdatingStatus && updatingShipmentId === shipment.id}
                          onClick={() => handleAdvanceStatus(shipment, "PICKED_UP")}
                          className="rounded-xl gap-1.5 font-semibold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                        >
                          {isUpdatingStatus && updatingShipmentId === shipment.id ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <PackageCheck className="size-3.5" />
                          )}
                          <span>Confirm Pickup</span>
                        </Button>
                      )}

                      {/* Workflow Action 2: PICKED_UP -> IN_HUB_TRANSIT */}
                      {shipment.status === "PICKED_UP" && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isUpdatingStatus && updatingShipmentId === shipment.id}
                          onClick={() => handleAdvanceStatus(shipment, "IN_HUB_TRANSIT")}
                          className="rounded-xl gap-1.5 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                        >
                          {isUpdatingStatus && updatingShipmentId === shipment.id ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <Building2 className="size-3.5" />
                          )}
                          <span>Transfer to Hub</span>
                        </Button>
                      )}

                      {/* Workflow Action 3: IN_HUB_TRANSIT -> OUT_FOR_DELIVERY */}
                      {shipment.status === "IN_HUB_TRANSIT" && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isUpdatingStatus && updatingShipmentId === shipment.id}
                          onClick={() => handleAdvanceStatus(shipment, "OUT_FOR_DELIVERY")}
                          className="rounded-xl gap-1.5 font-semibold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                        >
                          {isUpdatingStatus && updatingShipmentId === shipment.id ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <Truck className="size-3.5" />
                          )}
                          <span>Out for Delivery</span>
                        </Button>
                      )}

                      {/* Workflow Action 4: OUT_FOR_DELIVERY -> Verify OTP Modal */}
                      {shipment.status === "OUT_FOR_DELIVERY" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setSelectedShipmentForOtp(shipment);
                            setIsOtpModalOpen(true);
                          }}
                          className="rounded-xl gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                        >
                          <KeyRound className="size-3.5" />
                          <span>Verify Handover OTP</span>
                        </Button>
                      )}

                      {/* Workflow Action 5: DELIVERED Badge */}
                      {shipment.status === "DELIVERED" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25">
                          <CheckCircle2 className="size-3.5" />
                          <span>Delivered</span>
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/shipments/${shipment.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "rounded-xl gap-1.5 font-medium text-xs border-border/80 bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Eye className="size-3.5" />
                          <span>Details</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleCopy(shipment.receiverPhone, "Receiver Phone")}
                          className="rounded-xl border border-border/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <Phone className="size-3 text-muted-foreground" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipient Delivery OTP Verification Modal */}
      <VerifyDeliveryOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => {
          setIsOtpModalOpen(false);
          setSelectedShipmentForOtp(null);
        }}
        shipment={selectedShipmentForOtp}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
