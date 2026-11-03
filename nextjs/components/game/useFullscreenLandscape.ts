"use client";

// Opt-in "Full screen" for game boards on phones: enter fullscreen,
// then lock to landscape. Browsers only allow the orientation lock
// while fullscreen and after a tap, and iPhone Safari supports neither —
// so `supported` is false there and the button is never shown.

import { useCallback, useEffect, useState } from "react";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
  unlock?: () => void;
};

function orientationApi(): LockableOrientation | null {
  if (typeof screen === "undefined" || !screen.orientation) return null;
  return screen.orientation as LockableOrientation;
}

export function useFullscreenLandscape() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const canLock = typeof orientationApi()?.lock === "function";
    setSupported(touch && !!document.fullscreenEnabled && canLock);

    const onChange = () => {
      const on = !!document.fullscreenElement;
      setActive(on);
      // Leaving fullscreen (back gesture, Esc) releases the lock too.
      if (!on) orientationApi()?.unlock?.();
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      // Never leave the rest of the app stuck fullscreen/sideways.
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      orientationApi()?.unlock?.();
    };
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      // Fullscreen without the lock is still a bigger board, so a lock
      // refusal is not an error worth surfacing.
      await orientationApi()?.lock?.("landscape").catch(() => {});
    } catch {
      /* fullscreen refused — stay as we are */
    }
  }, []);

  return { supported, active, toggle };
}
