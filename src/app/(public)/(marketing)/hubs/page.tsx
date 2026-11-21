"use client";

import {
  ArrowRight,
  Check,
  Compass,
  Copy,
  ExternalLink,
  Globe2,
  LocateFixed,
  MapPin,
  Navigation,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { IHub } from "@/api/hub.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { mergeHubsWithDefaults } from "@/constants";
import { useGetHubs } from "@/hooks/hub.hooks";

interface IHubWithDistance extends IHub {
  _distanceKm?: number | null;
}

// Haversine formula for distance in km
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PublicHubsPage() {
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const { data: hubsResponse, isLoading } = useGetHubs({ limit: 100 });
  const hubs: IHub[] = useMemo(() => {
    return mergeHubsWithDefaults(hubsResponse?.data);
  }, [hubsResponse?.data]);

  // Extract unique zones
  const zones = useMemo(() => {
    const set = new Set<string>();
    for (const h of hubs) {
      if (h.zone) set.add(h.zone.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [hubs]);

  // Request user geolocation to find nearest hub
  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      toast.add({
        title: "Geolocation Unavailable",
        description: "Your browser does not support geolocation.",
        type: "error",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
        toast.add({
          title: "Location Acquired",
          description: "Hubs have been sorted by nearest proximity to you.",
          type: "success",
        });
      },
      (err) => {
        setIsLocating(false);
        toast.add({
          title: "Location Access Denied",
          description:
            err.message ||
            "Please allow location permission to find nearest hubs.",
          type: "error",
        });
      },
      { timeout: 9000, enableHighAccuracy: true },
    );
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.add({
      title: "Copied to Clipboard",
      description: `${label}: ${text}`,
      type: "success",
    });
    setTimeout(() => {
      setCopiedText((prev) => (prev === text ? null : prev));
    }, 2000);
  };

  // Filter and sort hubs
  const filteredAndSortedHubs = useMemo<IHubWithDistance[]>(() => {
    const result: IHubWithDistance[] = hubs.filter((hub) => {
      // Zone match
      if (selectedZone !== "ALL") {
        if (hub.zone.toLowerCase() !== selectedZone.toLowerCase()) {
          return false;
        }
      }

      // Search match
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesName = hub.name?.toLowerCase().includes(query);
        const matchesZone = hub.zone?.toLowerCase().includes(query);
        const matchesCode = hub.code?.toLowerCase().includes(query);
        const matchesAddress = hub.address?.toLowerCase().includes(query);
        const matchesPhone = hub.contactNo?.toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesZone &&
          !matchesCode &&
          !matchesAddress &&
          !matchesPhone
        ) {
          return false;
        }
      }

      return true;
    });

    // If userLocation is available, calculate distance and sort
    if (userLocation) {
      return result
        .map((hub) => {
          let distanceKm: number | null = null;
          if (
            hub.latitude !== null &&
            hub.longitude !== null &&
            hub.latitude !== undefined &&
            hub.longitude !== undefined
          ) {
            distanceKm = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              Number(hub.latitude),
              Number(hub.longitude),
            );
          }
          return { ...hub, _distanceKm: distanceKm };
        })
        .sort((a, b) => {
          if (a._distanceKm === null || a._distanceKm === undefined) return 1;
          if (b._distanceKm === null || b._distanceKm === undefined) return -1;
          return a._distanceKm - b._distanceKm;
        });
    }

    return result;
  }, [hubs, selectedZone, search, userLocation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-primary/5 via-background to-background py-14 sm:py-20 px-4 sm:px-6">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Warehouse className="size-3.5" />
            <span>Nationwide Logistics Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-heading">
            Transit Hub & Coverage Directory
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Locate your nearest regional distribution station, drop-off point,
            and sorting warehouse with verified contact hotlines and live GPS
            map coordinates.
          </p>

          {/* Search Bar & Near Me Trigger */}
          <div className="mx-auto max-w-2xl pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 p-2 rounded-2xl bg-card border border-border/80 shadow-lg backdrop-blur-md">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by district, zone, hub name, or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-9 h-11 border-0 bg-transparent text-xs sm:text-sm focus-visible:ring-0 shadow-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFindNearest}
                disabled={isLocating}
                className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-semibold gap-2 border-primary/30 text-primary hover:bg-primary/10 shrink-0"
              >
                {isLocating ? (
                  <Spinner className="size-3.5 text-primary" />
                ) : (
                  <LocateFixed className="size-3.5" />
                )}
                <span>{userLocation ? "Location Set" : "Nearest Hub"}</span>
              </Button>
            </div>
          </div>

          {/* Zone Quick Filters */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setSelectedZone("ALL")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                selectedZone === "ALL"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card/70 text-muted-foreground hover:bg-muted border-border/70"
              }`}
            >
              All Zones ({hubs.length})
            </button>
            {zones.map((zone) => {
              const count = hubs.filter(
                (h) => h.zone.toLowerCase() === zone.toLowerCase(),
              ).length;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    selectedZone.toLowerCase() === zone.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card/70 text-muted-foreground hover:bg-muted border-border/70"
                  }`}
                >
                  {zone} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Network Highlights Strip */}
      <div className="border-b border-border/60 bg-muted/20 py-4 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6 text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong>{hubs.length} Active Stations</strong> nationwide
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Globe2 className="size-3.5 text-primary" />
              <span>{zones.length} Delivery Zones</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Insured Transit & Sorting</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 text-primary">
                <Spinner className="size-3" />
                <span>Syncing live data...</span>
              </span>
            )}
            <span>
              Showing <strong>{filteredAndSortedHubs.length}</strong> matching
              transit centers
            </span>
          </div>
        </div>
      </div>

      {/* Nearest Hub Banner (if location granted) */}
      {userLocation && filteredAndSortedHubs.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary/10 border border-primary/25 text-xs text-primary">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 shrink-0" />
              <span>
                Sorted by proximity from your GPS location. Closest station is{" "}
                <strong>{filteredAndSortedHubs[0].name}</strong>
                {filteredAndSortedHubs[0]._distanceKm !== undefined &&
                  filteredAndSortedHubs[0]._distanceKm !== null && (
                    <>
                      {" "}
                      (approx.{" "}
                      {Number(filteredAndSortedHubs[0]._distanceKm).toFixed(1)}{" "}
                      km away)
                    </>
                  )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUserLocation(null)}
              className="text-xs font-semibold hover:underline"
            >
              Reset Proximity
            </button>
          </div>
        </div>
      )}

      {/* Hub Directory Cards Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {isLoading && hubs.length === 0 ? (
          <div className="py-24 text-center">
            <Spinner className="size-8 text-primary mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">
              Loading transit network directory...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Synchronizing regional nodes and dispatch contacts
            </p>
          </div>
        ) : filteredAndSortedHubs.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
              <Warehouse className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                No Transit Hubs Found
              </h3>
              <p className="text-xs text-muted-foreground">
                We couldn't find any hub stations matching your filter criteria:
                "{search || selectedZone}".
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedZone("ALL");
              }}
              className="rounded-xl text-xs gap-1.5"
            >
              <X className="size-3.5" />
              <span>Reset Search Filters</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedHubs.map((hub) => {
              const hasCoordinates =
                hub.latitude !== null &&
                hub.longitude !== null &&
                hub.latitude !== undefined &&
                hub.longitude !== undefined;
              const mapsUrl = hasCoordinates
                ? `https://www.google.com/maps?q=${hub.latitude},${hub.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${hub.name}, ${hub.address}, ${hub.zone}`,
                  )}`;
              const distance = hub._distanceKm;

              return (
                <Card
                  key={hub.id}
                  className="group rounded-2xl border-border/80 bg-card/70 hover:bg-card hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 backdrop-blur-xs flex flex-col justify-between overflow-hidden"
                >
                  <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    {/* Top row: Icon, Station Badge, Code */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105 shadow-2xs">
                          <Warehouse className="size-5" />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Active Node
                          </span>
                          {hub.code && (
                            <span className="font-mono text-[10px] font-bold rounded-md bg-muted px-2 py-0.5 text-muted-foreground border border-border/60">
                              {hub.code}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Zone Tag */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground font-heading group-hover:text-primary transition-colors">
                            {hub.name}
                          </h3>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {hub.zone} Zone
                          </span>
                          {distance !== undefined && distance !== null && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                              <Navigation className="size-3 text-primary" />
                              <span>{Number(distance).toFixed(1)} km away</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Physical Address */}
                      <div className="flex items-start gap-2 pt-1 text-xs text-muted-foreground leading-relaxed">
                        <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                        <span className="text-foreground/90">
                          {hub.address}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Contact Phone & Coordinates info */}
                    <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
                      {/* Phone hotline */}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <Phone className="size-3" />
                          <span>Hotline:</span>
                        </span>
                        {hub.contactNo ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${hub.contactNo}`}
                              className="font-mono font-bold text-foreground hover:text-primary transition-colors"
                            >
                              {hub.contactNo}
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(hub.contactNo || "", "Hotline")
                              }
                              className="p-1 rounded text-muted-foreground hover:text-foreground"
                              title="Copy Number"
                            >
                              {copiedText === hub.contactNo ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Customer Support 24/7
                          </span>
                        )}
                      </div>

                      {/* GPS Coordinates */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Compass className="size-3" />
                          <span>GPS Coords:</span>
                        </span>
                        {hasCoordinates ? (
                          <span className="font-mono font-medium text-muted-foreground">
                            {Number(hub.latitude).toFixed(4)},{" "}
                            {Number(hub.longitude).toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Regional Center
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 rounded-xl text-xs font-semibold gap-1.5 border-border/80 hover:border-primary/40 hover:text-primary"
                        >
                          <Compass className="size-3.5" />
                          <span>Open in Maps</span>
                          <ExternalLink className="size-2.5 opacity-60" />
                        </Button>
                      </a>

                      <Link
                        href={`/book-parcel?originHubId=${hub.id}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full h-8 rounded-xl text-xs font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
                        >
                          <span>Send Parcel</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Dispatch Info Banner */}
      <section className="border-t border-border/60 bg-muted/20 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-10 text-center space-y-4 backdrop-blur-md shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <Truck className="size-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
            Need to book a parcel from any of our transit hubs?
          </h2>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-muted-foreground">
            Calculate instant zone-to-zone shipping rates, verify chargeable
            weight, and book door-to-door courier deliveries within minutes.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/book-parcel">
              <Button className="rounded-xl text-xs font-bold px-6 h-10 gap-2">
                <Package className="size-4" />
                <span>Calculate & Book Parcel</span>
              </Button>
            </Link>
            <Link href="/track">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-semibold px-6 h-10 gap-2"
              >
                <Compass className="size-4" />
                <span>Track Consignment</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
