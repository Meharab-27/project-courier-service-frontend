"use client";

import {
  Bell,
  BookUser,
  ChevronRight,
  ExternalLink,
  Home,
  LogOut,
  Menu,
  Package,
  PackagePlus,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { IUser } from "@/api/auth.api";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useLogout } from "@/hooks";
import { cn } from "@/lib/utils";
import { type RoleConfig, type UserRole, ROLE_CONFIGS } from "./nav-config";

interface DashboardTopbarProps {
  user: IUser;
  onOpenMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardTopbar({
  user,
  onOpenMobile,
  isCollapsed,
  onToggleCollapse,
}: DashboardTopbarProps) {
  const pathname = usePathname();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleConfig: RoleConfig =
    ROLE_CONFIGS[user.role as UserRole] || ROLE_CONFIGS.CUSTOMER;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Logged out",
          description: "Signed out successfully",
          type: "success",
        });
        window.location.href = "/login";
      },
      onError: () => {
        window.location.href = "/login";
      },
    });
  };

  // Build clean breadcrumbs based on pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentTitle =
    pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1]
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden flex size-9 items-center justify-center rounded-lg border border-border/80 text-foreground hover:bg-muted transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Breadcrumb Path */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="size-3.5" />
            <span className="hidden md:inline">Home</span>
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/50" />
          <Link
            href={roleConfig.homePath}
            className="hover:text-foreground transition-colors font-medium"
          >
            {roleConfig.portalName}
          </Link>
          {pathSegments.length > 1 && (
            <>
              <ChevronRight className="size-3 text-muted-foreground/50" />
              <span className="font-semibold text-foreground truncate max-w-[150px]">
                {currentTitle}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Quick actions, Role Status Pill, User Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Role Quick Action Button */}
        {user.role === "CUSTOMER" && (
          <Link
            href="/book-parcel"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "hidden sm:inline-flex gap-1.5 rounded-lg shadow-xs active:scale-95 text-xs font-semibold",
            )}
          >
            <PackagePlus className="size-3.5" />
            <span>Book Parcel</span>
          </Link>
        )}

        {user.role === "ADMIN" && (
          <Link
            href="/admin/approve-courier"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex gap-1.5 rounded-lg border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 text-xs font-semibold",
            )}
          >
            <ShieldCheck className="size-3.5" />
            <span>Approve Couriers</span>
          </Link>
        )}

        {user.role === "COURIER" && (
          <Link
            href="/courier"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex gap-1.5 rounded-lg border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold",
            )}
          >
            <Truck className="size-3.5" />
            <span>Deliveries</span>
          </Link>
        )}

        {/* Public Website Shortcut */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open public website in new tab"
          className="hidden md:flex size-8 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Open public website in a new tab"
        >
          <ExternalLink className="size-3.5" />
        </Link>

        {/* Online Status / Role Chip */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="capitalize">{user.role.toLowerCase()}</span>
        </div>

        {/* User Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all p-0.5 outline-none"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            aria-label="Open user account menu"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground font-bold text-xs shadow-xs">
              {user.avatarUrl ? (
                // biome-ignore lint/a11y/useAltText: user avatar image
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                (user.name?.[0] || user.email?.[0] || "U").toUpperCase()
              )}
            </div>
          </button>

          {/* Dropdown Card */}
          {userMenuOpen && (
            <>
              {/* Invisible clickaway listener */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setUserMenuOpen(false);
                }}
              />

              <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-border/80 bg-card p-3 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex flex-col border-b border-border/60 pb-3 mb-2 px-1">
                  <span className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                    {user.name || "User Account"}
                    {user.isVerified && (
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Verified
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {user.email}
                  </span>
                  <div className="mt-1.5">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                        roleConfig.badgeClass,
                      )}
                    >
                      {user.role} Account
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-1">
                  <Link
                    href={roleConfig.homePath}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="size-4 text-muted-foreground" />
                    <span>My Dashboard</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Home className="size-4 text-muted-foreground" />
                    <span>Public Website</span>
                  </Link>
                  {user.role === "CUSTOMER" && (
                    <>
                      <Link
                        href="/book-parcel"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <PackagePlus className="size-4 text-muted-foreground" />
                        <span>Book New Parcel</span>
                      </Link>
                      <Link
                        href="/dashboard/customer/shipments"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Package className="size-4 text-muted-foreground" />
                        <span>My Shipments</span>
                      </Link>
                      <Link
                        href="/dashboard/customer/address-book"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <BookUser className="size-4 text-muted-foreground" />
                        <span>Address Book & Profile</span>
                      </Link>
                    </>
                  )}

                  {user.role === "COURIER" && (
                    <>
                      <Link
                        href="/dashboard/courier/deliveries"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Truck className="size-4 text-muted-foreground" />
                        <span>Deliveries Queue</span>
                      </Link>
                      <Link
                        href="/dashboard/courier/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <UserCheck className="size-4 text-muted-foreground" />
                        <span>Fleet Profile</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Logout Button */}
                <div className="border-t border-border/60 pt-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full justify-center gap-2 rounded-lg text-xs"
                  >
                    <LogOut className="size-3.5" />
                    <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
