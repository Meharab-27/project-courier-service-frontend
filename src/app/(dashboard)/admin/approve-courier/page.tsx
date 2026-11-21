import type { Metadata } from "next";
import { AdminCourierManager } from "@/components/modules/admin/AdminCourierManager";

export const metadata: Metadata = {
  title: "Courier Fleet Management & Onboarding | Admin Portal",
  description:
    "Manage courier accounts, assign distribution hubs, and setup vehicle profiles via POST /api/v1/courier/profile.",
};

export default function ApproveCourierPage() {
  return <AdminCourierManager />;
}
