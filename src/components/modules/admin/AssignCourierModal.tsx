"use client";

import {
  Bike,
  Building2,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { IShipmentData, IUser } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAssignCourier, useGetCouriers } from "@/hooks";
import { cn } from "@/lib/utils";

interface AssignCourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: IShipmentData | null;
  onSuccess?: () => void;
}

export function AssignCourierModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
}: AssignCourierModalProps) {
  const [courierSearch, setCourierSearch] = useState("");
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");

  const { data: couriersResponse, isLoading: isCouriersLoading } =
    useGetCouriers();
  const { mutate: assign, isPending: isAssigning } = useAssignCourier();

  const couriers: IUser[] = couriersResponse?.data || [];

  // Filter couriers by name, email, phone, or vehicle type
  const filteredCouriers = useMemo(() => {
    if (!courierSearch.trim()) return couriers;
    const q = courierSearch.toLowerCase();
    return couriers.filter((c) => {
      const name = c.name?.toLowerCase() || "";
      const email = c.email?.toLowerCase() || "";
      const phone = c.phone?.toLowerCase() || "";
      const vehicle = c.courierProfile?.vehicleType?.toLowerCase() || "";
      const hub = c.courierProfile?.hub?.name?.toLowerCase() || "";
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        vehicle.includes(q) ||
        hub.includes(q)
      );
    });
  }, [couriers, courierSearch]);

  if (!shipment) return null;

  const trackingCode =
    shipment.trackingNumber ||
    shipment.trackingId ||
    `#TRK-${shipment.id.slice(0, 8).toUpperCase()}`;

  const handleConfirmAssignment = () => {
    if (!selectedCourierId) {
      toast.add({
        title: "No Courier Selected",
        description: "Please select an active courier partner from the list.",
        type: "error",
      });
      return;
    }

    const selectedCourier = couriers.find((c) => c.id === selectedCourierId);

    assign(
      {
        shipmentId: shipment.id,
        courierId: selectedCourierId,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Courier Assigned Successfully",
            description: `Assigned to ${selectedCourier?.name || "courier"}. Consignment transitioned to PICKUP_ASSIGNED.`,
            type: "success",
          });
          onSuccess?.();
          onClose();
        },
        onError: (err: { message?: string }) => {
          toast.add({
            title: "Assignment Failed",
            description:
              err?.message ||
              "Failed to assign courier. Ensure courier profile is active and on duty.",
            type: "error",
          });
        },
      },
    );
  };

  const getVehicleIcon = (vehicleType?: string) => {
    switch (vehicleType) {
      case "BICYCLE":
        return <Bike className="size-4" />;
      case "MOTORBIKE":
        return <Car className="size-4" />;
      case "VAN":
      case "TRUCK":
        return <Truck className="size-4" />;
      default:
        return <Truck className="size-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="max-w-2xl sm:rounded-2xl p-6 sm:p-7 max-h-[90vh] flex flex-col">
        <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-border/60">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Truck className="size-4" />
            Courier Dispatch Protocol
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Assign Courier to Shipment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a verified and active courier partner to initiate doorstep
            pickup dispatch. Shipment will transition from{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              PAID
            </span>{" "}
            to{" "}
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              PICKUP_ASSIGNED
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {/* Consignment Quick Summary */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs space-y-2 mt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-foreground">
                {trackingCode}
              </span>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {shipment.status}
              </span>
            </div>
            <span className="font-bold text-primary">
              ৳{Number(shipment.totalCost || 0).toFixed(2)} BDT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <Compass className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Route:</strong>{" "}
                {shipment.originHub?.name || "Origin Hub"} &rarr;{" "}
                {shipment.destinationHub?.name || "Destination Hub"}
              </span>
            </div>
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span className="truncate">
                <strong className="text-foreground">Pickup:</strong>{" "}
                {shipment.senderAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Courier Search & Selection List */}
        <div className="flex-1 min-h-0 flex flex-col space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-primary" />
              Select Active Courier Partner ({filteredCouriers.length})
            </label>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={courierSearch}
              onChange={(e) => setCourierSearch(e.target.value)}
              placeholder="Search by courier name, phone, zone, or vehicle..."
              className="pl-9 h-9 text-xs rounded-xl bg-background"
            />
          </div>

          {/* Courier Card Options Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[280px]">
            {isCouriersLoading ? (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
                <Spinner className="size-5 text-primary" />
                <span className="text-xs">Loading available couriers...</span>
              </div>
            ) : filteredCouriers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No courier partners found matching your search.
              </div>
            ) : (
              filteredCouriers.map((courier) => {
                const profile = courier.courierProfile;
                const isSelected = selectedCourierId === courier.id;
                const isAvailable = profile?.isAvailable ?? true;
                const isActive = courier.status === "ACTIVE" || !courier.status;

                return (
                  <div
                    key={courier.id}
                    onClick={() => setSelectedCourierId(courier.id)}
                    className={cn(
                      "group relative flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border/70 hover:border-primary/40 hover:bg-muted/30 bg-card",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar / Selection indicator */}
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl font-bold transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                        )}
                      >
                        {isSelected ? (
                          <Check className="size-4 stroke-[3]" />
                        ) : (
                          <User className="size-4" />
                        )}
                      </div>

                      {/* Info details */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground truncate">
                            {courier.name}
                          </span>

                          {/* Duty / Status badge */}
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              On Duty
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.2 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              Off Duty
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                          {courier.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" />
                              {courier.phone}
                            </span>
                          )}
                          <span className="truncate">{courier.email}</span>
                        </div>

                        {/* Vehicle & Hub info */}
                        {profile && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-medium text-muted-foreground">
                            <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">
                              {getVehicleIcon(profile.vehicleType)}
                              <span>{profile.vehicleType}</span>
                              {profile.vehicleNumber && (
                                <span className="font-mono text-foreground font-semibold">
                                  ({profile.vehicleNumber})
                                </span>
                              )}
                            </span>

                            {profile.hub?.name && (
                              <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">
                                <Building2 className="size-3" />
                                <span>{profile.hub.name}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      <span
                        className={cn(
                          "size-5 rounded-full border flex items-center justify-center transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-transparent group-hover:border-primary/50",
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dialog Actions */}
        <DialogFooter className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isAssigning}
            className="rounded-xl text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!selectedCourierId || isAssigning}
            onClick={handleConfirmAssignment}
            className="rounded-xl text-xs font-bold gap-2 h-9 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
          >
            {isAssigning ? (
              <>
                <Spinner className="size-3.5" />
                <span>Assigning Dispatch...</span>
              </>
            ) : (
              <>
                <Truck className="size-3.5" />
                <span>Confirm Courier Assignment</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
