"use client";

// Persistent chrome for the game app, mounted once in the root layout
// so the top bar and tab bar stay put while screens change underneath
// (no flash between pages). On marketing-site paths it renders the
// page untouched.
//
//   tab  mode — slim top bar + bottom tab bar (top-bar tabs on desktop)
//   game mode — slim top bar only; the screen supplies a GameDock

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { APP_TABS, PHONE_LANDSCAPE, activeTab, appMode, backHref } from "@/lib/app-routes";
import NotificationBell from "@/components/NotificationBell";
import AppIcon from "./AppIcon";

interface Summary {
  player: { username: string; displayName: string } | null;
  yourTurn: number;
}

const TOP_BAR = 56;
const TAB_BAR = 62;
const DOCK = 66;
const RAIL = 76; // GameDock's width when it becomes a side rail

function useAppSummary(enabled: boolean, pathname: string) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/app/summary", { cache: "no-store" });
      if (r.ok) setSummary(await r.json());
    } catch { /* keep the last known state */ }
  }, []);
  // Re-check on every navigation (sign-in/out, a move just played) and
  // periodically / when the app comes back to the foreground.
  useEffect(() => { if (enabled) void load(); }, [enabled, pathname, load]);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(load, 30_000);
    const onVis = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [enabled, load]);
  return summary;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const mode = appMode(pathname);
  const inApp = mode !== "site";
  const summary = useAppSummary(inApp, pathname);

  // App-wide touch behaviour lives on <html> (overscroll can only be
  // stopped there): no rubber-band / pull-to-refresh inside the app.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("sok-app", inApp);
    return () => root.classList.remove("sok-app");
  }, [inApp]);

  if (!inApp) return <>{children}</>;

  const back = backHref(pathname);
  const current = activeTab(pathname);
  const player = summary?.player ?? null;
  const authPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");

  const tabs = APP_TABS.map((t) => ({
    ...t,
    active: current === t.href,
    badge: t.href === "/matches" ? summary?.yourTurn ?? 0 : 0,
  }));

  return (
    <>
      <TopBar $mode={mode}>
        <TopInner>
          <Left>
            {back ? (
              <IconLink href={back} aria-label="Back">
                <AppIcon name="back" />
              </IconLink>
            ) : null}
            <Brand href="/play" aria-label="Sphere of Kings — game home" $compact={!!back || !!player}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/b17be116-af38-47af-9813-ffa3c2aec5e7.jpg" alt="" />
              <span>Sphere of Kings</span>
            </Brand>
          </Left>
          <TopTabs aria-label="App sections">
            {tabs.map((t) => (
              <TopTab key={t.href} href={t.href} aria-current={t.active ? "page" : undefined}>
                {t.label}
                {t.badge > 0 && <Count>{t.badge}</Count>}
              </TopTab>
            ))}
          </TopTabs>
          <Right>
            {player ? (
              <>
                <NotificationBell />
                <Avatar href="/me" aria-label={`Your profile (${player.displayName})`}>
                  {initials(player.displayName)}
                </Avatar>
              </>
            ) : summary && !authPage ? (
              <SignIn href={`/signin?next=${encodeURIComponent(pathname)}`}>Sign in</SignIn>
            ) : null}
          </Right>
        </TopInner>
      </TopBar>

      <Frame $mode={mode}>{children}</Frame>

      {mode === "tab" && (
        <TabBar aria-label="App sections">
          {tabs.map((t) => (
            <Tab key={t.href} href={t.href} aria-current={t.active ? "page" : undefined}>
              <TabIcon>
                <AppIcon name={t.icon} size={23} />
                {t.badge > 0 && <TabBadge aria-label={`${t.badge} waiting`}>{t.badge > 9 ? "9+" : t.badge}</TabBadge>}
              </TabIcon>
              <span>{t.label}</span>
            </Tab>
          ))}
        </TabBar>
      )}
    </>
  );
}

const TopBar = styled.header<{ $mode: "tab" | "game" }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-top: env(safe-area-inset-top);
  background: rgba(10, 8, 6, 0.94);
  border-bottom: 1px solid #2a2218;
  backdrop-filter: blur(12px);
  /* Sideways phone during a game: every pixel of height goes to the
     board; Back moves into the control rail (GameDock). */
  ${(p) => p.$mode === "game" && `@media ${PHONE_LANDSCAPE} { display: none; }`}
