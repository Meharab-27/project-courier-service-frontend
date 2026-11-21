"use client";

import {
  Check,
  CheckCircle2,
  Copy,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Truck,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { IUser } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useDeleteUser, useGetUsers } from "@/hooks/auth.hooks";
import { cn } from "@/lib/utils";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { InspectUserDrawer } from "./InspectUserDrawer";

const ROLE_OPTIONS = [
  { label: "All Roles", value: "ALL" },
  { label: "Admins", value: "ADMIN" },
  { label: "Couriers", value: "COURIER" },
  { label: "Customers", value: "CUSTOMER" },
] as const;

export function AdminUserManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Inspector & Delete states
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Queries & Mutations
  const {
    data: usersResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useGetUsers({
    role: selectedRole !== "ALL" ? selectedRole : undefined,
    searchTerm: searchTerm || undefined,
  });

  const { mutate: deleteUserMutate, isPending: isDeleting } = useDeleteUser();

  const allUsers: IUser[] = usersResponse?.data || [];

  // Client-side filtering fallback
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      // Role match
      if (selectedRole !== "ALL") {
        if (user.role?.toUpperCase() !== selectedRole.toUpperCase()) {
          return false;
        }
      }

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = user.name?.toLowerCase().includes(query);
        const matchesEmail = user.email?.toLowerCase().includes(query);
        const matchesPhone = user.phone?.toLowerCase().includes(query);
        const matchesRole = user.role?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [allUsers, selectedRole, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = allUsers.length;
    const admins = allUsers.filter((u) => u.role === "ADMIN").length;
    const couriers = allUsers.filter((u) => u.role === "COURIER").length;
    const customers = allUsers.filter((u) => u.role === "CUSTOMER").length;
    return { total, admins, couriers, customers };
  }, [allUsers]);

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
    setInspectUserId(id);
    setIsInspectOpen(true);
  };

  const handleDeleteRequest = (user: IUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    deleteUserMutate(userToDelete.id, {
      onSuccess: () => {
        toast.add({
          title: "Account Soft-Deleted",
          description: `User account ${userToDelete.email} has been deactivated.`,
          type: "success",
        });
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      },
      onError: (err: unknown) => {
        const error = err as Error;
        toast.add({
          title: "Deletion Failed",
          description: error?.message || "Failed to soft-delete account.",
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
              User Directory & Access Control
            </h1>
            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Identity Management
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit system accounts, inspect verification details, and manage role
            assignments
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
              isRefetching && "animate-spin text-purple-600",
            )}
          />
          <span>Refresh Accounts</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Accounts
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.total}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Administrators
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.admins}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldAlert className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Couriers & Drivers
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.couriers}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Truck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Customers
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.customers}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <UserCheck className="size-5" />
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
              placeholder="Filter users by name, email, phone, or role..."
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

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRole(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedRole === opt.value
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted border-border/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">User Identity</th>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Role Details</th>
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
                    <Spinner className="size-6 text-purple-600 mx-auto mb-2" />
                    <span>Loading directory accounts...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Users className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="font-semibold text-foreground text-sm">
                      No matching user accounts
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Adjust your search query or role filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* 1. User Identity */}
                    <td className="py-3.5 px-4 align-top min-w-[200px]">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs mt-0.5">
                          {(user.name?.[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs leading-tight">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ID: {user.id.slice(0, 8)}...
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(user.id, "User ID")}
                              title="Copy ID"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {copiedText === user.id ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Role */}
                    <td className="py-3.5 px-4 align-top min-w-[120px]">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${
                          user.role === "ADMIN"
                            ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : user.role === "COURIER"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* 3. Phone */}
                    <td className="py-3.5 px-4 align-top min-w-[140px]">
                      {user.phone ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${user.phone}`}
                            className="font-mono text-xs font-medium text-foreground hover:text-purple-600 transition-colors"
                          >
                            {user.phone}
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(user.phone || "", "Phone")
                            }
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy Phone"
                          >
                            {copiedText === user.phone ? (
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

                    {/* 4. Verification & Status */}
                    <td className="py-3.5 px-4 align-top min-w-[130px]">
                      <div className="space-y-1">
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
                        {user.status && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Status: {user.status}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 5. Role Details */}
                    <td className="py-3.5 px-4 align-top min-w-[170px]">
                      {user.role === "COURIER" ? (
                        user.courierProfile ? (
                          <div className="space-y-0.5 text-[11px]">
                            <p className="font-semibold text-foreground">
                              {user.courierProfile.vehicleType} (
                              {user.courierProfile.vehicleNumber})
                            </p>
                            <p className="text-muted-foreground">
                              Zone: {user.courierProfile.currentZone}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Profile Pending
                          </span>
                        )
                      ) : user.role === "ADMIN" ? (
                        <span className="text-[11px] text-muted-foreground">
                          Full Platform Privileges
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Standard Sender
                        </span>
                      )}
                    </td>

                    {/* 6. Actions */}
                    <td className="py-3.5 px-4 align-top text-right min-w-[140px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenInspect(user.id)}
                          className="h-7 text-xs px-2.5 rounded-lg gap-1 hover:border-purple-600/40 hover:text-purple-600"
                        >
                          <Eye className="size-3" />
                          <span>Inspect</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRequest(user)}
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Soft-Delete User"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Displaying <strong>{filteredUsers.length}</strong> accounts matching
            filter criteria
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-purple-500" />
              {metrics.admins} Admins
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              {metrics.couriers} Couriers
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-sky-500" />
              {metrics.customers} Customers
            </span>
          </div>
        </div>
      </Card>

      {/* Inspect User Drawer (GET /api/v1/users/:id) */}
      <InspectUserDrawer
        userId={inspectUserId}
        isOpen={isInspectOpen}
        onClose={() => {
          setIsInspectOpen(false);
          setInspectUserId(null);
        }}
        onDeleteRequest={(u) => handleDeleteRequest(u)}
      />

      {/* Soft-Delete User Confirmation Dialog (DELETE /api/v1/users/:id) */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Soft-Delete User Account?"
        description="This will deactivate the user's access credentials and revoke active session tokens. Records can be reviewed by platform administrators."
        itemName={
          userToDelete
            ? `${userToDelete.name} (${userToDelete.email})`
            : undefined
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}
