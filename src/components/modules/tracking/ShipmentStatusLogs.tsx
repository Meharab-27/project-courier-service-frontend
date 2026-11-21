"use client";

import { ArrowRight, Clock, FileText, History, User } from "lucide-react";
import type { IShipmentStatusLog } from "@/api";
import { cn } from "@/lib/utils";

interface ShipmentStatusLogsProps {
  logs?: IShipmentStatusLog[];
  className?: string;
}

export function ShipmentStatusLogs({
  logs = [],
  className,
}: ShipmentStatusLogsProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
        <History className="size-6 mx-auto mb-2 text-muted-foreground/60" />
        <p className="font-semibold text-foreground">No Transit Logs Yet</p>
        <p className="mt-0.5">
          Detailed chronological audit events will populate as the shipment
          moves through our courier network.
        </p>
      </div>
    );
  }

  // Sort chronologically (latest first for intuitive timeline reading)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <FileText className="size-4 text-primary" />
        <h4 className="text-sm font-bold text-foreground">
          Chronological Audit Logs ({sortedLogs.length})
        </h4>
      </div>

      <div className="space-y-2.5">
        {sortedLogs.map((log, index) => {
          const actorName = log.performedBy?.name || "System Automated";

          return (
            <div
              key={log.id || `${log.createdAt}-${index}`}
              className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs text-xs space-y-2 transition-colors hover:border-border"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Status Transition Pill */}
                <div className="flex items-center gap-1.5 font-medium">
                  {log.fromStatus ? (
                    <>
                      <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {log.fromStatus}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                    </>
                  ) : null}
                  <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                    {log.toStatus}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3 text-muted-foreground" />
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>

              {/* Remarks */}
              {log.remarks && (
                <p className="text-foreground/90 text-xs leading-relaxed">
                  {log.remarks}
                </p>
              )}

              {/* Actor / Performed By */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                <span className="flex items-center gap-1">
                  <User className="size-3 text-primary" />
                  Logged by:{" "}
                  <strong className="text-foreground font-semibold">
                    {actorName}
                  </strong>
                </span>

                {log.performedBy?.role && (
                  <span className="rounded bg-muted px-1.5 py-0.2 font-mono uppercase text-[9px]">
                    {log.performedBy.role}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
