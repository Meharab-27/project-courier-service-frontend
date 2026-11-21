"use client";

import { usePathname } from "next/navigation";
import { FloatingChatWidget } from "./FloatingChatWidget";

/**
 * Conditionally mounts the FloatingChatWidget ONLY on:
 * 1. Home page: pathname === "/"
 * 2. Hubs page: pathname.startsWith("/hub")
 */
export function ChatWidgetMount() {
  const pathname = usePathname();

  // Render strictly on Home ("/") and Hubs ("/hubs", "/hub/*")
  const isAllowed = pathname === "/" || pathname?.startsWith("/hub");

  if (!isAllowed) {
    return null;
  }

  return <FloatingChatWidget />;
}

