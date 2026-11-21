"use client";

import { AlertTriangle, Ban, Loader2, Trash2 } from "lucide-react";
import React from "react";
import type { IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useCancelShipment, useDeleteShipment } from "@/hooks";

interface CancelShipmentDialogProps {
  shipment: IShipmentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ELIGIBLE_STATUSES = ["ORDER_PLACED", "PAYMENT_PENDING", "PAID"];

export function CancelShipmentDialog({
  shipment,
  isOpen,
  onClose,
  onSuccess,
}: CancelShipmentDialogProps) {
  const { mutate: cancelShipment, isPending } = useCancelShipment();

  if (!shipment) return null;

  const isEligible = ELIGIBLE_STATUSES.includes(shipment.status);

  const handleConfirmCancel = () => {
    if (!isEligible) {
      toast.add({
        title: "Cancellation Ineligible",
        description: `Shipment is already '${shipment.status}'. Only parcels prior to courier pickup can be cancelled.`,
        type: "error",
      });
      return;
    }

    cancelShipment(shipment.id, {
      onSuccess: () => {
        toast.add({
          title: "Shipment Cancelled",
          description: `Consignment #${shipment.trackingNumber || shipment.id.slice(0, 8)} was successfully cancelled.`,
          type: "success",
        });
        onSuccess?.();
        onClose();
      },
      onError: (err: any) => {
        toast.add({
          title: "Cancellation Failed",
          description: err?.message || "Failed to cancel shipment. Please contact support.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="sm:max-w-md max-w-full">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Ban className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Cancel Consignment Booking
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consignment: {shipment.trackingNumber || `#${shipment.id.slice(0, 8)}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Are you sure you want to cancel this parcel?</p>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Once cancelled, the delivery workflow stops and the status is permanently marked as{" "}
                  <strong>CANCELLED</strong>. If already paid, customer refund processing will be initiated according to policy.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span className="font-semibold text-foreground">{shipment.receiverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Status:</span>
              <span className="font-bold text-foreground uppercase">{shipment.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fare / Cost:</span>
              <span className="font-semibold text-foreground">৳{shipment.totalCost?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl text-xs"
          >
            Keep Shipment
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmCancel}
            disabled={isPending || !isEligible}
            className="rounded-xl text-xs gap-1.5 font-semibold bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <Ban className="size-3.5" />
                <span>Confirm Cancellation</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

interface DeleteShipmentDialogProps {
  shipment: IShipmentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteShipmentDialog({
  shipment,
  isOpen,
  onClose,
  onSuccess,
}: DeleteShipmentDialogProps) {
  const { mutate: deleteShipment, isPending } = useDeleteShipment();

  if (!shipment) return null;

  const isEligible = ELIGIBLE_STATUSES.includes(shipment.status);

  const handleConfirmDelete = () => {
    if (!isEligible) {
      toast.add({
        title: "Cannot Delete Shipment",
        description: `Shipment is currently '${shipment.status}'. Only consignments prior to courier pickup can be removed.`,
        type: "error",
      });
      return;
    }

    deleteShipment(shipment.id, {
      onSuccess: () => {
        toast.add({
          title: "Shipment Removed",
          description: `Consignment #${shipment.trackingNumber || shipment.id.slice(0, 8)} has been archived.`,
          type: "success",
        });
        onSuccess?.();
        onClose();
      },
      onError: (err: any) => {
        toast.add({
          title: "Delete Failed",
          description: err?.message || "Failed to remove shipment. Please try again.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="sm:max-w-md max-w-full">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Remove Consignment Record
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consignment: {shipment.trackingNumber || `#${shipment.id.slice(0, 8)}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-destructive-foreground">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Soft-delete this shipment record?</p>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  This action archives and hides the shipment from your active list. Eligible only before courier dispatch.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span className="font-semibold text-foreground">{shipment.receiverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-bold text-foreground uppercase">{shipment.status}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmDelete}
            disabled={isPending || !isEligible}
            className="rounded-xl text-xs gap-1.5 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Confirm Soft Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
