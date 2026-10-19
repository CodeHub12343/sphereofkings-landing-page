"use client";

import { useCallback, useEffect, useRef } from "react";
import { Difficulty } from "@/lib/games/difficulty";

export type AiGame = "rc" | "ik";

export interface AiResult {
  move: unknown;
  state: string;
}

/**
 * Thin hook around the shared AI web worker. Owns a single worker
 * instance per component lifecycle so repeated calls reuse it.
 */
export function useAiWorker() {
  const workerRef = useRef<Worker | null>(null);
  const nextIdRef = useRef(1);
  const pendingRef = useRef(new Map<number, (r: AiResult | Error) => void>());

  useEffect(() => {
    const w = new Worker(
      new URL("../../lib/games/ai-worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = w;
    w.onmessage = (ev: MessageEvent) => {
      const { requestId, move, state, error } = ev.data as {
        requestId: number;
        move?: unknown;
        state?: string;
        error?: string;
      };
      const cb = pendingRef.current.get(requestId);
      if (!cb) return;
      pendingRef.current.delete(requestId);
      if (error) cb(new Error(error));
      else cb({ move, state: state! });
    };
    return () => {
      w.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  const askMove = useCallback(
    (game: AiGame, state: string, difficulty: Difficulty): Promise<AiResult> =>
      new Promise((resolve, reject) => {
        const w = workerRef.current;
        if (!w) {
          reject(new Error("worker-not-ready"));
          return;
        }
        const requestId = nextIdRef.current++;
        pendingRef.current.set(requestId, (r) =>
          r instanceof Error ? reject(r) : resolve(r),
        );
        w.postMessage({ kind: game, requestId, state, difficulty });
      }),
    [],
  );

  return { askMove };
}
