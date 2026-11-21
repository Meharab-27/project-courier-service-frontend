"use client";

import {
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Save,
  Warehouse,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { IHub } from "@/api/hub.api";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useGetHubById, useUpdateHub } from "@/hooks/hub.hooks";
import { updateHubSchema } from "@/validation/hub.validation";
import { COMMON_BANGLADESH_ZONES } from "./CreateHubDialog";

interface EditHubDrawerProps {
  hub: IHub | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditHubDrawer({
  hub,
  isOpen,
  onClose,
  onSuccess,
}: EditHubDrawerProps) {
  // Fresh hub data from GET /api/v1/hubs/:id when opened
  const { data: freshHubResponse } = useGetHubById(hub?.id);
  const activeHub = freshHubResponse?.data || hub;

  const { mutate: updateHubMutate, isPending } = useUpdateHub();

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

  // Sync form state when activeHub changes
  useEffect(() => {
    if (activeHub) {
      setFormData({
        name: activeHub.name || "",
        code: activeHub.code || "",
        address: activeHub.address || "",
        zone: activeHub.zone || "",
        contactNo: activeHub.contactNo || "",
        latitude:
          activeHub.latitude !== undefined && activeHub.latitude !== null
            ? String(activeHub.latitude)
            : "",
        longitude:
          activeHub.longitude !== undefined && activeHub.longitude !== null
            ? String(activeHub.longitude)
            : "",
      });
      setFormErrors({});
    }
  }, [activeHub]);

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
          title: "Coordinates Updated",
          description: "GPS coordinates detected from your current device.",
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
    if (!activeHub?.id) return;

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

    const validationResult = updateHubSchema.safeParse(payload);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFormErrors(errors);
      return;
    }

    updateHubMutate(
      { id: activeHub.id, payload },
      {
        onSuccess: (res) => {
          toast.add({
            title: "Hub Updated",
            description: `${res?.data?.name || payload.name} changes saved successfully.`,
            type: "success",
          });
          onClose();
          if (onSuccess) onSuccess();
        },
        onError: (err: unknown) => {
          const error = err as Error;
          toast.add({
            title: "Update Failed",
            description: error?.message || "Failed to update hub.",
            type: "error",
          });
        },
      },
    );
  };

  const hasCoords =
    formData.latitude.trim() !== "" && formData.longitude.trim() !== "";
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`
    : null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerPopup side="right" className="max-w-md sm:max-w-lg">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Pencil className="size-4" />
            </div>
            <div>
              <DrawerTitle>Edit Transit Hub</DrawerTitle>
              <DrawerDescription>
                Modify infrastructure, zone routing, and dispatch contacts.
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <DrawerBody className="space-y-4">
            {/* Hub ID Metadata badge */}
            {activeHub?.id && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Warehouse className="size-3.5 text-purple-600" />
                  Hub Reference ID:
                </span>
                <span className="font-mono font-bold text-[11px] text-foreground">
                  {activeHub.id}
                </span>
              </div>
            )}

            {/* Row 1: Name and Code */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-hub-name"
                  className="text-xs font-semibold"
                >
                  Hub Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-hub-name"
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
                  htmlFor="edit-hub-code"
                  className="text-xs font-semibold"
                >
                  Hub Station Code
                </Label>
                <Input
                  id="edit-hub-code"
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

            {/* Row 2: Zone & Preset pills */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-hub-zone" className="text-xs font-semibold">
                District / Zone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-hub-zone"
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

              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_BANGLADESH_ZONES.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => handleInputChange("zone", z)}
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

            {/* Row 3: Physical Address */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-hub-address"
                className="text-xs font-semibold"
              >
                Physical Street Address{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-hub-address"
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
                htmlFor="edit-hub-contact"
                className="text-xs font-semibold"
              >
                Contact Telephone / Hotline
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  id="edit-hub-contact"
                  value={formData.contactNo}
                  onChange={(e) =>
                    handleInputChange("contactNo", e.target.value)
                  }
                  className="pl-9 h-9 text-xs rounded-xl font-mono"
                />
              </div>
              {formErrors.contactNo && (
                <p className="text-[11px] text-destructive font-medium">
                  {formErrors.contactNo}
                </p>
              )}
            </div>

            {/* Row 5: Coordinates */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <MapPin className="size-3.5 text-purple-600" />
                  Map Coordinates
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
                  <span>Detect GPS</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-hub-lat"
                    className="text-[11px] text-muted-foreground"
                  >
                    Latitude
                  </Label>
                  <Input
                    id="edit-hub-lat"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange("latitude", e.target.value)
                    }
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-hub-lng"
                    className="text-[11px] text-muted-foreground"
                  >
                    Longitude
                  </Label>
                  <Input
                    id="edit-hub-lng"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange("longitude", e.target.value)
                    }
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>

              {googleMapsUrl && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    Coordinates link verified
                  </span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    <span>Test on Google Maps</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          </DrawerBody>

          <DrawerFooter className="gap-2 sm:gap-0">
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
              className="rounded-xl text-xs font-bold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerPopup>
    </Drawer>
  );
}
