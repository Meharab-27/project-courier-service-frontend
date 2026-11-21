import type { ComponentType } from "react";
import {
  BookUser,
  Boxes,
  Compass,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Package,
  PackagePlus,
  ShieldAlert,
  Truck,
  UserCheck,
  Users,
  Warehouse,
} from "lucide-react";
import type { IUser } from "@/api/auth.api";

export type UserRole = "CUSTOMER" | "COURIER" | "ADMIN";

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "info" | "primary";
  description?: string;
  exact?: boolean;
}

export interface NavSection {
  sectionTitle?: string;
  items: NavItem[];
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  portalName: string;
  homePath: string;
  badgeClass: string;
  accentGradient: string;
  glowColor: string;
  navSections: NavSection[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  CUSTOMER: {
    role: "CUSTOMER",
    label: "Customer Portal",
    portalName: "Customer Space",
    homePath: "/customer",
    badgeClass:
      "bg-primary/10 text-primary border-primary/25 shadow-xs shadow-primary/10",
    accentGradient: "from-primary to-sky-500",
    glowColor: "rgba(14, 165, 233, 0.15)",
    navSections: [
      {
        sectionTitle: "Overview & Shipping",
        items: [
          {
            title: "Dashboard",
            href: "/customer",
            icon: LayoutDashboard,
            description: "Personal parcel overview & stats",
            exact: true,
          },
          {
            title: "Book a Parcel",
            href: "/book-parcel",
            icon: PackagePlus,
            badge: "Fast",
            badgeVariant: "primary",
            description: "Calculate rate & send package",
          },
          {
            title: "My Shipments",
            href: "/dashboard/customer/shipments",
            icon: Package,
            description: "Active & past consignment orders",
          },
          {
            title: "Address Book & Profile",
            href: "/dashboard/customer/address-book",
            icon: BookUser,
            description: "Saved delivery addresses & settings",
          },
        ],
      },
      {
        sectionTitle: "Services & Tools",
        items: [
          {
            title: "Track Consignment",
            href: "/track",
            icon: Compass,
            description: "Real-time delivery milestone tracking",
          },
          {
            title: "Apply as Courier",
            href: "/courier-apply",
            icon: Truck,
            badge: "Earn",
            badgeVariant: "success",
            description: "Join our courier delivery fleet",
          },
          {
            title: "Help & Inquiries",
            href: "/about-us",
            icon: HelpCircle,
            description: "Coverage hubs & customer assistance",
          },
        ],
      },
    ],
  },
  COURIER: {
    role: "COURIER",
    label: "Courier Portal",
    portalName: "Courier Fleet",
    homePath: "/courier",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-xs shadow-emerald-500/10",
    accentGradient: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.15)",
    navSections: [
      {
        sectionTitle: "Fleet Operations",
        items: [
          {
            title: "Rider Hub",
            href: "/dashboard/courier",
            icon: LayoutDashboard,
            description: "Assigned routes & delivery targets",
            exact: true,
          },
          {
            title: "Deliveries Queue",
            href: "/dashboard/courier/deliveries",
            icon: Truck,
            badge: "Active",
            badgeVariant: "success",
            description: "Dispatched packages for handover",
          },
          {
            title: "Shipment Timeline",
            href: "/dashboard/shipments",
            icon: Boxes,
            description: "Verify tracking & consignment status",
          },
        ],
      },
      {
        sectionTitle: "Profile & Logistics",
        items: [
          {
            title: "Hub Profile",
            href: "/dashboard/courier/profile",
            icon: UserCheck,
            description: "Vehicle registration & hub zone",
          },
          {
            title: "Courier Application",
            href: "/courier-apply",
            icon: FileText,
            description: "Document status & verification",
          },
          {
            title: "Quick Track",
            href: "/track",
            icon: Compass,
            description: "Lookup consignment details",
          },
        ],
      },
    ],
  },
  ADMIN: {
    role: "ADMIN",
    label: "Admin Command",
    portalName: "Admin Operations",
    homePath: "/admin",
    badgeClass:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25 shadow-xs shadow-purple-500/10",
    accentGradient: "from-purple-600 to-indigo-600",
    glowColor: "rgba(147, 51, 234, 0.15)",
    navSections: [
      {
        sectionTitle: "Control & Management",
        items: [
          {
            title: "Executive Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
            description: "Logistics health, revenue & volumes",
            exact: true,
          },
          {
            title: "Approve Couriers",
            href: "/admin/approve-courier",
            icon: UserCheck,
            badge: "Review",
            badgeVariant: "warning",
            description: "Review pending onboarding documents",
          },
          {
            title: "All Shipments",
            href: "/admin/shipments",
            icon: Boxes,
            description: "System-wide shipment monitoring",
          },
        ],
      },
      {
        sectionTitle: "Infrastructure & Directory",
        items: [
          {
            title: "Hubs & Warehouses",
            href: "/admin/hubs",
            icon: Warehouse,
            description: "Regional transit and distribution points",
          },
          {
            title: "User Management",
            href: "/admin/users",
            icon: Users,
            description: "Accounts, privileges and roles",
          },
          {
            title: "Customer Directory",
            href: "/admin/customers",
            icon: BookUser,
            description: "Registered senders, addresses & order stats",
          },
          {
            title: "Global Track",
            href: "/track",
            icon: Compass,
            description: "Direct consignment status inspector",
          },
        ],
      },
    ],
  },
};

/**
 * Route authorization matrix:
 * Determines if a given pathname can be accessed by the user's role.
 */
export function checkRouteAccess(
  pathname: string,
  userRole?: UserRole | string,
): { isAllowed: boolean; requiredRole?: UserRole; reason?: string } {
  if (!userRole) {
    return { isAllowed: false, reason: "Authentication required" };
  }

  // Admin has access to all admin routes and general dashboard routes
  if (pathname.startsWith("/admin")) {
    if (userRole === "ADMIN") {
      return { isAllowed: true };
    }
    return {
      isAllowed: false,
      requiredRole: "ADMIN",
      reason: "This area is restricted to System Administrators.",
    };
  }

  // Courier routes
  if (
    pathname.startsWith("/courier") ||
    pathname.startsWith("/dashboard/courier")
  ) {
    if (userRole === "COURIER" || userRole === "ADMIN") {
      return { isAllowed: true };
    }
    return {
      isAllowed: false,
      requiredRole: "COURIER",
      reason: "This area is restricted to Verified Couriers.",
    };
  }

  // Customer routes
  if (
    pathname.startsWith("/customer") ||
    pathname.startsWith("/dashboard/customer")
  ) {
    if (userRole === "CUSTOMER" || userRole === "ADMIN") {
      return { isAllowed: true };
    }
    return {
      isAllowed: false,
      requiredRole: "CUSTOMER",
      reason: "This area is restricted to Customer accounts.",
    };
  }

  // Generic /dashboard routes (e.g. /dashboard, /dashboard/shipments/[id]) are accessible by all authenticated roles
  return { isAllowed: true };
}
