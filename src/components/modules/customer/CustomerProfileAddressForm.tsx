"use client";

import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  Globe,
  HelpCircle,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  useGetCustomerMe,
  useGetMe,
  useUpdateCustomerMe,
  useUpdateUserMe,
} from "@/hooks";
import { cn } from "@/lib/utils";

export function CustomerProfileAddressForm() {
  const { data: userResponse, isLoading: isLoadingUser } = useGetMe();
  const { data: customerResponse, isLoading: isLoadingCustomer } = useGetCustomerMe();

  const user = userResponse?.data;
  const customer = customerResponse?.data;

  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUserMe();
  const { mutateAsync: updateCustomer, isPending: isUpdatingCustomer } = useUpdateCustomerMe();

  // Form states - User section (PATCH /api/v1/users/me)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Form states - Customer Address Book section (PATCH /api/v1/customers/me)
  const [defaultAddress, setDefaultAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Sync initial data from user and customer profile
  useEffect(() => {
    if (user && !hasLoadedInitial) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user, hasLoadedInitial]);

  useEffect(() => {
    if (customer && !hasLoadedInitial) {
      setDefaultAddress(
        customer.defaultAddress ||
          customer.defaultPickupAddress ||
          customer.address ||
          "",
      );
      setCity(customer.city || "");
      setDistrict(customer.district || "");
      setPostalCode(customer.postalCode || "");
      setAlternatePhone(customer.alternatePhone || "");
      setHasLoadedInitial(true);
    }
  }, [customer, hasLoadedInitial]);

  const isSubmitting = isUpdatingUser || isUpdatingCustomer;
  const isLoading = isLoadingUser || isLoadingCustomer;

  const totalOrders = customer?.totalOrders ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    if (!name.trim()) {
      errors.name = "Full name is required";
    }
    if (phone.trim() && phone.trim().length < 8) {
      errors.phone = "Enter a valid primary phone number";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.add({
        title: "Validation Error",
        description: "Please resolve the highlighted fields before saving.",
        type: "error",
      });
      return;
    }

    setFormErrors({});

    try {
      // 1. Dispatch PATCH /api/v1/users/me
      const userPromise = updateUser({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      // 2. Dispatch PATCH /api/v1/customers/me
      const customerPromise = updateCustomer({
        defaultAddress: defaultAddress.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        alternatePhone: alternatePhone.trim() || undefined,
      });

      await Promise.all([userPromise, customerPromise]);

      toast.add({
        title: "Settings Saved",
        description: "Your personal profile and default address book have been updated.",
        type: "success",
      });
    } catch (err: any) {
      toast.add({
        title: "Save Failed",
        description: err?.message || "Failed to update profile settings. Please try again.",
        type: "error",
      });
    }
  };

  if (isLoading && !hasLoadedInitial) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 text-muted-foreground p-8">
        <Spinner className="size-8 text-primary" />
        <p className="text-xs font-medium">Loading customer address book & profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stat Row: Read-Only totalOrders Stat Card & Profile Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Read-Only totalOrders Stat Card */}
        <Card className="rounded-2xl border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-5 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lifetime Consignments
              </span>
              <p className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
                {totalOrders}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>Total verified bookings placed</span>
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <Package className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Account Verification & Role Card */}
        <Card className="rounded-2xl border-border/80 bg-card/60 p-5 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Customer Status
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  <span>Verified Customer</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate pt-1">
                {user?.email}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <ShieldCheck className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Fast Pre-Fill Indicator Card */}
        <Card className="rounded-2xl border-border/80 bg-card/60 p-5 shadow-2xs sm:col-span-2 lg:col-span-1">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Default Address
              </span>
              <p className="text-sm font-bold text-foreground truncate max-w-[200px]">
                {city ? `${city}${district ? `, ${district}` : ""}` : "Not Configured"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {defaultAddress || "Save default address below for 1-click booking"}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs">
              <MapPin className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Combined Form Card */}
      <Card className="rounded-3xl border-border/80 bg-card/70 shadow-sm overflow-hidden backdrop-blur-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-8">
            {/* Header / Instructions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h2 className="text-lg font-bold text-foreground font-heading">
                  Personal Profile & Default Address Book
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your contact details and default sender pickup address for faster parcel booking
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl text-xs font-semibold gap-1.5 shadow-md shadow-primary/20 self-start sm:self-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Save All Changes</span>
                  </>
                )}
              </Button>
            </div>

            {/* Section 1: User Profile Details (PATCH /api/v1/users/me) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">User Profile Settings</h3>
              </div>

              {/* Avatar Preview & URL */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-border/70 bg-muted/30">
                <div className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground font-bold text-xl shadow-md overflow-hidden ring-2 ring-border">
                  {avatarUrl ? (
                    // biome-ignore lint/a11y/useAltText: Avatar Preview
                    <img
                      src={avatarUrl}
                      alt={name || "User Avatar"}
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    (name?.[0] || user?.email?.[0] || "U").toUpperCase()
                  )}
                </div>

                <div className="flex-1 space-y-1.5 w-full">
                  <Label htmlFor="avatarUrl" className="text-xs font-semibold flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-muted-foreground" />
                    <span>Avatar Image URL</span>
                  </Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="text-xs rounded-xl bg-card border-border/80 h-9"
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Direct link to a public PNG, JPG, or WebP avatar image.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>Full Name *</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) {
                        setFormErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    placeholder="e.g. John Doe"
                    className="text-xs rounded-xl bg-card border-border/80 h-9"
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-destructive font-medium">{formErrors.name}</p>
                  )}
                </div>

                {/* Primary Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>Primary Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formErrors.phone) {
                        setFormErrors((prev) => ({ ...prev, phone: "" }));
                      }
                    }}
                    placeholder="e.g. +880 1712 345678"
                    className="text-xs rounded-xl bg-card border-border/80 h-9"
                    disabled={isSubmitting}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-destructive font-medium">{formErrors.phone}</p>
                  )}
                </div>

                {/* Email (Read-Only) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>Registered Account Email</span>
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="text-xs rounded-xl bg-muted/50 border-border/60 text-muted-foreground h-9 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Account email is tied to authentication and verified credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Default Address Book Settings (PATCH /api/v1/customers/me) */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Default Address Book</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Pre-filled automatically whenever you book a new consignment parcel
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Street Address */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="defaultAddress" className="text-xs font-semibold flex items-center gap-1.5">
                    <Building className="size-3.5 text-muted-foreground" />
                    <span>Default Pickup / Sender Address</span>
                  </Label>
                  <textarea
                    id="defaultAddress"
                    rows={3}
                    value={defaultAddress}
                    onChange={(e) => setDefaultAddress(e.target.value)}
                    placeholder="House / Flat #, Road, Section, Landmark, Area..."
                    className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold flex items-center gap-1.5">
                    <Compass className="size-3.5 text-muted-foreground" />
                    <span>City</span>
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka, Chittagong..."
                    className="text-xs rounded-xl bg-card border-border/80 h-9"
                    disabled={isSubmitting}
                  />
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <Label htmlFor="district" className="text-xs font-semibold flex items-center gap-1.5">
                    <Globe className="size-3.5 text-muted-foreground" />
                    <span>District</span>
                  </Label>
                  <Input
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dhaka, Gazipur, Sylhet..."
                    className="text-xs rounded-xl bg-card border-border/80 h-9"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Postal Code */}
                <div className="space-y-1.5">
                  <Label htmlFor="postalCode" className="text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>Postal / Zip Code</span>
                  </Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 1205, 1212"
                    className="text-xs rounded-xl bg-card border-border/80 h-9"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Alternate Phone */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="alternatePhone" className="text-xs font-semibold flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>Secondary / Alternate Contact Number (Optional)</span>
                  </Label>
                  <Input
                    id="alternatePhone"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="e.g. +880 1812 000000 (Backup phone for rider reach)"
                    className="text-xs rounded-xl bg-card border-border/80 h-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                All changes to customer profile and default address sync instantly across your active session.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl text-xs font-semibold gap-1.5 shadow-md shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Updating Profile & Address...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Save All Settings</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
