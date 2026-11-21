import type { Metadata } from "next";
import { AdminShipmentMasterTable } from "@/components/modules/admin/AdminShipmentMasterTable";

export const metadata: Metadata = {
  title: "Shipment Dispatch & Courier Assignment | Admin Command",
  description:
    "Master shipment dispatch control table across regional hubs. Assign active couriers to paid shipments and manage the logistics lifecycle.",
};

export default function AdminShipmentsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
          Shipment Dispatch & Courier Assignment
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor all hub consignments, filter live parcel statuses, and assign
          on-duty courier partners to confirmed PAID bookings for immediate
          doorstep pickup.
        </p>
      </div>

      {/* Master Shipment Table & Assignment Dialog */}
      <AdminShipmentMasterTable />
    </div>
  );
}
