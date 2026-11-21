import type { Metadata } from "next";
import { AdminUserManager } from "@/components/modules/admin/AdminUserManager";

export const metadata: Metadata = {
  title: "User Directory & Access Control | Admin Portal",
  description:
    "Filter users by role and search term, inspect user profiles, and soft-delete accounts.",
};

export default function AdminUsersPage() {
  return <AdminUserManager />;
}
