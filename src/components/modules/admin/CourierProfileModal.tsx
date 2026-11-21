"use client";

import { Gauge, IdCard, Loader2, Save, Truck, Warehouse } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { IUser } from "@/api/auth.api";
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
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useSubmitCourierProfile } from "@/hooks/courier.hooks";
import { useGetHubs } from "@/hooks/hub.hooks";
import { COMMON_BANGLADESH_ZONES } from "./CreateHubDialog";

interface CourierProfileModalProps {
  courierUser: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CourierProfileModal({
  courierUser,
  isOpen,
  onClose,
  onSuccess,
}: CourierProfileModalProps) {
  const { data: hubsResponse } = useGetHubs();
  const hubs = hubsResponse?.data || [];

  const { mutate: setupProfileMutate, isPending } = useSubmitCourierProfile();

  type TVehicleType = "BICYCLE" | "MOTORBIKE" | "VAN" | "TRUCK";

  const [formData, setFormData] = useState<{
    hubId: string;
    vehicleType: TVehicleType;
    vehicleNumber: string;
    drivingLicense: string;
    currentZone: string;
    maxCapacityKg: string;
    isAvailable: boolean;
  }>({
    hubId: "",
    vehicleType: "MOTORBIKE",
    vehicleNumber: "",
    drivingLicense: "",
    currentZone: "",
    maxCapacityKg: "30",
    isAvailable: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate existing courierProfile data if already set
  useEffect(() => {
    if (courierUser?.courierProfile) {
      const p = courierUser.courierProfile;
      setFormData({
        hubId: p.hubId || p.hub?.id || "",
        vehicleType: p.vehicleType || "MOTORBIKE",
        vehicleNumber: p.vehicleNumber || "",
        drivingLicense: p.drivingLicense || "",
        currentZone: p.currentZone || "",
        maxCapacityKg: String(p.maxCapacityKg || 30),
        isAvailable: p.isAvailable ?? true,
      });
      setErrors({});
    } else if (courierUser) {
      setFormData({
        hubId: hubs[0]?.id || "",
        vehicleType: "MOTORBIKE",
        vehicleNumber: "",
        drivingLicense: "",
        currentZone: "",
        maxCapacityKg: "30",
        isAvailable: true,
      });
      setErrors({});
    }
  }, [courierUser, hubs]);

  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierUser) return;

    // Validate fields
    const newErrors: Record<string, string> = {};
    if (!formData.hubId) newErrors.hubId = "Assigned Hub is required.";
    if (!formData.vehicleNumber.trim())
      newErrors.vehicleNumber = "Vehicle registration number is required.";
    if (!formData.currentZone.trim())
      newErrors.currentZone = "Operating zone is required.";
    const cap = Number(formData.maxCapacityKg);
    if (!cap || cap <= 0)
      newErrors.maxCapacityKg = "Max capacity must be at least 1 kg.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      userId: courierUser.id,
      hubId: formData.hubId,
      vehicleType: formData.vehicleType,
      vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
      drivingLicense: formData.drivingLicense.trim() || undefined,
      currentZone: formData.currentZone.trim(),
      maxCapacityKg: cap,
      isAvailable: formData.isAvailable,
    };

    setupProfileMutate(payload, {
      onSuccess: () => {
        toast.add({
          title: "Courier Fleet Profile Updated",
          description: `Profile for ${courierUser.name} has been enrolled and updated.`,
          type: "success",
        });
        onClose();
        if (onSuccess) onSuccess();
      },
      onError: (err: unknown) => {
        const error = err as Error;
        toast.add({
          title: "Failed to Update Profile",
          description: error?.message || "Could not save courier profile.",
          type: "error",
        });
      },
    });
  };

