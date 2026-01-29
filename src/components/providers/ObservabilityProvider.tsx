"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logClientEvent } from "@/lib/observability/logger";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ObservabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const lastPathRef = useRef<string | null>(null);
  const lastThemeRef = useRef<typeof theme | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logClientEvent("error", "window_error", event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === "string"
            ? event.reason
            : "Unhandled promise rejection";
      logClientEvent("error", "unhandled_rejection", reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;

    const supportedEntries = PerformanceObserver.supportedEntryTypes ?? [];
    const observers: PerformanceObserver[] = [];

    const safeObserve = (type: string) => {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (type === "largest-contentful-paint") {
              logClientEvent("info", "web_vital", "LCP", {
                value: entry.startTime,
                name: entry.name,
              });
            }
            if (type === "first-contentful-paint") {
              logClientEvent("info", "web_vital", "FCP", {
                value: entry.startTime,
                name: entry.name,
              });
            }
            if (type === "layout-shift") {
              const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
              if (shift.hadRecentInput) return;
              logClientEvent("info", "web_vital", "CLS", {
                value: shift.value ?? 0,
                name: entry.name,
              });
            }
          });
        });
        observer.observe({ type, buffered: true });
        observers.push(observer);
      } catch {
        // ignore unsupported entry type
      }
    };

    if (supportedEntries.includes("largest-contentful-paint")) {
      safeObserve("largest-contentful-paint");
    }
    if (supportedEntries.includes("first-contentful-paint")) {
      safeObserve("first-contentful-paint");
    }
    if (supportedEntries.includes("layout-shift")) {
      safeObserve("layout-shift");
    }

    const timing = performance.getEntriesByType("navigation");
    if (timing.length > 0) {
      const nav = timing[0] as PerformanceNavigationTiming;
      logClientEvent("info", "navigation_timing", "Navigation timing", {
        domContentLoaded: nav.domContentLoadedEventEnd,
        loadEventEnd: nav.loadEventEnd,
        responseEnd: nav.responseEnd,
      });
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  useEffect(() => {
    if (!pathname || lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    logClientEvent("info", "page_view", "Page view", { pathname });
  }, [pathname]);

  useEffect(() => {
    if (!theme || lastThemeRef.current === theme) return;
    lastThemeRef.current = theme;
    logClientEvent("info", "theme_change", "Theme changed", { theme });
  }, [theme]);

  return children;
}
