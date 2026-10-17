"use client";

import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function CourierHero() {
  const [trackingId, setTrackingId] = useState("");
  const router = useRouter();

  // কুরিয়ার সার্ভিসের সাথে মানানসই ফ্লিপিং শব্দ
  const flipWords = ["Faster", "Safer", "Smarter", "Reliable"];

  const handleTrackParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    router.push(`/track?id=${trackingId.trim()}`);
  };

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24 lg:py-28">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-full max-w-5xl -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* বাম পাশের অংশ: হেডলাইন, ট্র্যাকিং বার এবং CTA */}
          <div className="flex flex-col items-start text-left lg:col-span-7">
            {/* Top Trust Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-xs">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Delivering across all 64 districts in Bangladesh</span>
            </div>

            {/* Animated Heading with ContainerTextFlip */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "relative mb-6 max-w-2xl text-left text-4xl leading-tight font-bold tracking-tight text-zinc-800 sm:text-5xl md:text-6xl dark:text-zinc-100",
              )}
              layout
            >
              <div className="inline-block leading-snug">
                Delivering your parcels 10x{" "}
                <ContainerTextFlip words={flipWords} />
              </div>
            </motion.h1>

            {/* Subheadline / Description */}
            <p className="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Experience seamless doorstep pickup, real-time parcel tracking,
              and guaranteed next-day Cash on Delivery (COD) settlement for your
              business and personal needs.
            </p>

            {/* Quick Parcel Tracking Bar */}
            <form
              onSubmit={handleTrackParcel}
              className="mb-8 flex w-full max-w-lg flex-col gap-2.5 rounded-2xl border border-border/70 bg-card p-2 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter tracking ID (e.g. CR-84920)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="h-11 border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 rounded-xl px-6 font-medium"
              >
                Track Parcel
              </Button>
            </form>

            {/* Secondary Action Links */}
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <Link
                href="/book-parcel"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 rounded-xl gap-2 px-5 text-sm font-medium",
                )}
              >
                <Package className="size-4" />
                Send a Parcel
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-11 rounded-xl gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium",
                )}
              >
                Become a Merchant
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Key Highlights / Stats */}
            <div className="grid w-full max-w-lg grid-cols-3 gap-4 border-t border-border/60 pt-6">
              <div>
                <p className="text-2xl font-bold text-foreground">64</p>
                <p className="text-xs text-muted-foreground">
                  Districts Covered
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">99.4%</p>
                <p className="text-xs text-muted-foreground">
                  Delivery Success
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24 hrs</p>
                <p className="text-xs text-muted-foreground">Fast COD Payout</p>
              </div>
            </div>
          </div>

          {/* ডান পাশের অংশ: স্ট্যাটিক লাইভ ট্র্যাকিং প্রিভিউ কার্ড */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-2xl border border-border/70 bg-card/95 p-6 shadow-xl backdrop-blur-xs">
              {/* Card Header */}
              <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Tracking ID
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      #BD-908421
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  In Transit
                </span>
              </div>

              {/* Delivery Timeline Steps */}
              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Picked up from Merchant
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dhaka Hub • 10:30 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Arrived at Sorting Facility
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Central Warehouse • 01:15 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Clock className="size-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Out for Delivery
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rider is on the way to destination
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 opacity-50">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Delivered to Customer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estimated by Today, 05:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Pills inside Card */}
              <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    100% Insured
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Banknote className="size-4 text-emerald-500" />
                  <span className="text-xs font-medium text-foreground">
                    0% COD Charge*
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { CourierHero as Hero };
