"use client";

import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe } from "@/hooks";
import { AccessDenied } from "./AccessDenied";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardTopbar } from "./DashboardTopbar";
import { checkRouteAccess } from "./nav-config";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: userResponse, isLoading, isError } = useGetMe();
  const user = userResponse?.data;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard_sidebar_collapsed") === "true";
    }
    return false;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toggle desktop collapsed mode
  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboard_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Redirect unauthenticated users to /login with redirect query param
  useEffect(() => {
    if (!isLoading && (!user || isError)) {
      const redirectUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirectUrl}`);
    }
  }, [isLoading, user, isError, router, pathname]);

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Not authenticated state
  if (!user || isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
          <Spinner className="size-6 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Checking Authorization...
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Redirecting to secure login...
        </p>
      </div>
    );
  }

  // Check role authorization for current route
  const { isAllowed, requiredRole } = checkRouteAccess(pathname, user.role);

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Role-Specific Sidebar */}
      <DashboardSidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <DashboardTopbar
          user={user}
          onOpenMobile={() => setIsMobileOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Content View or Access Denied */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {isAllowed ? (
            children
          ) : (
            <AccessDenied
              user={user}
              requiredRole={requiredRole}
              pathname={pathname}
            />
          )}
        </main>
      </div>
    </div>
  );
}
