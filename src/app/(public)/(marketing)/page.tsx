import type { Metadata } from "next";
import React from "react";
import {
  FeaturesGridSection,
  Hero,
  HomeCtaBanner,
  HomeFaqSection,
  HowItWorksSection,
  HubNetworkShowcase,
  LiveStatsCounter,
  RateEstimatorSection,
} from "@/components/modules/homepage";

export const metadata: Metadata = {
  title: "Express Parcel Courier & Logistics Service | Nationwide 62 Hubs",
  description:
    "Deliver parcels 10x faster across all 64 districts in Bangladesh with guaranteed next-day delivery, 6-digit delivery OTP verification, and 62 operational transit hubs.",
};

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* 1. Hero with Quick Parcel Tracking */}
      <Hero />

      {/* 2. Interactive Instant Shipping Rate Estimator */}
      <RateEstimatorSection />

      {/* 3. Live Verified Statistics Counter */}
      <LiveStatsCounter />

      {/* 4. 4-Stage Delivery Lifecycle Stepper */}
      <HowItWorksSection />

      {/* 5. 62 Nationwide Transit Hubs Directory Showcase */}
      <HubNetworkShowcase />

      {/* 6. Enterprise Features & Architecture Grid */}
      <FeaturesGridSection />

      {/* 7. Frequently Asked Questions Accordion */}
      <HomeFaqSection />

      {/* 8. Dual-Action Conversion Banner */}
      <HomeCtaBanner />
    </main>
  );
}

