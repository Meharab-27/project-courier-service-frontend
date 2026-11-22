import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Express Courier | Nationwide Parcel Delivery Bangladesh",
    template: "%s | Express Courier",
  },
  description:
    "Express Courier is a next-generation parcel logistics platform covering all 64 districts of Bangladesh across 62 strategic distribution hubs. Book parcels, track deliveries, and get real-time updates.",
  keywords: [
    "courier service",
    "parcel delivery",
    "Bangladesh courier",
    "package tracking",
    "express delivery",
    "nationwide logistics",
  ],
  authors: [{ name: "Express Courier" }],
  creator: "Express Courier Service Bangladesh",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <Providers>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
