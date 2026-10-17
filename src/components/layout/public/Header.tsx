"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { HaloButton } from "@/components/ui/halo-button";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import { cn } from "@/lib/utils";

const routes = [
  { name: "Home", url: "/" },
  { name: "About us", url: "/about-us" },
] as const;

export function Header() {
  const { data, isLoading } = useGetMe();
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Logged Out",
          description: "Logged Out Successfully",
          type: "success",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
      },
      onError: () => {
        toast.add({
          title: "Logout failed",
          description: "Something Went Wrong",
          type: "error",
        });
      },
    });
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          courier-service
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
          {routes.map((route) => (
            <Link
              key={route.url}
              href={route.url}
              className="transition-colors hover:text-foreground"
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Apply as Courier Page Link */}
          <Link
            href="/courier-apply"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2 rounded-lg border-primary/30 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:text-primary active:scale-95",
            )}
          >
            <Truck className="size-3.5" />
            <span>Apply as Courier</span>
          </Link>

          {!isLoading && !data && (
            <Link href="/login">
              <HaloButton>Login</HaloButton>
            </Link>
          )}

          {!isLoading && data && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium text-foreground leading-none">
                  {data?.data?.name || data?.data?.email}
                </span>
                <span
                  className={cn(
                    "mt-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border",
                    data?.data?.role === "COURIER" &&
                      "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    data?.data?.role === "ADMIN" &&
                      "border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400",
                    data?.data?.role === "CUSTOMER" &&
                      "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  )}
                >
                  {data?.data?.role || "USER"}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="rounded-lg"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
