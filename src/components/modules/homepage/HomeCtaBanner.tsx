"use client";

import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Compass,
  PackagePlus,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export function HomeCtaBanner() {
  return (
    <section className="py-20 bg-muted/30 border-t border-border/70 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Customers & Merchants */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-8 sm:p-10 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                <PackagePlus className="size-3.5" />
                <span>For Individuals & Online Businesses</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
                Ready to Send Your First Parcel?
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience next-day delivery, free doorstep pickup from your home or store, and 100% verified recipient handover OTP.
              </p>

              <div className="space-y-2 pt-2 text-xs text-foreground font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Stripe Card Checkout & Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Transparent rates starting at only ৳60 BDT</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
              <Link href="/book-parcel">
                <Button
                  size="lg"
                  className="rounded-xl h-11 px-6 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-2"
                >
                  <PackagePlus className="size-4" />
                  <span>Book a Parcel Now</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <Link href="/track">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-11 px-5 font-semibold text-xs border-border/80 bg-background/50 gap-2"
                >
                  <Compass className="size-4" />
                  <span>Track Consignment</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: For Couriers & Fleet Drivers */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/10 p-8 sm:p-10 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Truck className="size-3.5" />
                <span>Earn on Your Own Schedule</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
                Join Our Nationwide Courier Fleet
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Have a motorbike, bicycle, van, or cargo truck? Become a verified fleet partner, receive daily assigned delivery batches, and earn competitive payouts.
              </p>

              <div className="space-y-2 pt-2 text-xs text-foreground font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Weekly direct deposits & transparent delivery incentives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Dedicated mobile portal with turn-by-turn navigation</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
              <Link href="/courier-apply">
                <Button
                  size="lg"
                  className="rounded-xl h-11 px-6 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 gap-2"
                >
                  <Truck className="size-4" />
                  <span>Apply as Courier Partner</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <Link href="/hubs">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-11 px-5 font-semibold text-xs border-border/80 bg-background/50 gap-2"
                >
                  <span>Locate Regional Hubs</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
