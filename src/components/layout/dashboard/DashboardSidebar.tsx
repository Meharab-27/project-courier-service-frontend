"use client";

import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  LucideIcon,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import type { IUser } from "@/api/auth.api";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useLogout } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  type NavItem,
  type RoleConfig,
  type UserRole,
  ROLE_CONFIGS,
} from "./nav-config";

interface DashboardSidebarProps {
  user: IUser;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function DashboardSidebar({
  user,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const roleConfig: RoleConfig =
    ROLE_CONFIGS[user.role as UserRole] || ROLE_CONFIGS.CUSTOMER;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Logged out",
          description: "You have been safely signed out.",
          type: "success",
        });
        window.location.href = "/login";
      },
      onError: () => {
        toast.add({
          title: "Logout Notice",
          description: "Session cleared locally.",
          type: "info",
        });
        window.location.href = "/login";
      },
    });
  };

  const isLinkActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-hidden bg-card/95 text-card-foreground border-r border-border/70 backdrop-blur-xl">
      {/* Top Header / Branding */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
          <Link
            href={roleConfig.homePath}
            className="flex items-center gap-3 transition-opacity hover:opacity-90 min-w-0"
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md shadow-primary/20",
                roleConfig.accentGradient,
              )}
            >
              <Truck className="size-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-heading font-extrabold text-sm tracking-tight text-foreground truncate">
                  courier-service
                </span>
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  {roleConfig.portalName}
                </span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Role Badge Pill */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-2">
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs font-semibold",
                roleConfig.badgeClass,
              )}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="size-2 rounded-full bg-current animate-pulse" />
                {roleConfig.label}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto max-h-[calc(100vh-220px)]">
          {roleConfig.navSections.map((section, idx) => (
            <div key={section.sectionTitle || idx} className="space-y-1">
              {!isCollapsed && section.sectionTitle && (
                <p className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                  {section.sectionTitle}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isLinkActive(item);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 outline-none select-none",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                        isCollapsed && "justify-center px-2 py-3",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          active
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />

                      {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                          <div className="flex flex-col truncate">
                            <span className="truncate">{item.title}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                                active
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:bg-background",
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Profile & Collapse Controls */}
      <div className="border-t border-border/60 p-3 bg-muted/20">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors",
            !isCollapsed && "bg-card/70 border border-border/50 shadow-2xs",
            isCollapsed && "justify-center",
          )}
        >
          {/* Avatar */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-primary/40 text-primary font-bold text-xs ring-1 ring-border">
            {user.avatarUrl ? (
              // biome-ignore lint/a11y/useAltText: user avatar image
              <img
                src={user.avatarUrl}
                alt={user.name || "Avatar"}
                className="size-full rounded-xl object-cover"
              />
            ) : (
              (user.name?.[0] || user.email?.[0] || "U").toUpperCase()
            )}
          </div>

          {!isCollapsed && (
            <div className="flex flex-1 flex-col overflow-hidden leading-tight">
              <span className="font-semibold text-xs text-foreground truncate flex items-center gap-1">
                {user.name || user.email.split("@")[0]}
                {user.isVerified && (
                  <ShieldCheck className="size-3 text-emerald-500 shrink-0" />
                )}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>

        {/* Desktop Collapse / Expand Toggle Button */}
        <div className="hidden lg:flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full justify-center"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                <span>Collapse menu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out sticky top-0 h-screen z-30",
          isCollapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCloseMobile();
            }}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
