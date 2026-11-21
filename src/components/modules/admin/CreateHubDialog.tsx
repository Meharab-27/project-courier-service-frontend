"use client";

import { Compass, Loader2, MapPin, Phone, Plus, Warehouse } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { useCreateHub } from "@/hooks/hub.hooks";
import { createHubSchema } from "@/validation/hub.validation";

export const COMMON_BANGLADESH_ZONES = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Gazipur",
  "Narayanganj",
  "Bogura",
  "Cox's Bazar",
] as const;

export const BANGLADESH_ZONE_COORDINATES: Record<
  string,
  { lat: number; lng: number }
> = {
  Dhaka: { lat: 23.8103, lng: 90.4125 },
  Chattogram: { lat: 22.3569, lng: 91.7832 },
  Sylhet: { lat: 24.8949, lng: 91.8687 },
  Rajshahi: { lat: 24.3745, lng: 88.6042 },
  Khulna: { lat: 22.8456, lng: 89.5403 },
  Barishal: { lat: 22.701, lng: 90.3535 },
  Rangpur: { lat: 25.7439, lng: 89.2752 },
  Mymensingh: { lat: 24.7471, lng: 90.4203 },
  Cumilla: { lat: 23.4682, lng: 91.1788 },
  Gazipur: { lat: 23.9999, lng: 90.4203 },
  Narayanganj: { lat: 23.6238, lng: 90.5 },
  Bogura: { lat: 24.8465, lng: 89.377 },
  "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
};

interface CreateHubDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateHubDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateHubDialogProps) {
  const { mutate: createHubMutate, isPending } = useCreateHub();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    zone: "",
    contactNo: "",
    latitude: "",
    longitude: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      zone: "",
      contactNo: "",
      latitude: "",
      longitude: "",
    });
    setFormErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSelectZone = (zone: string) => {
    setFormData((prev) => {
      const next = { ...prev, zone };
      // Autofill default lat/lng if not yet entered
      if (
        !prev.latitude &&
        !prev.longitude &&
        BANGLADESH_ZONE_COORDINATES[zone]
      ) {
        next.latitude = String(BANGLADESH_ZONE_COORDINATES[zone].lat);
        next.longitude = String(BANGLADESH_ZONE_COORDINATES[zone].lng);
      }
      return next;
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.add({
        title: "Geolocation Unsupported",
        description: "Your browser does not support GPS geolocation.",
        type: "error",
      });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setIsDetectingLocation(false);
        toast.add({
          title: "Coordinates Detected",
          description: "Lat & Long autofilled from current position.",
          type: "success",
        });
      },
      (err) => {
        setIsDetectingLocation(false);
        toast.add({
          title: "Location Detection Failed",
          description: err.message || "Could not retrieve GPS coordinates.",
          type: "error",
        });
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim()
        ? formData.code.trim().toUpperCase()
        : undefined,
      address: formData.address.trim(),
      zone: formData.zone.trim(),
      contactNo: formData.contactNo.trim() || undefined,
      latitude: formData.latitude.trim()
        ? Number.parseFloat(formData.latitude.trim())
        : null,
      longitude: formData.longitude.trim()
        ? Number.parseFloat(formData.longitude.trim())
        : null,
    };

    const result = createHubSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFormErrors(errors);
      return;
    }

    createHubMutate(payload, {
      onSuccess: (res) => {
        toast.add({
          title: "Hub Created Successfully",
          description: `${res?.data?.name || payload.name} is now active in the transit network.`,
          type: "success",
        });
        handleClose();
        if (onSuccess) onSuccess();
      },
      onError: (err: unknown) => {
        const error = err as Error;
        toast.add({
          title: "Failed to Create Hub",
          description: error?.message || "An unexpected error occurred.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPopup className="sm:max-w-xl max-w-full p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Warehouse className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Create Transit Hub
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Register a new regional distribution warehouse or sorting
                station.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Row 1: Hub Name & Optional Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label
                htmlFor="create-hub-name"
                className="text-xs font-semibold"
              >
                Hub Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-hub-name"
                placeholder="e.g. Banani Transit Central"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
              {formErrors.name && (
                <p className="text-[11px] text-destructive font-medium">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="create-hub-code"
                className="text-xs font-semibold"
              >
                Code{" "}
                <span className="text-muted-foreground text-[10px] font-normal">
                  (Optional)
                </span>
              </Label>
              <Input
                id="create-hub-code"
                placeholder="HUB-BN-01"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                className="h-9 text-xs rounded-xl font-mono uppercase"
              />
              {formErrors.code && (
                <p className="text-[11px] text-destructive font-medium">
                  {formErrors.code}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Zone selection & custom input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="create-hub-zone"
                className="text-xs font-semibold"
              >
                District / Operating Zone{" "}
                <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">
                Quick click to autofill zone & coordinates
              </span>
            </div>
            <Input
              id="create-hub-zone"
              placeholder="e.g. Dhaka, Chattogram, Sylhet..."
              value={formData.zone}
              onChange={(e) => handleInputChange("zone", e.target.value)}
              className="h-9 text-xs rounded-xl"
              required
            />
            {formErrors.zone && (
              <p className="text-[11px] text-destructive font-medium">
                {formErrors.zone}
              </p>
            )}

            {/* Quick zone pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_BANGLADESH_ZONES.slice(0, 8).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => handleSelectZone(z)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors ${
                    formData.zone.toLowerCase() === z.toLowerCase()
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted border-border/60"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Full Physical Address */}
          <div className="space-y-1.5">
            <Label
              htmlFor="create-hub-address"
              className="text-xs font-semibold"
            >
              Physical Street Address{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-hub-address"
              placeholder="e.g. House 14, Road 7, Block D, Banani, Dhaka-1213"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="h-9 text-xs rounded-xl"
              required
            />
            {formErrors.address && (
              <p className="text-[11px] text-destructive font-medium">
                {formErrors.address}
              </p>
            )}
          </div>

          {/* Row 4: Contact Number */}
          <div className="space-y-1.5">
            <Label
              htmlFor="create-hub-contact"
              className="text-xs font-semibold"
            >
              Contact Telephone / Hotline
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                id="create-hub-contact"
                placeholder="+880 1711-234567"
                value={formData.contactNo}
                onChange={(e) => handleInputChange("contactNo", e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl font-mono"
              />
            </div>
            {formErrors.contactNo && (
              <p className="text-[11px] text-destructive font-medium">
                {formErrors.contactNo}
              </p>
            )}
          </div>

          {/* Row 5: Coordinates (Latitude & Longitude) */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <MapPin className="size-3.5 text-purple-600 dark:text-purple-400" />
                GPS Map Coordinates (Latitude & Longitude)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="h-7 text-[10px] rounded-lg px-2 gap-1"
              >
                {isDetectingLocation ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Compass className="size-3 text-purple-600" />
                )}
                <span>Auto-Detect GPS</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="create-hub-lat"
                  className="text-[11px] text-muted-foreground"
                >
                  Latitude
                </Label>
                <Input
                  id="create-hub-lat"
                  type="number"
                  step="any"
                  placeholder="23.8103"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleInputChange("latitude", e.target.value)
                  }
                  className="h-8 text-xs rounded-lg font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="create-hub-lng"
                  className="text-[11px] text-muted-foreground"
                >
                  Longitude
                </Label>
                <Input
                  id="create-hub-lng"
                  type="number"
                  step="any"
                  placeholder="90.4125"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleInputChange("longitude", e.target.value)
                  }
                  className="h-8 text-xs rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="rounded-xl text-xs font-bold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating Hub...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Create Hub</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
