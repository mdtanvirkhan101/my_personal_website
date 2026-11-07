"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logVisitorTelemetry } from "@/actions/network-telemetry";

export function NetworkTelemetryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Non-blocking background telemetry packet ping
    logVisitorTelemetry(pathname).catch(() => {});
  }, [pathname]);

  return null;
}

