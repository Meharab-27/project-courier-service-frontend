export default function PublicLoading() {
  return (
    <div className="flex min-h-screen flex-col animate-pulse">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 h-16 sm:h-20 flex items-center px-4 sm:px-6 justify-between">
        <div className="h-9 w-36 rounded-xl bg-muted" />
        <div className="h-10 w-64 rounded-full bg-muted hidden md:block" />
        <div className="h-9 w-24 rounded-lg bg-muted" />
      </div>

      {/* Hero section skeleton */}
      <div className="flex flex-col items-center justify-center gap-6 py-24 px-4">
        <div className="h-5 w-32 rounded-full bg-muted" />
        <div className="h-12 w-3/4 max-w-2xl rounded-xl bg-muted" />
        <div className="h-12 w-2/3 max-w-xl rounded-xl bg-muted/60" />
        <div className="h-5 w-1/2 max-w-md rounded bg-muted/40" />
        <div className="flex gap-3 mt-2">
          <div className="h-11 w-36 rounded-xl bg-muted" />
          <div className="h-11 w-36 rounded-xl bg-muted/60" />
        </div>
      </div>

      {/* Content cards skeleton */}
      <div className="container mx-auto max-w-7xl px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/60 bg-card/70 p-7 space-y-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted/60" />
            <div className="h-4 w-5/6 rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
