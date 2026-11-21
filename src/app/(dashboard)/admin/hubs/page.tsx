import type { Metadata } from "next";
import { AdminHubManager } from "@/components/modules/admin/AdminHubManager";

export const metadata: Metadata = {
  title: "Transit Hubs & Network Management | Admin Portal",
  description:
    "Manage regional distribution hubs, sorting centers, geolocation coordinates, and contact hotlines.",
};

export default function AdminHubsPage() {
  return <AdminHubManager />;
}
