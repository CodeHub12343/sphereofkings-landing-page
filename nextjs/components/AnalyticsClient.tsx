"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a pageview on every route change + sends web-vitals when the
// browser's performance observer reports them. Opt-out by not loading
// this component — it is additive, not required.

function sessionId(): string {
  try {
    const k = "sok.anon-session";
    const existing = localStorage.getItem(k);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(k, fresh);
    return fresh;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

function post(body: Record<string, unknown>) {
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      navigator.sendBeacon("/api/analytics", blob);
    } else {
      fetch("/api/analytics", {
        method: "POST", keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    }
  } catch {}
}

export default function AnalyticsClient() {
  const pathname = usePathname();
  const anon = typeof window !== "undefined" ? sessionId() : "";

  useEffect(() => {
    if (!pathname) return;
    post({ type: "pageview", path: pathname, anonymousSessionId: anon });
  }, [pathname, anon]);

  useEffect(() => {
    // Lightweight web-vitals reporter. Avoids the web-vitals package
    // dependency; LCP, CLS, FID are enough for a signal.
    if (typeof PerformanceObserver === "undefined") return;
    const cleanup: Array<() => void> = [];
    try {
      const lcp = new PerformanceObserver((list) => {
        const entry = list.getEntries().at(-1);
        if (entry) {
          post({ type: "web-vitals", path: pathname, anonymousSessionId: anon,
                 payload: { metric: "LCP", value: Math.round(entry.startTime) } });
        }
      });
      lcp.observe({ type: "largest-contentful-paint", buffered: true });
      cleanup.push(() => lcp.disconnect());
    } catch {}
    try {
      let cls = 0;
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          const e = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (!e.hadRecentInput) cls += e.value ?? 0;
        }
      });
      obs.observe({ type: "layout-shift", buffered: true });
      const flush = () => post({ type: "web-vitals", path: pathname, anonymousSessionId: anon,
                                  payload: { metric: "CLS", value: Math.round(cls * 1000) / 1000 } });
      window.addEventListener("pagehide", flush, { once: true });
      cleanup.push(() => { obs.disconnect(); window.removeEventListener("pagehide", flush); });
    } catch {}
    return () => cleanup.forEach((fn) => fn());
  }, [pathname, anon]);

  return null;
}
