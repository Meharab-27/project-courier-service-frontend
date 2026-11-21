import type { Metadata } from "next";
import { AdminCustomerManager } from "@/components/modules/admin/AdminCustomerManager";

export const metadata: Metadata = {
  title: "Customer Directory & Accounts | Admin Portal",
  description:
    "Filter customers by city, district, and search term, view order stats, and soft-delete customer records.",
};

export default function AdminCustomersPage() {
  return <AdminCustomerManager />;
}