`;
const TopInner = styled.div`
  height: ${TOP_BAR}px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 max(8px, env(safe-area-inset-right)) 0 max(8px, env(safe-area-inset-left));
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: flex-end;
`;
const IconLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--text, #f5f0e8);
  &:hover, &:active { color: var(--gold-light, #f0c040); background: rgba(201, 162, 39, 0.1); }
`;
const Brand = styled(Link)<{ $compact: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 4px 6px;
  text-decoration: none;
  img { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
  span {
    font-family: "Cinzel", serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--gold-light, #f0c040);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Phones: logo only — the full name doesn't fit beside the actions. */
  @media (max-width: 480px) { span { display: none; } }
  /* With a back arrow, or the bell + avatar, there isn't room for the
     full name on phones. */
  ${(p) => p.$compact && "@media (max-width: 600px) { span { display: none; } }"}
`;
const TopTabs = styled.nav`
  display: none;
  @media (min-width: 900px) {
    display: flex;
    gap: 4px;
  }
`;
const TopTab = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--text-muted, #a89880);
  &:hover { color: var(--text, #f5f0e8); }
  &[aria-current="page"] { color: var(--gold-light, #f0c040); background: rgba(201, 162, 39, 0.1); }
`;
const Count = styled.span`
  min-width: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #ff6b7a;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
`;
const Avatar = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-left: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8901e, #f0c040);
  color: #0a0a0a;
  font-size: 0.8rem;
  font-weight: 800;
  text-decoration: none;
  &:hover { color: #0a0a0a; filter: brightness(1.1); }
`;
const SignIn = styled(Link)`
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--gold, #c9a227);
  color: var(--gold-light, #f0c040);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
`;

const Frame = styled.div<{ $mode: "tab" | "game" }>`
  min-height: 100dvh;
  background: var(--bg, #0a0a0a);
  padding-top: calc(${TOP_BAR}px + env(safe-area-inset-top));
  padding-bottom: calc(${(p) => (p.$mode === "tab" ? TAB_BAR : DOCK)}px + env(safe-area-inset-bottom) + 16px);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  ${(p) => p.$mode === "tab" && `
    @media (min-width: 900px) { padding-bottom: 32px; }
  `}

  /* Game screens: the board fits the viewport — no sideways panning,
     no page scroll to reach it. Height leaves room for the top bar,
     status line, view switcher and dock. */
  ${(p) => p.$mode === "game" && `
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    .sok-board-scroll { overflow: visible; touch-action: manipulation; }
    .sok-board-scroll svg {
      width: 100%;
      min-width: 0;
      max-height: calc(100dvh - ${TOP_BAR + DOCK}px - 190px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
      min-height: 160px;
    }
    /* BoardChrome shows this under a mobile media query; the board no
       longer overflows here, so it must lose to that rule. */
    .sok-pan-hint { display: none !important; }
    input, textarea { user-select: text; -webkit-user-select: text; }

    /* Sideways phone: info column | board (full height) | control rail.
       Screens opt in with .sok-game-layout and mark the board with
       .sok-board-area; everything else stacks in the left column. */
    @media ${PHONE_LANDSCAPE} {
      padding-top: max(8px, env(safe-area-inset-top));
      padding-bottom: max(8px, env(safe-area-inset-bottom));
      padding-right: calc(${RAIL}px + env(safe-area-inset-right));
      .sok-game-head { display: none; }
      .sok-game-layout {
        display: grid;
        grid-template-columns: minmax(120px, 150px) minmax(0, 1fr);
        grid-auto-rows: min-content;
        column-gap: 12px;
        /* No row-gap: the board spans many implicit rows, and each empty
           row's gap would add invisible height. Items space themselves. */
        row-gap: 0;
        align-items: start;
      }
      .sok-game-layout > * { grid-column: 1; min-width: 0; margin-bottom: 8px; }
      .sok-game-layout > .sok-board-area { grid-column: 2; grid-row: 1 / span 30; margin-bottom: 0; }
      /* Thinner frame around the flat board: those pixels go to squares. */
      .sok-game-layout > .sok-board-area:not(.sok-sphere) { padding: 8px; }
      /* The status line may wrap here: the board is in its own column,
         so a longer hint can't shift it. */
      .sok-game-layout > [aria-live] { white-space: normal; flex-wrap: wrap; }
      .sok-board-scroll svg {
        /* 16 above + 8 below the board + 16 of board frame + slack. */
        max-height: calc(100dvh - 44px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        min-height: 0;
      }
      .sok-sphere { height: calc(100dvh - 28px - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important; }
      .sok-sphere-hint, .sok-rotate-hint { display: none !important; }
    }
  `}
`;

const TabBar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  padding: 4px max(4px, env(safe-area-inset-right)) env(safe-area-inset-bottom) max(4px, env(safe-area-inset-left));
  background: rgba(10, 8, 6, 0.96);
  border-top: 1px solid #2a2218;
  backdrop-filter: blur(12px);
  @media (min-width: 900px) { display: none; }
`;
const Tab = styled(Link)`
  flex: 1;
  height: ${TAB_BAR - 4}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-radius: 10px;
  color: #8a7c66;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  &[aria-current="page"] { color: var(--gold-light, #f0c040); }
  &:hover { color: var(--text, #f5f0e8); }
  &[aria-current="page"]:hover { color: var(--gold-light, #f0c040); }
  &:active { background: rgba(201, 162, 39, 0.08); }
`;
const TabIcon = styled.span`
  position: relative;
  display: inline-flex;
`;
const TabBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -10px;
  min-width: 17px;
  padding: 0 4px;
  border-radius: 9px;
  background: #ff6b7a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
`;
