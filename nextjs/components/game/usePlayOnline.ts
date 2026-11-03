"use client";

// Client side of online play: the quick-match search loop and invite
// creation. Shared by the app home screen and the /matches panel.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameId } from "@/lib/db/collections/players";

const HEARTBEAT_MS = 2500;

export type Searching = {
  status: "searching";
  game: GameId;
  waitedSeconds: number;
  rating: number;
  window: number;
};
export type Counts = Record<GameId, number>;

export function useQuickMatch() {
  const router = useRouter();
  const [search, setSearch] = useState<Searching | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopLoop = () => {
    searchingRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const heartbeat = useCallback(async (g: GameId) => {
    if (!searchingRef.current) return;
    try {
      const res = await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ game: g }),
      });
      const data = await res.json();
      if (!searchingRef.current) return;
      if (!res.ok) {
        stopLoop();
        setSearch(null);
        setError(data.error ?? "Could not join the queue.");
        return;
      }
      if (data.status === "matched") {
        stopLoop();
        router.push(`/match/${data.matchId}`);
        return;
      }
      if (data.status === "searching") setSearch(data);
    } catch {
      // Transient network failure — keep trying on the next beat.
    }
    if (searchingRef.current) {
      timerRef.current = setTimeout(() => void heartbeat(g), HEARTBEAT_MS);
    }
  }, [router]);

  const start = useCallback((g: GameId) => {
    setError(null);
    searchingRef.current = true;
    setSearch({ status: "searching", game: g, waitedSeconds: 0, rating: 0, window: 0 });
    void heartbeat(g);
  }, [heartbeat]);

  const cancel = useCallback(async () => {
    stopLoop();
    setSearch(null);
    try {
      const res = await fetch("/api/matchmaking", { method: "DELETE" });
      const data = await res.json();
      // Paired in the instant before cancelling — take them to the board.
      if (data.status === "matched") router.push(`/match/${data.matchId}`);
    } catch { /* the stale entry ages out of the queue on its own */ }
  }, [router]);

  // Resume a search already in progress (refresh, or opened in another
  // tab) and load how many people are searching.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/matchmaking", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.counts) setCounts(data.counts);
        if (data.status === "matched") router.push(`/match/${data.matchId}`);
        else if (data.status === "searching") start(data.game);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [router, start]);

  // Leaving the screen drops you from the queue rather than leaving a
  // ghost entry someone could be paired with.
  useEffect(() => {
    const leave = () => {
      if (!searchingRef.current) return;
      fetch("/api/matchmaking", { method: "DELETE", keepalive: true }).catch(() => {});
    };
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      leave();
      stopLoop();
    };
  }, []);

  return { search, counts, error, setError, start, cancel };
}

export function useCreateInvite() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (game: GameId) => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/matches/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ game }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the invite.");
        return;
      }
      router.push(`/match/${data.match.id}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setCreating(false);
    }
  }, [router]);

  return { create, creating, error };
}
