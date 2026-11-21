"use client";

import { Home, LayoutDashboard, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { IUser } from "@/api/auth.api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type RoleConfig, type UserRole, ROLE_CONFIGS } from "./nav-config";

interface AccessDeniedProps {
  user: IUser;
  requiredRole?: UserRole;
  pathname: string;
}

export function AccessDenied({
  user,
  requiredRole,
  pathname,
}: AccessDeniedProps) {
  const userRoleConfig: RoleConfig =
    ROLE_CONFIGS[user.role as UserRole] || ROLE_CONFIGS.CUSTOMER;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      {/* Decorative ambient background blur */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-72 w-full max-w-xl -translate-x-1/2 rounded-full bg-destructive/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/80 bg-card/80 p-6 shadow-xl backdrop-blur-xl text-center">
        <CardContent className="flex flex-col items-center p-0">
          {/* Icon Badge */}
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5 mb-4 shadow-sm">
            <ShieldAlert className="size-7" />
          </div>

          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Access Restricted
          </h2>

          <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-sm">
            You do not have permission to access{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono text-[11px]">
              {pathname}
            </code>
            .
            {requiredRole && (
              <span className="block mt-1">
                This section is reserved exclusively for{" "}
                <span className="font-semibold text-foreground">
                  {requiredRole}
                </span>{" "}
                accounts.
              </span>
            )}
          </p>

          {/* Current Role Indicator */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">Signed in as:</span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-bold uppercase text-[10px]",
                userRoleConfig.badgeClass,
              )}
            >
              {user.role} ({user.email})
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full">
            <Link
              href={userRoleConfig.homePath}
              className={cn(
                buttonVariants({ variant: "default" }),
                "flex-1 gap-2 rounded-xl text-xs font-semibold shadow-xs",
              )}
            >
              <LayoutDashboard className="size-4" />
              <span>Go to My Dashboard</span>
            </Link>

            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "gap-2 rounded-xl text-xs font-semibold border-border",
              )}
            >
              <Home className="size-4" />
              <span>Homepage</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
