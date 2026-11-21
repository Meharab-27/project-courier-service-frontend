import { Spinner } from "@/components/ui/spinner";

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex w-[260px] flex-col justify-between border-r border-border/70 bg-card/60 p-4">
        <div className="space-y-6">
          {/* Logo placeholder */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
            </div>
          </div>

          {/* Badge placeholder */}
          <div className="h-8 rounded-lg bg-muted/60 animate-pulse" />

          {/* Nav item placeholders */}
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-2.5 bg-muted/40 animate-pulse"
              >
                <div className="size-5 rounded-md bg-muted" />
                <div className="h-3.5 w-24 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* User profile placeholder */}
        <div className="flex items-center gap-3 rounded-xl border border-border/50 p-2 bg-muted/30">
          <div className="size-9 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-28 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Topbar Skeleton */}
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 rounded bg-muted animate-pulse" />
            <div className="h-4 w-4 rounded bg-muted/50" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="size-8 rounded-full bg-muted animate-pulse" />
          </div>
        </header>

        {/* Content body placeholder */}
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded-lg bg-muted animate-pulse" />
              <div className="h-3.5 w-72 rounded bg-muted/60 animate-pulse" />
            </div>
            <Spinner className="size-5 text-primary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3"
              >
                <div className="size-8 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>

          <div className="h-72 rounded-2xl border border-border/60 bg-card/60 p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Spinner className="size-7 text-primary" />
            <p className="text-xs">Authenticating user portal...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
