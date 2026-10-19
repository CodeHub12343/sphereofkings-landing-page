// Web-worker runtime for the AIs. Both engines import small — they
// bundle fine into a dedicated worker so a Hard-tier search doesn't
// freeze the main thread.
//
// Protocol: main thread posts {game, state, difficulty, requestId};
// worker replies {requestId, moveJson, nextState}.
//
// The caller is `useAiWorker` in components/game/useAiWorker.ts.

/// <reference lib="webworker" />

import * as rc from "./royal-checkers/engine";
import * as rcAi from "./royal-checkers/ai";
import * as ik from "./imperial-kings/engine";
import * as ikAi from "./imperial-kings/ai";
import { Difficulty } from "./difficulty";

type Req =
  | { kind: "rc"; requestId: number; state: string; difficulty: Difficulty }
  | { kind: "ik"; requestId: number; state: string; difficulty: Difficulty };

type Res = {
  requestId: number;
  move: unknown;
  state: string;
} | { requestId: number; error: string };

self.addEventListener("message", (ev: MessageEvent<Req>) => {
  const msg = ev.data;
  try {
    if (msg.kind === "rc") {
      const s = rc.decode(msg.state);
      const m = rcAi.chooseMove(s, msg.difficulty);
      if (!m) {
        (self as unknown as Worker).postMessage({ requestId: msg.requestId, error: "no-moves" } as Res);
        return;
      }
      const next = rc.apply(s, m);
      (self as unknown as Worker).postMessage({
        requestId: msg.requestId, move: m, state: rc.encode(next),
      } as Res);
    } else {
      const s = ik.decode(msg.state);
      const m = ikAi.chooseMove(s, msg.difficulty);
      if (!m) {
        (self as unknown as Worker).postMessage({ requestId: msg.requestId, error: "no-moves" } as Res);
        return;
      }
      const next = ik.apply(s, m);
      (self as unknown as Worker).postMessage({
        requestId: msg.requestId, move: m, state: ik.encode(next),
      } as Res);
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({
      requestId: msg.requestId,
      error: err instanceof Error ? err.message : "unknown",
    } as Res);
  }
});

export {};
