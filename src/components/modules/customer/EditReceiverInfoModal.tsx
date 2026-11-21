"use client";

import { AlertCircle, CheckCircle2, Edit3, Loader2, MapPin, Phone, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { IShipmentData } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useUpdateShipment } from "@/hooks";

interface EditReceiverInfoModalProps {
  shipment: IShipmentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ELIGIBLE_STATUSES = ["ORDER_PLACED", "PAYMENT_PENDING", "PAID"];

export function EditReceiverInfoModal({
  shipment,
  isOpen,
  onClose,
  onSuccess,
}: EditReceiverInfoModalProps) {
  const { mutate: updateShipment, isPending } = useUpdateShipment();

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (shipment) {
      setReceiverName(shipment.receiverName || "");
      setReceiverPhone(shipment.receiverPhone || "");
      setReceiverAddress(shipment.receiverAddress || "");
      setDeliveryNotes(shipment.notes || "");
      setErrors({});
    }
  }, [shipment]);

  if (!shipment) return null;

  const isEligible = ELIGIBLE_STATUSES.includes(shipment.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEligible) {
      toast.add({
        title: "Cannot Edit Shipment",
        description: `Shipment status is "${shipment.status}". Delivery details can only be changed before courier dispatch.`,
        type: "error",
      });
      return;
    }

    const newErrors: { [key: string]: string } = {};
    if (!receiverName.trim()) {
      newErrors.receiverName = "Receiver name is required";
    }
    if (!receiverPhone.trim()) {
      newErrors.receiverPhone = "Receiver phone is required";
    } else if (receiverPhone.trim().length < 8) {
      newErrors.receiverPhone = "Enter a valid contact phone number";
    }
    if (!receiverAddress.trim()) {
      newErrors.receiverAddress = "Delivery address is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateShipment(
      {
        id: shipment.id,
        payload: {
          receiverName: receiverName.trim(),
          receiverPhone: receiverPhone.trim(),
          receiverAddress: receiverAddress.trim(),
          deliveryNotes: deliveryNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Receiver Info Updated",
            description: "The recipient information has been successfully updated.",
            type: "success",
          });
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          toast.add({
            title: "Update Failed",
            description:
              err?.message || "Could not update receiver info. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="sm:max-w-md max-w-full">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Edit3 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Edit Receiver Information
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consignment: {shipment.trackingNumber || `#${shipment.id.slice(0, 8)}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        {!isEligible ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Modification Locked</p>
              <p className="mt-0.5 text-muted-foreground">
                This shipment has progressed to <strong>{shipment.status}</strong>. Receiver details can only be edited while status is <em>ORDER_PLACED</em>, <em>PAYMENT_PENDING</em>, or <em>PAID</em>.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="receiverName" className="text-xs font-semibold flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <span>Recipient Full Name</span>
              </Label>
              <Input
                id="receiverName"
                value={receiverName}
                onChange={(e) => {
                  setReceiverName(e.target.value);
                  if (errors.receiverName) {
                    setErrors((prev) => ({ ...prev, receiverName: "" }));
                  }
                }}
                placeholder="e.g. Mehedi Hasan"
                className="text-xs rounded-xl"
                disabled={isPending}
              />
              {errors.receiverName && (
                <p className="text-[11px] text-destructive font-medium">{errors.receiverName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receiverPhone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground" />
                <span>Recipient Phone Number</span>
              </Label>
              <Input
                id="receiverPhone"
                value={receiverPhone}
                onChange={(e) => {
                  setReceiverPhone(e.target.value);
                  if (errors.receiverPhone) {
                    setErrors((prev) => ({ ...prev, receiverPhone: "" }));
                  }
                }}
                placeholder="e.g. +880 1712 345678"
                className="text-xs rounded-xl"
                disabled={isPending}
              />
              {errors.receiverPhone && (
                <p className="text-[11px] text-destructive font-medium">{errors.receiverPhone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receiverAddress" className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                <span>Delivery Street Address</span>
              </Label>
              <textarea
                id="receiverAddress"
                rows={3}
                value={receiverAddress}
                onChange={(e) => {
                  setReceiverAddress(e.target.value);
                  if (errors.receiverAddress) {
                    setErrors((prev) => ({ ...prev, receiverAddress: "" }));
                  }
                }}
                placeholder="House, Road, Area, Landmark..."
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
              />
              {errors.receiverAddress && (
                <p className="text-[11px] text-destructive font-medium">{errors.receiverAddress}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliveryNotes" className="text-xs font-semibold flex items-center gap-1.5">
                <Edit3 className="size-3.5 text-muted-foreground" />
                <span>Delivery Instructions / Notes (Optional)</span>
              </Label>
              <textarea
                id="deliveryNotes"
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Call before delivery, ring the blue bell..."
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
              />
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
                type="submit"
                variant="default"
                size="sm"
                disabled={isPending}
                className="rounded-xl text-xs gap-1.5 font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogPopup>
    </Dialog>
  );
}
