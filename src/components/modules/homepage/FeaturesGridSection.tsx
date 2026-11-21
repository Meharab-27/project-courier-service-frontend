"use client";

import {
  Bot,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: KeyRound,
    title: "6-Digit Delivery OTP Protection",
    tag: "Zero-Fraud Handover",
    description:
      "Every paid consignment issues a cryptographically secure 6-digit OTP code to the recipient. Couriers cannot mark a parcel as DELIVERED without verifying this PIN.",
    accentColor: "emerald",
  },
  {
    icon: Bot,
    title: "Bilingual RAG AI Logistics Agent",
    tag: "English & Bangla Support",
    description:
      "Ask our floating AI assistant any question about hub phone numbers, volumetric pricing calculations, or live delivery status in natural English or বাংলা.",
    accentColor: "sky",
  },
  {
    icon: Truck,
    title: "Guaranteed Doorstep Collection",
    tag: "Fast Fleet Pickup",
    description:
      "No need to carry packages to a physical depot. Our automated dispatcher assigns the nearest on-duty motorbike or van rider to collect from your facility.",
    accentColor: "purple",
  },
  {
    icon: Clock,
    title: "Real-Time 8-Stage Lifecycle Tracker",
    tag: "Audit-Trail Verified",
    description:
      "Monitor every movement from ORDER_PLACED to doorstep handover. Timestamped milestone logs ensure complete accountability for high-value goods.",
    accentColor: "amber",
  },
  {
    icon: CreditCard,
    title: "Instant Stripe & COD Settlements",
    tag: "Secure Transactions",
    description:
      "Seamless checkout integration supporting international and domestic credit cards via Stripe, paired with guaranteed next-day merchant payouts for COD.",
    accentColor: "indigo",
  },
  {
    icon: Users,
    title: "Dedicated Courier Partner Portal",
    tag: "Fleet Mobility",
    description:
      "Field riders access a mobile-optimized dispatch queue with one-tap recipient calling, turn-by-turn hub navigation, and digital OTP input.",
    accentColor: "rose",
  },
];

export function FeaturesGridSection() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Enterprise-Grade Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            Engineered for Modern E-Commerce & Logistics
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Built from the ground up to eliminate package loss, streamline line-haul distribution, and provide customers with effortless transparency.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="rounded-3xl border border-border/80 bg-card/70 hover:bg-card hover:border-primary/40 hover:shadow-lg transition-all p-7 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <Icon className="size-6" />
                    </div>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/60">
                      {f.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Production Active & Monitored</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
