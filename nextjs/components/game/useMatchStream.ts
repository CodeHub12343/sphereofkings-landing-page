"use client";

import { useEffect, useRef, useState } from "react";
import type { Match } from "@/lib/db/collections/matches";

// Subscribes to a match's Pusher channel when configured, falls back
// to polling every 2s otherwise. Returns the latest Match + a
// `connectionState` the UI can use to draw a disconnection banner.

export type ConnState = "connecting" | "live" | "polling" | "offline";

interface MatchEvent {
  state?: string;
  toMoveSide?: "red-or-white" | "black";
  finished?: boolean;
  outcome?: string;
  winnerId?: string;
}

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

export function useMatchStream(matchId: string, initial: Match | null) {
  const [match, setMatch] = useState<Match | null>(initial);
  const [conn, setConn] = useState<ConnState>("connecting");
  const refetchRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    // The server's broadcast gives us a lightweight patch; we fetch
    // the full match whenever any event arrives so we always reconcile
    // against the authoritative record.
    const refetch = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) setConn("offline");
          return;
        }
        const data = (await res.json()) as { match: Match };
        if (!cancelled) setMatch(data.match);
      } catch {
        if (!cancelled) setConn("offline");
      }
    };
    refetchRef.current = refetch;

    const startPolling = () => {
      setConn("polling");
      pollTimer = setInterval(refetch, 2000);
    };

    const useLive = async () => {
      if (!PUSHER_KEY || !PUSHER_CLUSTER) {
        startPolling();
        return;
      }
      try {
        const mod = await import("pusher-js");
        if (cancelled) return;
        const Pusher = mod.default;
        const p = new Pusher(PUSHER_KEY, {
          cluster: PUSHER_CLUSTER,
          channelAuthorization: {
            endpoint: "/api/realtime/auth",
            transport: "ajax",
          },
        });
        const channel = p.subscribe(`match-${matchId}`);
        channel.bind("move", (data: MatchEvent) => {
          if (!data) { void refetch(); return; }
          // Opportunistic in-place patch; refetch for canonical state.
          setMatch((prev) => (prev ? { ...prev, state: data.state ?? prev.state,
            toMoveSide: data.toMoveSide ?? prev.toMoveSide,
            status: data.finished ? "finished" : prev.status,
            winnerId: data.winnerId ?? prev.winnerId,
            outcome: data.outcome ?? prev.outcome } : prev));
          void refetch();
        });
        channel.bind("resign", () => { void refetch(); });
        channel.bind("match-started", () => { void refetch(); });
        channel.bind("match-declined", () => { void refetch(); });

        p.connection.bind("connected", () => !cancelled && setConn("live"));
        p.connection.bind("unavailable", () => !cancelled && setConn("polling"));
        p.connection.bind("disconnected", () => !cancelled && setConn("polling"));
        p.connection.bind("failed", () => !cancelled && setConn("offline"));

        // A safety-net low-rate poll in case of silent event loss.
        pollTimer = setInterval(refetch, 10_000);

        return () => { p.unsubscribe(`match-${matchId}`); p.disconnect(); };
      } catch {
        startPolling();
      }
    };

    void refetch();
    const live = useLive();

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      void live.then((cleanup) => cleanup?.());
    };
  }, [matchId]);

  return { match, conn, refetch: () => refetchRef.current() };
}
