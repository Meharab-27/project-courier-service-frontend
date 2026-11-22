import {
  Compass,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-card/60 backdrop-blur-md text-foreground">
      {/* Top Footer Grid */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Truck className="size-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-foreground font-heading">
                Express Courier
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Next-generation nationwide parcel logistics platform connecting all 64 districts in Bangladesh across 62 strategic distribution hubs with cryptographic OTP delivery verification.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>Central Logistics HQ: Uttara Sector 4, Dhaka-1230</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span>Nationwide Helpline: +880 1711-000101 (24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-primary shrink-0" />
                <span>Enterprise Support: support@expresscourier.com.bd</span>
              </div>
            </div>
          </div>

          {/* Quick Links: Services (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Shipping & Tracking
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/book-parcel" className="hover:text-primary transition-colors">
                  Book a Parcel
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-primary transition-colors">
                  Track Consignment
                </Link>
              </li>
              <li>
                <Link href="/hubs" className="hover:text-primary transition-colors">
                  62 Nationwide Hubs
                </Link>
              </li>
              <li>
                <Link href="/book-parcel" className="hover:text-primary transition-colors">
                  Rate Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Fleet Partners (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Courier Fleet & Partners
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/courier-apply" className="hover:text-primary transition-colors font-semibold text-emerald-600 dark:text-emerald-400">
                  Apply as Fleet Courier
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Courier Dispatch Login
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-primary transition-colors">
                  Fleet Safety & Standards
                </Link>
              </li>
              <li>
                <Link href="/hubs" className="hover:text-primary transition-colors">
                  Regional Sorting Facilities
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Security Badge (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Security Guarantee
            </h4>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4" />
                <span>6-Digit Handover OTP</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Parcels are strictly protected against theft. Delivery is confirmed only when the recipient provides their verified security PIN.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border/60">
                <CreditCard className="size-3" />
                <span>Stripe 256-bit SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-border/60 py-6 bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Express Courier Service Bangladesh. All rights reserved.</p>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Delivery SLA
            </Link>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
