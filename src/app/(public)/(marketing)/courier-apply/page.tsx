import type { Metadata } from "next";
import CourierApplyForm from "@/components/form/courier-apply-form";

export const metadata: Metadata = {
  title: "Apply as Courier Partner | Courier Service",
  description:
    "Join our delivery network as a courier partner. Register your vehicle, select your regional hub, and start earning.",
};

export default function CourierApplyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <CourierApplyForm />
    </div>
  );
}
