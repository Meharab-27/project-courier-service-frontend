"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe } from "@/hooks";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: userResponse, isLoading } = useGetMe();
  const user = userResponse?.data;

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "COURIER") {
        router.replace("/courier");
      } else {
        router.replace("/customer");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="size-8 text-primary" />
      <p className="text-xs font-medium">Navigating to your portal...</p>
    </div>
  );
}
