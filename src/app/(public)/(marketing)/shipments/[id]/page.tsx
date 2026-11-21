import type { Metadata } from "next";
import { Suspense } from "react";
import { ShipmentDetailsView } from "@/components/modules/shipment/ShipmentDetailsView";
import { Spinner } from "@/components/ui/spinner";

interface ShipmentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ShipmentPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Shipment #${id} | Courier Service`,
    description: `Track consignment details and view delivery OTP for shipment #${id}.`,
  };
}

export default async function ShipmentPage({ params }: ShipmentPageProps) {
  const { id } = await params;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Decorative ambient background glow */}
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs">Loading consignment details...</p>
          </div>
        }
      >
        <ShipmentDetailsView shipmentId={id} />
      </Suspense>
    </div>
  );
}
