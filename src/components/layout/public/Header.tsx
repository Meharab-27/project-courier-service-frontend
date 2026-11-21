"use client";

import {
  IconBrandGithub,
  IconCalculator,
  IconHome,
  IconInfoCircle,
  IconPackage,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Compass, Truck, Warehouse } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  FloatingDock,
  type FloatingDockItem,
} from "@/components/ui/floating-dock";
import { HaloButton } from "@/components/ui/halo-button";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import { cn } from "@/lib/utils";

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

  const dockItems: FloatingDockItem[] = [
    {
      title: "Home",
      icon: <IconHome className="size-full text-foreground/80" />,
      href: "/",
    },
    {
      title: "Book Parcel",
      icon: <IconPackage className="size-full text-foreground/80" />,
      href: "/book-parcel",
    },
    {
      title: "Rate Calculator",
      icon: <IconCalculator className="size-full text-foreground/80" />,
      href: "/book-parcel",
    },
    {
      title: "Apply Courier",
      icon: <IconTruckDelivery className="size-full text-foreground/80" />,
      href: "/courier-apply",
    },
    {
      title: "Track",
      icon: <Compass className="size-full text-foreground/80 p-0.5" />,
      href: "/track",
    },
    {
      title: "Hubs",
      icon: <Warehouse className="size-full text-foreground/80 p-0.5" />,
      href: "/hubs",
    },
    {
      title: "About Us",
      icon: <IconInfoCircle className="size-full text-foreground/80" />,
      href: "/about-us",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Truck className="size-5" />
          </div>
          <span className="hidden sm:inline font-heading font-extrabold tracking-tight">
            Express Courier
          </span>
        </Link>

        {/* Center: Floating Dock Navigation Bar */}
        <div className="flex items-center justify-center">
          <FloatingDock
            items={dockItems}
            tooltipPosition="bottom"
            mobileDirection="bottom"
            desktopClassName="h-12 border-border/70 bg-card/60 shadow-xs backdrop-blur-md"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Apply as Courier Shortcut */}
          <Link
            href="/courier-apply"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden lg:inline-flex gap-2 rounded-lg border-primary/30 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:text-primary active:scale-95",
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
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-lg text-xs font-semibold gap-1.5",
                )}
              >
                <span>Dashboard</span>
              </Link>
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
