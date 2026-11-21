"use client";

import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetAllShipments, useGetHubs } from "@/hooks";
import { cn } from "@/lib/utils";
import { AssignCourierModal } from "./AssignCourierModal";

const STATUS_FILTERS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Paid (Ready to Dispatch)", value: "PAID", highlight: true },
  { label: "Pickup Assigned", value: "PICKUP_ASSIGNED" },
  { label: "Picked Up", value: "PICKED_UP" },
  { label: "In Hub Transit", value: "IN_HUB_TRANSIT" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Payment Pending", value: "PAYMENT_PENDING" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

export function AdminShipmentMasterTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedHub, setSelectedHub] = useState<string>("ALL");
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Modal state
  const [assignModalShipment, setAssignModalShipment] =
    useState<IShipmentData | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Queries
  const {
    data: shipmentsResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useGetAllShipments({
    searchTerm: searchTerm || undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    limit: 100,
  });

  const { data: hubsResponse } = useGetHubs();
  const hubs = hubsResponse?.data || [];

  const rawShipments: IShipmentData[] = shipmentsResponse?.data || [];

  // Client-side hub filtering & search refinement
  const filteredShipments = useMemo(() => {
    return rawShipments.filter((shipment) => {
      // Hub filter
      if (selectedHub !== "ALL") {
        const matchesOrigin = shipment.originHubId === selectedHub;
        const matchesDest = shipment.destinationHubId === selectedHub;
        if (!matchesOrigin && !matchesDest) return false;
      }
      return true;
    });
  }, [rawShipments, selectedHub]);

  // Metric aggregates
  const metrics = useMemo(() => {
    const total = rawShipments.length;
    const paidAwaiting = rawShipments.filter((s) => s.status === "PAID").length;
    const inTransit = rawShipments.filter((s) =>
      [
        "PICKUP_ASSIGNED",
        "PICKED_UP",
        "IN_HUB_TRANSIT",
        "OUT_FOR_DELIVERY",
      ].includes(s.status),
    ).length;
    const delivered = rawShipments.filter(
      (s) => s.status === "DELIVERED",
    ).length;
    const pendingPayment = rawShipments.filter(
      (s) => s.status === "PAYMENT_PENDING",
    ).length;

    return { total, paidAwaiting, inTransit, delivered, pendingPayment };
  }, [rawShipments]);

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTrackingId(tracking);
    toast.add({
      title: "Tracking Copied",
      description: `Copied ${tracking} to clipboard`,
      type: "success",
    });
    setTimeout(() => setCopiedTrackingId(null), 2000);
  };

  const handleOpenAssignModal = (shipment: IShipmentData) => {
    setAssignModalShipment(shipment);
    setIsAssignModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          icon: ShieldCheck,
          label: "Paid - Ready",
        };
      case "PICKUP_ASSIGNED":
        return {
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
          icon: Truck,
          label: "Pickup Assigned",
        };
      case "PICKED_UP":
        return {
          bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
          icon: PackageCheck,
          label: "Picked Up",
        };
      case "IN_HUB_TRANSIT":
        return {
          bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
          icon: Building2,
          label: "In Transit",
        };
      case "OUT_FOR_DELIVERY":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          icon: Truck,
          label: "Out For Delivery",
        };
      case "DELIVERED":
        return {
          bg: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2,
          label: "Delivered",
        };
      case "PAYMENT_PENDING":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
          icon: Clock,
          label: "Payment Pending",
        };
      case "CANCELLED":
        return {
          bg: "bg-destructive/10 text-destructive border-destructive/25",
          icon: X,
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-muted text-muted-foreground border-border/80",
          icon: Package,
          label: status,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Consignments
            </span>
            <Boxes className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            {metrics.total}
          </p>
          <span className="text-[10px] text-muted-foreground">
            System-wide bookings
          </span>
        </div>

        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Ready to Dispatch
            </span>
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.paidAwaiting}
          </p>
          <span className="text-[10px] font-medium text-emerald-700/80 dark:text-emerald-400/80">
            PAID shipments awaiting courier
          </span>
        </div>

        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              In Delivery Transit
            </span>
            <Truck className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {metrics.inTransit}
          </p>
          <span className="text-[10px] text-muted-foreground">
            Assigned & on the road
          </span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Successfully Delivered
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            {metrics.delivered}
          </p>
          <span className="text-[10px] text-muted-foreground">
            Doorstep OTP cleared
          </span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <Card className="rounded-2xl border-border/80 bg-card/80 p-4 shadow-2xs backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Tracking ID, Sender, Receiver, Phone..."
              className="pl-9 pr-8 h-10 rounded-xl bg-background border-border/80 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Hub Selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs">
              <Building2 className="size-3.5 text-muted-foreground" />
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Regional Hubs</option>
                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name} ({hub.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="h-9 gap-1.5 rounded-xl text-xs font-medium"
            >
              <RefreshCw
                className={cn("size-3.5", isRefetching && "animate-spin")}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-3.5 pt-3 border-t border-border/50 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => {
            const isSelected = selectedStatus === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setSelectedStatus(f.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? f.value === "PAID"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : f.value === "PAID"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{f.label}</span>
                {f.value === "PAID" && metrics.paidAwaiting > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                      isSelected
                        ? "bg-white text-emerald-700"
                        : "bg-emerald-600 text-white",
                    )}
                  >
                    {metrics.paidAwaiting}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Master Shipments Table */}
      <Card className="rounded-2xl border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4 font-semibold">
                  Consignment & Title
                </th>
                <th className="py-3.5 px-4 font-semibold">Route (Hubs)</th>
                <th className="py-3.5 px-4 font-semibold">Sender & Receiver</th>
                <th className="py-3.5 px-4 font-semibold">Specs & Fare</th>
                <th className="py-3.5 px-4 font-semibold">Lifecycle Status</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Courier</th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Dispatch Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Spinner className="size-6 text-primary" />
                      <span className="text-xs">
                        Fetching master shipment consignments...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Package className="size-8 text-muted-foreground/60" />
                      <p className="text-xs font-semibold text-foreground">
                        No Shipments Found
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Try modifying your search query or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const trackingCode =
                    shipment.trackingNumber ||
                    shipment.trackingId ||
                    `#TRK-${shipment.id.slice(0, 8).toUpperCase()}`;

                  const isPaid = shipment.status === "PAID";
                  const statusInfo = getStatusBadge(shipment.status);
                  const StatusIcon = statusInfo.icon;

                  const isCopied = copiedTrackingId === trackingCode;

                  return (
                    <tr
                      key={shipment.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors group",
                        isPaid && "bg-emerald-500/5",
                      )}
                    >
                      {/* 1. Consignment ID & Title */}
                      <td className="py-4 px-4 align-top min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-foreground">
                              {trackingCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTracking(trackingCode)}
                              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              title="Copy Tracking Number"
                            >
                              {isCopied ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>

                          <p className="font-medium text-foreground truncate max-w-[200px]">
                            {shipment.parcelTitle || "Standard Parcel"}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {shipment.createdAt && (
                              <span>
                                {new Date(
                                  shipment.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            )}
                            {shipment.isFragile && (
                              <span className="rounded bg-amber-500/10 px-1 py-0.2 font-semibold text-amber-600 dark:text-amber-400">
                                Fragile
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Hub Route */}
                      <td className="py-4 px-4 align-top min-w-[170px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-semibold text-foreground">
                            <span className="truncate max-w-[100px]">
                              {shipment.originHub?.name || "Origin Hub"}
                            </span>
                            <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[100px]">
                              {shipment.destinationHub?.name || "Dest Hub"}
                            </span>
                          </div>

                          <div className="text-[10px] text-muted-foreground">
                            {shipment.originHub?.zone && (
                              <span>Zone: {shipment.originHub.zone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Sender & Receiver */}
                      <td className="py-4 px-4 align-top min-w-[200px]">
                        <div className="space-y-1">
                          <p className="text-[11px] text-muted-foreground">
                            <strong className="text-foreground">From:</strong>{" "}
                            {shipment.senderName} ({shipment.senderPhone})
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            <strong className="text-foreground">To:</strong>{" "}
                            {shipment.receiverName} ({shipment.receiverPhone})
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 truncate max-w-[220px]">
                            {shipment.receiverAddress}
                          </p>
                        </div>
                      </td>

                      {/* 4. Specs & Fare */}
                      <td className="py-4 px-4 align-top min-w-[110px]">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-primary text-sm">
                            ৳{Number(shipment.totalCost || 0).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {shipment.weightKg} kg
                            {shipment.chargeableWeightKg &&
                              ` (${shipment.chargeableWeightKg.toFixed(1)} c.kg)`}
                          </p>
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-4 px-4 align-top min-w-[140px]">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                            statusInfo.bg,
                          )}
                        >
                          <StatusIcon className="size-3.5 shrink-0" />
                          <span>{statusInfo.label}</span>
                        </span>

                        {shipment.deliveryOtp && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="font-mono bg-muted/60 px-1 rounded">
                              OTP: {shipment.deliveryOtp}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 6. Assigned Courier */}
                      <td className="py-4 px-4 align-top min-w-[160px]">
                        {shipment.courier ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-foreground font-bold">
                              <User className="size-3.5 text-purple-600 dark:text-purple-400" />
                              <span>{shipment.courier.name}</span>
                            </div>
                            {shipment.courier.phone && (
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {shipment.courier.phone}
                              </p>
                            )}
                          </div>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            <AlertCircle className="size-3" />
                            Awaiting Courier
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-4 px-4 align-top text-right min-w-[160px]">
                        <div className="flex items-center justify-end gap-2">
                          {/* Highlighted "Assign Courier" button for any shipment in PAID status */}
                          {isPaid ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenAssignModal(shipment)}
                              className="h-8 rounded-xl font-bold gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/25"
                            >
                              <Truck className="size-3.5" />
                              <span>Assign Courier</span>
                            </Button>
                          ) : (
                            <Link href={`/dashboard/shipments/${shipment.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="size-3.5" />
                                <span>Inspect</span>
                              </Button>
                            </Link>
                          )}

                          <Link
                            href={`/shipments/${shipment.id}`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            title="Open Public Tracking View"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
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
            Showing <strong>{filteredShipments.length}</strong> consignments
            across all regional hubs
          </span>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              <strong>{metrics.paidAwaiting}</strong> Pending Courier
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-purple-500" />
              <strong>{metrics.inTransit}</strong> Active Deliveries
            </span>
          </div>
        </div>
      </Card>

      {/* Assign Courier Dialog Modal */}
      <AssignCourierModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        shipment={assignModalShipment}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
