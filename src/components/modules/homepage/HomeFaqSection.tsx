"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does the 6-Digit Delivery OTP protect my shipment?",
    a: "When your parcel payment is verified via Stripe, our backend generates a unique cryptographically random 6-digit Delivery OTP visible only to the sender and recipient. When our courier rider reaches your doorstep, they must enter this exact code into their courier app to finalize the delivery. This prevents misdelivery and unauthorized parcel handovers.",
  },
  {
    q: "How are parcel delivery rates calculated?",
    a: "Rates are based on chargeable weight (max of actual scale weight vs. volumetric weight L×W×H/5000). For intra-zone shipments within the same division (e.g. Dhaka Metro to Dhaka Metro), the base rate is ৳60 for the first 1kg and ৳30 for each additional kg. For inter-zone nationwide deliveries, the base rate is ৳120 for the first 1kg and ৳45 per additional kg. Fragile handling is +৳50.",
  },
  {
    q: "Can I track my consignment without creating an account?",
    a: "Yes! Our public tracking portal (/track) is completely free and accessible without logging in. Simply enter your consignment tracking number (e.g., TRK-2026-A1B2C3) to view live milestone history, regional hub sorting locations, and estimated delivery dates.",
  },
  {
    q: "How quickly does a courier arrive for doorstep pickup?",
    a: "Once your shipment is confirmed and paid, our automated dispatcher allocates the nearest active on-duty rider from your local hub. Doorstep pickup generally occurs within 2 to 4 hours during business hours across major metropolitan centers.",
  },
  {
    q: "How do I apply to become a courier fleet partner?",
    a: "If you have a motorcycle, bicycle, van, or cargo truck along with a valid driving license and national identity card (NID), you can apply online through our 'Apply as Courier' portal (/courier-apply). Once our admin team approves your vehicle credentials, you can immediately start accepting deliveries in your zone.",
  },
  {
    q: "Can I edit or cancel a consignment after booking?",
    a: "You can update recipient details or cancel your shipment for a full refund while the status is ORDER_PLACED, PAYMENT_PENDING, or PAID. Once an admin assigns a courier and the status advances to PICKUP_ASSIGNED or any transit state, consignments are locked to prevent route disruption.",
  },
];

export function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-20 bg-background relative">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="size-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Everything you need to know about our courier delivery network, pricing formulas, and security protocols.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card
                key={faq.q}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  isOpen
                    ? "border-primary/40 bg-card shadow-sm"
                    : "border-border/70 bg-card/60 hover:bg-card hover:border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    {faq.q}
                  </span>
                  <div
                    className={cn(
                      "size-8 rounded-full border border-border/80 flex items-center justify-center shrink-0 transition-transform duration-200",
                      isOpen ? "rotate-180 bg-primary/10 text-primary border-primary/20" : "text-muted-foreground",
                    )}
                  >
                    <ChevronDown className="size-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
