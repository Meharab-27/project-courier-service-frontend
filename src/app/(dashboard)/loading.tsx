export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted/60" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card/70 p-5 space-y-3"
          >
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card/70 overflow-hidden">
        <div className="p-4 border-b border-border/60">
          <div className="h-5 w-32 rounded bg-muted" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 flex-1 rounded bg-muted/60" />
              <div className="h-4 w-20 rounded bg-muted/40" />
              <div className="h-6 w-16 rounded-full bg-muted/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
