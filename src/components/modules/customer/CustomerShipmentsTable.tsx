"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Loader2,
  MapPin,
  Package,
  PackagePlus,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { extractPaymentCheckoutUrl, type IShipmentData } from "@/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useCreateStripePayment, useGetAllShipments } from "@/hooks";
import { cn } from "@/lib/utils";
import { EditReceiverInfoModal } from "./EditReceiverInfoModal";
import { CancelShipmentDialog, DeleteShipmentDialog } from "./ShipmentActionDialogs";

const STATUS_TABS = [
  { label: "All", value: "ALL" },
  { label: "Payment Pending", value: "PAYMENT_PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Pickup Assigned", value: "PICKUP_ASSIGNED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

type SortField = "createdAt" | "trackingNumber" | "receiverName" | "totalCost" | "status";
type SortOrder = "asc" | "desc";

export function CustomerShipmentsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Selected shipment for modals
  const [editingShipment, setEditingShipment] = useState<IShipmentData | null>(null);
  const [cancellingShipment, setCancellingShipment] = useState<IShipmentData | null>(null);
  const [deletingShipment, setDeletingShipment] = useState<IShipmentData | null>(null);
  const [payingShipmentId, setPayingShipmentId] = useState<string | null>(null);

  const { mutate: initiatePayment, isPending: isPaying } = useCreateStripePayment();

  // Search debounce handler
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    const timeout = setTimeout(() => {
      setDebouncedSearch(val.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Query params for backend GET /api/v1/shipments/get-all-shipments
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      status: activeTab === "ALL" ? undefined : activeTab,
      searchTerm: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    }),
    [currentPage, limit, activeTab, debouncedSearch, sortBy, sortOrder],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllShipments(queryParams);

  const shipments: IShipmentData[] = response?.data || [];
  const meta = response?.meta || {
    page: currentPage,
    limit,
    total: shipments.length,
    totalPages: Math.ceil(shipments.length / limit) || 1,
  };

  const totalCount = meta.total;
  const totalPages = Math.max(1, meta.totalPages);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.add({
      title: `${label} Copied`,
      description: `Copied "${text}" to clipboard`,
      type: "success",
    });
  };

  const handlePayNow = (shipment: IShipmentData) => {
    setPayingShipmentId(shipment.id);
    initiatePayment(shipment.id, {
      onSuccess: (res: any) => {
        const checkoutUrl = extractPaymentCheckoutUrl(res);
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast.add({
            title: "Redirecting...",
            description: "Preparing payment session...",
            type: "info",
          });
          window.location.href = `/dashboard/shipments/${shipment.id}`;
        }
      },
      onError: (err: any) => {
        setPayingShipmentId(null);
        toast.add({
          title: "Payment Error",
          description: err?.message || "Failed to initiate payment. Please try again.",
          type: "error",
        });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDER_PLACED":
        return {
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
          label: "Order Placed",
        };
      case "PAYMENT_PENDING":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
          label: "Payment Pending",
        };
      case "PAID":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
          label: "Paid",
        };
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

  const renderSortIndicator = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="size-3 text-muted-foreground/60" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="size-3 text-primary font-bold" />
    ) : (
      <ArrowDown className="size-3 text-primary font-bold" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Search Bar & Status Tabs Row */}
      <div className="flex flex-col gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs border-primary"
                    : "bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70",
                )}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Tracking #, Recipient Name, or Phone..."
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
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-primary")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Link
              href="/book-parcel"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-xl text-xs gap-1.5 font-semibold shadow-xs",
              )}
            >
              <PackagePlus className="size-3.5" />
              <span>Book Parcel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl border-border/80 bg-card/70 shadow-2xs overflow-hidden backdrop-blur-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground p-8">
              <Spinner className="size-8 text-primary" />
              <p className="text-xs font-medium">Loading your consignment records...</p>
            </div>
          ) : shipments.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 mb-3 text-muted-foreground/60 shadow-2xs">
                <Package className="size-7" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No Shipments Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {debouncedSearch || activeTab !== "ALL"
                  ? "No consignments match your current search and filter criteria. Try resetting filters."
                  : "You have not created any parcel delivery shipments yet."}
              </p>
              {debouncedSearch || activeTab !== "ALL" ? (
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
                  Reset Filters
                </Button>
              ) : (
                <Link
                  href="/book-parcel"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "mt-4 rounded-xl gap-2 font-semibold text-xs shadow-xs",
                  )}
                >
                  <PackagePlus className="size-3.5" />
                  <span>Book Your First Parcel</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground">
                    {/* Consignment / Tracking # */}
                    <th className="py-3.5 px-4 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("trackingNumber")}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                      >
                        <span>Tracking #</span>
                        {renderSortIndicator("trackingNumber")}
                      </button>
                    </th>

                    {/* Recipient */}
                    <th className="py-3.5 px-4 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("receiverName")}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                      >
                        <span>Recipient</span>
                        {renderSortIndicator("receiverName")}
                      </button>
                    </th>

                    {/* Destination Hub / Route */}
                    <th className="py-3.5 px-4 font-semibold hidden md:table-cell">
                      <span>Destination</span>
                    </th>

                    {/* Fare / Cost */}
                    <th className="py-3.5 px-4 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("totalCost")}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                      >
                        <span>Fare</span>
                        {renderSortIndicator("totalCost")}
                      </button>
                    </th>

                    {/* Status */}
                    <th className="py-3.5 px-4 font-semibold">
                      <button
                        type="button"
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                      >
                        <span>Status</span>
                        {renderSortIndicator("status")}
                      </button>
                    </th>

                    {/* Date */}
                    <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">
                      <button
                        type="button"
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                      >
                        <span>Date</span>
                        {renderSortIndicator("createdAt")}
                      </button>
                    </th>

                    {/* Actions */}
                    <th className="py-3.5 px-4 text-right font-semibold">
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                  {shipments.map((shipment) => {
                    const badge = getStatusBadge(shipment.status);
                    const isEligibleToEditOrCancel = [
                      "ORDER_PLACED",
                      "PAYMENT_PENDING",
                      "PAID",
                    ].includes(shipment.status);

                    const trackingCode =
                      shipment.trackingNumber ||
                      shipment.trackingId ||
                      `#${shipment.id.slice(0, 8).toUpperCase()}`;

                    const dateFormatted = shipment.createdAt
                      ? new Date(shipment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <tr
                        key={shipment.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Tracking # & Parcel Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
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
                            <span className="text-[11px] text-muted-foreground truncate max-w-[170px] mt-0.5">
                              {shipment.parcelTitle || `Consignment #${shipment.id.slice(0, 8)}`}
                            </span>
                          </div>
                        </td>

                        {/* Recipient Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col max-w-[180px]">
                            <span className="font-semibold text-foreground truncate">
                              {shipment.receiverName}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                              <Phone className="size-2.5 text-muted-foreground/70" />
                              <span>{shipment.receiverPhone}</span>
                            </span>
                          </div>
                        </td>

                        {/* Destination */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[190px]">
                            <MapPin className="size-3 text-primary shrink-0" />
                            <span className="truncate" title={shipment.receiverAddress}>
                              {shipment.receiverAddress ||
                                shipment.destinationHub?.name ||
                                "Address on file"}
                            </span>
                          </div>
                        </td>

                        {/* Fare */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-foreground">
                            ৳{shipment.totalCost?.toFixed(2) || "0.00"}
                          </span>
                        </td>

                        {/* Status Pill */}
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              badge.bg,
                            )}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-muted-foreground hidden lg:table-cell">
                          {dateFormatted}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Pay Now Button (if payment pending) */}
                            {shipment.status === "PAYMENT_PENDING" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                onClick={() => handlePayNow(shipment)}
                                disabled={isPaying && payingShipmentId === shipment.id}
                                className="h-7 px-2.5 rounded-lg text-[11px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                title="Pay consignment via Stripe"
                              >
                                {isPaying && payingShipmentId === shipment.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <CreditCard className="size-3" />
                                )}
                                <span>Pay</span>
                              </Button>
                            )}

                            {/* View Consignment Details */}
                            <Link
                              href={`/dashboard/shipments/${shipment.id}`}
                              className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "h-7 px-2 rounded-lg text-[11px] border-border/80 text-foreground hover:bg-muted",
                              )}
                              title="View consignment details and OTP"
                            >
                              <Eye className="size-3.5" />
                              <span className="sr-only">View</span>
                            </Link>

                            {/* Edit Receiver Info Modal Trigger */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!isEligibleToEditOrCancel}
                              onClick={() => setEditingShipment(shipment)}
                              className={cn(
                                "h-7 px-2 rounded-lg text-[11px] border-border/80",
                                !isEligibleToEditOrCancel && "opacity-40 cursor-not-allowed",
                              )}
                              title={
                                isEligibleToEditOrCancel
                                  ? "Edit recipient and delivery details"
                                  : "Editing locked: Parcel dispatched or completed"
                              }
                            >
                              <Edit3 className="size-3.5 text-primary" />
                              <span className="sr-only">Edit Receiver</span>
                            </Button>

                            {/* Cancel Shipment Trigger */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!isEligibleToEditOrCancel}
                              onClick={() => setCancellingShipment(shipment)}
                              className={cn(
                                "h-7 px-2 rounded-lg text-[11px] border-border/80 hover:bg-amber-500/10 hover:border-amber-500/30",
                                !isEligibleToEditOrCancel && "opacity-40 cursor-not-allowed",
                              )}
                              title={
                                isEligibleToEditOrCancel
                                  ? "Cancel this consignment"
                                  : "Cancellation locked: Parcel in transit"
                              }
                            >
                              <Ban className="size-3.5 text-amber-600 dark:text-amber-400" />
                              <span className="sr-only">Cancel</span>
                            </Button>

                            {/* Delete Shipment Trigger */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!isEligibleToEditOrCancel}
                              onClick={() => setDeletingShipment(shipment)}
                              className={cn(
                                "h-7 px-2 rounded-lg text-[11px] border-border/80 hover:bg-destructive/10 hover:border-destructive/30",
                                !isEligibleToEditOrCancel && "opacity-40 cursor-not-allowed",
                              )}
                              title={
                                isEligibleToEditOrCancel
                                  ? "Remove / soft-delete shipment"
                                  : "Delete locked: Parcel in transit"
                              }
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && shipments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/70 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>
                  Showing{" "}
                  <strong>
                    {Math.min(totalCount, (currentPage - 1) * limit + 1)} -{" "}
                    {Math.min(totalCount, currentPage * limit)}
                  </strong>{" "}
                  of <strong>{totalCount}</strong> shipments
                </span>

                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-border/80 bg-card px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isFetching}
                  className="h-8 px-2.5 rounded-lg text-xs"
                >
                  <ChevronLeft className="size-3.5" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const isGap = prev && page - prev > 1;

                      return (
                        <React.Fragment key={page}>
                          {isGap && <span className="px-1 text-muted-foreground">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            disabled={isFetching}
                            className={cn(
                              "size-7 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center",
                              currentPage === page
                                ? "bg-primary text-primary-foreground shadow-2xs"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isFetching}
                  className="h-8 px-2.5 rounded-lg text-xs"
                >
                  <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Receiver Info Modal */}
      <EditReceiverInfoModal
        shipment={editingShipment}
        isOpen={Boolean(editingShipment)}
        onClose={() => setEditingShipment(null)}
        onSuccess={() => refetch()}
      />

      {/* Cancel Shipment Confirmation Dialog */}
      <CancelShipmentDialog
        shipment={cancellingShipment}
        isOpen={Boolean(cancellingShipment)}
        onClose={() => setCancellingShipment(null)}
        onSuccess={() => refetch()}
      />

      {/* Delete Shipment Confirmation Dialog */}
      <DeleteShipmentDialog
        shipment={deletingShipment}
        isOpen={Boolean(deletingShipment)}
        onClose={() => setDeletingShipment(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
