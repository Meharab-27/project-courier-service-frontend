import { PackageSearch, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        {/* Icon */}
        <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <PackageSearch className="size-10" />
        </div>

        {/* Error Code */}
        <p className="text-7xl font-black tracking-tight text-foreground/10 select-none">
          404
        </p>

        {/* Heading */}
        <div className="space-y-2 -mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Parcel Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for has been moved, deleted, or never
            existed. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full gap-2 rounded-xl">
              <Home className="size-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/track" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2 rounded-xl">
              <ArrowLeft className="size-4" />
              Track a Parcel
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
