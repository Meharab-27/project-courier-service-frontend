"use client";

import {
  ArrowRight,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Search,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ALL_HUBS } from "@/constants/hubs.constant";
import { cn } from "@/lib/utils";

const DIVISION_FILTERS = [
  "ALL",
  "Dhaka Metro",
  "Dhaka Division",
  "Chittagong Division",
  "Rajshahi Division",
  "Khulna Division",
  "Barisal Division",
  "Sylhet Division",
  "Rangpur Division",
  "Mymensingh Division",
] as const;

export function HubNetworkShowcase() {
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHubs = useMemo(() => {
    return ALL_HUBS.filter((hub) => {
      if (selectedDivision !== "ALL" && hub.zone !== selectedDivision) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = hub.name.toLowerCase().includes(q);
        const matchesCode = hub.code.toLowerCase().includes(q);
        const matchesAddress = hub.address.toLowerCase().includes(q);
        const matchesZone = hub.zone.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesAddress || matchesZone;
      }
      return true;
    });
  }, [selectedDivision, searchTerm]);

  // Show up to 8 hubs in preview, with a link to /hubs
  const previewHubs = filteredHubs.slice(0, 8);

  return (
    <section className="py-20 bg-muted/20 border-t border-border/70 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Warehouse className="size-3.5" />
              <span>Nationwide Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
              62 Strategic Transit Hubs Across Bangladesh
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our regional distribution centers connect 64 districts with daily overnight line-hauls, doorstep pickup fleets, and localized parcel sortation.
            </p>
          </div>

          <Link href="/hubs">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl gap-2 font-bold text-xs border-border/80 bg-card/60 hover:bg-card"
            >
              <span>Explore All 62 Hubs Directory</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {/* Division Filter Pills & Search Bar */}
        <div className="space-y-4 mb-8">
          {/* Division Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DIVISION_FILTERS.map((div) => {
              const isActive = selectedDivision === div;
              const count =
                div === "ALL"
                  ? ALL_HUBS.length
                  : ALL_HUBS.filter((h) => h.zone === div).length;

              return (
                <button
                  key={div}
                  type="button"
                  onClick={() => setSelectedDivision(div)}
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70",
                  )}
                >
                  <span>{div}</span>
                  <span
                    className={cn(
                      "text-[10px] rounded-full px-1.5 py-0.2 font-mono",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by hub name, code (e.g. HUB-DHA-01), or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 rounded-xl text-xs bg-card/70 border-border/80"
            />
          </div>
        </div>

        {/* Hub Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewHubs.map((hub) => (
            <Card
              key={hub.code}
              className="rounded-2xl border border-border/80 bg-card/70 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all p-4 space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-extrabold uppercase bg-muted px-2 py-0.5 rounded text-muted-foreground group-hover:text-primary transition-colors">
                    {hub.code}
                  </span>
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {hub.zone}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {hub.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground flex items-start gap-1 mt-1 leading-snug">
                    <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{hub.address}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <a
                  href={`tel:${hub.contactNo}`}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Phone className="size-3" />
                  <span>{hub.contactNo}</span>
                </a>

                {hub.latitude && hub.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${hub.latitude},${hub.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-[11px]"
                    title="View on Google Maps"
                  >
                    <span>Maps</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* View All Callout */}
        <div className="mt-8 text-center">
          <Link
            href="/hubs"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
          >
            <span>Showing {previewHubs.length} of {ALL_HUBS.length} transit hubs. Click to browse the complete interactive nationwide hub directory →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
