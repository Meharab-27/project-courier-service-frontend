"use client";

import {
  CheckCircle2,
  Copy,
  Mail,
  Phone,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { IUser } from "@/api/auth.api";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetUserById } from "@/hooks/auth.hooks";

interface InspectUserDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteRequest?: (user: IUser) => void;
}

export function InspectUserDrawer({
  userId,
  isOpen,
  onClose,
  onDeleteRequest,
}: InspectUserDrawerProps) {
  const { data: userResponse, isLoading } = useGetUserById(userId || undefined);
  const user = userResponse?.data;
  const [_copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerPopup side="right" className="max-w-md sm:max-w-lg">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <User className="size-5" />
            </div>
            <div>
              <DrawerTitle>User Account Inspector</DrawerTitle>
              <DrawerDescription>
                Detailed account identity, role credentials, and attached
                profile.
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-5">
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner className="size-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Loading account details...
              </p>
            </div>
          ) : !user ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              User details unavailable.
            </div>
          ) : (
            <>
              {/* Profile Card Summary */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-lg shadow-inner">
                    {(user.name?.[0] || "U").toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground leading-tight">
                        {user.name}
                      </h3>
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold border border-amber-500/20">
                          <XCircle className="size-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                        user.role === "ADMIN"
                          ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : user.role === "COURIER"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      }`}
                    >
                      {user.role} Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      Email Address:
                    </span>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <span>{user.email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(user.email, "Email")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3 opacity-70 hover:opacity-100" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      Phone Number:
                    </span>
                    {user.phone ? (
                      <div className="flex items-center gap-1.5 font-mono text-foreground font-semibold">
                        <a
                          href={`tel:${user.phone}`}
                          className="hover:underline"
                        >
                          {user.phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(user.phone || "", "Phone")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="size-3 opacity-70 hover:opacity-100" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">
                        Not provided
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Metadata */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  System Reference
                </h4>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Account User ID:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
                      <span>{user.id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(user.id, "User ID")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3 opacity-70 hover:opacity-100" />
                      </button>
                    </div>
                  </div>

                  {user.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        System Status:
                      </span>
                      <span className="font-semibold text-foreground">
                        {user.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attached Courier Profile (if role is COURIER) */}
              {user.role === "COURIER" && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="size-3.5 text-emerald-600" />
                    Attached Courier Fleet Profile
                  </h4>
                  {user.courierProfile ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Assigned Hub:
                        </span>
                        <span className="font-bold text-foreground">
                          {user.courierProfile.hub?.name ||
                            user.courierProfile.hubId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Vehicle Type:
                        </span>
                        <span className="font-semibold text-foreground">
                          {user.courierProfile.vehicleType} (
                          {user.courierProfile.vehicleNumber})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Operating Zone:
                        </span>
                        <span className="font-semibold text-foreground">
                          {user.courierProfile.currentZone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Capacity / Deliveries:
                        </span>
                        <span className="font-mono text-foreground">
                          {user.courierProfile.maxCapacityKg} kg max |{" "}
                          {user.courierProfile.activeDeliveries ?? 0} active
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                      Courier account exists, but fleet profile (hub, vehicle,
                      zone) is not yet configured.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </DrawerBody>

        <DrawerFooter className="gap-2 sm:gap-0">
          {user && onDeleteRequest && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onDeleteRequest(user);
                onClose();
              }}
              className="rounded-xl text-xs gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Soft-Delete Account</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
