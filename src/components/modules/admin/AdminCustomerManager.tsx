"use client";

import {
  BookUser,
  Building,
  Check,
  Copy,
  Eye,
  Filter,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ICustomer } from "@/api/customer.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useDeleteCustomer, useGetAllCustomers } from "@/hooks/customer.hooks";
import { cn } from "@/lib/utils";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { InspectCustomerDrawer } from "./InspectCustomerDrawer";

export function AdminCustomerManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modal / Drawer state
  const [inspectCustomerId, setInspectCustomerId] = useState<string | null>(
    null,
  );
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<ICustomer | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Queries & Mutations
  const {
    data: customersResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useGetAllCustomers({
    city: selectedCity !== "ALL" ? selectedCity : undefined,
    district: selectedDistrict !== "ALL" ? selectedDistrict : undefined,
    searchTerm: searchTerm || undefined,
  });

  const { mutate: deleteCustomerMutate, isPending: isDeleting } =
    useDeleteCustomer();

  const allCustomers: ICustomer[] = customersResponse?.data || [];

  // Extract unique cities & districts
  const { cities, districts } = useMemo(() => {
    const citySet = new Set<string>();
    const districtSet = new Set<string>();

    for (const c of allCustomers) {
      if (c.city?.trim()) citySet.add(c.city.trim());
      if (c.district?.trim()) districtSet.add(c.district.trim());
    }

    return {
      cities: Array.from(citySet).sort((a, b) => a.localeCompare(b)),
      districts: Array.from(districtSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [allCustomers]);

  // Client-side filtering fallback
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((customer) => {
      // City filter
      if (selectedCity !== "ALL") {
        if (customer.city?.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // District filter
      if (selectedDistrict !== "ALL") {
        if (
          customer.district?.toLowerCase() !== selectedDistrict.toLowerCase()
        ) {
          return false;
        }
      }

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const name = customer.name || customer.user?.name || "";
        const email = customer.email || customer.user?.email || "";
        const phone = customer.phone || customer.user?.phone || "";
        const address = customer.defaultAddress || customer.address || "";
        const city = customer.city || "";
        const district = customer.district || "";

        const matchesName = name.toLowerCase().includes(query);
        const matchesEmail = email.toLowerCase().includes(query);
        const matchesPhone = phone.toLowerCase().includes(query);
        const matchesAddress = address.toLowerCase().includes(query);
        const matchesCity = city.toLowerCase().includes(query);
        const matchesDistrict = district.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesAddress &&
          !matchesCity &&
          !matchesDistrict
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allCustomers, selectedCity, selectedDistrict, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = allCustomers.length;
    const totalOrders = allCustomers.reduce(
      (sum, c) => sum + (c.totalOrders || 0),
      0,
    );
    const uniqueCitiesCount = new Set(
      allCustomers.map((c) => c.city?.toLowerCase()).filter(Boolean),
    ).size;
    const uniqueDistrictsCount = new Set(
      allCustomers.map((c) => c.district?.toLowerCase()).filter(Boolean),
    ).size;

    return { total, totalOrders, uniqueCitiesCount, uniqueDistrictsCount };
  }, [allCustomers]);

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

  const handleOpenInspect = (id: string) => {
    setInspectCustomerId(id);
    setIsInspectOpen(true);
  };

  const handleDeleteRequest = (customer: ICustomer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;

    deleteCustomerMutate(customerToDelete.id, {
      onSuccess: () => {
        toast.add({
          title: "Customer Record Soft-Deleted",
          description: "Customer profile has been archived.",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        setCustomerToDelete(null);
      },
      onError: (err: unknown) => {
        const error = err as Error;
        toast.add({
          title: "Deletion Failed",
          description:
            error?.message || "Failed to soft-delete customer record.",
          type: "error",
        });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Customer Directory & Accounts
            </h1>
            <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400 border border-sky-500/20">
              Clients
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor client orders, saved delivery addresses, regional coverage,
            and customer activity
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rounded-xl text-xs gap-1.5 h-9 self-start sm:self-auto"
        >
          <RefreshCw
            className={cn(
              "size-3.5",
              isRefetching && "animate-spin text-sky-600",
            )}
          />
          <span>Refresh Records</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Customers
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.total}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <BookUser className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Orders Sent
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.totalOrders}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Package className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Cities
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.uniqueCitiesCount}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Districts Covered
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.uniqueDistrictsCount}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MapPin className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="rounded-2xl border-border/80 bg-card/60 shadow-2xs backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter by customer name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 rounded-xl border-border/80 bg-background/70 text-xs h-9"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* City & District Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* City Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/70 px-2.5 py-1 rounded-xl">
              <Filter className="size-3.5" />
              <span className="font-medium">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Cities ({allCustomers.length})</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* District Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/70 px-2.5 py-1 rounded-xl">
              <MapPin className="size-3.5" />
              <span className="font-medium">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {(selectedCity !== "ALL" || selectedDistrict !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCity("ALL");
                  setSelectedDistrict("ALL");
                }}
                className="h-8 text-xs rounded-xl text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Location (City / District)</th>
                <th className="py-3 px-4">Default Address</th>
                <th className="py-3 px-4 text-center">Order Stats</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Spinner className="size-6 text-sky-600 mx-auto mb-2" />
                    <span>Loading customer accounts...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <BookUser className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="font-semibold text-foreground text-sm">
                      No matching customer records
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Adjust your search term, city, or district filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const name =
                    customer.name || customer.user?.name || "Customer";
                  const email =
                    customer.email || customer.user?.email || "No email";
                  const phone = customer.phone || customer.user?.phone || "";
                  const address =
                    customer.defaultAddress ||
                    customer.address ||
                    "Unspecified";

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* 1. Customer Name & Email */}
                      <td className="py-3.5 px-4 align-top min-w-[190px]">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs mt-0.5">
                            {(name[0] || "C").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs leading-tight">
                              {name}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {email}
                            </p>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ID: {customer.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact Phone */}
                      <td className="py-3.5 px-4 align-top min-w-[140px]">
                        {phone ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${phone}`}
                              className="font-mono text-xs font-medium text-foreground hover:text-sky-600 transition-colors"
                            >
                              {phone}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(phone, "Phone")}
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy Phone"
                            >
                              {copiedText === phone ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Unlisted
                          </span>
                        )}
                      </td>

                      {/* 3. Location (City / District) */}
                      <td className="py-3.5 px-4 align-top min-w-[150px]">
                        <div className="space-y-1">
                          {customer.city && (
                            <span className="inline-flex items-center rounded-md bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                              {customer.city}
                            </span>
                          )}
                          {customer.district && (
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground ml-1">
                              {customer.district}
                            </span>
                          )}
                          {!customer.city && !customer.district && (
                            <span className="text-[11px] text-muted-foreground italic">
                              Nationwide
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Default Address */}
                      <td className="py-3.5 px-4 align-top max-w-[260px]">
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed">
                          <MapPin className="size-3.5 shrink-0 mt-0.5 text-sky-600" />
                          <span className="text-foreground/90 line-clamp-2">
                            {address}
                          </span>
                        </div>
                      </td>

                      {/* 5. Order Stats */}
                      <td className="py-3.5 px-4 align-top text-center min-w-[110px]">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                          <Package className="size-3 text-purple-600" />
                          <span>{customer.totalOrders ?? 0}</span>
                        </span>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 align-top text-right min-w-[130px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenInspect(customer.id)}
                            className="h-7 text-xs px-2.5 rounded-lg gap-1 hover:border-sky-600/40 hover:text-sky-600"
                          >
                            <Eye className="size-3" />
                            <span>Inspect</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRequest(customer)}
                            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Soft-Delete Customer"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing <strong>{filteredCustomers.length}</strong> customer records
            matching filter criteria
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-sky-500" />
              {metrics.total} Registered Clients
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-purple-500" />
              {metrics.totalOrders} Lifetime Orders
            </span>
          </div>
        </div>
      </Card>

      {/* Inspect Customer Drawer (GET /api/v1/customers/:id) */}
      <InspectCustomerDrawer
        customerId={inspectCustomerId}
        isOpen={isInspectOpen}
        onClose={() => {
          setIsInspectOpen(false);
          setInspectCustomerId(null);
        }}
        onDeleteRequest={(c) => handleDeleteRequest(c)}
      />

      {/* Soft-Delete Customer Confirmation Dialog (DELETE /api/v1/customers/:id) */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Soft-Delete Customer Record?"
        description="This will mark the customer profile as archived and deactivate associated default address shortcuts."
        itemName={
          customerToDelete
            ? `${customerToDelete.name || customerToDelete.email || customerToDelete.id}`
            : undefined
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
      />
    </div>
  );
}
