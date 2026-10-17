import Link from "next/link";
import { Suspense } from "react";
import VerifyAccountForm from "@/components/form/verify-account-form";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Verify Account | Courier Service",
  description:
    "Verify your Courier Service account using your email and 6-digit verification code.",
};

export default function AccountVerifyPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            Courier Service
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md">
            <Suspense
              fallback={
                <div className="flex justify-center p-8">
                  <Spinner />
                </div>
              }
            >
              <VerifyAccountForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        {/** biome-ignore lint/performance/noImgElement: static decorative illustration */}
        <img
          src="/courier-service.jpeg"
          alt="Courier Service"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