  const hasExistingProfile = Boolean(courierUser?.courierProfile);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="sm:max-w-lg max-w-full p-6 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Truck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {hasExistingProfile
                  ? "Edit Courier Profile"
                  : "Setup Courier Profile"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assign dispatch hub, vehicle tier, registration plate, and
                delivery subzones.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {courierUser && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs mt-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                {(courierUser.name?.[0] || "C").toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-foreground">{courierUser.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {courierUser.email}
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] bg-card px-2 py-1 rounded border border-border/60">
              ID: {courierUser.id.slice(0, 8)}...
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Assigned Transit Hub Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="courier-hub" className="text-xs font-semibold">
              Assigned Distribution Hub{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <select
                id="courier-hub"
                value={formData.hubId}
                onChange={(e) => handleInputChange("hubId", e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/80 bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Select an operating transit hub...</option>
                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name} ({hub.code}) — {hub.zone}
                  </option>
                ))}
              </select>
            </div>
            {errors.hubId && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.hubId}
              </p>
            )}
          </div>

          {/* Vehicle Type & Plate Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="vehicle-type" className="text-xs font-semibold">
                Vehicle Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="vehicle-type"
                value={formData.vehicleType}
                onChange={(e) =>
                  handleInputChange(
                    "vehicleType",
                    e.target.value as TVehicleType,
                  )
                }
                className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="MOTORBIKE">Motorbike (Up to 30 kg)</option>
                <option value="VAN">Delivery Van (Up to 250 kg)</option>
                <option value="TRUCK">Freight Truck (Up to 1000 kg)</option>
                <option value="BICYCLE">Bicycle / Cycle (Up to 15 kg)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vehicle-number" className="text-xs font-semibold">
                Vehicle Plate Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vehicle-number"
                placeholder="e.g. DHAKA-METRO-HA-4412"
                value={formData.vehicleNumber}
                onChange={(e) =>
                  handleInputChange("vehicleNumber", e.target.value)
                }
                className="h-9 text-xs rounded-xl font-mono uppercase"
                required
              />
              {errors.vehicleNumber && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.vehicleNumber}
                </p>
              )}
            </div>
          </div>

          {/* Current Operating Zone */}
          <div className="space-y-1.5">
            <Label htmlFor="courier-zone" className="text-xs font-semibold">
              Current Operating Zone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="courier-zone"
              placeholder="e.g. Gulshan Zone, Dhanmondi, Chittagong..."
              value={formData.currentZone}
              onChange={(e) => handleInputChange("currentZone", e.target.value)}
              className="h-9 text-xs rounded-xl"
              required
            />
            {errors.currentZone && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.currentZone}
              </p>
            )}

            {/* Quick zone pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_BANGLADESH_ZONES.slice(0, 7).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => handleInputChange("currentZone", `${z} Zone`)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors ${
                    formData.currentZone.includes(z)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted border-border/60"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Max Capacity & Driving License */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="max-capacity" className="text-xs font-semibold">
                Max Load Capacity (Kg){" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  id="max-capacity"
                  type="number"
                  min="1"
                  max="2000"
                  placeholder="30"
                  value={formData.maxCapacityKg}
                  onChange={(e) =>
                    handleInputChange("maxCapacityKg", e.target.value)
                  }
                  className="pl-9 h-9 text-xs rounded-xl font-mono"
                  required
                />
              </div>
              {errors.maxCapacityKg && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.maxCapacityKg}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="driving-license"
                className="text-xs font-semibold"
              >
                Driving License Number
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  id="driving-license"
                  placeholder="e.g. DL-DH-992140"
                  value={formData.drivingLicense}
                  onChange={(e) =>
                    handleInputChange("drivingLicense", e.target.value)
                  }
                  className="pl-9 h-9 text-xs rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground">
                Courier Fleet Availability
              </span>
              <p className="text-[11px] text-muted-foreground">
                Set active and ready to receive dispatch assignments.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  handleInputChange("isAvailable", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
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
              size="sm"
              disabled={isPending}
              className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>
                    {hasExistingProfile
                      ? "Update Courier Profile"
                      : "Assign & Activate Fleet"}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
