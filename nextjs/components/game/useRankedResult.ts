"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface MeSummary {
  id: string;
  username: string;
  displayName: string;
  isMinor: boolean;
  publicProfile: boolean;
}

/**
 * Loads the current session once and gives the game board a reporter
 * function it can call when the game ends.
 */
export function useRankedResult(game: "royal-checkers" | "imperial-kings") {
  const [me, setMe] = useState<MeSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const reportedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/players/me")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setMe(data.player ?? null);
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(true));
    return () => { cancelled = true; };
  }, []);

  const report = useCallback(
    async (result: "win" | "loss" | "draw", difficulty: number) => {
      if (!me || reportedRef.current) return;
      reportedRef.current = true;
      try {
        const res = await fetch("/api/players/ranked-result", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ game, result, difficulty }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          ranking: { rating: number };
          newAchievements: string[];
        };
        setNewRating(data.ranking.rating);
        setNewAchievements(data.newAchievements ?? []);
      } catch {}
    },
    [game, me],
  );

  const reset = useCallback(() => {
    reportedRef.current = false;
    setNewRating(null);
    setNewAchievements([]);
  }, []);

  return { me, loaded, report, reset, newRating, newAchievements };
}
