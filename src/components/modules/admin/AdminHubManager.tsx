"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  Copy,
  ExternalLink,
  Filter,
  Globe2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Warehouse,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { IHub } from "@/api/hub.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { mergeHubsWithDefaults } from "@/constants";
import { useGetHubs } from "@/hooks/hub.hooks";
import { cn } from "@/lib/utils";
import { CreateHubDialog } from "./CreateHubDialog";
import { EditHubDrawer } from "./EditHubDrawer";

export function AdminHubManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dialog and Drawer states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<IHub | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Query hubs from backend GET /api/v1/hubs
  const {
    data: hubsResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useGetHubs({
    search: searchTerm || undefined,
    zone: selectedZone !== "ALL" ? selectedZone : undefined,
    limit: 100,
  });

  const allHubs = useMemo(() => {
    return mergeHubsWithDefaults(hubsResponse?.data);
  }, [hubsResponse?.data]);

  // Extract all unique zones from loaded hubs for the zone filter dropdown
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    for (const h of allHubs) {
      if (h.zone) set.add(h.zone.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allHubs]);

  // Client-side filtering in case backend doesn't perform search/zone filtering
  const filteredHubs = useMemo(() => {
    return allHubs.filter((hub) => {
      // Zone match
      if (selectedZone !== "ALL") {
        if (hub.zone.toLowerCase() !== selectedZone.toLowerCase()) {
          return false;
        }
      }

      // Search match (name, code, address)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = hub.name?.toLowerCase().includes(query);
        const matchesCode = hub.code?.toLowerCase().includes(query);
        const matchesAddress = hub.address?.toLowerCase().includes(query);
        const matchesContact = hub.contactNo?.toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesCode &&
          !matchesAddress &&
          !matchesContact
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allHubs, selectedZone, searchTerm]);

  // Pagination calculation
  const totalItems = filteredHubs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedHubs = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredHubs.slice(startIndex, startIndex + pageSize);
  }, [filteredHubs, validCurrentPage, pageSize]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = allHubs.length;
    const zoneCount = new Set(allHubs.map((h) => h.zone.toLowerCase())).size;
    const geoCoded = allHubs.filter(
      (h) =>
        h.latitude !== null && h.longitude !== null && h.latitude !== undefined,
    ).length;
    const withHotline = allHubs.filter((h) => Boolean(h.contactNo)).length;

    return { total, zoneCount, geoCoded, withHotline };
  }, [allHubs]);

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

  const handleOpenEdit = (hub: IHub) => {
    setEditingHub(hub);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Hub Network Management
            </h1>
            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Admin Ops
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure regional transit stations, geographic zones, sorting
            nodes, and contact points
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                isRefetching && "animate-spin text-purple-600",
              )}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/25"
          >
            <Plus className="size-4" />
            <span>Create Hub</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Hubs
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.total}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Warehouse className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Zones
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.zoneCount}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Globe2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Geo-Coded Stations
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.geoCoded}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Compass className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-2xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Direct Hotlines
              </p>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                {metrics.withHotline}
              </h3>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Phone className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="rounded-2xl border-border/80 bg-card/60 shadow-2xs backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search hubs by name, code, or street address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 rounded-xl border-border/80 bg-background/70 text-xs h-9"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Zone Filter & Page Size */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/70 px-2.5 py-1 rounded-xl">
              <Filter className="size-3.5" />
              <span className="font-medium">Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Zones ({allHubs.length})</option>
                {uniqueZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/70 px-2.5 py-1 rounded-xl">
              <span className="font-medium">Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Hub & Station</th>
                <th className="py-3 px-4">Zone / District</th>
                <th className="py-3 px-4">Physical Address</th>
                <th className="py-3 px-4">Contact Hotline</th>
                <th className="py-3 px-4">Map Coordinates</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Spinner className="size-6 text-purple-600 mx-auto mb-2" />
                    <span>Loading transit hubs database...</span>
                  </td>
                </tr>
              ) : paginatedHubs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <Warehouse className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="font-semibold text-foreground text-sm">
                      No matching hubs found
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try clearing search filters or create a new hub entry.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-4 rounded-xl text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="size-3.5" />
                      <span>Create First Hub</span>
                    </Button>
                  </td>
                </tr>
              ) : (
                paginatedHubs.map((hub) => {
                  const hasCoordinates =
                    hub.latitude !== null &&
                    hub.longitude !== null &&
                    hub.latitude !== undefined &&
                    hub.longitude !== undefined;
                  const mapsUrl = hasCoordinates
                    ? `https://www.google.com/maps?q=${hub.latitude},${hub.longitude}`
                    : null;

                  return (
                    <tr
                      key={hub.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* 1. Hub name & Code */}
                      <td className="py-3.5 px-4 align-top min-w-[180px]">
                        <div className="flex items-start gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5">
                            <Warehouse className="size-4" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight">
                              {hub.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {hub.code ? (
                                <span className="font-mono text-[10px] font-bold rounded-md bg-muted px-2 py-0.5 text-muted-foreground border border-border/60">
                                  {hub.code}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">
                                  No code
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCopy(hub.id, "Hub ID")}
                                title="Copy Hub ID"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {copiedText === hub.id ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3 opacity-60 hover:opacity-100" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Zone */}
                      <td className="py-3.5 px-4 align-top min-w-[120px]">
                        <span className="inline-flex items-center rounded-md bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                          {hub.zone}
                        </span>
                      </td>

                      {/* 3. Physical Address */}
                      <td className="py-3.5 px-4 align-top max-w-[280px]">
                        <div className="flex items-start gap-1.5 text-muted-foreground text-xs leading-relaxed">
                          <MapPin className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                          <span className="text-foreground/90">
                            {hub.address}
                          </span>
                        </div>
                      </td>

                      {/* 4. Contact No */}
                      <td className="py-3.5 px-4 align-top min-w-[150px]">
                        {hub.contactNo ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${hub.contactNo}`}
                              className="font-mono text-xs font-medium text-foreground hover:text-purple-600 transition-colors flex items-center gap-1.5"
                            >
                              <Phone className="size-3.5 text-purple-600" />
                              <span>{hub.contactNo}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(hub.contactNo || "", "Phone")
                              }
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy Phone"
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
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* 5. Coordinates */}
                      <td className="py-3.5 px-4 align-top min-w-[160px]">
                        {hasCoordinates ? (
                          <div className="space-y-1">
                            <div className="font-mono text-[11px] text-muted-foreground">
                              <span>{Number(hub.latitude).toFixed(4)}</span>,{" "}
                              <span>{Number(hub.longitude).toFixed(4)}</span>
                            </div>
                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                              >
                                <Compass className="size-3" />
                                <span>Google Maps</span>
                                <ExternalLink className="size-2.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Not mapped
                          </span>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 align-top text-right min-w-[110px]">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(hub)}
                          className="h-8 rounded-xl text-xs font-semibold gap-1.5 hover:border-purple-600/40 hover:text-purple-600"
                        >
                          <Pencil className="size-3.5" />
                          <span>Edit</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <strong>
              {totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>{Math.min(validCurrentPage * pageSize, totalItems)}</strong>{" "}
            of <strong>{totalItems}</strong> transit hubs
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage <= 1}
              className="h-7 w-7 p-0 rounded-lg"
              title="First Page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              className="h-7 w-7 p-0 rounded-lg"
              title="Previous Page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            <span className="px-2 text-xs font-semibold text-foreground">
              Page {validCurrentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className="h-7 w-7 p-0 rounded-lg"
              title="Next Page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className="h-7 w-7 p-0 rounded-lg"
              title="Last Page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* "Create Hub" Dialog */}
      <CreateHubDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* "Edit Hub" Drawer */}
      <EditHubDrawer
        hub={editingHub}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingHub(null);
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
