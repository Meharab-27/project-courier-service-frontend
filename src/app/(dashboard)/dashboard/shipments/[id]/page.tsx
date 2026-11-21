import type { Metadata } from "next";
import { Suspense } from "react";
import { ShipmentDetailsView } from "@/components/modules/shipment/ShipmentDetailsView";
import { Spinner } from "@/components/ui/spinner";

interface DashboardShipmentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DashboardShipmentPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Shipment #${id} Timeline | Dashboard`,
    description: `Monitor shipment timeline, delivery OTP, and status audit logs for consignment #${id}.`,
  };
}

export default async function DashboardShipmentPage({
  params,
}: DashboardShipmentPageProps) {
  const { id } = await params;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Decorative ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-full max-w-5xl -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <Suspense
        fallback={
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs">Loading shipment timeline...</p>
          </div>
        }
      >
        <ShipmentDetailsView shipmentId={id} />
      </Suspense>
    </div>
  );
}
