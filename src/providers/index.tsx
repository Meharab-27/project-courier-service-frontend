"use client";
import React, { type ReactNode } from "react";
import GoogleAuthProvider from "./google.provider";
import QueryProvider from "./query.provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleAuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </GoogleAuthProvider>
  );
}
