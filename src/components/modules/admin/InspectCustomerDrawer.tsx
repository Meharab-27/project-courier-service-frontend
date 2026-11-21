"use client";

import {
  BookUser,
  Copy,
  Mail,
  MapPin,
  Package,
  Phone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { ICustomer } from "@/api/customer.api";
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
import { useGetCustomerById } from "@/hooks/customer.hooks";

interface InspectCustomerDrawerProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteRequest?: (customer: ICustomer) => void;
}

export function InspectCustomerDrawer({
  customerId,
  isOpen,
  onClose,
  onDeleteRequest,
}: InspectCustomerDrawerProps) {
  const { data: customerResponse, isLoading } = useGetCustomerById(
    customerId || undefined,
  );
  const customer = customerResponse?.data;
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

  const displayName = customer?.name || customer?.user?.name || "Customer";
  const displayEmail = customer?.email || customer?.user?.email || "No email";
  const displayPhone = customer?.phone || customer?.user?.phone || "No phone";

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerPopup side="right" className="max-w-md sm:max-w-lg">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <BookUser className="size-5" />
            </div>
            <div>
              <DrawerTitle>Customer Profile Inspector</DrawerTitle>
              <DrawerDescription>
                Shipping addresses, dispatch orders, and account demographics.
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-5">
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner className="size-6 text-sky-600 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Loading customer details...
              </p>
            </div>
          ) : !customer ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Customer details unavailable.
            </div>
          ) : (
            <>
              {/* Profile Card Summary */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold text-lg shadow-inner">
                    {(displayName[0] || "C").toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground leading-tight">
                      {displayName}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block rounded-md bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        Customer Record
                      </span>
                      {customer.district && (
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {customer.district}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Orders metric highlight */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Total Orders
                    </p>
                    <p className="text-lg font-extrabold text-foreground font-mono flex items-center gap-1.5 mt-0.5">
                      <Package className="size-4 text-sky-600" />
                      <span>{customer.totalOrders ?? 0}</span>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Region / City
                    </p>
                    <p className="text-xs font-bold text-foreground mt-1 truncate">
                      {customer.city || customer.zone || "National"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      Email:
                    </span>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <span>{displayEmail}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(displayEmail, "Email")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3 opacity-70 hover:opacity-100" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      Primary Phone:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-foreground font-semibold">
                      <a
                        href={`tel:${displayPhone}`}
                        className="hover:underline"
                      >
                        {displayPhone}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(displayPhone, "Phone")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3 opacity-70 hover:opacity-100" />
                      </button>
                    </div>
                  </div>

                  {customer.alternatePhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        Alternate Phone:
                      </span>
                      <span className="font-mono text-foreground">
                        {customer.alternatePhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Shipping Addresses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-sky-600" />
                  Address Book & Demographics
                </h4>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Default Physical Address:
                    </span>
                    <p className="text-foreground mt-0.5 leading-relaxed">
                      {customer.defaultAddress || customer.address || (
                        <span className="italic text-muted-foreground">
                          Not configured
                        </span>
                      )}
                    </p>
                  </div>

                  {customer.defaultPickupAddress && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        Default Pickup Point:
                      </span>
                      <p className="text-foreground mt-0.5 leading-relaxed">
                        {customer.defaultPickupAddress}
                      </p>
                    </div>
                  )}

                  {customer.defaultDeliveryAddress && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        Default Delivery Destination:
                      </span>
                      <p className="text-foreground mt-0.5 leading-relaxed">
                        {customer.defaultDeliveryAddress}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">City:</span>
                      <span className="font-semibold text-foreground">
                        {customer.city || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        District:
                      </span>
                      <span className="font-semibold text-foreground">
                        {customer.district || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        Postal:
                      </span>
                      <span className="font-semibold text-foreground">
                        {customer.postalCode || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System IDs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  System Reference
                </h4>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Customer Record ID:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
                      <span>{customer.id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(customer.id, "Customer ID")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="size-3 opacity-70 hover:opacity-100" />
                      </button>
                    </div>
                  </div>

                  {customer.userId && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Linked User ID:
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
                        <span>{customer.userId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(customer.userId, "User ID")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="size-3 opacity-70 hover:opacity-100" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DrawerBody>

        <DrawerFooter className="gap-2 sm:gap-0">
          {customer && onDeleteRequest && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onDeleteRequest(customer);
                onClose();
              }}
              className="rounded-xl text-xs gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Soft-Delete Customer</span>
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
